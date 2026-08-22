"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const article = document.querySelector<HTMLElement>("[data-article-body]");
      if (!article) return;
      const start = article.offsetTop;
      const total = Math.max(article.offsetHeight - window.innerHeight, 1);
      setProgress(Math.min(100, Math.max(0, ((window.scrollY - start) / total) * 100)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[80] h-0.5 bg-transparent" aria-hidden>
      <div
        className="h-full bg-[linear-gradient(90deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] transition-[width] duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
