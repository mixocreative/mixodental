# Dental reference records

The clinical and print references the dental rules cite, and the candidate studies behind them. Read when questioning a dental number. `docs/dental-reference/face-labels.json` stays a file of its own, because `scripts/dental-face-labels.ts` reads it.

**5 documents, gathered into this one record on 2026-11-19.** Each is copied whole, nothing reconciled with later reality, under an anchor that is its old filename - so a reference anywhere in this repo, in an old commit message or in an audit log still finds it by that name.

| when | document | was |
|---|---|---|
| undated | [Dental rework reference](#README) | `docs/dental-reference/README.md` |
| undated | [Candidate sharp-ridge connectors](#connector-path-candidates) | `docs/dental-reference/connector-path-candidates.md` |
| undated | [Detected edge candidates on the neutral reference aligner](#detected-edge-candidates) | `docs/dental-reference/detected-edge-candidates.md` |
| undated | [Review model: proposed outer ridge, opening, and support faces](#support-area-review) | `docs/dental-reference/support-area-review.md` |
| undated | [Two-contour surface partition — diagnostic, not support permission](#two-contour-face-regions) | `docs/dental-reference/two-contour-face-regions.md` |

---

<a id="README"></a>

## Dental rework reference

*Was `docs/dental-reference/README.md`.*

The owner explicitly approved publishing this patient-specific reference mesh and screenshots to this public repository on 2026-10-24 so cloud workers can reproduce and fix the Dental Auto Generate defects. Do not add patient names, original file paths, or further patient material to this folder.

`reference-aligner.stl` is the **already correctly posed** benchmark. Its filename and 80-byte binary STL header were neutralized; the triangle records are byte-for-byte unchanged. SHA-256: `37978ABED8A1A4045B25F288A355FAB40971F5E5AD21D1C4740491D8E9B31987`.

| Image | What to inspect |
| --- | --- |
| `01-exterior-contact-side.png` | Unwanted support touches the tooth/exterior side. |
| `02-exterior-contact-tooth.png` | Another forbidden tooth-side contact. |
| `03-mask-overreach-and-gaps.png` | Allowed-area mask spills above and misses some inner/lower surface. |
| `04-desired-inner-area-redacted.png` | Blue annotation of intended inner/lower region. The identifying status-bar filename was replaced using an image-editing tool; this is a **slightly re-rendered visual guide**, not pixel-exact regression evidence. |
| `05-intended-tilt.png` | Supplied correct printing pose has an intentional tilt. |
| `06-nonplanar-trim-contours.png` | Hand-traced inner and outer trim edges rise near the posterior ends. |
| `07-outer-ridge-and-inner-opening-annotation.png` | Operator's later clarification: blue/orange sections and green sharp-ridge joins form the candidate outer contour; red marks the central opening. |

Diagnostic derived assets: [edge chains](#detected-edge-candidates), [green connector paths](#connector-path-candidates), the [two-contour face partition](#two-contour-face-regions), and the [simplified operator review model](#support-area-review). The [dentalwork folder](../dentalwork/README.md) has separate plain-language and technical explanations plus a Windows STL-to-GLB review script. These reference visuals do not certify other patients.

Use the mesh through the app's STL importer, as `scripts/probe-dental-orientation.ts` does. The active plan is [the Dental rework plan](superpowers.md#2026-10-24-dental-rework). These images are qualitative references; geometry and contact assertions should be measured on the mesh itself, and the operator should visually review the result.

---

<a id="connector-path-candidates"></a>

## Candidate sharp-ridge connectors

*Was `docs/dental-reference/connector-path-candidates.md`.*

`connector-path-candidates.glb` shows the neutral reference shell with the previously measured **blue** full-arch and **orange** partial 60° sharp-edge chains. Two **green** paths connect their corresponding endpoints within the looser 20° sharp-edge graph. These paths are diagnostic candidates, not verified anatomical trim.

The short green route is 10.55 mm over 38 mesh edges. The other is 40.39 mm over 168 mesh edges and spans 10.34 mm in axial depth; its shape requires comparison against the operator's marked green route. Together with blue and orange they form a simple 2,665-edge cycle (every graph vertex has degree two). Blocking face adjacency across this *single* cycle leaves all 373,956 faces in one connected region. It does not, by itself, isolate a support area. A separately recovered central-opening contour is needed before testing a between-contours surface strip.

Reproduce with PowerShell:

```powershell
$env:DENTAL_PROBE_FIXTURE='docs/dental-reference/reference-aligner.stl'
$env:DENTAL_PROBE_CONNECTORS='1'
$env:DENTAL_PROBE_GLB='docs/dental-reference/connector-path-candidates.glb'
.\node_modules\.bin\vite-node.cmd scripts/probe-dental-edges.ts
```

Do not authorize support contacts from either connector until the path is visually checked against the intended ridge and the inner/outer contours are proven to bound only the permitted lower surface.

---

<a id="detected-edge-candidates"></a>

## Detected edge candidates on the neutral reference aligner

*Was `docs/dental-reference/detected-edge-candidates.md`.*

Open `detected-edge-candidates.glb` in a GLB viewer. It contains the reference aligner as a translucent off-white shell and the 60° mesh-normal-transition edge components as colored tubes:

- **Blue:** largest open full-arch chain (1,628 edges). It covers most of the projected arch but has two endpoints; it is *not* a certified anatomical trim or support boundary.
- **Orange:** second-largest open partial chain (831 edges). It is not a complete paired inner trim.
- **Magenta:** small closed loops, previously mistaken for a rim. They are false full-arch boundary candidates.

The GLB shows what the current geometric probe can extract on this **one** reference mesh. No colored chain licenses support contacts or establishes reliable detection on other aligners. The needed two complete non-planar trim contours and the safe between-contours surface remain unresolved.

Regenerate from the approved neutral fixture with PowerShell:

```powershell
$env:DENTAL_PROBE_FIXTURE='docs/dental-reference/reference-aligner.stl'
$env:DENTAL_PROBE_GLB='docs/dental-reference/detected-edge-candidates.glb'
.\node_modules\.bin\vite-node.cmd scripts/probe-dental-edges.ts
```

---

<a id="support-area-review"></a>

## Review model: proposed outer ridge, opening, and support faces

*Was `docs/dental-reference/support-area-review.md`.*

Open `support-area-review.glb` and rotate the model. This is the **reference-STL candidate for operator review**, not the production mask and not a claim that supports are safe.

- **Blue:** long sharp outer-ridge section detected at 60°.
- **Yellow:** shorter sharp outer-ridge section detected at 60°.
- **Green:** two 20° sharp-network paths joining those sections. The longer one must be checked carefully at the posterior end.
- **Red:** central-opening silhouette lifted to a 339-edge mesh loop.
- **Teal faces:** the proposed support-contact surface enclosed by the two contours. Only these faces would be considered for tips if the method passes further tests.
- **Neutral off-white faces:** everything else, proposed as forbidden for tips.

![Opening view](dental-reference/support-area-review-opening.png)

![Side view](dental-reference/support-area-review-side.png)

On this neutral reference, the two loops separate 254,344 teal faces from 119,612 neutral faces. The partition is unchanged under three large input rotations of this same STL. That does **not** establish reliability on a different patient's aligner or prove every teal face is anatomically safe. The operator should check whether all teal faces—and no off-white faces—match the intended contact zone, especially both back ends and the green joins.

Regenerate with PowerShell:

```powershell
$env:DENTAL_PROBE_FIXTURE='docs/dental-reference/reference-aligner.stl'
$env:DENTAL_PROBE_CONNECTORS='1'
$env:DENTAL_PROBE_OPENING='1'
$env:DENTAL_PROBE_REVIEW_GLB='docs/dental-reference/support-area-review.glb'
.\node_modules\.bin\vite-node.cmd scripts/probe-dental-edges.ts
```

---

<a id="two-contour-face-regions"></a>

## Two-contour surface partition — diagnostic, not support permission

*Was `docs/dental-reference/two-contour-face-regions.md`.*

The operator's [annotated view](dental-reference/07-outer-ridge-and-inner-opening-annotation.png) identifies a sharp **outer/down-facing ridge** (blue and orange measured sections, green missing sections) and the central opening (red). This reference-only probe tests that topological idea.

Open `two-contour-face-regions.glb`: **blue/orange/green** make the candidate outer ridge, **red** is a candidate mesh loop around the projected central opening. **Teal** and **coral** are the two resulting face-connected regions, deliberately named *unclassified* in the GLB. Teal appears broadly on the intended underside in the rendered views; coral appears predominantly on tooth/exterior surfaces. Neither has been approved for support tips.

![Opening-side diagnostic view](dental-reference/two-contour-opening-view.png)

![Side diagnostic view](dental-reference/two-contour-side-view.png)

### Measured on this one reference STL

- Projected mesh occupancy has exactly one enclosed central hole at 256, 384, and 512-pixel grids. At all three sizes the same 342 silhouette edges near the hole are selected: a 339-edge main loop plus a spurious 3-edge loop sharing one vertex.
- The candidate outer contour is a simple 2,665-edge cycle. Together with the 339-edge opening loop, blocking face adjacency splits the 373,956-face mesh into **254,344-face** and **119,612-face** regions.
- The 254,344-face region has mean normal·opening **+0.381**; the 119,612-face region has **−0.299**. This sign is geometric evidence, not anatomical ground truth.
- The probe was repeated after input rotations of `[1.1, −2.2, 0.7]`, `[−2.5, 0.4, 2.1]`, and `[0.9, 1.7, −1.3]` radians, in addition to the original pose. All four yielded the same 339-edge opening loop, connector lengths (10.55 and 40.39 mm), two regions, and face counts. This shows rotation consistency on **one mesh**, not generalization to other aligners.

### Remaining gate

The operator must compare teal/coral and both green joins against the intended anatomy, especially at the posterior ends. Then test at least one distinct similar STL, local perturbations, forbidden-face labels, brush edits, and final landed tips. Until those checks pass, the production dental mask remains fail-closed and no automatic contacts are authorized by this probe.

Reproduce the GLB with PowerShell:

```powershell
$env:DENTAL_PROBE_FIXTURE='docs/dental-reference/reference-aligner.stl'
$env:DENTAL_PROBE_CONNECTORS='1'
$env:DENTAL_PROBE_OPENING='1'
$env:DENTAL_PROBE_REGION_GLB='docs/dental-reference/two-contour-face-regions.glb'
.\node_modules\.bin\vite-node.cmd scripts/probe-dental-edges.ts
```
