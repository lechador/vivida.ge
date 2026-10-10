"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import QRCode from "qrcode";

import { buildSolanaPayUrl, serviceCover } from "@/lib/bazaar-pure";

/**
 * Insight Bazaar — single-view marketplace client. One public URL
 * (/readings) drives every state through query params so the English
 * rewrite table (exact paths only) keeps working: ?service=<id>,
 * ?provider=<id>, ?view=bookings|apply.
 */

type ProviderRef = {
  id: string;
  displayName: string;
  headline: string;
  bio: string;
  specialties: string[];
  avgRating100: number | null;
  reviewCount: number;
  avatarUrl?: string | null;
};

type Service = {
  id: string;
  title: string;
  description: string;
  category: string;
  priceUsdcCents: number;
  deliveryPromise: string;
  imageUrl?: string | null;
  provider: ProviderRef;
};

type BookingBuyer = {
  id: string;
  status: string;
  priceUsdcCents: number;
  providerWallet: string;
  deliveryText: string | null;
  txSignature: string | null;
  createdAt: string;
  serviceId: string;
  serviceTitle: string;
  providerDisplayName: string;
  providerId: string;
};

type BookingProvider = {
  id: string;
  status: string;
  priceUsdcCents: number;
  buyerNote: string;
  deliveryText: string | null;
  txSignature: string | null;
  createdAt: string;
  serviceId: string;
  serviceTitle: string;
};

const CATEGORIES = [
  { id: "all", label: "Everything" },
  { id: "tarot", label: "Tarot" },
  { id: "natal", label: "Birth chart" },
  { id: "compatibility", label: "Compatibility" },
  { id: "other", label: "Other" },
] as const;

function price(cents: number): string {
  return (cents / 100).toFixed(2);
}

function rating(avg100: number | null): string {
  if (avg100 == null) return "New";
  return `${(avg100 / 100).toFixed(1)} ★`;
}

const CATEGORY_LABELS: Record<string, string> = {
  tarot: "Tarot",
  natal: "Birth chart",
  compatibility: "Compatibility",
  other: "Other",
};

function categoryLabel(slug: string): string {
  return CATEGORY_LABELS[slug] ?? "Other";
}

function reviewCountLabel(n: number): string {
  return `${n} review${n === 1 ? "" : "s"}`;
}

/** Reader portrait; initials on cosmic gradient when no photo yet. */
function ReaderAvatar({
  name,
  avatarUrl,
  size = 40,
}: {
  name: string;
  avatarUrl?: string | null;
  size?: number;
}) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={`${name}, astrology reader`}
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover ring-1 ring-border/60"
      />
    );
  }
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className="grid shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] font-semibold text-white"
    >
      {initials || "✦"}
    </span>
  );
}

function statusLabel(status: string): string {
  switch (status) {
    case "pending_payment":
      return "Awaiting payment";
    case "paid":
      return "Paid — reading in progress";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  const json = (await res.json().catch(() => null)) as T & {
    error?: string;
    reason?: string;
  };
  if (!res.ok) {
    const err = new Error(
      (json as { error?: string })?.error ?? "request_failed",
    );
    (err as { status?: number; reason?: string }).status = res.status;
    (err as { status?: number; reason?: string }).reason = (
      json as { reason?: string }
    )?.reason;
    throw err;
  }
  return json as T;
}

/** Copy helper with a transient "Copied" label. */
function useCopy(): [string | null, (text: string) => void] {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = useCallback((text: string) => {
    void navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(text);
        setTimeout(() => setCopied(null), 1600);
      },
      () => undefined,
    );
  }, []);
  return [copied, copy];
}

