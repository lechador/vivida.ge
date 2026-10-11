"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import QRCode from "qrcode";
import { PrivyProvider, useDepositFunds, usePrivy } from "@privy-io/react-auth";
import {
  toSolanaWalletConnectors,
  useSignAndSendTransaction,
  useWallets,
} from "@privy-io/react-auth/solana";
import {
  AccountRole,
  address,
  appendTransactionMessageInstructions,
  compileTransaction,
  createNoopSigner,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  getBase58Decoder,
  getTransactionEncoder,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
} from "@solana/kit";
import {
  TOKEN_PROGRAM_ADDRESS,
  findAssociatedTokenPda,
  getCreateAssociatedTokenIdempotentInstructionAsync,
  getTransferCheckedInstruction,
} from "@solana-program/token";

import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { USDC_MINT, formatUsdc, usdcCentsToBaseUnits } from "@/lib/usdc-pure";
import { fbTrack } from "@/lib/fb-pixel";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";

/**
 * The USDC payment flow for the English site (vividaastro.com).
 *
 * One Privy provider + one payment dialog per page: every "Pay with USDC"
 * button opens the shared dialog through context, so the Privy iframe loads
 * once and only when first needed. The buyer pays from their own wallet —
 * a Privy embedded wallet (created on first login) or any external Solana
 * wallet via the connect modal / QR. The app never sends transactions; the
 * server verifies the on-chain transfer against the order's reference.
 */

const RPC_URL =
  (process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "").trim() ||
  "https://api.mainnet-beta.solana.com";
const RPC_WS_URL = RPC_URL.replace(/^https:\/\//, "wss://").replace(
  /^http:\/\//,
  "ws://",
);

export type CryptoPayRequest = {
  kind: "credits" | "premium_pass";
  /** Wallet pays from the buyer's wallet; fiat pays by card straight to our wallet. */
  method?: "wallet" | "fiat";
  packId?: "s" | "m" | "l";
  credits?: number | null;
  days?: number | null;
  amountUsdcCents: number;
  product?: string | null;
  returnTo?: string | null;
};

type CryptoPayContextValue = {
  open: (request: CryptoPayRequest) => void;
  available: boolean;
};

const CryptoPayContext = React.createContext<CryptoPayContextValue | null>(
  null,
);

export function CryptoPayHost({ children }: { children: React.ReactNode }) {
  const appId = (process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "").trim();
  const [request, setRequest] = React.useState<
    (CryptoPayRequest & { nonce: number }) | null
  >(null);
  // The last opened request stays around so the dialog content survives its
  // close animation; the nonce key remounts a fresh body on every open.
  const [lastRequest, setLastRequest] = React.useState<
    (CryptoPayRequest & { nonce: number }) | null
  >(null);
  const [everOpened, setEverOpened] = React.useState(false);
  const open = React.useCallback((next: CryptoPayRequest) => {
    const opened = { ...next, nonce: Date.now() };
    setRequest(opened);
    setLastRequest(opened);
    setEverOpened(true);
  }, []);
  const value = React.useMemo(
    () => ({ open, available: Boolean(appId) }),
    [open, appId],
  );

  return (
    <CryptoPayContext.Provider value={value}>
      {children}
      {everOpened && appId ? (
        <PrivyProvider
          appId={appId}
          config={{
            appearance: { theme: "dark", accentColor: "#22d3ee" },
            loginMethods: ["email", "wallet"],
            embeddedWallets: {
              solana: { createOnLogin: "users-without-wallets" },
            },
            externalWallets: {
              solana: { connectors: toSolanaWalletConnectors() },
            },
            solana: {
              rpcs: {
                "solana:mainnet": {
                  rpc: createSolanaRpc(RPC_URL),
                  rpcSubscriptions: createSolanaRpcSubscriptions(RPC_WS_URL),
                },
              },
            },
          }}
        >
          <PayDialog
            request={request}
            lastRequest={lastRequest}
            onClose={() => setRequest(null)}
          />
        </PrivyProvider>
      ) : null}
    </CryptoPayContext.Provider>
  );
}

