"use client";

import { useEffect, useId, useState } from "react";

export default function DiscoveryYearSelector({ years, selectedYear, onSelect }: { years: number[]; selectedYear: number | null; onSelect: (year: number | null) => void }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const search = query.trim().toLowerCase();
  const allYears = { label: "All years", value: null };
  const matches = years.filter(year => String(year).startsWith(search)).reverse().map(year => ({ label: String(year), value: year }));
  const options = search ? [...matches, ...("all years".includes(search) ? [allYears] : [])] : [allYears, ...matches];

  useEffect(() => {
    if (open && activeIndex >= 0) document.getElementById(`${id}-option-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex, id]);

  function choose(value: number | null) {
    onSelect(value);
    close();
  }

  function close() {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
  }

  return <div className="flex max-w-full items-end gap-2">
    <div className="relative w-40 min-w-0">
      <label htmlFor={id} className="text-sm font-medium">Discovery year</label>
      <input id={id} type="text" inputMode="search" role="combobox" autoComplete="off" aria-autocomplete="list" aria-expanded={open} aria-controls={open ? `${id}-options` : undefined} aria-activedescendant={open && activeIndex >= 0 && activeIndex < options.length ? `${id}-option-${activeIndex}` : undefined} placeholder="Type a year…" value={open ? query : selectedYear === null ? "All years" : String(selectedYear)} onFocus={() => { setQuery(""); setActiveIndex(-1); setOpen(true); }} onClick={() => { if (!open) { setQuery(""); setActiveIndex(-1); setOpen(true); } }} onChange={event => { setQuery(event.target.value); setActiveIndex(-1); setOpen(true); }} onBlur={() => {
        const exactYear = years.find(year => String(year) === search);
        if (open && exactYear !== undefined) onSelect(exactYear);
        else if (open && (search === "all" || search === "all years")) onSelect(null);
        close();
      }} onKeyDown={event => {
        if (event.key === "Escape") {
          event.preventDefault();
          close();
        } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          setOpen(true);
          if (options.length) setActiveIndex(index => event.key === "ArrowDown" ? (index + 1) % options.length : (index <= 0 ? options.length - 1 : index - 1));
        } else if (event.key === "Enter" && open) {
          event.preventDefault();
          const option = options[activeIndex >= 0 ? activeIndex : 0];
          if (option) choose(option.value);
        }
      }} className={`mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm ${selectedYear !== null ? "font-bold text-teal-900" : "bg-white text-slate-700"}`} style={selectedYear !== null ? { backgroundColor: "#f0fdfa", borderColor: "#5eead4" } : undefined} />
      {open && <div className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
        <ul id={`${id}-options`} role="listbox" aria-label="Discovery year suggestions" className="max-h-56 overflow-y-auto py-1">
          {options.map((option, index) => <li key={option.label} role="presentation"><button id={`${id}-option-${index}`} type="button" role="option" aria-selected={selectedYear === option.value} tabIndex={-1} onPointerDown={event => event.preventDefault()} onMouseEnter={() => setActiveIndex(index)} onClick={() => choose(option.value)} className={`block w-full px-3 py-2 text-left text-sm ${activeIndex === index || selectedYear === option.value ? "bg-teal-50 font-semibold text-teal-900" : "text-slate-700 hover:bg-slate-50"}`}>{option.label}</button></li>)}
        </ul>
        {!options.length && <p className="px-3 py-2 text-xs text-slate-600" role="status">No matching year. Choose All years to clear the selection.</p>}
      </div>}
    </div>
  </div>;
}
