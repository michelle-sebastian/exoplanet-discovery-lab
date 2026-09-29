import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const outputPath = fileURLToPath(new URL("../src/data/observations.json", import.meta.url));
const downloadDir = new URL("./downloads/nasa/", import.meta.url);

const sources = [
  {
    id: "hd-209458-transits",
    kind: "photometry",
    planet: "HD 209458 b",
    title: "HD 209458 transit observations",
    note: "Two separate transit windows from the same star.",
    reference: "Knutson et al. 2007, ApJ 655, 564",
    url: "https://exoplanetarchive.ipac.caltech.edu/data/ExoData/0108/0108859/data/UID_0108859_PLC_007.tbl",
    timeFrame: "HJD",
    columns: ["HJD", "Relative_Flux", "Relative_Flux_Uncertainty", "Accepted"],
    acceptedColumn: 3,
  },
  {
    id: "hd-189733-transit",
    kind: "photometry",
    planet: "HD 189733 b",
    title: "HD 189733 transit observations",
    note: "A single transit with a deeper dip than HD 209458 b.",
    reference: "Winn et al. 2007, AJ 133, 1828",
    url: "https://exoplanetarchive.ipac.caltech.edu/data/ExoData/0098/0098505/data/UID_0098505_PLC_023.tbl",
    timeFrame: "HJD",
    columns: ["HJD", "Relative_Flux", "Relative_Flux_Uncertainty", "Accepted"],
    acceptedColumn: 3,
  },
  {
    id: "51-peg-radial-velocity",
    kind: "radialVelocity",
    planet: "51 Peg b",
    title: "51 Peg radial-velocity observations",
    note: "A modest velocity signal measured across many nights.",
    reference: "Marcy et al. 1997, ApJ 481, 926",
    url: "https://exoplanetarchive.ipac.caltech.edu/data/ExoData/0113/0113357/data/UID_0113357_RVC_002.tbl",
    timeFrame: "JD",
    columns: ["JD", "Radial_Velocity", "Radial_Velocity_Uncertainty"],
    periodDays: 4.2307966,
    trialMin: 3.5,
    trialMax: 5,
    trialStep: 0.001,
    trialStart: 4,
    periodTolerance: 0.03,
  },
  {
    id: "hd-189733-radial-velocity",
    kind: "radialVelocity",
    planet: "HD 189733 b",
    title: "HD 189733 radial-velocity observations",
    note: "A larger stellar velocity signal measured over several years. The period needs to be precise for the points to align.",
    reference: "Winn et al. 2006, ApJ 653, L69",
    url: "https://exoplanetarchive.ipac.caltech.edu/data/ExoData/0098/0098505/data/UID_0098505_RVC_002.tbl",
    timeFrame: "JD",
    columns: ["JD", "Radial_Velocity", "Radial_Velocity_Uncertainty"],
    periodDays: 2.21857567,
    trialMin: 2.19,
    trialMax: 2.25,
    trialStep: 0.0001,
    trialStart: 2.2,
    periodTolerance: 0.001,
  },
  {
    id: "wasp-12-radial-velocity",
    kind: "radialVelocity",
    planet: "WASP-12 b",
    title: "WASP-12 radial-velocity observations",
    note: "A large velocity signal from a planet with a short orbit.",
    reference: "Hebb et al. 2009, ApJ 693, 1920",
    url: "https://exoplanetarchive.ipac.caltech.edu/data/ExoData/0300/0300068/data/UID_0300068_RVC_001.tbl",
    timeFrame: "BJD",
    columns: ["BJD", "Radial_Velocity", "Radial_Velocity_Uncertainty"],
    periodDays: 1.091418901,
    trialMin: 0.9,
    trialMax: 1.3,
    trialStep: 0.001,
    trialStart: 1,
    periodTolerance: 0.02,
  },
];

const observations = [];
const downloads = [];
for (const source of sources) {
  const response = await fetch(source.url, { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`${source.id}: HTTP ${response.status}`);
  const body = await response.text();
  const header = body.split("\n").find((line) => line.startsWith("|"));
  const columns = header?.split("|").slice(1, -1).map((column) => column.trim());
  if (JSON.stringify(columns) !== JSON.stringify(source.columns)) throw new Error(`${source.id}: unexpected columns ${JSON.stringify(columns)}`);
  const rows = body.split("\n")
    .filter((line) => /^\s*\d{7}\.\d+\s+/.test(line))
    .map((line) => line.trim().split(/\s+/).map(Number))
    .filter((values) => values.length === source.columns.length && values.every(Number.isFinite))
    .filter((values) => source.acceptedColumn === undefined || values[source.acceptedColumn] === 1)
    .map((values) => values.slice(0, 3))
    .sort((a, b) => a[0] - b[0]);
  if (rows.length < 20) throw new Error(`${source.id}: too few valid observations`);
  const metadata = { ...source };
  delete metadata.acceptedColumn;
  observations.push({ ...metadata, rows });
  downloads.push({ id: source.id, url: source.url, reference: source.reference, filename: source.url.split("/").at(-1), body, validRows: rows.length });
  process.stdout.write(`${source.id}: ${rows.length} observations\n`);
}

mkdirSync(downloadDir, { recursive: true });
for (const download of downloads) writeFileSync(new URL(download.filename, downloadDir), download.body);
writeFileSync(new URL("observations-manifest.json", downloadDir), `${JSON.stringify({ fetched_at_utc: new Date().toISOString(), sources: downloads.map(({ id, url, reference, filename, validRows }) => ({ id, url, reference, filename, validRows })) }, null, 2)}\n`);
writeFileSync(`${outputPath}.tmp`, `${JSON.stringify(observations)}\n`);
renameSync(`${outputPath}.tmp`, outputPath);
