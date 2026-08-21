# The Gettysburg Files — stability-repaired baseline v70


## v70 · Stability repair
- Removed the unintended top strip on cinematic Prologue/Epilogue screens.
- Rebuilt the project-wide **OPEN RECORD** gate without moving whole file pages into an animated wrapper; the original DOM structure now remains intact.
- Added explicit hidden-state handling for gated sections so grid/flex component rules cannot make them reappear or disappear unpredictably.
- Removed repeated forced scroll restoration in Case File D, which could interrupt taps and cause visible jumps in iPad Safari.
- Kept the Prologue glass blur on a dedicated background layer while the text remains on a separate sharp layer.
- Rechecked all concrete file gates, the complete D01–D04 interaction flow, JavaScript syntax, duplicate IDs and local asset references.

## Current review state
This baseline intentionally starts in temporary test mode: Files A–C are marked **RESTORED**, File D is **DAMAGED · AVAILABLE**, and the Master Recovery Key remains locked. File D itself starts untouched so its full revised device-analysis and final-recovery workflow can be tested.

## v69 · Unified headings, briefings, device flow and recovery semantics
- Rebuilt the second Prologue text panel as a true glass surface: the background layer is blurred while every line of text remains sharp throughout its animation.
- Protected the project logo in the main header and fixed it to a maximum of two lines, with the recovery cluster reduced so the title always has priority.
- Audited all concrete file headers across A–D and the Master Key screen. Each now uses a short one-line file label, a one-line main title, and a right-aligned status line above the case-recovery bar.
- Shortened overlong headings such as C01 so they remain inside the visible area on tablet, desktop and phone layouts.
- Unified all file instruction cards with the blue archive edge used on the overview pages and added a consistent **ARCHIVE BRIEFING** signal marker.
- Introduced a deliberate reading gate: the instruction transmission appears first, and the working record opens only after the learner taps **OPEN RECORD**. No automatic scroll is triggered.
- Consolidated Case File D into four coherent device records: Parallelism and Antithesis now remain one shared record, followed by the Birth Metaphor and the final three-part closing formula.
- Expanded the Birth Metaphor validation matrices for natural student formulations about the founding, survival, renewal and framing of the nation, including targeted partial-feedback states instead of blanket rejection.
- Added consistent line-style icons to every Analyst Briefing and integrated the Antithesis progression and final Rule-of-Three hierarchy into verified explanation blocks.
- Unified project-wide status colours: grey means locked, blue means available/ready, green means verified/recovered, and orange remains reserved for active reconstruction tasks.
- Reworked all Master-Key fragment overlays with centred actions and reliable lower padding; the final restoration is now opened deliberately from the blue ready-state directory card.

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
For review, Files A and B start restored, File C starts available but unrestored, and Files D plus the Master Recovery Key remain locked. Case C now concludes in C02: the external analytical work is confirmed in the archive, followed by the Line of Argument recovery and the unlock of File D.


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

## v34 · C01 cleanup + C02 line-of-argument rebuild
- Embedded C01 answer matrix remains version 1.5.
- C01 now shows exactly one red `SECTION RECONSTRUCTION` heading and one `CONTENT RECONSTRUCTION` heading.
- `NEXT SECTION` and `COMPLETE CONTENT REVIEW` use the same secondary/ghost button design as `PREVIOUS SECTION`.
- The old C02 Section Functions matching task has been removed.
- The previous analytical-notes workflow is now the new C02.
- C02 reconnects to the Everett/Lincoln contradiction and the 272-word question.
- C02 displays the five recovered speech sections, not the speech as a single continuous block, with vocabulary hovers and subtle colour coding.
- The macro structure `PAST → PRESENT → FUTURE` remains and now leads directly into the analyst records.
- A dedicated `WHAT IS A LINE OF ARGUMENT?` meta-level explanation appears before the existing skill check.

## v35 · Prologue/Epilogue background update
- Replaced the shared Prologue/Epilogue background with the newly supplied Gettysburg battlefield image.
- Optimized the supplied PNG as a local WebP asset for substantially smaller web delivery while preserving the source dimensions.
- Removed the global darkening overlay from the Prologue and Epilogue because the new image already provides sufficient contrast.
- Existing Prologue/Epilogue content, animation timing, interface elements and layout remain unchanged.

