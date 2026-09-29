"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Planet } from "@/components/PlanetScatter";
import PlanetEvidenceExercise from "@/components/PlanetEvidenceExercise";
import Link from "next/link";
import ObservationExplorer from "./ObservationExplorer";
import TransitSimulation from "./TransitSimulation";
import MethodOverview from "./MethodOverview";
import ActivityNav from "./ActivityNav";
import MethodsBackToTop from "@/components/MethodsBackToTop";

const questions = [
  { prompt: "A star dims at regular intervals. Which method measures this?", answer: "Transit", reason: "Repeated dips can reveal an orbital period and the planet-to-star radius ratio." },
  { prompt: "A star's spectrum shifts back and forth. Which method measures this?", answer: "Radial velocity", reason: "The shifts trace the star's motion and constrain the planet's minimum mass." },
  { prompt: "A young giant planet is far from its bright star. Which method may separate their light?", answer: "Direct imaging", reason: "Imaging works best when the planet is bright and widely separated from its star." },
];

const sections = [
  { key: "transit", label: "Transit detection" },
  { key: "velocity", label: "Radial velocity detection" },
  { key: "apply", label: "Apply what you learned" },
] as const;
type Section = typeof sections[number]["key"];
const transitActivities = [
  { id: "transit-overview", label: "How transit works" },
  { id: "simulated-transit", label: "Simulated transit" },
  { id: "real-transit-observations", label: "Real transit observations" },
];
const velocityActivities = [
  { id: "velocity-overview", label: "How radial velocity works" },
  { id: "real-velocity-observations", label: "Real velocity observations" },
];

