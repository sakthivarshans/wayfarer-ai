# Visa requirements dataset — attribution

`visa-matrix-tidy.csv` and `countries-iso2.json` in this folder are **vendored,
unmodified copies** of files from
[xpressmike/visa-matrix](https://github.com/xpressmike/visa-matrix), pinned to
commit `33cf6adec69e108496e72039dc6b29e13f2f3962` (retrieved 2026-09-28).

- **License:** [CC BY-SA 4.0](./LICENSE), as published by the upstream project.
  That project's data is itself derived from Wikipedia's visa-policy articles
  (CC BY-SA) and cross-checked against the passport-index dataset.
- **Changes made by this project:** none. The files are byte-for-byte copies.
  Anything derived from them at runtime (e.g. the API's visa summaries) is
  computed in `src/services/travelEssentials/` and is not redistributed as data.
- **Scope of the license:** it applies to the files in *this folder*. The rest
  of the repository is not a derivative of this data.

## Accuracy

Visa rules change often, and this is a periodic aggregation, not a live
government feed. Each row carries a `confidence` value (`high`, `medium`, or
`disputed` where the upstream sources disagree). The app surfaces that value
and always tells users to verify with an official source before travelling.

## Updating

Re-download the two data files from a newer upstream commit, replace them, and
update `metadata.json` (`commit`, `retrievedAt`) and the commit SHA above.
