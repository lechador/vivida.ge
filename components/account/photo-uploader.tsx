"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";

const MAX_PHOTOS = 6;
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type ServerPhoto = { id: string; url: string; ready: boolean };

type PendingUpload = {
  id: string;        // local UUID for keying
  preview: string;   // object URL
  progress: number;  // 0..1
  error?: string;
};

export function PhotoUploader({
  initial,
}: {
  initial: ServerPhoto[];
}) {
  const [photos, setPhotos] = useState<ServerPhoto[]>(initial);
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const totalCount = photos.length + pending.length;
  const remaining = Math.max(0, MAX_PHOTOS - totalCount);

  // Cleanup object URLs on unmount / when removed from pending
  useEffect(() => {
    return () => {
      pending.forEach((p) => URL.revokeObjectURL(p.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function uploadOne(file: File) {
    const localId = crypto.randomUUID();
    const preview = URL.createObjectURL(file);
    setPending((p) => [
      ...p,
      { id: localId, preview, progress: 0 },
    ]);

    const setProgress = (progress: number) => {
      setPending((p) =>
        p.map((row) => (row.id === localId ? { ...row, progress } : row))
      );
    };
    const setError = (error: string) => {
      setPending((p) =>
        p.map((row) =>
          row.id === localId ? { ...row, error, progress: 1 } : row
        )
      );
    };
    const finishLocal = (photo?: ServerPhoto) => {
      URL.revokeObjectURL(preview);
      setPending((p) => p.filter((row) => row.id !== localId));
      if (photo) setPhotos((existing) => [...existing, photo]);
    };

    try {
      // 1. Get presigned URL
      const presignRes = await fetch("/api/photos/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: file.type,
          contentLength: file.size,
        }),
      });
      if (!presignRes.ok) {
        const data = (await presignRes.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(errorToMessage(data.error));
      }
      const { photoId, uploadUrl, publicUrl } = (await presignRes.json()) as {
        photoId: string;
        uploadUrl: string;
        publicUrl: string;
      };

      setProgress(0.1);

      // 2. PUT to R2 with progress tracking via XHR (fetch doesn't do upload progress)
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(0.1 + 0.85 * (e.loaded / e.total));
          }
        };
        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300
            ? resolve()
            : reject(new Error(`R2 upload failed (${xhr.status})`));
        xhr.onerror = () => reject(new Error("R2 upload failed"));
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });
      setProgress(0.95);

      // 3. Finalize
      const finalRes = await fetch(`/api/photos/${photoId}/finalize`, {
        method: "POST",
      });
      if (!finalRes.ok) {
        throw new Error("ვერ დადასტურდა ატვირთვა");
      }

      finishLocal({ id: photoId, url: publicUrl, ready: true });
    } catch (err) {
      setError((err as Error).message);
      // Leave pending row with error visible briefly
      setTimeout(() => finishLocal(undefined), 3000);
    }
  }

  async function handleFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    const validated: File[] = [];
    for (const f of arr) {
      if (!ALLOWED_TYPES.includes(f.type)) continue;
      if (f.size > MAX_BYTES) continue;
      validated.push(f);
    }
    const room = MAX_PHOTOS - totalCount;
    const accepted = validated.slice(0, Math.max(0, room));
    accepted.forEach((f) => {
      void uploadOne(f);
    });
  }

  async function deletePhoto(id: string) {
    setPhotos((p) => p.filter((x) => x.id !== id));
    try {
      await fetch(`/api/photos/${id}`, { method: "DELETE" });
    } catch {
      // ignore — UI already updated; if delete failed we'll have a phantom
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">ფოტოები</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            დაამატე 6-მდე ფოტო. პირველი ფოტო ხდება პროფილის ნიღაბი.
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-border bg-card/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {totalCount} / {MAX_PHOTOS}
        </span>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((p, i) => (
          <PhotoTile
            key={p.id}
            url={p.url}
            badge={i === 0 ? "მთავარი" : null}
            onDelete={() => deletePhoto(p.id)}
          />
        ))}
        <AnimatePresence>
          {pending.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <PendingTile pending={p} />
            </motion.div>
          ))}
        </AnimatePresence>
        {remaining > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
            }}
            className={cn(
              "group flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-all",
              dragOver
                ? "border-[var(--vivida-violet)] bg-[var(--vivida-violet)]/15 scale-[1.02]"
                : "border-border bg-card/30 hover:border-[var(--vivida-violet)]/50 hover:bg-card/50"
            )}
          >
            <Camera
              className={cn(
                "size-8 transition-colors",
                dragOver
                  ? "text-[var(--vivida-violet)]"
                  : "text-muted-foreground group-hover:text-foreground"
              )}
            />
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
              დაამატე ფოტო
            </span>
            <span className="text-[10px] text-muted-foreground/70">
              {remaining} დარჩა
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <p className="mt-4 text-xs text-muted-foreground">
        JPEG · PNG · WebP — მაქს. 5 MB / ფოტო
      </p>
    </div>
  );
}

function PhotoTile({
  url,
  badge,
  onDelete,
}: {
  url: string;
  badge: string | null;
  onDelete: () => void;
}) {
  return (
    <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-border ring-1 ring-foreground/5">
      <Image
        src={url}
        alt=""
        fill
        sizes="(min-width: 640px) 200px, 50vw"
        className="object-cover transition-transform group-hover:scale-105"
      />
      <button
        type="button"
        onClick={onDelete}
        aria-label="წაშლა"
        className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-black/70 text-white opacity-0 backdrop-blur transition-opacity hover:bg-black/85 group-hover:opacity-100"
      >
        <X className="size-3.5" />
      </button>
      {badge && (
        <span className="absolute left-2 top-2 rounded-full bg-[var(--vivida-violet)]/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
          {badge}
        </span>
      )}
    </div>
  );
}

function PendingTile({ pending }: { pending: PendingUpload }) {
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border ring-1 ring-foreground/5">
      <img
        src={pending.preview}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-50"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/30 backdrop-blur-sm">
        {pending.error ? (
          <span className="px-3 text-center text-xs font-medium text-destructive">
            {pending.error}
          </span>
        ) : (
          <>
            <Loader2 className="size-6 animate-spin text-[var(--vivida-cyan)]" />
            <span className="text-xs text-muted-foreground tabular-nums">
              {Math.round(pending.progress * 100)}%
            </span>
          </>
        )}
      </div>
      <div
        className="absolute bottom-0 left-0 h-1 bg-[linear-gradient(90deg,var(--vivida-violet),var(--vivida-cyan))] transition-all"
        style={{ width: `${pending.progress * 100}%` }}
      />
    </div>
  );
}

function errorToMessage(code: string | undefined): string {
  switch (code) {
    case "limit_reached":
      return "მაქსიმალური 6 ფოტო უკვე გყავს";
    case "invalid_type":
      return "ფაილის ფორმატი არასწორია";
    case "too_large":
      return "ფაილი 5 MB-ზე დიდია";
    case "storage_not_configured":
      return "შენახვა ჯერ არ არის ჩართული";
    case "unauthorized":
      return "გთხოვ, ხელახლა შემოდი";
    default:
      return "ატვირთვის შეცდომა";
  }
}
