# The Gettysburg Files — modular baseline v33

## Repository structure
Upload the **contents of this folder** to the repository root, so that `index.html`, `cases/`, `css/`, `js/`, `data/` and `assets/` are all directly at the top level of the repository.

- `index.html` — application shell, modals and recovery overlay
- `cases/` — Prologue, central Archive Overview, Case Files A–D, Master Recovery Key and Epilogue
- `css/` — base, component, cinematic Prologue/Epilogue and responsive styles
- `js/` — the JavaScript files actually used by the website
- `data/` — replaceable rule-based answer matrices used by interactive validation
- `assets/images/` — local image assets, including the locally optimized Prologue/Epilogue background

## Archive navigation
After the Prologue, students enter a central **Case File Directory**. At first only File A is available. Completing a file returns students to the directory, marks that file as **RESTORED** and unlocks the next damaged file. Restored files remain accessible for review. After File D, the Master Recovery Key is unlocked from the directory.

Completed case files store a local review snapshot in the browser. This preserves the fully recovered state of each completed file across page reloads on the same browser/device. The cinematic Master-Key-fragment recovery sequence only plays on the first successful completion of a file.

## Recovery-key logic
The four Archive Files unlock the fragments `18 · 63 · 27 · 2`. Students use those recovered fragments to reconstruct the hidden final key `1863 – 272` on the Master Recovery Key screen.

## Baseline status
v27 continues the approved modular baseline with responsive Archive Directory alignment, equal Prologue background darkness across both cinematic phases, three precise B01 localisation targets, and a two-stage cinematic B02 contradiction sequence.

The final analytical task in the Epilogue is intentionally not implemented yet.


## v29 review start
For review, Files A and B start restored, File C starts available but unrestored, and Files D plus the Master Recovery Key remain locked. Case C (C01–C03) has been rebuilt around the content → function → macro pattern → analytical language progression.


## v30 update
C01 now validates the five section summaries sequentially (01/05–05/05). Each section is verified independently with section-specific ACCEPT / REFINE / RETHINK logic loaded from `data/c01-answer-matrix.json`, so the validation matrix can be revised without changing the C01 HTML or JavaScript workflow.


## v31 C01 matrix update
The replaceable `data/c01-answer-matrix.json` has been expanded for the final C01 section. It now recognises broader audience/living → future action paraphrases, common variants of the idea that the soldiers did not die in vain, contractions such as `didn't` → `did not`, and additional inflected verb forms. The phrase `he addresses the audience` alone remains a REFINE case.

## v32 · C01 slider, narrative transition and answer matrix v1.4
- Fixed the C01 summary slider so hidden sections are not rendered underneath the active section.
- C01 now completes through 05/05 and reveals a dedicated narrative transition to C02.
- The C01→C02 transition explicitly moves from understanding what Lincoln says to how his line of argument develops.
- `data/c01-answer-matrix.json` is now version 1.4.
- Section 2 validation now accepts broader formulations about the continued existence, survival or endurance of the Union/nation despite tensions, conflict, crisis or division.
- Grammatical variants such as `can still exists` are normalised through the `exist` word family.

## v33 · C01 completion logic + matrix v1.5
- Embedded `data/c01-answer-matrix.json` updated to version 1.5.
- Section 2 validation now requires conflict/crisis/division plus survival, continued existence, future, or testing of the nation; conflict-only answers are REFINE.
- Section 4 validation now robustly accepts singular/plural/possessive variants around `soldier(s)` and `sacrifice`, including natural paraphrases.
- C01 now has `STRUCTURE RECONSTRUCTION` and `CONTENT RECONSTRUCTION` category headings.
- The extra structure-success block was removed; the verify/status control itself carries the success state.
- The content slider remains visible after 05/05 is verified.
- The final C01 recovery block is compact and uses `RECOVERED` plus `CONTINUE RECOVERY` to enter C02.
