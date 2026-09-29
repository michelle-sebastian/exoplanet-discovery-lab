"use client";

export default function MethodsBackToTop() {
  return <div className="flex justify-end pt-3">
    <a href="#methods-top" onClick={event => {
      event.preventDefault();
      const top = document.getElementById("methods-top");
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#methods-top`);
      window.scrollTo({ top: 0, behavior: reducedMotion ? "instant" : "smooth" });
      top?.focus({ preventScroll: true });
    }} className="inline-flex min-h-10 items-center rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-900 shadow-sm hover:bg-teal-100">Back to top ↑</a>
  </div>;
}
