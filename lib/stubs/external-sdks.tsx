import * as React from "react";

// @aws-sdk/client-s3 & @aws-sdk/s3-request-presigner
export class S3Client {
  constructor(_config?: unknown) {}
  async send(_cmd: unknown): Promise<Record<string, unknown>> {
    return {};
  }
}
export class PutObjectCommand {
  constructor(public input: unknown) {}
}
export class GetObjectCommand {
  constructor(public input: unknown) {}
}
export class HeadObjectCommand {
  constructor(public input: unknown) {}
}
export class DeleteObjectCommand {
  constructor(public input: unknown) {}
}
export async function getSignedUrl(
  _client: unknown,
  _command: unknown,
  _options?: unknown,
): Promise<string> {
  return "";
}

// @marsidev/react-turnstile
export type TurnstileInstance = {
  reset: () => void;
  getResponse: () => string | undefined;
};
export const Turnstile = React.forwardRef<
  TurnstileInstance,
  Record<string, unknown>
>(function Turnstile(_props, ref) {
  React.useImperativeHandle(ref, () => ({
    reset: () => {},
    getResponse: () => "stub-token",
  }));
  return null;
});

// @next/third-parties/google
export function GoogleAnalytics(_props: Record<string, unknown>) {
  return null;
}

// @privy-io/react-auth
export function PrivyProvider({
  children,
}: {
  appId?: string;
  config?: Record<string, unknown>;
  children?: React.ReactNode;
}) {
  return <>{children}</>;
}
export function usePrivy() {
  return {
    ready: true,
    authenticated: false,
    login: () => {},
    logout: async () => {},
    user: null,
  };
}
export function useDepositFunds() {
  return {
    depositFunds: async (_opts?: unknown) => ({
      method: "fiat",
      status: "cancelled",
    }),
  };
}

// @privy-io/react-auth/solana
export function toSolanaWalletConnectors() {
  return {};
}
export function useWallets() {
  return {
    wallets: [] as Array<{ address: string; walletClientType?: string }>,
  };
}
export function useSignAndSendTransaction() {
  return {
    signAndSendTransaction: async (_opts?: unknown) => ({
      signature: new Uint8Array(),
    }),
  };
}

// @solana/kit & @solana-program/token
export const AccountRole = {
  READONLY: 0,
  WRITABLE: 1,
  READONLY_SIGNER: 2,
  WRITABLE_SIGNER: 3,
} as const;
export function address(addr: string): string {
  return addr;
}
export function createNoopSigner(addr: string) {
  return { address: addr };
}
export function createSolanaRpc(_url: string) {
  return {
    getLatestBlockhash: () => ({
      send: async () => ({
        value: { blockhash: "11111111111111111111111111111111", lastValidBlockHeight: 0n },
      }),
    }),
    getTokenAccountBalance: (_ata: unknown) => ({
      send: async () => ({ value: { amount: "0" } }),
    }),
  };
}
export function createSolanaRpcSubscriptions(_url: string) {
  return {};
}
export function createTransactionMessage(_opts: unknown) {
  return {};
}
export function setTransactionMessageFeePayer(_payer: unknown, tx: unknown) {
  return tx;
}
export function setTransactionMessageLifetimeUsingBlockhash(
  _bh: unknown,
  tx: unknown,
) {
  return tx;
}
export function appendTransactionMessageInstructions(
  _ixs: unknown[],
  tx: unknown,
) {
  return tx;
}
export function compileTransaction(tx: unknown) {
  return tx;
}
export function getTransactionEncoder() {
  return { encode: (_tx: unknown) => new Uint8Array() };
}
export function getBase58Decoder() {
  return { decode: (_bytes: unknown) => "" };
}
export function pipe<T>(initial: T, ...fns: Array<(val: any) => any>): any {
  return fns.reduce((acc, fn) => fn(acc), initial);
}
export const TOKEN_PROGRAM_ADDRESS = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
export async function findAssociatedTokenPda(_opts: unknown): Promise<[string, number]> {
  return ["", 0];
}
export async function getCreateAssociatedTokenIdempotentInstructionAsync(
  _opts: unknown,
) {
  return { accounts: [] as Array<{ address: string; role: number }> };
}
export function getTransferCheckedInstruction(_opts: unknown) {
  return { accounts: [] as Array<{ address: string; role: number }> };
}

// @react-email/components & @react-email/render
function createEmailTag(Tag: string) {
  return function EmailComponent({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    [key: string]: unknown;
  }) {
    return React.createElement(Tag, props, children);
  };
}
export const Html = createEmailTag("html");
export const Head = createEmailTag("head");
export const Preview = createEmailTag("div");
export const Body = createEmailTag("body");
export const Container = createEmailTag("div");
export const Section = createEmailTag("section");
export const Heading = createEmailTag("h2");
export const Text = createEmailTag("p");
export const Button = createEmailTag("a");
export const Hr = createEmailTag("hr");
export async function render(_element: React.ReactElement): Promise<string> {
  return "<!DOCTYPE html><html><body></body></html>";
}

// @react-pdf/renderer
export const Document = createEmailTag("div");
export const Page = createEmailTag("div");
export const View = createEmailTag("div");
export const Font = {
  register: (_opts: unknown) => {},
  registerHyphenationCallback: (_cb: unknown) => {},
};
export const StyleSheet = {
  create: <T extends Record<string, unknown>>(styles: T): T => styles,
};
export async function renderToBuffer(_element: unknown): Promise<Buffer> {
  return Buffer.from("");
}

// @sentry/nextjs
export function init(_opts?: unknown) {}
export function captureException(_err: unknown, _ctx?: unknown) {}
export function captureMessage(_msg: string, _ctx?: unknown) {}
export function captureRequestError(_err: unknown, _req?: unknown, _ctx?: unknown) {}
export function captureRouterTransitionStart(_href: string, _type: string) {}
export function withScope(cb: (scope: { setTag: () => void; setExtra: () => void }) => void) {
  cb({ setTag: () => {}, setExtra: () => {} });
}

// resend
export class Resend {
  emails = {
    send: async (_payload: unknown) => ({ data: { id: "mock-email-id" }, error: null }),
  };
  constructor(_apiKey?: string) {}
}
