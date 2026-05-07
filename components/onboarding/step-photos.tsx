"use client";

import { PhotoUploader } from "@/components/account/photo-uploader";

/**
 * Final onboarding step — encourage the user to add photos before they
 * land on the dashboard. The PhotoUploader component is fully self-
 * contained: it talks directly to /api/photos/* and the photos attach
 * to the user's account immediately. Saving photos has no dependency
 * on the profile being saved yet, so users can upload here and still
 * back out / skip without leaving orphans.
 */
export function StepPhotos() {
  return (
    <div className="space-y-5">
      <header className="space-y-1.5 text-center">
        <h2 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">
          დაამატე ფოტოები
        </h2>
        <p className="mx-auto max-w-md text-pretty text-sm text-muted-foreground">
          პირველი ფოტო ხდება შენი პროფილის ნიღაბი. შეგიძლია 6-მდე ფოტო ატვირთო —
          ან გამოტოვო, თუ გინდა მერე ააწყო.
        </p>
      </header>

      <PhotoUploader initial={[]} />
    </div>
  );
}
