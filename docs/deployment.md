# Deployment and releases

## Hosting

The app runs on Vercel at [app.prodterra.earth](https://app.prodterra.earth). Every merge into `main` is deployed to production.

Production needs `NEXT_PUBLIC_ARCGIS_API_KEY` and `NEXT_PUBLIC_API_URL=https://api.prodterra.earth`.

## Branches

- `main`: what runs in production. Changes only through release pull requests.
- `develop`: integration branch. Every change arrives through a pull request from a `feature/*`, `fix/*` or `docs/*` branch.

Commits follow [Conventional Commits](https://www.conventionalcommits.org/) and are signed.

## Versions

[Semantic Versioning](https://semver.org/), still in `0.x`:

- A release with new features (`feat`) raises the minor version: `0.7.0` → `0.8.0`.
- A release with only fixes raises the patch version: `0.8.0` → `0.8.1`.
- A repository with no changes gets no release.

Changes are listed under `## Unreleased` in `CHANGELOG.md` as they are merged.

## Release steps

1. Create `release/X.Y.Z` from `develop`.
2. Set the version in `package.json` and rename `## Unreleased` to `## X.Y.Z - date` in `CHANGELOG.md`.
3. Open a pull request to `main` and merge it.
4. Tag `main` with a signed tag `vX.Y.Z` and publish a GitHub release with the changelog section.
5. Merge the release branch back into `develop`.

When a release needs a new API feature, release the API first.
