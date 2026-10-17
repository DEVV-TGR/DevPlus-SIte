/** docs: docs/10-materiais-atelier.md */

const POINTER_QUERY =
  "(hover: hover) and (pointer: fine) and (min-width: 768px) and (prefers-reduced-motion: no-preference)";

const properties = [
  "--atelier-pointer-x",
  "--atelier-pointer-y",
  "--atelier-rotate-x",
  "--atelier-rotate-y",
  "--atelier-shift-x",
  "--atelier-shift-y",
] as const;

/** Event-driven updates only: no ticker, scroll listener or perpetual rAF. */
export function attachPointerMaterial(
  target: HTMLElement,
  output: HTMLElement,
): () => void {
  const media = window.matchMedia(POINTER_QUERY);
  const original = properties.map((name) => ({
    name,
    value: output.style.getPropertyValue(name),
    priority: output.style.getPropertyPriority(name),
  }));
  const originalActive = output.getAttribute("data-atelier-active");
  let visible = true;
  let destroyed = false;
  let frame = 0;
  let clientX = 0;
  let clientY = 0;

  const reset = () => {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    output.removeAttribute("data-atelier-active");
    properties.forEach((name) => output.style.removeProperty(name));
  };

  const focused = () => target.contains(document.activeElement);
  const enabled = () =>
    !destroyed && media.matches && visible && !document.hidden && !focused();

  const paint = () => {
    frame = 0;
    if (!enabled()) return reset();
    // Measure the untransformed interaction wrapper, never the tilting face.
    const rect = target.getBoundingClientRect();
    if (!rect.width || !rect.height) return reset();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    output.style.setProperty("--atelier-pointer-x", `${(x * 100).toFixed(2)}%`);
    output.style.setProperty("--atelier-pointer-y", `${(y * 100).toFixed(2)}%`);
    output.style.setProperty("--atelier-rotate-x", `${((0.5 - y) * 8).toFixed(2)}deg`);
    output.style.setProperty("--atelier-rotate-y", `${((x - 0.5) * 8).toFixed(2)}deg`);
    output.style.setProperty("--atelier-shift-x", `${((x - 0.5) * 24).toFixed(2)}px`);
    output.style.setProperty("--atelier-shift-y", `${((y - 0.5) * 24).toFixed(2)}px`);
    output.setAttribute("data-atelier-active", "true");
  };

  const move = (event: PointerEvent) => {
    if (event.pointerType !== "mouse" || event.buttons || !enabled()) {
      reset();
      return;
    }
    clientX = event.clientX;
    clientY = event.clientY;
    if (!frame) frame = window.requestAnimationFrame(paint);
  };
  const visibility = () => {
    if (document.hidden) reset();
  };

  target.addEventListener("pointermove", move, { passive: true });
  target.addEventListener("pointerleave", reset);
  target.addEventListener("pointercancel", reset);
  target.addEventListener("pointerdown", reset, { passive: true });
  target.addEventListener("focusin", reset);
  window.addEventListener("blur", reset);
  document.addEventListener("visibilitychange", visibility);
  media.addEventListener("change", reset);

  const observer =
    typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(([entry]) => {
          if (destroyed) return;
          visible = entry?.isIntersecting ?? false;
          if (!visible) reset();
        });
  observer?.observe(target);

  return () => {
    destroyed = true;
    reset();
    target.removeEventListener("pointermove", move);
    target.removeEventListener("pointerleave", reset);
    target.removeEventListener("pointercancel", reset);
    target.removeEventListener("pointerdown", reset);
    target.removeEventListener("focusin", reset);
    window.removeEventListener("blur", reset);
    document.removeEventListener("visibilitychange", visibility);
    media.removeEventListener("change", reset);
    observer?.disconnect();
    original.forEach(({ name, value, priority }) => {
      if (value) output.style.setProperty(name, value, priority);
    });
    if (originalActive !== null)
      output.setAttribute("data-atelier-active", originalActive);
  };
}