export function ReadingsApp() {
  const router = useRouter();
  const params = useSearchParams();
  const serviceId = params.get("service");
  const providerId = params.get("provider");
  const view = params.get("view");

  const go = useCallback(
    (next: Record<string, string | null>) => {
      const q = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(next)) {
        if (v == null) q.delete(k);
        else q.set(k, v);
      }
      const s = q.toString();
      router.replace(s ? `/readings?${s}` : "/readings", { scroll: false });
    },
    [params, router],
  );

  const [services, setServices] = useState<Service[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let live = true;
    api<{ services: Service[] }>("/api/bazaar/services")
      .then((d) => {
        if (live) setServices(d.services);
      })
      .catch(() => {
        if (live) setLoadError(true);
      });
    return () => {
      live = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (services ?? []).filter(
      (s) =>
        (category === "all" || s.category === category) &&
        (!q ||
          `${s.title} ${s.description} ${s.provider.displayName}`
            .toLowerCase()
            .includes(q)),
    );
  }, [services, category, query]);

  const selectedService = serviceId
    ? ((services ?? []).find((s) => s.id === serviceId) ?? null)
    : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
      {/* Masthead — editorial row, not a centered hero. */}
      <div className="flex flex-col gap-6 border-b border-border/40 pb-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--vivida-cyan)]">
            Insight Bazaar
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            A human reading,{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink))] bg-clip-text text-transparent">
              commissioned like art
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Tarot spreads, birth-chart interpretations, and compatibility
            sessions from vetted readers. You pay in USDC on Solana — straight
            to your reader&apos;s wallet. Birth details stay private and
            off-chain, always.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            onClick={() =>
              go({ view: "bookings", service: null, provider: null })
            }
            className="rounded-full border border-border/60 px-4 py-2 text-sm font-medium transition-colors hover:border-foreground/40"
          >
            My readings
          </button>
          <button
            onClick={() => go({ view: "apply", service: null, provider: null })}
            className="rounded-full bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink))] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-950/30"
          >
            Become a reader
          </button>
        </div>
      </div>

      {view === "bookings" ? (
        <BookingsView onBack={() => go({ view: null })} />
      ) : view === "apply" ? (
        <ApplyView onBack={() => go({ view: null })} />
      ) : providerId ? (
        <ProviderView
          key={providerId}
          providerId={providerId}
          services={services}
          onService={(id) => go({ service: id, provider: null })}
          onBack={() => go({ provider: null })}
        />
      ) : serviceId ? (
        <ServiceView
          key={serviceId}
          serviceId={serviceId}
          cached={selectedService}
          loading={services === null}
          onProvider={(id) => go({ provider: id, service: null })}
          onBack={() => go({ service: null })}
        />
      ) : (
        <>
          {/* Filter rail */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              aria-label="Categories"
            >
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={category === c.id}
                  onClick={() => setCategory(c.id)}
                  className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                    category === c.id
                      ? "bg-foreground font-semibold text-background"
                      : "border border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search readings or readers…"
              className="w-full rounded-xl border border-border/60 bg-card/40 px-4 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-[var(--vivida-cyan)]/60 sm:max-w-xs"
            />
          </div>

          {/* Listing — horizontal rows, reader-first. */}
          <div className="mt-6">
            {services === null && !loadError && (
              <div className="space-y-3" aria-label="Loading">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-28 animate-pulse rounded-2xl bg-card/40"
                  />
                ))}
              </div>
            )}
            {loadError && (
              <p className="rounded-2xl border border-border/50 p-6 text-sm text-muted-foreground">
                The marketplace couldn&apos;t load. Check your connection and
                refresh.
              </p>
            )}
            {services !== null && filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center">
                <p className="text-lg font-semibold">No readings yet</p>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  {services.length === 0
                    ? "Our first readers are being vetted right now. Check back soon — or apply to be one of them."
                    : "Nothing matches that search. Try a different word or category."}
                </p>
                {services.length === 0 && (
                  <button
                    onClick={() => go({ view: "apply" })}
                    className="mt-5 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background"
                  >
                    Apply as a reader
                  </button>
                )}
              </div>
            )}
            {/* Listing — featured banner + card grid. */}
            <div className="mt-6">
              {filtered.length > 0 && (
                <button
                  onClick={() => go({ service: filtered[0].id })}
                  className="group relative block w-full overflow-hidden rounded-3xl border border-border/40 text-left"
                >
                  <div className="relative aspect-[16/10] sm:aspect-[16/6]">
                    <Image
                      src={serviceCover(
                        filtered[0].imageUrl,
                        filtered[0].category,
                      )}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 1152px"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      priority
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,oklch(0.08_0.02_280/0.55)_62%,oklch(0.07_0.02_280/0.94)_100%)]"
                    />
                    <div className="absolute left-4 top-4 flex flex-wrap gap-2 sm:left-6 sm:top-6">
                      <span className="rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--vivida-pink)] backdrop-blur">
                        {categoryLabel(filtered[0].category)}
                      </span>
                      {filtered[0].deliveryPromise && (
                        <span className="rounded-full bg-black/55 px-3 py-1 text-[11px] font-medium text-white/85 backdrop-blur">
                          {filtered[0].deliveryPromise}
                        </span>
                      )}
                    </div>
                    <span className="absolute right-4 top-4 rounded-full bg-black/55 px-3.5 py-1.5 text-base font-semibold tabular-nums text-white backdrop-blur sm:right-6 sm:top-6">
                      {price(filtered[0].priceUsdcCents)}{" "}
                      <span className="text-xs font-normal text-white/70">
                        USDC
                      </span>
                    </span>
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 sm:p-6">
                      <div className="min-w-0">
                        <p className="text-2xl font-semibold leading-tight tracking-tight text-white drop-shadow sm:text-4xl">
                          {filtered[0].title}
                        </p>
                        <div className="mt-2 flex items-center gap-2.5">
                          <ReaderAvatar
                            name={filtered[0].provider.displayName}
                            avatarUrl={filtered[0].provider.avatarUrl}
                            size={32}
                          />
                          <p className="truncate text-sm text-white/85">
                            {filtered[0].provider.displayName} ·{" "}
                            {rating(filtered[0].provider.avgRating100)}
                            {filtered[0].provider.reviewCount > 0 &&
                              ` (${filtered[0].provider.reviewCount})`}
                          </p>
                        </div>
                      </div>
                      <span
                        aria-hidden
                        className="hidden shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-transform group-hover:translate-x-1 sm:inline-flex"
                      >
                        Book →
                      </span>
                    </div>
                  </div>
                </button>
              )}
              {filtered.length > 1 && (
                <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                  {filtered.slice(1).map((s) => (
                    <li key={s.id}>
                      <button
                        onClick={() => go({ service: s.id })}
                        className="group block w-full overflow-hidden rounded-3xl border border-border/40 bg-card/30 text-left transition-colors hover:border-foreground/25"
                      >
                        <div className="relative aspect-[16/8]">
                          <Image
                            src={serviceCover(s.imageUrl, s.category)}
                            alt=""
                            fill
                            sizes="(max-width: 768px) 100vw, 568px"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            loading="lazy"
                          />
                          <div
                            aria-hidden
                            className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,oklch(0.07_0.02_280/0.85)_100%)]"
                          />
                          <span className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--vivida-pink)] backdrop-blur">
                            {categoryLabel(s.category)}
                          </span>
                          <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-3 py-1 text-sm font-semibold tabular-nums text-white backdrop-blur">
                            {price(s.priceUsdcCents)}{" "}
                            <span className="text-[11px] font-normal text-white/70">
                              USDC
                            </span>
                          </span>
                        </div>
                        <div className="p-4">
                          <p className="text-lg font-semibold leading-snug group-hover:underline">
                            {s.title}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {s.description}
                          </p>
                          <div className="mt-3 flex items-center gap-2">
                            <ReaderAvatar
                              name={s.provider.displayName}
                              avatarUrl={s.provider.avatarUrl}
                              size={28}
                            />
                            <p className="truncate text-xs text-muted-foreground">
                              {s.provider.displayName} ·{" "}
                              {rating(s.provider.avgRating100)}
                              {s.provider.reviewCount > 0 &&
                                ` (${s.provider.reviewCount})`}
                              {s.deliveryPromise
                                ? ` · ${s.deliveryPromise}`
                                : ""}
                            </p>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Trust strip */}
          <div className="mt-12 grid gap-3 rounded-2xl border border-border/40 bg-card/30 p-6 text-sm sm:grid-cols-3">
            <div>
              <p className="font-semibold">Vetted readers</p>
              <p className="mt-1 text-muted-foreground">
                Every reader is approved by the Vivida team before listing.
              </p>
            </div>
            <div>
              <p className="font-semibold">Direct USDC payment</p>
              <p className="mt-1 text-muted-foreground">
                You pay your reader&apos;s Solana wallet from your own app —
                verified on-chain before the reading begins.
              </p>
            </div>
            <div>
              <p className="font-semibold">Private by design</p>
              <p className="mt-1 text-muted-foreground">
                Birth details and readings live only in your booking, visible to
                you and your reader. Never on-chain.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Service detail + booking ─────────────────────────────────────────── */

