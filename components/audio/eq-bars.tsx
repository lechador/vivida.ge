/** Small animated equalizer that "dances" while audio plays. */
export function EqBars({ playing }: { playing: boolean }) {
  const heights = [9, 14, 6, 12];
  return (
    <span aria-hidden className="flex h-3.5 items-end gap-[2px]">
      {heights.map((h, i) => (
        <span
          key={i}
          className="w-[2px] rounded-full bg-[var(--vivida-cyan)]"
          style={{
            height: h,
            transformOrigin: "bottom",
            opacity: playing ? 1 : 0.5,
            animation: playing ? "vivida-eq 0.85s ease-in-out infinite" : "none",
            animationDelay: `${i * 110}ms`,
          }}
        />
      ))}
    </span>
  );
}
