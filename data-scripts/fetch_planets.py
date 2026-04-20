from astroquery.ipac.nexsci.nasa_exoplanet_archive import NasaExoplanetArchive
import json
from pathlib import Path
import numpy as np
import pandas as pd

# Query composite planet parameters (pscomppars)
table = NasaExoplanetArchive.query_criteria(
    table="pscomppars",
    select=(
        "pl_name,hostname,discoverymethod,disc_year,"
        "pl_orbper,pl_rade,pl_masse,pl_eqt,pl_orbsmax,sy_dist,"
        "st_teff,st_rad,st_mass,st_met,sy_pnum"
    )
)

# Convert to pandas DataFrame
df = table.to_pandas()

# Replace inf / -inf with NaN
df.replace([np.inf, -np.inf], np.nan, inplace=True)

# Replace NaN with None (which becomes null in JSON)
df = df.where(pd.notnull(df), None)

rows = df.to_dict(orient="records")

out_path = Path(__file__).resolve().parents[1] / "src" / "data" / "planets.json"
out_path.parent.mkdir(parents=True, exist_ok=True)

with open(out_path, "w") as f:
    json.dump(rows, f, indent=2)

print(f"Saved {len(rows)} planets to {out_path}")
