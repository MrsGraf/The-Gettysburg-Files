# The Gettysburg Files — modular build

## Repository structure
- `index.html`
- `cases/` — prologue, Case A–D, Final Key, Epilogue
- `css/` — base, components, prologue, responsive
- `js/` — the actual JavaScript files used by the website
- `js-txt-copies/` — identical text copies for easier viewing/upload workflows
- `assets/images/` — reserved for local image assets

## Important
The website uses the `.js` files in `js/`. The `.txt` files are only copies.

## Changes integrated
- Global green recovery/verified/restored/confirmed feedback styling.
- Red remains the colour for the next active action.
- Added hover support for preserving, profound, secession, postponed and Robert E. Lee.
- Replaced the abstract Gettysburg locator with a historically oriented 1863 Union/Confederacy map.
- Tablet layout stacks map and task/feedback area vertically.
- Centralised fragment/localStorage state in `state.js`.
- Case A interaction logic isolated in `case-a.js`.

- A03 invitation redesigned as a linear source-analysis flow; FROM WHOM removed; assignments remain freely editable until final verification.