function ServiceView({
  serviceId,
  cached,
  loading,
  onProvider,
  onBack,
}: {
  serviceId: string;
  cached: Service | null;
  loading: boolean;
  onProvider: (id: string) => void;
  onBack: () => void;
}) {
  const [fetched, setFetched] = useState<Service | null>(null);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [wallet, setWallet] = useState<string | null>(null);

  // Deep-link entry: the marketplace list doesn't carry this service, so
  // fetch it directly. Async callbacks only — no synchronous setState.
  useEffect(() => {
    if (cached || fetched || fetchFailed) return;
    let live = true;
    api<{ service: Service & { providerWallet: string } }>(
      `/api/bazaar/services/${serviceId}`,
    )
      .then((d) => {
        if (!live) return;
        setFetched(d.service);
        setWallet(d.service.providerWallet);
      })
      .catch(() => {
        if (live) setFetchFailed(true);
      });
    return () => {
      live = false;
    };
  }, [cached, fetched, fetchFailed, serviceId]);

  const service = cached ?? fetched;
  const fetching = !cached && !fetched && !fetchFailed;
  const missing = !service && !fetching && !loading;

  useEffect(() => {
    if (!service || wallet) return;
    let live = true;
    api<{ service: Service & { providerWallet: string } }>(
      `/api/bazaar/services/${service.id}`,
    )
      .then((d) => {
        if (live) setWallet(d.service.providerWallet);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [service, wallet]);

  if (missing || (!loading && !service)) {
    return (
      <DetailShell onBack={onBack}>
        <p className="text-lg font-semibold">Reading not found</p>
        <p className="mt-2 text-sm text-muted-foreground">
          It may have been paused by the reader. Browse the marketplace for
          alternatives.
        </p>
      </DetailShell>
    );
  }
  if (!service) {
    return (
      <DetailShell onBack={onBack}>
        <div className="h-40 animate-pulse rounded-2xl bg-card/40" />
      </DetailShell>
    );
  }

  return (
    <DetailShell onBack={onBack}>
      <div className="relative overflow-hidden rounded-3xl border border-border/40">
        <div className="relative aspect-[16/8] sm:aspect-[16/5]">
          <Image
            src={serviceCover(service.imageUrl, service.category)}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 1152px"
            className="object-cover"
            priority
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,oklch(0.07_0.02_280/0.88)_100%)]"
          />
          <span className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--vivida-pink)] backdrop-blur sm:left-6 sm:top-6">
            {categoryLabel(service.category)}
          </span>
        </div>
      </div>
      <div className="mt-6 grid gap-10 md:grid-cols-[1fr_340px]">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {service.title}
          </h2>
          <button
            onClick={() => onProvider(service.provider.id)}
            className="mt-3 flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground hover:underline"
          >
            <ReaderAvatar
              name={service.provider.displayName}
              avatarUrl={service.provider.avatarUrl}
              size={28}
            />
            <span>
              by {service.provider.displayName} ·{" "}
              {rating(service.provider.avgRating100)}
              {service.provider.reviewCount > 0 &&
                ` · ${service.provider.reviewCount} ${reviewCountLabel(service.provider.reviewCount)}`}
            </span>
          </button>
          <p className="mt-5 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
            {service.description}
          </p>
          <div className="mt-6 rounded-2xl border border-border/40 bg-card/30 p-5">
            <p className="font-semibold">{service.provider.displayName}</p>
            <p className="text-sm text-muted-foreground">
              {service.provider.headline}
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
              {service.provider.bio}
            </p>
          </div>
        </div>
        <aside className="md:sticky md:top-6 md:self-start">
          <BookingCard service={service} providerWallet={wallet} />
        </aside>
      </div>
    </DetailShell>
  );
}

