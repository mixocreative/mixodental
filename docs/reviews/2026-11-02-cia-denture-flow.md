# CIA integrity audit: the denture flow (2026-11-02)

Tier: Screen, scoped by the owner to the denture flow (start card, Step 1 orientation, Step 2 supports, OK, export).
Primary state: a correct, printable supported denture and the STL file that leaves the app. Irreversible steps:
the export (a file leaves), and anything that throws away the operator's step work.

Evidence came from the code and from scripted browser walks (Playwright, headless Chromium, swiftshader) on one
local denture scan, called scan #1 here. Walks ran at 900 x 700 and 1280 x 800. Faults were injected by wrapping
the page's `Worker`: a crash (the worker's `error` event), an engine error (an empty mesh sent to the engine) and a
hang (a job the worker never receives). The walk scripts live outside the repository.

## Findings

| # | Severity | Finding | Fixed |
|---|---|---|---|
| 1 | HIGH | In Step 2 one Ctrl+Z took back the accepted pose, the supports and the denture policy while the screen stayed on Step 2 (OK and Back gone). A second Ctrl+Z removed the imported denture and dropped the app to the start screen, where Redo cannot be reached: the operator's work was lost. | yes, 61bf2d6 |
| 2 | MEDIUM | A Step 1 scan that was rejected (worker crash, timeout, engine error) showed "could not be stood upright… use Free transform, then press Next" but left the step "scanning": Next stayed off ("Wait until the print angles are checked") with nothing running. | yes, ed44bd4 |
| 3 | MEDIUM | Denture jobs had no Cancel, so a stuck job ran to the 10-minute timeout. Back, Exit or a new file left it running, and every later denture job (the next file's scan, an export) waited behind it. An export crash was worded as a build crash ("rebuild the supports"). A failure of an outdated build still set the status line. | yes, 9a4dded |
| 4 | MEDIUM | After a failed, crashed or cancelled build, OK and Add another said "Wait until the supports are built." although no build was coming until a change. | yes, b643cc3 |
| 5 | MEDIUM | At 900 x 700 the dental viewport stopped at 58 % of the window (160 px blank under it), Step 1's bar covered the whole viewport (the denture and the step badge were hidden), and the background-work list lay over the bar's Back button, so Back could not be clicked while a scan ran. | yes, 31cd0fc |
| 6 | LOW | After the denture worker restarts in Step 1 (a crash, a timeout, a cancelled job), the live-tilt handle is gone: the tips stop showing as the dial moves, with no message. Next still works. | no |
| 7 | LOW | After a failed orientation the status line reads "Drop a denture STL, or choose one…" although the denture is loaded (shared step wording). | no |
| 8 | LOW | OK re-arranges the plate, which moves the denture and starts a full support rebuild (about 4 s on scan #1). An export or check started in that window reports "the support check did not finish for 1 object". The exported file is right (export builds its own). | no |
| 9 | LOW | A whole-plate export of an unnamed project is named `scene-printable.stl`, not after the denture. | no |
| 10 | LOW | Undo inside Step 1 turns the denture back but not the dial, so dial and pose disagree until the dial moves. Next accepts the pose shown. | no |
| 11 | LOW | Undo's disabled reason inside a dental step says "leave the mode to undo earlier steps"; in the dental flow the way back is Back (shared text). | no |

## What each fix does

- #1: a dental step sets the undo floor when it begins (stage, object or loading state changed), after the
  step's opening commands landed. Undo inside a step still takes back that step's edits (walked: a denture
  setting change, its Undo and Redo, each with its rebuild). Test: `src/dental/flow.test.ts` plays the flow
  through the real session reducer and history, with and without the floor.
- #2: `src/denture/steps/orient/scanOutcome.ts` maps every ending of the scan to the step's state; none stays
  "scanning". Walked: a crash during the scan now leaves Next on. Test: `scanOutcome.test.ts`.
- #3: the denture client offers Cancel on its long jobs, words each failure in its own context, and
  `cancel(prefix)` stops a left step's jobs quietly. Walked: Cancel of a hung rebuild, Exit during a hung
  build, Back during a hung scan followed by the same file again (stood upright after 7.9 s instead of waiting
  behind the hung job). Tests: `dentureClient.test.ts`, `keyedQueue.test.ts`.
- #4: `dentalBuildFailed` in the command state; OK's reason says what to do. Test: `dentalStep3.test.ts`.
- #5: the dental viewport takes the window height at 1100 px and below, Step 1's bar stays on the right below
  the badge from 721 to 1100 px, and the background-work list sits above the docked edit bar. Walked at
  900 x 700 (screens measured, Back clickable during a scan). Test: `src/ui/narrowDentalLayout.test.ts`.

## Checked and clean

- Export of the finished plate: the file holds the model and the supports at full resolution in the pose shown
  (scan #1: 187,684 triangles = 157,772 model + 29,912 supports, plate at z = 0, default label). The export
  rebuilds from the scene at click time, and a unit changed during the export is refused ("changed while it
  was being exported"). An export while the worker hangs showed no Cancel for 10 minutes; it now offers Cancel (#3; covered by the
  client test, not walked again).
- Two builds of one unit: a queued build is replaced by a newer one; a running build finishes, and App drops
  its result when the unit changed meanwhile. The resolve status line waits for the build of the unit as it
  is after the resolve (`rebuildStatus.ts`).
- Engine error during a rebuild: the status names the failure, the last good build stays drawn, OK is off.
- Leaving the page: `beforeunload` asks whenever the scene differs from the last save, which covers a running
  build. Not walked (a `beforeunload` prompt can freeze headless Chromium): UNVERIFIED at runtime.

## Owner questions

1. Undo now stops at the start of the current dental step (#1). Should Undo instead cross into the previous
   step and take the screen back with it? That needs the step to follow the scene, a larger change.
2. OK's plate re-arrange moves the denture and rebuilds its supports in full (#8). Should a move that only
   translates keep the build (the supports move with the model)? That is in the build path.
3. "Check for unsupported spots" on a finished denture of scan #1 lists 5 spots that the denture build's own
   report does not. Should the check read the denture policy (low points left to the denture shape are
   informational), as it already does for points outside the aligner area?
4. Step 2 at 900 x 700 still docks its panel at the bottom over about half the viewport. Docking it on the
   right on tablet-wide windows also needs the fit-view inset changed. Wanted?

## Not walked at this tier

Real worker out-of-memory (simulated by the `error` event only), the 10-minute timeout itself (simulated by a
hang and Cancel), every locale at 900 x 700 (English only), and a second denture through Add another.
