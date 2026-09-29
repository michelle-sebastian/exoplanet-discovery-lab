# Exoplanet Explorer

An educational Next.js site for exploring confirmed exoplanets, detection methods, discovery history, and habitability questions. Planet measurements come from the [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/) `pscomppars` table. The site uses a dated, validated snapshot; it does not query NASA during a visitor's page load.

## Run locally

Use Node.js 20.9 or newer and Python 3. No API key or local database is required.

```bash
npm ci
npm run dev
```

Open <http://localhost:3000>. Before publishing, run `npm run lint` and `npm run build`. The [site verification workflow](.github/workflows/verify-site.yml) repeats these checks for changes pushed to GitHub.

## Publish on Vercel

1. Commit the site, `package-lock.json`, `src/data/planets.json`, `src/data/dataset-meta.json`, and `src/data/observations.json` to the GitHub repository. Do not commit `.env` files or `data-scripts/downloads/`.
2. In Vercel, choose **Add New → Project**, connect the GitHub account that owns the repository, and import it. The repository can remain private. Set the framework to **Next.js**, root directory to the repository root, and production branch to `main`. The default `npm run build` command is sufficient. No environment variables are required for the site itself.
3. Inspect the first deployment at its `vercel.app` address. Check the homepage, chart, planet profile, habitability explorer, detection activities, timeline, glossary, About page, and NASA links. Then attach a custom domain in Vercel if desired. Keep the GitHub and Vercel accounts protected with two-factor authentication.

GitHub is the source for builds, not a live data server for visitors. Vercel builds a new version when `main` changes. The deployed site remains available if GitHub or NASA is temporarily unavailable. In particular, changing a local JSON file does **not** change an existing Vercel deployment.

## Refresh the NASA catalog every day

The [scheduled GitHub Actions workflow](.github/workflows/refresh-nasa-data.yml) runs daily at 12:37 UTC and can also be started from **Actions → Refresh NASA planet data → Run workflow**. It downloads the current NASA catalog, checks the required columns and unique planet names, rejects an unexpectedly large drop in catalog size, builds the site, and commits the refreshed `planets.json` and `dataset-meta.json` to `main`. Vercel's Git integration then builds and publishes that commit. A failed download or build leaves the last successful deployment in place.

The workflow needs GitHub Actions enabled and permission to write repository contents. If repository rules prevent the workflow from pushing to `main`, allow this specific workflow to update the two data files or use a reviewed pull-request process instead. Check the first manual workflow run and its corresponding Vercel deployment before relying on the schedule. GitHub schedules can be delayed, and a public repository's schedule can be disabled after prolonged inactivity, so watch the Actions and Vercel failure notifications.

For a private repository in a GitHub organization, Vercel may restrict deployments by commit author. If a successful data-refresh commit does not trigger a Vercel build, create a `main` [Vercel Deploy Hook](https://vercel.com/docs/deploy-hooks), store its URL as a GitHub Actions repository secret named `VERCEL_DEPLOY_HOOK_URL`, and rerun the workflow. The workflow calls the hook only when that secret exists. Treat the hook URL as a password; never paste it into the repository.

The `observations.json` examples are curated observation files used in the Detection Methods Lab. They are not part of NASA's changing planet catalog and are not refreshed by the daily job. To regenerate them manually, run `node data-scripts/prepare_observations.mjs`, review the resulting changes, and commit them.

To refresh the planet catalog manually on your computer, run `python3 data-scripts/fetch_planets.py`, check the data diff, and commit the two files in `src/data`. The raw source downloads remain in `data-scripts/downloads/` for local inspection and are ignored by Git.

## Security and maintenance

The public app has no user accounts, database, NASA credentials, or write API. The deployed NASA measurements are public data. Keep any future secrets in Vercel environment variables or GitHub Actions secrets, never in source files or variables prefixed `NEXT_PUBLIC_`. Limit GitHub collaborators and workflow permissions, enable Dependabot alerts and security updates, and review the [weekly dependency update pull requests](.github/dependabot.yml) before deploying them. The data-refresh workflow uses the repository's scoped `GITHUB_TOKEN`; it needs no personal access token. Review failed workflows and deployment logs rather than assuming a scheduled refresh always succeeded.