export default function DetectionMethodsClient({ planets, exercisePlanets }: { planets: Planet[]; exercisePlanets: Planet[] }) {
  const params = useSearchParams();
  const requested = params.get("section");
  const tab: Section = requested === "velocity" || requested === "apply" ? requested : "transit";
  const [bonusOpen, setBonusOpen] = useState(false);
  const [question, setQuestion] = useState(0);
  const [choice, setChoice] = useState("");
  const [answerShown, setAnswerShown] = useState(false);
  useEffect(() => {
    // Keep earlier activity bookmarks usable after introducing method tabs.
    if (params.has("section")) return;
    const hash = window.location.hash;
    const section = hash === "#target-selection" || hash === "#check-understanding" ? "apply" : hash === "#velocity-overview" || hash === "#real-velocity-observations" ? "velocity" : "transit";
    if (!hash) return;
    const next = new URLSearchParams(params.toString());
    next.set("section", section);
    const anchor = hash === "#real-observations" ? "#real-transit-observations" : hash;
    window.history.replaceState(null, "", `/lab/methods?${next}${anchor}`);
  }, [params]);
  function selectSection(section: Section) {
    const next = new URLSearchParams(params.toString());
    next.set("section", section);
    window.history.replaceState(null, "", `/lab/methods?${next}`);
    setBonusOpen(false);
  }

  return <main className="site-page">
    <header id="methods-top" tabIndex={-1} className="page-intro" style={{ borderBottom: "none", paddingBottom: 0, marginBottom: 0, scrollMarginTop: "2.5rem" }}>
      <p className="page-eyebrow">Interactive lab</p>
      <h1 className="mt-2">Detection Methods Lab</h1>
      <p className="mt-3 leading-7 text-slate-700" style={{ maxWidth: "none" }}>Explore how astronomers find exoplanets. In this section, we focus on two methods: <strong>transits and radial velocity</strong>. Measure a simulated transit, investigate published brightness and stellar-velocity data, then use the evidence to choose which known systems would produce clearer signals. A bonus quiz introduces direct imaging, with NASA resources to explore other detection methods.</p>
    </header>
    <div className="section-nav" role="tablist" aria-label="Detection Methods Lab sections">
      {sections.map(({ key, label }, index) => <button key={key} id={`methods-${key}-tab`} type="button" role="tab" aria-selected={tab === key} aria-controls={`methods-${key}-panel`} tabIndex={tab === key ? 0 : -1} onClick={() => selectSection(key)} onKeyDown={event => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? sections.length - 1 : (index + (event.key === "ArrowRight" ? 1 : sections.length - 1)) % sections.length;
        const next = sections[nextIndex].key;
        selectSection(next);
        document.getElementById(`methods-${next}-tab`)?.focus();
      }} className={`min-h-12 flex-[1_1_160px] cursor-pointer border-r border-slate-200 px-4 py-3.5 text-center text-sm font-semibold text-teal-800 last:border-r-0 hover:bg-teal-50 focus-visible:bg-teal-50 ${tab === key ? "bg-teal-50" : ""}`}>{label}</button>)}
    </div>
    <div id="methods-transit-panel" role="tabpanel" aria-labelledby="methods-transit-tab" hidden={tab !== "transit"}>
      <ActivityNav items={transitActivities} active={tab === "transit"} label="Transit activities" />
      <div className="space-y-6">
        <MethodOverview method="transit" />
        <TransitSimulation planets={planets} />
        <ObservationExplorer mode="transit" />
      </div>
    </div>
    <div id="methods-velocity-panel" role="tabpanel" aria-labelledby="methods-velocity-tab" hidden={tab !== "velocity"}>
      <ActivityNav items={velocityActivities} active={tab === "velocity"} label="Radial velocity activities" />
      <div className="space-y-6">
        <MethodOverview method="velocity" />
        <ObservationExplorer mode="velocity" />
      </div>
    </div>
    <div id="methods-apply-panel" role="tabpanel" aria-labelledby="methods-apply-tab" hidden={tab !== "apply"}>
      <div className="space-y-6">
        <section id="target-selection" aria-labelledby="target-selection-heading" className="lab-panel space-y-6 p-5 sm:p-6">
          <div><h2 id="target-selection-heading" className="text-xl font-semibold text-slate-900">Apply what you learned: choose targets from the evidence</h2><p className="mt-2 text-sm leading-6 text-slate-700">Which known planets would produce clearer signals? Use what you learned about transit dips and stellar motion to compare these systems. Choose a planet, identify the properties that support your choice, and explain your reasoning before reviewing the feedback. These activities compare detectability using selected catalog properties; they are not a search for undiscovered planets or complete observing proposals.</p></div>
          <PlanetEvidenceExercise planets={exercisePlanets} exercise="transit" />
          <PlanetEvidenceExercise planets={exercisePlanets} exercise="radial-velocity" />
          <p className="text-sm text-slate-600">Continue from detection to characterization: <Link href="/lab/hz?section=investigate" className="font-semibold text-teal-800 underline">investigate a promising planet’s habitability →</Link>.</p>
        </section>
        <section className="lab-panel p-5 sm:p-6" aria-labelledby="other-methods-heading">
          <h2 id="other-methods-heading" className="text-xl font-semibold">Other detection methods</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Direct imaging</strong> separates a planet’s light from its star’s glare. It is especially useful for bright, young giant planets with wide separation from their stars. This lab focuses on transit and radial-velocity measurements and does not analyze direct images.</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Microlensing detects temporary gravitational magnification; astrometry measures changes in a star’s position. Pulsar timing measures another kind of orbital effect through the timing of pulses. Every method favors some systems over others. <a href="https://science.nasa.gov/resource/the-search-for-other-earths-fact-sheet/" target="_blank" rel="noreferrer" className="font-semibold text-teal-800 underline">Read NASA’s guide to other detection methods ↗</a></p>
          <MethodsBackToTop />
        </section>
        <div>
          <button type="button" aria-expanded={bonusOpen} aria-controls="check-understanding" onClick={() => setBonusOpen(open => !open)} className="flex w-full items-center justify-between rounded-lg border border-teal-200 bg-teal-50 px-5 py-3 text-left text-sm font-semibold text-teal-900 hover:bg-teal-100"><span><strong className="font-bold">{bonusOpen ? "Hide Bonus Activity" : "Unlock Bonus Activity"}</strong>: check your understanding</span><span aria-hidden="true">{bonusOpen ? "▴" : "▾"}</span></button>
    <section id="check-understanding" aria-labelledby="method-heading" className="mt-3 rounded-lg border border-teal-200 bg-teal-50 p-5 sm:p-6" hidden={!bonusOpen}>
      <h2 id="method-heading" className="text-xl font-semibold text-slate-900">Check your understanding</h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">A short quiz about detection methods. Choose the method that matches each observation. One question introduces direct imaging, but this lab does not analyze direct images.</p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <p className="text-sm text-slate-600">Question {question + 1} of {questions.length}</p>
        <button type="button" onClick={() => { setQuestion((question + 1) % questions.length); setChoice(""); setAnswerShown(false); }} className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50">Next question</button>
      </div>
      <p className="mt-4 font-medium">{questions[question].prompt}</p>
      <div className="mt-4 flex flex-wrap gap-3">{["Transit", "Radial velocity", "Direct imaging"].map((option) => <button key={option} type="button" aria-pressed={choice === option} onClick={() => { setChoice(option); setAnswerShown(false); }} className={`rounded border px-4 py-2 text-sm font-medium ${choice === option ? "border-teal-700 bg-teal-50 text-teal-900" : "border-slate-300 hover:bg-slate-50"}`}>{option}</button>)}</div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" disabled={!choice} onClick={() => setAnswerShown(true)} className="rounded bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Check answer</button>
      </div>
      {answerShown && <p role="status" className="mt-4 border-l-4 border-teal-600 bg-teal-50 p-4 text-sm leading-6">{choice === questions[question].answer ? "Correct. " : `The best answer is ${questions[question].answer}. `}{questions[question].reason}</p>}
      <MethodsBackToTop />
    </section>
        </div>
      </div>
    </div>
  </main>;
}
