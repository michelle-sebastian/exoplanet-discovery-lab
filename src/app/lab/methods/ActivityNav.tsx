"use client";

import { useEffect, useState } from "react";

type Activity = { id: string; label: string };

export default function ActivityNav({ items, active, label }: { items: readonly Activity[]; active: boolean; label: string }) {
  const [current, setCurrent] = useState(items[0].id);
  useEffect(() => {
    if (!active) return;
    let frame = 0;
    function update() {
      frame = 0;
      const headerBottom = document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0;
      let section = items[0].id;
      for (const item of items) {
        const element = document.getElementById(item.id);
        if (element && element.getBoundingClientRect().top <= headerBottom + 160) section = item.id;
      }
      setCurrent(section);
    }
    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [active, items]);

  return <nav aria-label={label} className="mb-4 flex flex-wrap items-center gap-2 text-sm">
    <span className="mr-1 text-slate-600">In this tab:</span>
    {items.map(item => <a key={item.id} href={`#${item.id}`} aria-current={current === item.id ? "location" : undefined} onClick={event => {
      event.preventDefault();
      setCurrent(item.id);
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${item.id}`);
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.getElementById(item.id)?.scrollIntoView({ block: "start", behavior: reducedMotion ? "instant" : "smooth" });
    }} className={`rounded-md border px-3 py-2 font-semibold ${current === item.id ? "border-teal-700 bg-teal-100 text-teal-950" : "border-slate-200 bg-white text-teal-800 hover:bg-teal-50"}`}>{item.label}</a>)}
  </nav>;
}
