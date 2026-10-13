"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneVerify } from "@/components/auth/phone-verify";
import { SmsMarketingToggle } from "@/components/auth/sms-marketing-toggle";
import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import { signUpWithEmail, verifyEmailWithCode } from "@/actions/auth";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { normalizeReturnPath } from "@/lib/safe-return-path";

const TURNSTILE_ENABLED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function SignupForm({ locale = "ka" }: { locale?: UserLocale }) {
  const en = locale !== "ka";
  const router = useRouter();
  const params = useSearchParams();
  // Where to land after signup, same-origin relative paths only.
  const nextParam = params.get("next");
  const safeNext = nextParam
    ? normalizeReturnPath(nextParam, "") || null
    : null;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Optional SMS verification of a mobile number (see PhoneVerify).
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneClaim, setPhoneClaim] = useState<{
    phone: string;
    claimToken: string | null;
  } | null>(null);
  const [smsMarketing, setSmsMarketing] = useState(false);

  // Code-entry (OTP) state on the "check your inbox" screen.
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [verifying, startVerify] = useTransition();
  const [phoneLinkNeedsRetry, setPhoneLinkNeedsRetry] = useState(false);
  const [verifiedSignedIn, setVerifiedSignedIn] = useState(false);

  const verifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError(null);
    startVerify(async () => {
      // Pass the password we still hold so a correct code signs them straight
      // in, no bounce to /login to retype it. Falls back to /login if the
      // auto-signin didn't take.
      const res = await verifyEmailWithCode({
        email,
        code: code.trim(),
        password,
        phoneClaimToken: phoneClaim?.claimToken ?? null,
        smsMarketing: !!phoneClaim && smsMarketing,
      });
      if (res.ok) {
        trackEvent(ANALYTICS_EVENT.signUpVerified, {
          method: "email",
          auto_signed_in: res.signedIn ? 1 : 0,
        });
        if (phoneClaim && res.phoneLinked === false) {
          setVerifiedSignedIn(res.signedIn);
          setPhoneLinkNeedsRetry(true);
          return;
        }
        if (res.signedIn) {
          // Straight to their destination (or dashboard), birth details
          // are optional and can be added later via onboarding.
          router.push(
            safeNext
              ? `/post-login?next=${encodeURIComponent(safeNext)}`
              : "/post-login",
          );
        } else {
          // Not auto-signed-in, bounce to login, carrying next along.
          const q = safeNext ? `&next=${encodeURIComponent(safeNext)}` : "";
          router.push(`/login?verified=1${q}`);
        }
        router.refresh();
      } else {
        setCodeError(res.error);
      }
    });
  };

  // Disable submit until Turnstile passes (when enabled). When the env var
  // is missing we let the form work, server still fails-closed via verifyTurnstile.
  const submitDisabled = isPending || (TURNSTILE_ENABLED && !turnstileToken);
  const hasUnverifiedPhone = !!phoneInput.trim() && !phoneClaim;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const result = await signUpWithEmail({
          name,
          email,
          password,
          turnstileToken,
        });
        if (result.ok) {
          // Account created, but email is not verified yet, a distinct step
          // from sign_up_verified below. Tracking both is what makes the
          // credential-signup abandonment rate visible in GA4.
          trackEvent(ANALYTICS_EVENT.signUpSubmitted, {
            method: "email",
            phone_verified: phoneClaim ? 1 : 0,
          });
          setDone(true);
        } else {
          setError(result.error);
        }
      } catch {
        setError(
          en
            ? "Could not create the account. Please try again."
            : "ანგარიშის შექმნა ვერ მოხერხდა. სცადე ხელახლა.",
        );
      } finally {
        // Turnstile proof is single-use, including failed server attempts.
        setTurnstileToken(null);
        setTurnstileKey((key) => key + 1);
      }
    });
  };

  if (phoneLinkNeedsRetry) {
    const continueHref = verifiedSignedIn
      ? safeNext
        ? `/post-login?next=${encodeURIComponent(safeNext)}`
        : "/post-login"
      : safeNext
        ? `/login?verified=1&next=${encodeURIComponent(safeNext)}`
        : "/login?verified=1";
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="mx-auto size-9 text-[var(--vivida-cyan)]" />
        <h3 className="text-lg font-semibold">
          {en ? "Email verified" : "ელფოსტა დადასტურდა"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {en
            ? "Your phone verification expired or could not be linked. Add the number again in Account to use phone sign-in and choose promotional SMS."
            : "ნომრის დადასტურებას ვადა გაუვიდა ან მიბმა ვერ მოხერხდა. ტელეფონით შესასვლელად და მარკეტინგული SMS-ის ასარჩევად ნომერი ანგარიშიდან ხელახლა დაამატე."}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild variant="mystic">
            <Link href={verifiedSignedIn ? "/account" : "/login?verified=1"}>
              {verifiedSignedIn
                ? en
                  ? "Add number in Account"
                  : "ნომრის დამატება ანგარიშში"
                : en
                  ? "Sign in"
                  : "შესვლა"}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={continueHref}>{en ? "Continue" : "გაგრძელება"}</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-[var(--vivida-cyan)]/15 ring-1 ring-[var(--vivida-cyan)]/40">
          <MailCheck className="size-6 text-[var(--vivida-cyan)]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            {en ? "Check your inbox" : "შემოწმე საფოსტო ყუთი"}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {en ? "We sent an email to " : "გამოგიგზავნეთ წერილი "}
            <span className="text-foreground">{email}</span>
            {en
              ? ". Enter the 6-digit email code below, or open the link and choose your password there."
              : "-ზე. ქვემოთ შეიყვანე ელფოსტის 6-ნიშნა კოდი, ან გახსენი ლინკი და იქ დააყენე პაროლი."}
          </p>
          {phoneClaim && (
            <p className="mt-2 text-xs text-muted-foreground">
              {en
                ? "Use the email code below to link the number you just verified. If you use the email link, add the number later in Account."
                : "ახლახან დადასტურებული ნომრის მისაბმელად ქვემოთ ელფოსტის კოდი გამოიყენე. თუ ელფოსტის ლინკს გახსნი, ნომერს მოგვიანებით ანგარიშიდან დაამატებ."}
            </p>
          )}
          {hasUnverifiedPhone && (
            <p className="mt-2 text-xs text-muted-foreground">
              {en
                ? "The unverified number was not added. You can add it later in Account."
                : "დაუდასტურებელი ნომერი არ დამატებულა. მისი დამატება მოგვიანებით ანგარიშიდან შეგიძლია."}
            </p>
          )}
        </div>

        {/* OTP code entry, the easy path for users who struggle with links */}
        <form onSubmit={verifyCode} className="space-y-3 text-left">
          <div className="space-y-1.5">
            <Label htmlFor="code">
              {en ? "Verification code" : "დადასტურების კოდი"}
            </Label>
            <Input
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              disabled={verifying}
              className="text-center text-lg tracking-[0.4em]"
            />
          </div>
          {codeError && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {codeError}
            </div>
          )}
          <Button
            type="submit"
            variant="mystic"
            size="lg"
            className="w-full"
            disabled={verifying || code.length !== 6}
          >
            {verifying && <Loader2 className="size-4 animate-spin" />}
            {verifying
              ? en
                ? "Verifying…"
                : "მოწმდება…"
              : en
                ? "Verify"
                : "დადასტურება"}
          </Button>
        </form>

        <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-left text-xs text-muted-foreground">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-muted-foreground/70" />
          {en
            ? "Can't find the email? Check spam or request it again from the "
            : "ვერ ნახავ წერილს? ნახე spam-ში ან "}
          <Link href="/login" className="underline-offset-2 hover:underline">
            {en ? "sign-in page" : "შესვლის გვერდიდან"}
          </Link>{" "}
          {en ? "." : " მოითხოვე ხელახლა."}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">{en ? "Name" : "სახელი"}</Label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="given-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
          placeholder={en ? "e.g. Alex" : "მაგ. გიორგი"}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">{en ? "Email" : "ელფოსტა"}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">{en ? "Password" : "პაროლი"}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          {en ? "At least 8 characters." : "მინიმუმ 8 სიმბოლო."}
        </p>
      </div>

      {/* Phone verification is Georgian-host only (SMS codes go to Georgian
          numbers); the whole optional-number block stays off on English. */}
      {!en && (
        <div className="space-y-1.5">
          <Label>
            {en
              ? "Mobile number (optional)"
              : "მობილურის ნომერი (არასავალდებულო)"}
          </Label>
          <PhoneVerify
            locale={locale}
            purpose="signup"
            disabled={isPending}
            onVerified={({ phone: verifiedPhone, claimToken }) => {
              setPhoneClaim({ phone: verifiedPhone, claimToken });
              setSmsMarketing(false);
              setError(null);
            }}
            onReset={() => {
              setPhoneClaim(null);
              setSmsMarketing(false);
            }}
            onInputChange={setPhoneInput}
          />
          <p className="text-xs text-muted-foreground">
            {en
              ? "After the SMS code, complete email verification with the code sent to your inbox to link this number for sign-in. You can also add it later in Account."
              : "SMS კოდის შემდეგ ელფოსტაზეც გამოგზავნილი კოდი შეიყვანე, რომ ნომრით შესვლა ჩაირთოს. ნომრის დამატება მოგვიანებითაც შეგიძლია ანგარიშიდან."}
          </p>
          {hasUnverifiedPhone && (
            <p role="status" className="text-xs text-muted-foreground">
              {en
                ? "You can create your account now. This number will only be added after SMS verification."
                : "ანგარიშის შექმნა ახლაც შეგიძლია. ნომერი მხოლოდ SMS დადასტურების შემდეგ დაემატება."}
            </p>
          )}
          <SmsMarketingToggle
            locale={locale}
            checked={smsMarketing}
            onChange={setSmsMarketing}
            disabled={!phoneClaim || isPending}
          />
          {!phoneClaim && (
            <p className="text-xs text-muted-foreground">
              {en
                ? "Verify your number to choose promotional SMS. Verification codes are sent regardless of this setting."
                : "მარკეტინგული SMS-ის ასარჩევად ჯერ ნომერი დაადასტურე. დადასტურების კოდი ამ პარამეტრზე არ არის დამოკიდებული."}
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <TurnstileWidget
        key={turnstileKey}
        locale={locale}
        onChange={setTurnstileToken}
      />

      <Button
        type="submit"
        variant="mystic"
        size="lg"
        className="w-full"
        disabled={submitDisabled}
      >
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {isPending
          ? en
            ? "Creating account…"
            : "ანგარიშის შექმნა…"
          : en
            ? "Create account"
            : "ანგარიშის შექმნა"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        {en
          ? "By creating an account, you agree to the "
          : "რეგისტრაციით ეთანხმები "}
        <Link href="/terms" className="underline-offset-2 hover:underline">
          {en ? "Terms" : "წესებსა და პირობებს"}
        </Link>{" "}
        {en ? " and " : " და "}
        <Link href="/privacy" className="underline-offset-2 hover:underline">
          {en ? "Privacy Policy" : "კონფიდენციალურობის პოლიტიკას"}
        </Link>
        .
      </p>
    </form>
  );
}
