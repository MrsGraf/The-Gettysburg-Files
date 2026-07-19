# The Gettysburg Files — modular baseline v20

## Repository structure
Upload the **contents of this folder** to the repository root, so that `index.html`, `cases/`, `css/`, `js/`, `js-txt-copies/` and `assets/` are all directly at the top level of the repository.

- `index.html` — application shell, modals and recovery overlay
- `cases/` — Prologue, central Archive Overview, Case Files A–D, Master Recovery Key and Epilogue
- `css/` — base, component, cinematic Prologue/Epilogue and responsive styles
- `js/` — the JavaScript files actually used by the website
- `js-txt-copies/` — text copies of the case/state JavaScript files for viewing workflows; `app.js` is intentionally provided only in `js/`
- `assets/images/` — local image assets, including the locally optimized Prologue/Epilogue background

## Archive navigation
After the Prologue, students enter a central **Case File Directory**. At first only File A is available. Completing a file returns students to the directory, marks that file as **RESTORED** and unlocks the next damaged file. Restored files remain accessible for review. After File D, the Master Recovery Key is unlocked from the directory.

Completed case files store a local review snapshot in the browser. This preserves the fully recovered state of each completed file across page reloads on the same browser/device. The cinematic Master-Key-fragment recovery sequence only plays on the first successful completion of a file.

## Recovery-key logic
The four Archive Files unlock the fragments `18 · 63 · 27 · 2`. Students use those recovered fragments to reconstruct the hidden final key `1863 – 272` on the Master Recovery Key screen.

## Baseline status
v19 builds on v18 and adds the locally preloaded Prologue/Epilogue background, refined header alignment, clearer lock states, spoiler-free directory descriptions and centered spelling feedback for accepted free-text answers with minor spelling errors.

The final analytical task in the Epilogue is intentionally not implemented yet.