function DetailShell({
  onBack,
  children,
}: {
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8">
      <button
        onClick={onBack}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← All readings
      </button>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function BookingCard({
  service,
  providerWallet,
}: {
  service: Service;
  providerWallet: string | null;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [booking, setBooking] = useState<{
    id: string;
    priceUsdcCents: number;
    providerWallet: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, copy] = useCopy();

  async function reserve() {
    setBusy(true);
    setError(null);
    try {
      const d = await api<{
        id: string;
        priceUsdcCents: number;
        providerWallet: string;
      }>("/api/bazaar/bookings", {
        method: "POST",
        body: JSON.stringify({ serviceId: service.id, buyerNote: note }),
      });
      setBooking(d);
    } catch (e) {
      const status = (e as { status?: number }).status;
      if (status === 401) {
        router.push(
          `/login?next=${encodeURIComponent(`/readings?service=${service.id}`)}`,
        );
        return;
      }
      setError(
        status === 404
          ? "This reading is no longer available."
          : "Couldn't create your booking. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  const wallet = booking?.providerWallet ?? providerWallet;

  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 p-6">
      <p className="text-2xl font-semibold tabular-nums">
        {price(service.priceUsdcCents)}{" "}
        <span className="text-sm font-normal text-muted-foreground">USDC</span>
      </p>
      {service.deliveryPromise && (
        <p className="mt-1 text-xs text-muted-foreground">
          {service.deliveryPromise}
        </p>
      )}

      {!booking ? (
        <div className="mt-5">
          <label htmlFor="buyer-note" className="text-sm font-medium">
            Your question + birth details{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </label>
          <textarea
            id="buyer-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            maxLength={4000}
            placeholder="What you want guidance on, plus date, time and place of birth if relevant…"
            className="mt-2 w-full rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-[var(--vivida-cyan)]/60"
          />
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Shown only to {service.provider.displayName}. Never published, never
            put on the blockchain.
          </p>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          <button
            onClick={reserve}
            disabled={busy}
            className="mt-4 w-full rounded-xl bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink))] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-950/30 disabled:opacity-60"
          >
            {busy ? "Reserving…" : "Reserve this reading"}
          </button>
        </div>
      ) : (
        <PaymentStep
          bookingId={booking.id}
          priceUsdcCents={booking.priceUsdcCents}
          providerWallet={booking.providerWallet}
          wallet={wallet}
          copied={copied}
          copy={copy}
        />
      )}
    </div>
  );
}

function PaymentStep({
  bookingId,
  priceUsdcCents,
  providerWallet,
  wallet,
  copied,
  copy,
}: {
  bookingId: string;
  priceUsdcCents: number;
  providerWallet: string;
  wallet: string | null;
  copied: string | null;
  copy: (t: string) => void;
}) {
  const [sig, setSig] = useState("");
  const [payer, setPayer] = useState("");
  const [qr, setQr] = useState<string | null>(null);
  const [state, setState] = useState<
    "idle" | "checking" | "paid" | "pending" | "failed"
  >("idle");
  const [detail, setDetail] = useState<string | null>(null);

  const payUrl = buildSolanaPayUrl({
    recipient: wallet ?? providerWallet,
    priceUsdcCents,
    label: "Vivida",
    message: "Insight Bazaar reading",
  });

  useEffect(() => {
    if (!payUrl) return;
    let live = true;
    QRCode.toDataURL(payUrl, { width: 200, margin: 1 })
      .then((url) => {
        if (live) setQr(url);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [payUrl]);

  async function verify() {
    if (!sig.trim() || !payer.trim()) return;
    setState("checking");
    setDetail(null);
    try {
      const d = await api<{ ok: boolean; status?: string; reason?: string }>(
        `/api/bazaar/bookings/${bookingId}/verify-payment`,
        {
          method: "POST",
          body: JSON.stringify({
            txSignature: sig.trim(),
            payerWallet: payer.trim(),
          }),
        },
      );
      if (d.status === "paid" || d.status === "delivered") {
        setState("paid");
        return;
      }
      // 202: accepted, the chain just hasn't indexed the signature yet.
      setState("pending");
      setDetail(
        "The network hasn't indexed this transaction yet — it usually appears within a minute. Wait a little, then check again.",
      );
    } catch (e) {
      const status = (e as { status?: number }).status;
      const reason = (e as { reason?: string }).reason;
      if (status === 503 || reason === "unavailable") {
        setState("pending");
        setDetail(
          "We couldn't reach the payment network just now — give it a minute and check again.",
        );
      } else if (reason === "underpaid") {
        setState("failed");
        setDetail(
          `This transaction paid less than ${price(priceUsdcCents)} USDC to the reader's wallet. Send the full amount, then submit the new signature.`,
        );
      } else if (reason === "already_used") {
        setState("failed");
        setDetail(
          "This payment is already linked to another booking. Each on-chain payment funds exactly one reading.",
        );
      } else if (reason === "not_signer") {
        setState("failed");
        setDetail(
          "That transaction wasn't sent from the wallet address above. Check the address matches the wallet you paid with.",
        );
      } else {
        setState("failed");
        setDetail(
          "We couldn't match this signature to your payment. Double-check you pasted the full signature of the transfer to the address above.",
        );
      }
    }
  }

  if (state === "paid") {
    return (
      <div className="mt-5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm">
        <p className="font-semibold text-emerald-300">Payment confirmed ✓</p>
        <p className="mt-1 text-muted-foreground">
          Your reader has your question and will deliver the reading here, in My
          readings.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 border-t border-border/40 pt-5 text-sm">
      <p className="font-semibold">Pay {price(priceUsdcCents)} USDC</p>
      <ol className="mt-3 list-decimal space-y-3 pl-5 text-muted-foreground">
        <li>
          Pay exactly{" "}
          <strong className="text-foreground">
            {price(priceUsdcCents)} USDC
          </strong>{" "}
          on <strong className="text-foreground">Solana</strong> — scan the code
          or open your wallet with the amount prefilled:
          {qr && payUrl ? (
            <div className="mt-3 flex flex-col items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qr}
                alt={`QR code: pay ${price(priceUsdcCents)} USDC to the reader`}
                width={180}
                height={180}
                className="rounded-xl border border-border/60 bg-white p-2"
              />
              <a
                href={payUrl}
                className="rounded-xl bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink))] px-4 py-2 text-sm font-semibold text-white"
              >
                Open in wallet
              </a>
            </div>
          ) : null}
          <p className="mt-2">
            Or send manually from Phantom, Solflare, or any wallet to:
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="min-w-0 flex-1 break-all rounded-lg bg-background/70 px-2 py-1.5 font-mono text-[11px] text-foreground">
              {wallet ?? providerWallet}
            </code>
            <button
              onClick={() => copy(wallet ?? providerWallet)}
              className="shrink-0 rounded-lg border border-border/60 px-2.5 py-1.5 text-xs font-medium hover:border-foreground/40"
            >
              {copied === (wallet ?? providerWallet) ? "Copied" : "Copy"}
            </button>
          </div>
        </li>
        <li>
          Paste the wallet address you paid from — we check the payment was
          really sent by you.
          <input
            value={payer}
            onChange={(e) => {
              setPayer(e.target.value);
              if (state !== "idle") setState("idle");
            }}
            placeholder="Your Solana wallet address"
            spellCheck={false}
            className="mt-2 w-full rounded-xl border border-border/60 bg-background/60 px-3 py-2 font-mono text-xs outline-none placeholder:font-sans placeholder:text-muted-foreground/60 focus:border-[var(--vivida-cyan)]/60"
          />
        </li>
        <li>
          Paste the transaction signature below.
          <input
            value={sig}
            onChange={(e) => {
              setSig(e.target.value);
              if (state !== "idle") setState("idle");
            }}
            placeholder="e.g. 5UfDu…"
            spellCheck={false}
            className="mt-2 w-full rounded-xl border border-border/60 bg-background/60 px-3 py-2 font-mono text-xs outline-none placeholder:font-sans placeholder:text-muted-foreground/60 focus:border-[var(--vivida-cyan)]/60"
          />
        </li>
      </ol>
      {state === "pending" || state === "failed" ? (
        <p className="mt-3 rounded-xl bg-card/60 p-3 text-xs leading-relaxed text-muted-foreground">
          {detail}
        </p>
      ) : null}
      <button
        onClick={verify}
        disabled={state === "checking" || !sig.trim() || !payer.trim()}
        className="mt-4 w-full rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background disabled:opacity-50"
      >
        {state === "checking" ? "Checking Solana…" : "I've paid — verify"}
      </button>
      <a
        href={`https://solscan.io/account/${wallet ?? providerWallet}`}
        target="_blank"
        rel="noreferrer"
        className="mt-3 block text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
      >
        View the reader&apos;s wallet on Solscan
      </a>
    </div>
  );
}

/* ── Provider profile ─────────────────────────────────────────────────── */

function ProviderView({
  providerId,
  services,
  onService,
  onBack,
}: {
  providerId: string;
  services: Service[] | null;
  onService: (id: string) => void;
  onBack: () => void;
}) {
  const [data, setData] = useState<{
    id: string;
    displayName: string;
    headline: string;
    bio: string;
    specialties: string[];
    avgRating100: number | null;
    reviewCount: number;
    avatarUrl: string | null;
    services: Array<{
      id: string;
      title: string;
      description: string;
      category: string;
      priceUsdcCents: number;
      deliveryPromise: string;
    }>;
    reviews: Array<{
      id: string;
      rating: number;
      comment: string;
      createdAt: string;
    }>;
  } | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let live = true;
    api<{ provider: NonNullable<typeof data> }>(
      `/api/bazaar/providers/${providerId}`,
    )
      .then((d) => {
        if (live) setData(d.provider);
      })
      .catch(() => {
        if (live) setMissing(true);
      });
    return () => {
      live = false;
    };
  }, [providerId]);

  // Prefer the live profile, but the cached marketplace rows keep the page
  // useful while it loads.
  const fallback = (services ?? []).filter((s) => s.provider.id === providerId);

  if (missing) {
    return (
      <DetailShell onBack={onBack}>
        <p className="text-lg font-semibold">Reader not found</p>
      </DetailShell>
    );
  }
  if (!data && services === null) {
    return (
      <DetailShell onBack={onBack}>
        <div className="h-40 animate-pulse rounded-2xl bg-card/40" />
      </DetailShell>
    );
  }

  const name =
    data?.displayName ?? fallback[0]?.provider.displayName ?? "Reader";

  return (
    <DetailShell onBack={onBack}>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--vivida-cyan)]">
        Reader profile
      </p>
      <div className="mt-2 flex items-center gap-4">
        <ReaderAvatar
          name={name}
          avatarUrl={data?.avatarUrl ?? fallback[0]?.provider.avatarUrl}
          size={64}
        />
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">{name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {data?.headline ?? fallback[0]?.provider.headline ?? ""} ·{" "}
            {rating(
              data?.avgRating100 ?? fallback[0]?.provider.avgRating100 ?? null,
            )}
            {(data?.reviewCount ?? 0) > 0 &&
              ` · ${reviewCountLabel(data?.reviewCount ?? 0)}`}
          </p>
        </div>
      </div>
      {(data?.specialties ?? fallback[0]?.provider.specialties ?? []).length >
        0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {(data?.specialties ?? fallback[0]?.provider.specialties ?? []).map(
            (s) => (
              <span
                key={s}
                className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground"
              >
                {categoryLabel(s)}
              </span>
            ),
          )}
        </div>
      )}
      {(data?.bio ?? fallback[0]?.provider.bio) && (
        <p className="mt-4 max-w-3xl whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
          {data?.bio ?? fallback[0]?.provider.bio}
        </p>
      )}

      <h3 className="mt-10 text-xl font-semibold">Readings by {name}</h3>
      <ul className="mt-3 divide-y divide-border/40">
        {(data?.services ?? fallback).map((s) => (
          <li key={s.id}>
            <button
              onClick={() => onService(s.id)}
              className="group flex w-full items-center justify-between gap-4 py-4 text-left"
            >
              <span>
                <span className="block font-semibold group-hover:underline">
                  {s.title}
                </span>
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  {categoryLabel(s.category)}
                  {s.deliveryPromise ? ` · ${s.deliveryPromise}` : ""}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <span className="font-semibold tabular-nums">
                  {price(s.priceUsdcCents)}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    USDC
                  </span>
                </span>
                <span
                  aria-hidden
                  className="text-muted-foreground transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {data && data.reviews.length > 0 && (
        <>
          <h3 className="mt-10 text-xl font-semibold">
            Reviews ({data.reviewCount})
          </h3>
          <ul className="mt-3 space-y-3">
            {data.reviews.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl border border-border/40 bg-card/30 p-4"
              >
                <p className="text-sm font-semibold">
                  {"★".repeat(r.rating)}
                  <span className="text-muted-foreground">
                    {"★".repeat(5 - r.rating)}
                  </span>
                </p>
                {r.comment && (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                    {r.comment}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </DetailShell>
  );
}

/* ── My readings (buyer + provider) ───────────────────────────────────── */

function BookingsView({ onBack }: { onBack: () => void }) {
  const [data, setData] = useState<{
    asBuyer: BookingBuyer[];
    asProvider: BookingProvider[];
    ownProvider: {
      id: string;
      status: string;
      displayName: string;
      solanaWallet: string;
    } | null;
  } | null>(null);
  const [locked, setLocked] = useState(false);

  const reload = useCallback(() => {
    api<{
      asBuyer: BookingBuyer[];
      asProvider: BookingProvider[];
      ownProvider: {
        id: string;
        status: string;
        displayName: string;
        solanaWallet: string;
      } | null;
    }>("/api/bazaar/bookings")
      .then(setData)
      .catch((e) => {
        if ((e as { status?: number }).status === 401) setLocked(true);
      });
  }, []);

  useEffect(reload, [reload]);

  if (locked) {
    return (
      <DetailShell onBack={onBack}>
        <p className="text-lg font-semibold">Sign in to see your readings</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Bookings, deliveries, and reviews live here once you&apos;re signed
          in.
        </p>
        <a
          href={`/login?next=${encodeURIComponent("/readings?view=bookings")}`}
          className="mt-5 inline-block rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background"
        >
          Sign in
        </a>
      </DetailShell>
    );
  }
  if (!data) {
    return (
      <DetailShell onBack={onBack}>
        <div className="h-40 animate-pulse rounded-2xl bg-card/40" />
      </DetailShell>
    );
  }

  return (
    <DetailShell onBack={onBack}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">My readings</h2>
        <UpdatesToggle />
      </div>

      {data.asProvider.length > 0 && (
        <section className="mt-8">
          <h3 className="text-lg font-semibold">Incoming orders</h3>
          <ul className="mt-3 space-y-3">
            {data.asProvider.map((b) => (
              <ProviderOrderCard key={b.id} booking={b} onDone={reload} />
            ))}
          </ul>
        </section>
      )}

      {data.ownProvider && (
        <ProviderServicesSection
          providerStatus={data.ownProvider.status}
          displayName={data.ownProvider.displayName}
        />
      )}

      <section className={data.asProvider.length > 0 ? "mt-10" : "mt-6"}>
        <h3 className="text-lg font-semibold">My bookings</h3>
        {data.asBuyer.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
            Nothing booked yet. Find a reading in the marketplace and reserve it
            — it will appear here with its payment and delivery status.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {data.asBuyer.map((b) => (
              <BuyerBookingCard key={b.id} booking={b} onDone={reload} />
            ))}
          </ul>
        )}
      </section>
    </DetailShell>
  );
}

function BuyerBookingCard({
  booking,
  onDone,
}: {
  booking: BookingBuyer;
  onDone: () => void;
}) {
  const [sig, setSig] = useState("");
  const [payer, setPayer] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [review, setReview] = useState("");
  const [stars, setStars] = useState(5);
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewed, setReviewed] = useState(false);

  const payUrl = buildSolanaPayUrl({
    recipient: booking.providerWallet,
    priceUsdcCents: booking.priceUsdcCents,
    label: "Vivida",
    message: "Insight Bazaar reading",
  });

  async function verify() {
    setBusy(true);
    setMsg(null);
    try {
      const d = await api<{ ok: boolean; status?: string; reason?: string }>(
        `/api/bazaar/bookings/${booking.id}/verify-payment`,
        {
          method: "POST",
          body: JSON.stringify({
            txSignature: sig.trim(),
            payerWallet: payer.trim(),
          }),
        },
      );
      if (d.status === "paid" || d.status === "delivered") {
        onDone();
        return;
      }
      // 202: accepted, the chain just hasn't indexed the signature yet.
      setMsg("Not indexed yet — wait a minute and try again.");
    } catch (e) {
      const status = (e as { status?: number }).status;
      const reason = (e as { reason?: string }).reason;
      setMsg(
        status === 503 || reason === "unavailable"
          ? "We couldn't reach the payment network just now — give it a minute and check again."
          : reason === "underpaid"
            ? `That payment is short of ${price(booking.priceUsdcCents)} USDC. Send the full amount, then verify the new signature.`
            : reason === "already_used"
              ? "That payment already funds another booking."
              : reason === "not_signer"
                ? "That transaction wasn't sent from the wallet above."
                : (e as Error).message === "invalid_payer_wallet"
                  ? "Enter the wallet address you paid from."
                  : "No matching payment found. Check the signature and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function sendReview() {
    setReviewBusy(true);
    try {
      await api("/api/bazaar/reviews", {
        method: "POST",
        body: JSON.stringify({
          bookingId: booking.id,
          rating: stars,
          comment: review,
        }),
      });
      setReviewed(true);
      onDone();
    } catch {
      setMsg("Couldn't post your review. Try again.");
    } finally {
      setReviewBusy(false);
    }
  }

  async function cancelBooking() {
    if (!window.confirm("Cancel this booking? No payment has been made.")) {
      return;
    }
    setBusy(true);
    try {
      await api(`/api/bazaar/bookings/${booking.id}/cancel`, {
        method: "POST",
      });
      onDone();
    } catch {
      setMsg("Couldn't cancel. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded-2xl border border-border/40 bg-card/30 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold">{booking.serviceTitle}</p>
        <p className="text-sm text-muted-foreground">
          {price(booking.priceUsdcCents)} USDC · {statusLabel(booking.status)}
        </p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {booking.providerDisplayName} · booked{" "}
        {new Date(booking.createdAt).toLocaleDateString("en-US")}
      </p>

      {booking.status === "pending_payment" && (
        <div className="mt-4 border-t border-border/40 pt-4 text-sm">
          <p className="text-muted-foreground">
            Pay {price(booking.priceUsdcCents)} USDC on Solana to{" "}
            <code className="break-all font-mono text-[11px] text-foreground">
              {booking.providerWallet}
            </code>{" "}
            {payUrl ? (
              <>
                —{" "}
                <a
                  href={payUrl}
                  className="font-medium text-[var(--vivida-cyan)] underline-offset-2 hover:underline"
                >
                  open in your wallet with the amount prefilled
                </a>
              </>
            ) : null}
          </p>
          <div className="mt-2 grid gap-2">
            <input
              value={payer}
              onChange={(e) => setPayer(e.target.value)}
              placeholder="Your Solana wallet address (you paid from)"
              spellCheck={false}
              className="w-full rounded-xl border border-border/60 bg-background/60 px-3 py-2 font-mono text-xs outline-none placeholder:font-sans placeholder:text-muted-foreground/60 focus:border-[var(--vivida-cyan)]/60"
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={sig}
                onChange={(e) => setSig(e.target.value)}
                placeholder="Transaction signature"
                spellCheck={false}
                className="flex-1 rounded-xl border border-border/60 bg-background/60 px-3 py-2 font-mono text-xs outline-none placeholder:font-sans placeholder:text-muted-foreground/60 focus:border-[var(--vivida-cyan)]/60"
              />
              <button
                onClick={verify}
                disabled={busy || !sig.trim() || !payer.trim()}
                className="rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background disabled:opacity-50"
              >
                {busy ? "Checking…" : "Verify"}
              </button>
            </div>
          </div>
          {msg && <p className="mt-2 text-xs text-muted-foreground">{msg}</p>}
          <button
            onClick={cancelBooking}
            disabled={busy}
            className="mt-3 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline disabled:opacity-50"
          >
            Cancel this booking
          </button>
        </div>
      )}

      {booking.deliveryText && (
        <div className="mt-4 border-t border-border/40 pt-4">
          <p className="text-sm font-semibold">Your reading</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
            {booking.deliveryText}
          </p>
        </div>
      )}

      {booking.status === "delivered" && !reviewed && (
        <div className="mt-4 border-t border-border/40 pt-4">
          <p className="text-sm font-semibold">Leave a review</p>
          <div
            className="mt-2 flex gap-1"
            role="radiogroup"
            aria-label="Rating"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                role="radio"
                aria-checked={stars === n}
                onClick={() => setStars(n)}
                className={`text-xl ${n <= stars ? "text-amber-300" : "text-muted-foreground/40"}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="How was your reading? (optional, public)"
            className="mt-2 w-full rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-[var(--vivida-cyan)]/60"
          />
          <button
            onClick={sendReview}
            disabled={reviewBusy}
            className="mt-2 rounded-xl border border-border/60 px-4 py-2 text-sm font-medium hover:border-foreground/40 disabled:opacity-50"
          >
            {reviewBusy ? "Posting…" : "Post review"}
          </button>
          {msg && <p className="mt-2 text-xs text-muted-foreground">{msg}</p>}
        </div>
      )}
      {reviewed && (
        <p className="mt-4 text-sm text-emerald-300">
          Thanks — your review is live on the reader&apos;s profile.
        </p>
      )}
    </li>
  );
}

function ProviderOrderCard({
  booking,
  onDone,
}: {
  booking: BookingProvider;
  onDone: () => void;
}) {
  const [text, setText] = useState(booking.deliveryText ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function deliver() {
    setBusy(true);
    setMsg(null);
    try {
      await api(`/api/bazaar/bookings/${booking.id}/deliver`, {
        method: "POST",
        body: JSON.stringify({ deliveryText: text }),
      });
      onDone();
    } catch (e) {
      const status = (e as { status?: number }).status;
      setMsg(
        status === 409
          ? "This order isn't paid yet — delivery unlocks after payment verifies."
          : "Couldn't deliver. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function decline() {
    if (!window.confirm("Decline this order? The buyer hasn't paid yet.")) {
      return;
    }
    setBusy(true);
    try {
      await api(`/api/bazaar/bookings/${booking.id}/cancel`, {
        method: "POST",
      });
      onDone();
    } catch {
      setMsg("Couldn't decline. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded-2xl border border-border/40 bg-card/30 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold">{booking.serviceTitle}</p>
        <p className="text-sm text-muted-foreground">
          {price(booking.priceUsdcCents)} USDC · {statusLabel(booking.status)}
        </p>
      </div>
      {booking.buyerNote && (
        <div className="mt-3 rounded-xl bg-background/50 p-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Buyer&apos;s question + birth details (private)
          </p>
          <p className="mt-1 whitespace-pre-wrap leading-relaxed">
            {booking.buyerNote}
          </p>
        </div>
      )}
      {booking.status === "pending_payment" && (
        <div className="mt-3 border-t border-border/40 pt-3 text-sm">
          <p className="text-muted-foreground">
            Waiting for the buyer&apos;s USDC payment. Decline removes the order
            before any money moves.
          </p>
          <button
            onClick={decline}
            disabled={busy}
            className="mt-2 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline disabled:opacity-50"
          >
            Decline order
          </button>
          {msg && <p className="mt-2 text-xs text-red-400">{msg}</p>}
        </div>
      )}
      {booking.status === "paid" && (
        <div className="mt-3">
          <label className="text-sm font-medium">Deliver the reading</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            maxLength={20000}
            placeholder="Write the full reading here…"
            className="mt-2 w-full rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-[var(--vivida-cyan)]/60"
          />
          {msg && <p className="mt-2 text-xs text-red-400">{msg}</p>}
          <button
            onClick={deliver}
            disabled={busy || !text.trim()}
            className="mt-2 rounded-xl bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink))] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Delivering…" : "Deliver reading"}
          </button>
        </div>
      )}
      {booking.status === "delivered" && booking.deliveryText && (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {booking.deliveryText}
        </p>
      )}
    </li>
  );
}

/** One-tap email opt-out for marketplace mail (paid orders, deliveries). */
function UpdatesToggle() {
  const [on, setOn] = useState<boolean | null>(null);

  useEffect(() => {
    let live = true;
    api<{ bazaarUpdates: boolean }>("/api/bazaar/updates")
      .then((d) => {
        if (live) setOn(d.bazaarUpdates);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, []);

  async function flip() {
    if (on === null) return;
    const next = !on;
    setOn(next);
    try {
      await api("/api/bazaar/updates", {
        method: "POST",
        body: JSON.stringify({ enabled: next }),
      });
    } catch {
      setOn(!next);
    }
  }

  if (on === null) return null;
  return (
    <button
      onClick={flip}
      aria-pressed={on}
      className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      title="Order and delivery emails for your readings"
    >
      {on ? "✓ Order emails on" : "Order emails off"}
    </button>
  );
}

/* ── Reader service management ────────────────────────────────────────── */
type OwnService = {
  id: string;
  title: string;
  description: string;
  category: string;
  priceUsdcCents: number;
  deliveryPromise: string;
  status: string;
};

function ProviderServicesSection({
  providerStatus,
  displayName,
}: {
  providerStatus: string;
  displayName: string;
}) {
  const [services, setServices] = useState<OwnService[] | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const reload = useCallback(() => {
    api<{ services: OwnService[] }>("/api/bazaar/mine")
      .then((d) => setServices(d.services))
      .catch(() => setMsg("Couldn't load your services."));
  }, []);

  useEffect(reload, [reload]);

  async function setStatus(id: string, status: "active" | "paused") {
    setMsg(null);
    try {
      await api(`/api/bazaar/services/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      reload();
    } catch {
      setMsg("Couldn't update that service. Try again.");
    }
  }

  return (
    <section className="mt-10">
      <h3 className="text-lg font-semibold">Your services</h3>
      {providerStatus === "pending" && (
        <p className="mt-3 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm">
          {displayName} is under review — the Vivida team approves readers by
          hand. You can list services here as soon as your profile is approved.
        </p>
      )}
      {providerStatus === "suspended" && (
        <p className="mt-3 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm">
          Your reader profile is suspended — listings are hidden. Contact us to
          resolve this.
        </p>
      )}
      {msg && <p className="mt-3 text-sm text-red-400">{msg}</p>}
      {services === null ? (
        <div className="mt-3 h-20 animate-pulse rounded-2xl bg-card/40" />
      ) : (
        <ul className="mt-3 space-y-3">
          {services.map((s) => (
            <li
              key={s.id}
              className="rounded-2xl border border-border/40 bg-card/30 p-4"
            >
              {editingId === s.id ? (
                <ServiceForm
                  initial={s}
                  onDone={() => {
                    setEditingId(null);
                    reload();
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {s.title}{" "}
                      <span
                        className={`ml-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          s.status === "active"
                            ? "bg-emerald-400/15 text-emerald-300"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {s.status === "active" ? "Live" : "Paused"}
                      </span>
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {categoryLabel(s.category)} · {price(s.priceUsdcCents)}{" "}
                      USDC
                      {s.deliveryPromise ? ` · ${s.deliveryPromise}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => setEditingId(s.id)}
                      className="rounded-xl border border-border/60 px-3 py-1.5 text-xs font-medium hover:border-foreground/40"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        setStatus(
                          s.id,
                          s.status === "active" ? "paused" : "active",
                        )
                      }
                      className="rounded-xl border border-border/60 px-3 py-1.5 text-xs font-medium hover:border-foreground/40"
                    >
                      {s.status === "active" ? "Pause" : "Resume"}
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {providerStatus === "approved" && !showNew && (
        <button
          onClick={() => setShowNew(true)}
          className="mt-3 rounded-xl border border-dashed border-border/60 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:border-foreground/40 hover:text-foreground"
        >
          + List a new service
        </button>
      )}
      {showNew && (
        <div className="mt-3 rounded-2xl border border-border/40 bg-card/30 p-4">
          <ServiceForm
            onDone={() => {
              setShowNew(false);
              reload();
            }}
            onCancel={() => setShowNew(false)}
          />
        </div>
      )}
    </section>
  );
}

function ServiceForm({
  initial,
  onDone,
  onCancel,
}: {
  initial?: OwnService;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? "tarot");
  const [dollars, setDollars] = useState(
    initial ? (initial.priceUsdcCents / 100).toFixed(2) : "",
  );
  const [promise, setPromise] = useState(initial?.deliveryPromise ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    const cents = Math.round(Number(dollars) * 100);
    try {
      if (initial) {
        await api(`/api/bazaar/services/${initial.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            title,
            description,
            category,
            priceUsdcCents: cents,
            deliveryPromise: promise,
          }),
        });
      } else {
        await api("/api/bazaar/services", {
          method: "POST",
          body: JSON.stringify({
            title,
            description,
            category,
            priceUsdcCents: cents,
            deliveryPromise: promise,
          }),
        });
      }
      onDone();
    } catch (e) {
      const code = (e as Error).message;
      setError(
        code === "invalid_price"
          ? "Price must be between 1 and 500 USDC."
          : code === "provider_not_approved"
            ? "Your reader profile isn't approved yet."
            : "Couldn't save. Check every field and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  const valid =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    Number.isFinite(Number(dollars)) &&
    Number(dollars) > 0;

  return (
    <div className="grid gap-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={90}
        placeholder="Service title — e.g. Celtic Cross Deep-Dive"
        aria-label="Service title"
        className={inputCls}
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        maxLength={4000}
        placeholder="What the buyer gets, format, length…"
        aria-label="Service description"
        className={inputCls}
      />
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">
            Category
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${inputCls} bg-card`}
          >
            {(["tarot", "natal", "compatibility", "other"] as const).map(
              (c) => (
                <option key={c} value={c}>
                  {categoryLabel(c)}
                </option>
              ),
            )}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">
            Price (USDC)
          </span>
          <input
            value={dollars}
            onChange={(e) => setDollars(e.target.value)}
            inputMode="decimal"
            placeholder="19.99"
            aria-label="Price in USDC"
            className={inputCls}
          />
        </label>
      </div>
      <input
        value={promise}
        onChange={(e) => setPromise(e.target.value)}
        maxLength={120}
        placeholder="Delivery promise — e.g. Delivered within 24 hours (optional)"
        aria-label="Delivery promise"
        className={inputCls}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={busy || !valid}
          className="rounded-xl bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink))] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Saving…" : initial ? "Save changes" : "List service"}
        </button>
        <button
          onClick={onCancel}
          disabled={busy}
          className="rounded-xl border border-border/60 px-4 py-2.5 text-sm font-medium hover:border-foreground/40"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ── Become a reader ──────────────────────────────────────────────────── */

function ApplyView({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState({
    displayName: "",
    headline: "",
    bio: "",
    solanaWallet: "",
    specialties: [] as string[],
  });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggleSpecialty(s: string) {
    setForm((f) => ({
      ...f,
      specialties: f.specialties.includes(s)
        ? f.specialties.filter((x) => x !== s)
        : [...f.specialties, s].slice(0, 4),
    }));
  }

  async function submit() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const d = await api<{ ok: boolean; status: string }>(
        "/api/bazaar/apply",
        {
          method: "POST",
          body: JSON.stringify(form),
        },
      );
      setResult(
        d.status === "approved"
          ? "Your reader profile is live — list your first service from My readings once logged in."
          : "Application received. The Vivida team reviews every reader before they go live — we'll email you.",
      );
    } catch (e) {
      const status = (e as { status?: number }).status;
      const code = (e as Error).message;
      if (status === 401) {
        router.push(
          `/login?next=${encodeURIComponent("/readings?view=apply")}`,
        );
        return;
      }
      setError(
        code === "invalid_solana_wallet"
          ? "That doesn't look like a Solana wallet address. Paste your mainnet receiving address from Phantom or Solflare."
          : code === "invalid_profile_fields"
            ? "Please fill in your name, headline, and bio."
            : "Couldn't submit. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <DetailShell onBack={onBack}>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--vivida-cyan)]">
        For readers
      </p>
      <h2 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight">
        Offer readings to thousands of seekers
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Set your own services and prices in USDC. Buyers pay your Solana wallet
        directly — no revenue share in the MVP. Every reader is approved by the
        Vivida team before appearing publicly.
      </p>

      {result ? (
        <p className="mt-6 max-w-xl rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5 text-sm">
          {result}
        </p>
      ) : (
        <div className="mt-6 grid max-w-2xl gap-4">
          <Field label="Display name">
            <input
              value={form.displayName}
              onChange={(e) =>
                setForm({ ...form, displayName: e.target.value })
              }
              maxLength={60}
              placeholder="e.g. Maya K."
              className={inputCls}
            />
          </Field>
          <Field label="Headline">
            <input
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
              maxLength={120}
              placeholder="e.g. Tarot reader for crossroads decisions"
              className={inputCls}
            />
          </Field>
          <Field label="Bio">
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={5}
              maxLength={2000}
              placeholder="Your background, approach, and what seekers can expect…"
              className={inputCls}
            />
          </Field>
          <Field label="Specialties">
            <div className="flex flex-wrap gap-2">
              {["tarot", "natal", "compatibility", "other"].map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSpecialty(s)}
                  aria-pressed={form.specialties.includes(s)}
                  className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                    form.specialties.includes(s)
                      ? "bg-foreground font-semibold text-background"
                      : "border border-border/60 text-muted-foreground"
                  }`}
                >
                  {categoryLabel(s)}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Solana wallet (USDC receiver, mainnet)">
            <input
              value={form.solanaWallet}
              onChange={(e) =>
                setForm({ ...form, solanaWallet: e.target.value })
              }
              spellCheck={false}
              placeholder="Your public receiving address"
              className={`${inputCls} font-mono text-xs`}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Buyers send USDC here from their own wallets. Never share seed
              phrases — Vivida will never ask for them.
            </p>
          </Field>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            onClick={submit}
            disabled={
              busy ||
              !form.displayName.trim() ||
              !form.headline.trim() ||
              !form.bio.trim() ||
              !form.solanaWallet.trim()
            }
            className="rounded-xl bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink))] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-950/30 disabled:opacity-50"
          >
            {busy ? "Submitting…" : "Apply as a reader"}
          </button>
        </div>
      )}
    </DetailShell>
  );
}

const inputCls =
  "w-full rounded-xl border border-border/60 bg-card/40 px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-[var(--vivida-cyan)]/60";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