export function PayWithUsdcButton({
  kind,
  method = "wallet",
  packId,
  credits,
  days,
  amountUsdcCents,
  product,
  returnTo,
  className,
  variant = "mystic",
  size,
  children,
}: CryptoPayRequest & {
  className?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  children?: React.ReactNode;
}) {
  const context = React.useContext(CryptoPayContext);
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      disabled={!context?.available}
      onClick={() => {
        trackEvent(ANALYTICS_EVENT.productSelected, {
          product:
            kind === "credits" ? `credits_${credits}` : "premium_crypto_30d",
          surface: product ?? "crypto_pay",
          payment_model: "one_time",
          credits: credits ?? undefined,
          value: amountUsdcCents / 100,
          currency: "USDC",
        });
        context?.open({
          kind,
          method,
          packId,
          credits,
          days,
          amountUsdcCents,
          product,
          returnTo,
        });
      }}
    >
      {children ?? `Pay ${formatUsdc(amountUsdcCents)}`}
    </Button>
  );
}

// ── Dialog ─────────────────────────────────────────────────────────────────

function PayDialog({
  request,
  lastRequest,
  onClose,
}: {
  request: (CryptoPayRequest & { nonce: number }) | null;
  lastRequest: (CryptoPayRequest & { nonce: number }) | null;
  onClose: () => void;
}) {
  const active = request ?? lastRequest;
  return (
    <Dialog
      open={request !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[92dvh] max-w-md overflow-y-auto">
        {active ? (
          <PayDialogBody
            key={active.nonce}
            request={active}
            onClose={onClose}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

type PurchaseInfo = {
  id: string;
  kind: "credits" | "premium_pass";
  method: string;
  credits: number | null;
  days: number | null;
  amountUsdcCents: number;
  recipient: string;
  reference: string;
  solanaPayUrl: string | null;
};

type Phase =
  | "creating"
  | "awaiting"
  | "confirming"
  | "done"
  | "problem"
  | "expired"
  | "error"
  | "already_premium";

function shortAddress(value: string): string {
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}

function PayDialogBody({
  request,
  onClose,
}: {
  request: CryptoPayRequest & { nonce: number };
  onClose: () => void;
}) {
  const router = useRouter();
  const { ready, authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const { depositFunds } = useDepositFunds();
  const cryptoContext = React.useContext(CryptoPayContext);

  const [phase, setPhase] = React.useState<Phase>("creating");
  const [purchase, setPurchase] = React.useState<PurchaseInfo | null>(null);
  const [qr, setQr] = React.useState<string | null>(null);
  const [problem, setProblem] = React.useState<{
    reason: string;
    shortfallUsdcCents?: number;
  } | null>(null);
  const [paste, setPaste] = React.useState("");
  const [checking, setChecking] = React.useState(false);
  const [pasteError, setPasteError] = React.useState<string | null>(null);
  const [walletBusy, setWalletBusy] = React.useState(false);
  const [walletError, setWalletError] = React.useState<string | null>(null);
  const [cardBusy, setCardBusy] = React.useState(false);
  const [cardError, setCardError] = React.useState<string | null>(null);
  const [balanceBaseUnits, setBalanceBaseUnits] = React.useState<bigint | null>(
    null,
  );
  const [balanceLoading, setBalanceLoading] = React.useState(false);
  const [copied, setCopied] = React.useState<string | null>(null);

  const amountLabel = formatUsdc(request.amountUsdcCents);
  const fiatLabel = `$${(request.amountUsdcCents / 100).toFixed(2)}`;
  const isFiat = purchase?.method === "fiat";
  const itemLabel =
    request.kind === "credits"
      ? `${request.credits ?? ""} Vivida credits`
      : "Vivida PRO · 30-day pass";

  // 1) Create the pending purchase (the server snapshots recipient/price).
  // The guard keeps Strict Mode's dev-only double effect invocation from
  // creating two pending purchases per open; the response is intentionally
  // not cancelled on cleanup (a remount skips via the guard, and a real
  // close just lets the expired-in-an-hour row sit).
  const createdRef = React.useRef(false);
  React.useEffect(() => {
    if (createdRef.current) return;
    createdRef.current = true;
    (async () => {
      try {
        const res = await fetch("/api/crypto/checkout", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            kind: request.kind,
            method: request.method ?? "wallet",
            packId: request.packId,
            product: request.product ?? undefined,
            returnTo: request.returnTo ?? undefined,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          alreadyPremium?: boolean;
          id?: string;
          kind?: "credits" | "premium_pass";
          method?: string;
          credits?: number | null;
          days?: number | null;
          amountUsdcCents?: number;
          currency?: string;
          recipient?: string;
          reference?: string;
          solanaPayUrl?: string | null;
          value?: number;
          contentId?: string;
        };
        if (data.alreadyPremium) {
          setPhase("already_premium");
          return;
        }
        if (!res.ok || !data.id || !data.recipient || !data.reference) {
          setPhase("error");
          return;
        }
        setPurchase({
          id: data.id,
          kind: data.kind ?? request.kind,
          method: data.method ?? "wallet",
          credits: data.credits ?? null,
          days: data.days ?? null,
          amountUsdcCents: data.amountUsdcCents ?? request.amountUsdcCents,
          recipient: data.recipient,
          reference: data.reference,
          solanaPayUrl: data.solanaPayUrl ?? null,
        });
        setPhase("awaiting");
        fbTrack(
          "InitiateCheckout",
          {
            value: data.value,
            currency: data.currency,
            content_ids: [data.contentId],
            content_type: "product",
          },
          `${data.id}:initiate_checkout`,
        );
        trackEvent(ANALYTICS_EVENT.checkoutStarted, {
          product: data.contentId,
          value: data.value,
          currency: data.currency,
        });
      } catch {
        setPhase("error");
      }
    })();
  }, [request]);

  // 2) QR for the Solana Pay URL (any wallet app can scan).
  React.useEffect(() => {
    if (!purchase?.solanaPayUrl) return;
    let cancelled = false;
    QRCode.toDataURL(purchase.solanaPayUrl, { width: 208, margin: 1 })
      .then((data) => {
        if (!cancelled) setQr(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [purchase?.solanaPayUrl]);

  // 3) Poll while awaiting: the server auto-detects the payment by reference.
  React.useEffect(() => {
    if (phase !== "awaiting" || !purchase) return;
    let stopped = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/crypto/checkout/${purchase.id}`, {
          cache: "no-store",
        });
        const data = (await res.json().catch(() => ({}))) as {
          status?: string;
          reason?: string;
          shortfallUsdcCents?: number;
        };
        if (stopped) return;
        if (data.status === "confirmed") {
          setPhase("done");
          router.refresh();
        } else if (data.status === "problem") {
          setProblem({
            reason: data.reason ?? "failed",
            shortfallUsdcCents: data.shortfallUsdcCents,
          });
          setPhase("problem");
        } else if (data.status === "expired") {
          setPhase("expired");
        }
      } catch {
        // Keep polling — transient network failures resolve.
      }
    };
    const timer = setInterval(tick, 4000);
    tick();
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [phase, purchase, router]);

  // Prefer the Privy embedded wallet; fall back to the first connected one.
  const wallet = React.useMemo(() => {
    if (!wallets || wallets.length === 0) return null;
    const embedded = wallets.find(
      (w) => (w as { walletClientType?: string }).walletClientType === "privy",
    );
    return embedded ?? wallets[0];
  }, [wallets]);
  const walletAddress = wallet?.address ?? null;

  // 4) Wallet USDC balance (missing ATA → no USDC yet).
  const refreshBalance = React.useCallback(async () => {
    if (!walletAddress) {
      setBalanceBaseUnits(null);
      return;
    }
    setBalanceLoading(true);
    try {
      const rpc = createSolanaRpc(RPC_URL);
      const [ata] = await findAssociatedTokenPda({
        owner: address(walletAddress),
        mint: address(USDC_MINT),
        tokenProgram: TOKEN_PROGRAM_ADDRESS,
      });
      const res = await rpc.getTokenAccountBalance(ata).send();
      setBalanceBaseUnits(BigInt(res.value.amount));
    } catch {
      setBalanceBaseUnits(BigInt(0));
    } finally {
      setBalanceLoading(false);
    }
  }, [walletAddress]);

  React.useEffect(() => {
    if (!walletAddress) return;
    let cancelled = false;
    const run = async () => {
      // Defer past the effect body: the first setState must happen in the
      // async callback, not synchronously during the render commit.
      await Promise.resolve();
      if (!cancelled) await refreshBalance();
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [walletAddress, refreshBalance]);

  const enoughUsdc =
    balanceBaseUnits != null &&
    balanceBaseUnits >= BigInt(usdcCentsToBaseUnits(request.amountUsdcCents));

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1600);
    } catch {
      // Clipboard unavailable — the address stays selectable.
    }
  };

  const markConfirmed = () => {
    setPhase("done");
    router.refresh();
  };

  const payWithWallet = async () => {
    if (!purchase || !wallet) return;
    setWalletBusy(true);
    setWalletError(null);
    try {
      const rpc = createSolanaRpc(RPC_URL);
      const mint = address(USDC_MINT);
      const from = address(wallet.address);
      const to = address(purchase.recipient);
      const [fromAta] = await findAssociatedTokenPda({
        owner: from,
        mint,
        tokenProgram: TOKEN_PROGRAM_ADDRESS,
      });
      const [toAta] = await findAssociatedTokenPda({
        owner: to,
        mint,
        tokenProgram: TOKEN_PROGRAM_ADDRESS,
      });
      const transfer = getTransferCheckedInstruction({
        source: fromAta,
        mint,
        destination: toAta,
        authority: createNoopSigner(from),
        amount: BigInt(usdcCentsToBaseUnits(purchase.amountUsdcCents)),
        decimals: 6,
      });
      // Carry the order's reference as a read-only account so the server can
      // auto-detect this exact payment.
      const transferWithReference = {
        ...transfer,
        accounts: [
          ...transfer.accounts,
          { address: address(purchase.reference), role: AccountRole.READONLY },
        ],
      };
      // The receiving wallet's USDC token account may not exist yet — the
      // first payment creates it (idempotent; a no-op afterwards).
      const createAta =
        await getCreateAssociatedTokenIdempotentInstructionAsync({
          payer: createNoopSigner(from),
          mint,
          owner: to,
        });
      const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
      const message = pipe(
        createTransactionMessage({ version: 0 }),
        (tx) => setTransactionMessageFeePayer(from, tx),
        (tx) =>
          setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
        (tx) =>
          appendTransactionMessageInstructions(
            [createAta, transferWithReference],
            tx,
          ),
      );
      const bytes = new Uint8Array(
        getTransactionEncoder().encode(compileTransaction(message)),
      );
      const { signature } = await signAndSendTransaction({
        transaction: bytes,
        wallet,
      });
      const signatureBase58 = getBase58Decoder().decode(signature);
      setPhase("confirming");
      const res = await fetch(`/api/crypto/checkout/${purchase.id}/submit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ signature: signatureBase58 }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        status?: string;
        reason?: string;
        shortfallUsdcCents?: number;
      };
      if (res.ok && data.status === "confirmed") {
        markConfirmed();
        return;
      }
      if (res.status === 202 || res.status === 503) {
        // Sent, not indexed yet (or RPC busy) — fall back to polling.
        setPhase("awaiting");
        return;
      }
      if (res.status === 402 || res.status === 409) {
        setProblem({
          reason: data.reason ?? "failed",
          shortfallUsdcCents: data.shortfallUsdcCents,
        });
        setPhase("problem");
        return;
      }
      setPhase("awaiting");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setWalletError(
        /reject|denied|cancel/i.test(message)
          ? "Payment cancelled."
          : "The payment couldn't be sent. Check your USDC balance and try again.",
      );
      setPhase("awaiting");
    } finally {
      setWalletBusy(false);
    }
  };

  /**
   * Card-direct payment: Privy's fund modal with destination.wallet set to
   * the platform wallet, so USDC lands in OUR wallet and the buyer never
   * touches crypto. The modal returns no transaction proof — only
   * submitted/confirmed — so we notify the server, which window-scans for
   * the incoming transfer while the existing poll watches for confirmation.
   */
  const payByCard = async () => {
    if (!purchase || cardBusy) return;
    if (!authenticated) {
      setCardError("Sign in first, then pay by card.");
      return;
    }
    setCardBusy(true);
    setCardError(null);
    try {
      const result = await depositFunds({
        destination: {
          asset: "usdc",
          chain: "solana",
          wallet: purchase.recipient,
        },
        fiat: {
          source: { defaultAsset: "usd" },
          defaultAmount: (purchase.amountUsdcCents / 100).toFixed(2),
        },
      });
      if (
        result.method !== "fiat" ||
        (result.status !== "confirmed" && result.status !== "submitted")
      ) {
        setCardError("The card payment didn't complete. Please try again.");
        return;
      }
      const res = await fetch(`/api/crypto/checkout/${purchase.id}/fiat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ depositStatus: result.status }),
      });
      if (!res.ok) {
        setCardError(
          "We couldn't start tracking your payment. Please try again.",
        );
        return;
      }
      fbTrack(
        "AddPaymentInfo",
        {
          value: purchase.amountUsdcCents / 100,
          currency: "USD",
          content_ids: [
            request.kind === "credits"
              ? `credits_${request.credits}`
              : "premium_crypto_30d",
          ],
          content_type: "product",
        },
        `${purchase.id}:add_payment_info`,
      );
      // Stay in awaiting — the status poll detects the on-chain arrival.
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setCardError(
        /cancel|dismiss|close|exit|denied/i.test(message)
          ? "Card payment cancelled."
          : "Card payment failed. Please try again.",
      );
    } finally {
      setCardBusy(false);
    }
  };

  const switchMethod = () => {
    cryptoContext?.open({
      kind: request.kind,
      method: isFiat ? "wallet" : "fiat",
      packId: request.packId,
      credits: request.credits,
      days: request.days,
      amountUsdcCents: request.amountUsdcCents,
      product: request.product,
      returnTo: request.returnTo,
    });
  };

  const checkPasted = async () => {
    if (!purchase || !paste.trim()) return;
    setChecking(true);
    setPasteError(null);
    try {
      const res = await fetch(`/api/crypto/checkout/${purchase.id}/submit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ signature: paste.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        status?: string;
        reason?: string;
        shortfallUsdcCents?: number;
      };
      if (res.ok && data.status === "confirmed") {
        markConfirmed();
        return;
      }
      if (res.status === 202) {
        setPasteError(
          "This payment isn't confirmed yet. Give it a moment and check again.",
        );
      } else if (data.reason === "bad_signature") {
        setPasteError("That doesn't look like a transaction ID.");
      } else if (data.reason === "no_reference") {
        setPasteError(
          "We couldn't match this payment to your order. If you sent it from an exchange, contact support.",
        );
      } else if (data.reason === "underpaid") {
        setPasteError(
          `This payment was short by ${formatUsdc(data.shortfallUsdcCents ?? 0)}.`,
        );
      } else if (data.reason === "already_used") {
        setPasteError(
          "This transaction was already used for another purchase.",
        );
      } else if (data.reason === "failed") {
        setPasteError("That transaction failed on-chain.");
      } else {
        setPasteError("We couldn't verify this payment. Please try again.");
      }
    } catch {
      setPasteError("Network error. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const balanceLabel =
    balanceBaseUnits == null
      ? "—"
      : `${(Number(balanceBaseUnits) / 1_000_000).toFixed(2)} USDC`;

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle className="text-xl">
          {isFiat ? "Pay by card" : "Pay with USDC"}
        </DialogTitle>
        <DialogDescription>
          {itemLabel}
          {isFiat ? " · card payment" : " · Solana network"}
        </DialogDescription>
      </DialogHeader>

      {phase === "creating" && (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Preparing your payment…
        </div>
      )}

      {phase === "error" && (
        <div className="space-y-4 py-2">
          <p className="text-sm text-destructive">
            Payment setup failed. Please close this and try again.
          </p>
          <Button variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      )}

      {phase === "already_premium" && (
        <div className="space-y-4 py-2">
          <p className="text-sm text-foreground/80">
            You already have an active PRO subscription — manage it from your
            subscription page.
          </p>
          <Button asChild variant="mystic" className="w-full">
            <Link href="/subscription">Go to subscription</Link>
          </Button>
        </div>
      )}

      {phase === "expired" && (
        <div className="space-y-4 py-2">
          <p className="text-sm text-foreground/80">
            This payment window expired before we saw a payment. No charge was
            made — start a new one when you&apos;re ready.
          </p>
          <Button variant="mystic" className="w-full" onClick={onClose}>
            Start a new payment
          </Button>
        </div>
      )}

      {(phase === "awaiting" || phase === "confirming") && purchase && (
        <>
          <div className="rounded-2xl border border-[var(--vivida-cyan)]/30 bg-[var(--vivida-cyan)]/8 p-4 text-center">
            <div className="text-3xl font-bold tracking-tight">
              {isFiat ? fiatLabel : amountLabel}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {itemLabel}
            </div>
            <button
              type="button"
              onClick={switchMethod}
              className="mt-2 text-xs font-medium text-[var(--vivida-cyan)] underline decoration-dotted underline-offset-4"
            >
              {isFiat ? "← Pay with USDC instead" : "Pay by card instead →"}
            </button>
          </div>

          {isFiat && authenticated && (
            <div className="rounded-2xl border border-border bg-background/40 p-3.5">
              <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Card payment
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Pay with your card — Apple Pay and Google Pay supported where
                available. The crypto is handled for you; you never touch a
                wallet.
              </p>
              <Button
                variant="mystic"
                className="mt-3 w-full"
                disabled={cardBusy}
                onClick={() => void payByCard()}
              >
                {cardBusy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Wallet className="size-4" />
                )}
                Pay {fiatLabel} by card
              </Button>
              {cardError && (
                <p className="mt-2 text-xs text-destructive">{cardError}</p>
              )}
            </div>
          )}

          {!isFiat && !authenticated ? (
            <Button
              variant="mystic"
              className="w-full"
              disabled={!ready}
              onClick={() => login()}
            >
              <Wallet className="size-4" /> Continue with a wallet
            </Button>
          ) : !isFiat && wallet ? (
            <div className="rounded-2xl border border-border bg-background/40 p-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Your wallet
                  </div>
                  <div className="truncate font-mono text-sm">
                    {shortAddress(wallet.address)}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    Balance: {balanceLoading ? "…" : balanceLabel}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Refresh balance"
                  onClick={() => void refreshBalance()}
                >
                  <RefreshCw
                    className={cn("size-3.5", balanceLoading && "animate-spin")}
                  />
                </Button>
              </div>
              {enoughUsdc ? (
                <Button
                  variant="mystic"
                  className="mt-3 w-full"
                  disabled={walletBusy || phase === "confirming"}
                  onClick={() => void payWithWallet()}
                >
                  {walletBusy || phase === "confirming" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="size-4" />
                  )}
                  Pay {amountLabel}
                </Button>
              ) : (
                <div className="mt-3 rounded-xl border border-[var(--vivida-gold)]/30 bg-[var(--vivida-gold)]/8 p-3 text-xs">
                  <p className="font-medium text-foreground">
                    Add USDC to your wallet first
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Send USDC on the Solana network to your wallet address, then
                    refresh the balance.
                  </p>
                  <button
                    type="button"
                    onClick={() => void copy(wallet.address, "wallet")}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-2 py-1 font-mono text-[11px]"
                  >
                    {shortAddress(wallet.address)}
                    {copied === "wallet" ? (
                      <Check className="size-3" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </button>
                </div>
              )}
              {walletError && (
                <p className="mt-2 text-xs text-destructive">{walletError}</p>
              )}
            </div>
          ) : !isFiat ? (
            <p className="text-center text-sm text-muted-foreground">
              Setting up your wallet…
            </p>
          ) : null}

          {!isFiat && (
            <>
              <div className="rounded-2xl border border-border bg-background/40 p-3.5">
                <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Or pay from any Solana wallet
                </div>
                <div className="mt-2 flex items-center gap-3">
                  {qr ? (
                    // eslint-disable-next-line @next/next/no-img-element -- data URL QR
                    <img
                      src={qr}
                      alt="Scan to pay"
                      className="size-28 rounded-lg bg-white p-1"
                    />
                  ) : (
                    <div className="size-28 shrink-0 animate-pulse rounded-lg bg-foreground/5" />
                  )}
                  <div className="min-w-0 flex-1 text-xs text-muted-foreground">
                    <p>
                      Scan with Phantom, Solflare, or any wallet app — the
                      amount and order are prefilled.
                    </p>
                    <button
                      type="button"
                      onClick={() => void copy(purchase.recipient, "recipient")}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-2 py-1 font-mono text-[11px] text-foreground"
                    >
                      {shortAddress(purchase.recipient)}
                      {copied === "recipient" ? (
                        <Check className="size-3" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background/40 p-3.5">
                <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Already paid?
                </div>
                <div className="mt-2 flex gap-2">
                  <Input
                    value={paste}
                    onChange={(e) => setPaste(e.target.value)}
                    placeholder="Paste the transaction ID"
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void checkPasted()}
                    disabled={checking || !paste.trim()}
                  >
                    {checking ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      "Check"
                    )}
                  </Button>
                </div>
                {pasteError && (
                  <p className="mt-2 text-xs text-destructive">{pasteError}</p>
                )}
              </div>
            </>
          )}

          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            {phase === "confirming"
              ? "Confirming your payment…"
              : "Waiting for the payment to confirm…"}
          </p>
        </>
      )}

      {phase === "problem" && (
        <div className="space-y-4 py-2">
          <p className="text-sm text-destructive">
            {problem?.reason === "underpaid"
              ? `We found your payment, but it was short by ${formatUsdc(
                  problem.shortfallUsdcCents ?? 0,
                )}. Send the remaining amount, or contact support.`
              : problem?.reason === "already_used"
                ? "This transaction was already used for another purchase."
                : problem?.reason === "no_reference"
                  ? "We found a payment but couldn't match it to this order. If you sent it from an exchange, contact support."
                  : "We found a payment that couldn't be verified. Contact support with your transaction ID."}
          </p>
          <Button variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      )}

      {phase === "done" && (
        <div className="space-y-4 py-2 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
            <Check className="size-6" />
          </div>
          <div>
            <p className="text-lg font-semibold">
              {request.kind === "credits"
                ? `${request.credits ?? ""} credits added`
                : "PRO is active"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {request.kind === "credits"
                ? "Your balance has been updated."
                : `${request.days ?? 30} days of unlimited access.`}
            </p>
          </div>
          {request.returnTo ? (
            <Button asChild variant="mystic" className="w-full">
              <Link href={request.returnTo}>Continue</Link>
            </Button>
          ) : null}
          <Button
            variant={request.returnTo ? "outline" : "mystic"}
            className="w-full"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      )}
    </div>
  );
}
