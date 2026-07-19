# The Gettysburg Files — modular build v12

## Repository structure
Upload the **contents of this folder** to the repository root, so that `index.html`, `cases/`, `css/`, `js/`, `js-txt-copies/` and `assets/` are all directly at the top level of the repository.

- `index.html` — application shell
- `cases/` — Prologue, Case Files A–D, Master Recovery Key and Epilogue
- `css/` — base, component, cinematic Prologue/Epilogue and responsive styles
- `js/` — the JavaScript files actually used by the website
- `js-txt-copies/` — identical text copies of every JavaScript file for easier viewing/upload workflows
- `assets/images/` — reserved for local image assets

## Recovery-key logic
The four Archive Files unlock the fragments `18 · 63 · 27 · 2`. Students use those recovered fragments to reconstruct the hidden final key `1863 – 272` on the Master Recovery Key screen.

## Reconstructed v12 baseline
This build restores the cinematic Prologue sequence, the full revised Case A historical progression and sources, the later Case B reading flow, the revised Case C line-of-argument progression, and the collected File D analysis tasks. It also restores the hidden Master Key workflow and a Prologue-style Epilogue placeholder.

The final analytical task in the Epilogue is intentionally not implemented yet.

## Background image
The Prologue and Epilogue currently use the original project background image through an immutable raw GitHub URL pointing to the earlier repository commit. This works on GitHub Pages. The image can later be copied into `assets/images/` and the CSS path changed to a local file if full self-containment is preferred.
