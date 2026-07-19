# The Gettysburg Files — modular baseline v28

## Repository structure
Upload the **contents of this folder** to the repository root, so that `index.html`, `cases/`, `css/`, `js/` and `assets/` are all directly at the top level of the repository.

- `index.html` — application shell, modals and recovery overlay
- `cases/` — Prologue, central Archive Overview, Case Files A–D, Master Recovery Key and Epilogue
- `css/` — base, component, cinematic Prologue/Epilogue and responsive styles
- `js/` — the JavaScript files actually used by the website
- `assets/images/` — local image assets, including the locally optimized Prologue/Epilogue background

## Archive navigation
After the Prologue, students enter a central **Case File Directory**. In this temporary review build, Files A–D and the Master Recovery Key are all directly accessible so the current modules can be checked without completing the preceding files. The recovery logic itself remains in place; this review unlock should be removed again before the final student release.

Completed case files store a local review snapshot in the browser. This preserves the fully recovered state of each completed file across page reloads on the same browser/device. The cinematic Master-Key-fragment recovery sequence only plays on the first successful completion of a file.

## Recovery-key logic
The four Archive Files unlock the fragments `18 · 63 · 27 · 2`. Students use those recovered fragments to reconstruct the hidden final key `1863 – 272` on the Master Recovery Key screen.

## Baseline status
v28 continues the approved modular baseline and adds the corrected, losslessly optimized archive-paper texture; restores vocabulary hover support wherever the Gettysburg Address is displayed; restructures Case C into C01 content/summary, C02 section functions plus the past–present–future macro pattern, and C03 analytical depth/language; removes the redundant argument-map reconstruction while retaining the line-of-argument skill check; and temporarily unlocks all archive files for review.

The final analytical task in the Epilogue is intentionally not implemented yet.
