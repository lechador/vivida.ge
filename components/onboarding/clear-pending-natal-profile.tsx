"use client";

import { useEffect } from "react";

import { clearPendingNatalProfile } from "@/lib/pending-natal-profile";

/** Clears the calculator draft once the saved chart page is reached. */
export function ClearPendingNatalProfile() {
  useEffect(() => {
    clearPendingNatalProfile();
  }, []);

  return null;
}
