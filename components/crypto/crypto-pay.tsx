"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2, Wallet } from "lucide-react";
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
import { USDC_MINT, formatUsdc, usdcCentsToBaseUnits } from "@/lib/usdc-pure";
import { fbTrack } from "@/lib/fb-pixel";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";

/**
 * The card payment flow for the English site (vividaastro.com).
 *
 * One Privy provider + one payment dialog per page: every "Pay by card"
 * button opens the shared dialog through context. The buyer pays by
 * card/Apple Pay/Google Pay in Privy's fund modal with destination.wallet
 * set to the platform wallet — USDC lands in OUR wallet and the buyer never
 * touches crypto. The server matches the transfer by time window + amount
 * once the fund flow reports submitted/confirmed, then grants exactly once.
 */

const RPC_URL =
  (process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "").trim() ||
  "https://api.mainnet-beta.solana.com";
const RPC_WS_URL = RPC_URL.replace(/^https:\/\//, "wss://").replace(
  /^http:\/\//,
  "ws://",
);

/**
 * Test-only sandbox mode for the card onramp: Stripe's sandbox accepts test
 * values (US/EU phone format, code 000000, card 4242…) and moves no real
 * funds. Set NEXT_PUBLIC_PRIVY_ONRAMP_SANDBOX=1 for a test deploy; never in
 * production.
 */
const ONRAMP_SANDBOX = process.env.NEXT_PUBLIC_PRIVY_ONRAMP_SANDBOX === "1";

