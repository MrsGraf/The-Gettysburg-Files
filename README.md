# The Gettysburg Files

**Complete release**

*The Gettysburg Files* is an interactive HTML/CSS/JavaScript learning environment for analysing Abraham Lincoln's Gettysburg Address. Students reconstruct the historical context, the circumstances of the speech, its line of argument and selected rhetorical patterns through four connected archive files.

Completing all four files releases the fragments of the Master Recovery Key. Reconstructing the key restores Archive Case #272 and unlocks a final Analyst Briefing with an additional method sheet for analysing political speeches.

## Learning path

1. **Prologue** - introduces the damaged archive.
2. **Case File Directory** - central navigation and recovery status.
3. **File A · Opening the Case** - historical context, Gettysburg and the cemetery dedication.
4. **File B · The Two Speeches** - ceremony, speakers and the recovered Gettysburg Address.
5. **File C · Reconstructing the Argument** - sections, macro structure and line of argument. C03 continues temporarily outside the archive through the downloadable Analyst Record.
6. **File D · The Hidden Blueprint** - selected rhetorical devices and their function within Lincoln's argument, ending with the Analyst Briefing **From Effect to Interpretation**.
7. **Master Recovery Key** - combines the four recovered fragments and restores the complete archive.
8. **Final Analyst Briefing** - downloadable reference material with an additional method sheet. Students can then return to the File Directory and reopen all restored files for review.

## Regular starting state

The classroom release starts with no pre-completed recovery states:

- File A - **DAMAGED · AVAILABLE**
- Files B-D - **LOCKED**
- Master Recovery Key - **LOCKED**
- Archive Recovery - **0%**
- no preset Master-Key fragments
- no tasks preset as recovered

Each completed case file remains accessible for review and unlocks the next file.

## Recovery logic

The four files release the fragments:

`18 · 63 · 27 · 2`

Students use the fragments in file order to reconstruct the Master Recovery Key:

`1863 - 272`

After the final recovery, Archive Case #272 is marked **FULLY RESTORED**. The final Analyst Briefing can be downloaded directly from the recovery window, and **RETURN TO FILE DIRECTORY** keeps all four restored files available for review.

## Downloadable material

- `assets/docs/Gettysburg-Address-C03.pdf` - the external C03 Analyst Record used during File C.
- `assets/docs/Final-Analyst-Briefing.pdf` - the final Analyst Briefing and additional method sheet made available after the Master-Key recovery. The QR code in this PDF also has a clickable link to the accompanying online method sheet.

## Repository structure

Upload the **contents of this folder** to the repository root. `index.html`, `cases/`, `css/`, `js/`, `data/` and `assets/` must remain at the top level.

- `index.html` - application shell, shared information modals and recovery overlays
- `cases/` - Prologue, Case File Directory, Files A-D and the legacy Master-Key fallback screen
- `css/` - base, component, project-theme, Prologue and responsive styles
- `js/` - application, state and case-specific interaction logic
- `data/` - replaceable rule-based answer matrices used by interactive validation
- `assets/images/` - local, web-optimised historical and interface images
- `assets/docs/` - downloadable Analyst Records and briefings

## Responsive design

The **tablet layout is the visual reference**. Desktop and smartphone layouts preserve the same hierarchy, colours, cards, glass surfaces, status system and sequence of elements. Responsive changes are intended mainly to provide sensible line breaks, stacking and spacing for the available screen size rather than an alternative design.

## Status colours

- **Grey** - locked / inactive
- **Blue** - available / ready for the next deliberate step
- **Green** - recovered / verified / completed
- **Red / orange** - active reconstruction or attention state, not general availability

Lock symbols follow the same logic: grey closed = locked, blue open = available, green open = recovered.

## Local state and review

Completed case files store their recovery state and review snapshot in the browser. Restored files therefore remain available from the File Directory for review on the same browser/device. The regular release contains no test-mode unlocks.

## Running the project

The project is designed for static hosting such as GitHub Pages. Because the case files are loaded with `fetch()`, use a web server rather than opening `index.html` directly through `file://`.

For local testing, any simple local HTTP server is sufficient. Open `index.html` through that server and test the full progression from the Prologue through the Master-Key recovery.
