import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen

SELECT_COLUMNS = (
    "pl_name,hostname,discoverymethod,disc_year,"
    "pl_orbper,pl_rade,pl_masse,pl_eqt,pl_insol,pl_orbsmax,sy_dist,"
    "st_teff,st_rad,st_mass,st_met,sy_pnum"
)

TAP_SYNC_URL = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"
QUERY = f"select {SELECT_COLUMNS} from pscomppars"


def fetch_rows():
    params = urlencode({"query": QUERY, "format": "json"})
    with urlopen(f"{TAP_SYNC_URL}?{params}", timeout=60) as response:
        body = response.read().decode("utf-8")
    rows = json.loads(body)
    if not isinstance(rows, list) or not rows:
        raise ValueError("NASA returned an empty or invalid catalog")
    expected = set(SELECT_COLUMNS.split(","))
    if any(not isinstance(row, dict) or not expected.issubset(row) for row in rows):
        raise ValueError("NASA returned unexpected catalog columns")
    names = [row["pl_name"] for row in rows]
    if any(not isinstance(name, str) or not name.strip() for name in names) or len(set(names)) != len(names):
        raise ValueError("NASA returned missing or duplicate planet names")
    return rows, body


out_path = Path(__file__).resolve().parents[1] / "src" / "data" / "planets.json"
out_path.parent.mkdir(parents=True, exist_ok=True)

rows, body = fetch_rows()
fetched_at = datetime.now(timezone.utc)
previous_count = 0
if out_path.exists():
    previous_rows = json.loads(out_path.read_text(encoding="utf-8"))
    if not isinstance(previous_rows, list):
        raise ValueError("Existing planet snapshot is invalid")
    previous_count = len(previous_rows)
if previous_count and len(rows) < previous_count * 0.95:
    raise ValueError(
        f"NASA catalog shrank unexpectedly: {previous_count} to {len(rows)} planets. "
        "Review the source before replacing the published snapshot."
    )
download_dir = Path(__file__).resolve().parent / "downloads" / "nasa"
download_dir.mkdir(parents=True, exist_ok=True)
(download_dir / "pscomppars.json").write_text(body, encoding="utf-8")

temporary_path = out_path.with_suffix(".json.tmp")
with open(temporary_path, "w", encoding="utf-8") as f:
    json.dump(rows, f, indent=2)
    f.write("\n")
temporary_path.replace(out_path)

metadata_path = out_path.with_name("dataset-meta.json")
metadata = {"fetched_at": fetched_at.date().isoformat(), "fetched_at_utc": fetched_at.isoformat(), "source": "NASA Exoplanet Archive pscomppars", "planet_count": len(rows)}
metadata_temporary_path = metadata_path.with_suffix(".json.tmp")
with open(metadata_temporary_path, "w", encoding="utf-8") as f:
    json.dump(metadata, f, indent=2)
    f.write("\n")
metadata_temporary_path.replace(metadata_path)
(download_dir / "catalog-manifest.json").write_text(json.dumps({**metadata, "query": QUERY, "endpoint": TAP_SYNC_URL, "filename": "pscomppars.json"}, indent=2) + "\n", encoding="utf-8")

print(f"Saved {len(rows)} planets to {out_path}")