export type CryptoPayRequest = {
  kind: "credits" | "premium_pass";
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

export function PayByCardButton({
  kind,
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

  const [phase, setPhase] = React.useState<Phase>("creating");
  const [purchase, setPurchase] = React.useState<PurchaseInfo | null>(null);
  const [problem, setProblem] = React.useState<{
    reason: string;
    shortfallUsdcCents?: number;
  } | null>(null);
  const [cardBusy, setCardBusy] = React.useState(false);
  const [cardError, setCardError] = React.useState<string | null>(null);
  const [funded, setFunded] = React.useState(false);
  const [completeBusy, setCompleteBusy] = React.useState(false);
  const [completeError, setCompleteError] = React.useState<string | null>(null);

  const fiatLabel = `$${(request.amountUsdcCents / 100).toFixed(2)}`;
  const itemLabel =
    request.kind === "credits"
      ? `${request.credits ?? ""} Vivida credits`
      : "Vivida PRO · 30-day pass";

  // 1) Create the pending purchase (the server snapshots recipient/price).
  // The guard keeps Strict Mode's dev-only double effect invocation from
  // creating two pending purchases per open.
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
            method: "fiat",
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

  // 2) Poll while awaiting: the server detects the on-chain arrival.
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

  const markConfirmed = () => {
    setPhase("done");
    router.refresh();
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
      // No destination.wallet: omitting it funds the buyer's own embedded
      // wallet (Privy rejects third-party addresses here). Step 2 moves the
      // exact amount to the platform wallet with the order reference.
      const result = await depositFunds({
        destination: {
          asset: "usdc",
          chain: "solana",
        },
        fiat: {
          source: { defaultAsset: "usd" },
          defaultAmount: (purchase.amountUsdcCents / 100).toFixed(2),
          // Prefer Stripe's embedded onramp (stays in-app for cards, Apple
          // Pay, Google Pay). Falls back to other providers when Stripe has
          // no quote — e.g. MoonPay, which completes on their own site.
          preferredProvider: "stripe",
          ...(ONRAMP_SANDBOX ? { environment: "sandbox" as const } : {}),
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
      // Fund flow confirmed — advance to step 2 (exact transfer) while the
      // status poll keeps watching as a fallback.
      setFunded(true);
      // Stay in awaiting — the status poll detects the on-chain arrival.
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[crypto/card] depositFunds failed:", message);
      if (/cancel|dismiss|close|exit|denied/i.test(message)) {
        setCardError("Card payment cancelled.");
      } else if (message && message.length <= 160) {
        // Surface the provider's reason (no on-ramp available, KYC
        // required, quote failed…) so failures are diagnosable.
        setCardError(message);
      } else {
        setCardError("Card payment failed. Please try again.");
      }
    } finally {
      setCardBusy(false);
    }
  };

  /**
   * Step 2: send the exact USDC transfer from the funded embedded wallet to
   * the platform wallet, carrying the purchase reference so the server
   * matches it exactly (no window guessing). Amount is the pack price when
   * the balance covers it, otherwise the full balance — the tolerance floor
   * still confirms it when the on-ramp spread is small. Below the floor we
   * refuse to send dust that could never credit; funds stay in the buyer's
   * wallet.
   */
  const completePayment = async () => {
    if (!purchase || completeBusy) return;
    const embedded =
      wallets.find(
        (w) =>
          (w as { walletClientType?: string }).walletClientType === "privy",
      ) ??
      wallets[0] ??
      null;
    if (!embedded) {
      setCompleteError("Your wallet isn't ready yet. Wait a moment and retry.");
      return;
    }
    setCompleteBusy(true);
    setCompleteError(null);
    try {
      const rpc = createSolanaRpc(RPC_URL);
      const mint = address(USDC_MINT);
      const from = address(embedded.address);
      const to = address(purchase.recipient);
      const [fromAta] = await findAssociatedTokenPda({
        owner: from,
        mint,
        tokenProgram: TOKEN_PROGRAM_ADDRESS,
      });
      let balance: bigint;
      try {
        const res = await rpc.getTokenAccountBalance(fromAta).send();
        balance = BigInt(res.value.amount);
      } catch {
        balance = BigInt(0);
      }
      const price = BigInt(usdcCentsToBaseUnits(purchase.amountUsdcCents));
      const floor = (price * BigInt(9000)) / BigInt(10000);
      if (balance < floor) {
        const have = (Number(balance) / 1_000_000).toFixed(2);
        const need = (Number(price) / 1_000_000).toFixed(2);
        setCompleteError(
          `Only ${have} USDC arrived (about ${need} needed). Contact support — your funds stayed in your wallet.`,
        );
        return;
      }
      const amount = balance >= price ? price : balance;
      const transfer = getTransferCheckedInstruction({
        source: fromAta,
        mint,
        destination: (
          await findAssociatedTokenPda({
            owner: to,
            mint,
            tokenProgram: TOKEN_PROGRAM_ADDRESS,
          })
        )[0],
        authority: createNoopSigner(from),
        amount,
        decimals: 6,
      });
      // Carry the order's reference as a read-only account so the server can
      // match this exact payment.
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
        wallet: embedded,
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
        // Sent, not indexed yet (or RPC busy) — fall back to polling, which
        // matches by reference or window.
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
      setCompleteError(
        /reject|denied|cancel|dismiss|close|exit/i.test(message)
          ? "Payment cancelled."
          : "Couldn't send the payment. Please try again.",
      );
      setPhase("awaiting");
    } finally {
      setCompleteBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle className="text-xl">Pay by card</DialogTitle>
        <DialogDescription>{itemLabel} · card payment</DialogDescription>
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
            <div className="text-3xl font-bold tracking-tight">{fiatLabel}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {itemLabel}
            </div>
          </div>

          {authenticated && !funded && (
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

          {authenticated && funded && !ONRAMP_SANDBOX && (
            <div className="rounded-2xl border border-border bg-background/40 p-3.5">
              <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Complete payment
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Your card payment arrived. Send it to activate — one tap, no
                addresses to copy.
              </p>
              <Button
                variant="mystic"
                className="mt-3 w-full"
                disabled={completeBusy}
                onClick={() => void completePayment()}
              >
                {completeBusy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Wallet className="size-4" />
                )}
                Complete payment
              </Button>
              {completeError && (
                <p className="mt-2 text-xs text-destructive">{completeError}</p>
              )}
            </div>
          )}

          {authenticated && funded && ONRAMP_SANDBOX && (
            <div className="rounded-2xl border border-border bg-background/40 p-3.5">
              <p className="text-xs text-muted-foreground">
                Sandbox mode — the card flow is verified end to end and no real
                funds move. Unset NEXT_PUBLIC_PRIVY_ONRAMP_SANDBOX to take live
                payments.
              </p>
            </div>
          )}

          {!authenticated ? (
            <Button
              variant="mystic"
              className="w-full"
              disabled={!ready}
              onClick={() => login()}
            >
              <Wallet className="size-4" /> Sign in to pay by card
            </Button>
          ) : null}

          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            Waiting for the payment to confirm…
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
