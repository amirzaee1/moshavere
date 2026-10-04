# Independent final visual critic — Before You Buy

**Verdict: REVISE — one targeted transition fix.** Settled compositions, Persian readability, exact CTA and final form pass. Audio/pronunciation and complete audiovisual acceptance remain **BLOCKED: no actual listening was available**.

Artifact: `production/delivery/Before-You-Buy-1080p.mp4`, validated after atomic replacement: 67.200 s, 1080×1920, 60 fps, H.264 + AAC, 50,647,602 bytes. The earlier incomplete MP4 was not reviewed as a valid deliverable. Contact sheets use the identical finalized Hyperframes video-only render; native checks and measurements use the repaired master.

Method: whole-film sampling every 0.5 s; dense 1/30 s transition sheets at 5.5–6.3, 17.1–18.6, 25.8–26.7, 37.6–38.5, 43–44, 50.7–51.6, 57.7–58.7 and 60.65–62.2; native-size opening, long Persian titles, route, CTA, form and additional cropped morph frames. This is sampled visual inspection, not exhaustive frame-by-frame playback or a listening review.

## The one fix

**61.10–61.18 s, lower-middle: the CTA heading travels through the already-visible name input.** Around native requested timestamp 61.117 s, «نیاز به مشاوره دارم» sits inside the name field; by 61.150 s it straddles the field’s upper border before clearing it. The settled layout is correct, but this short crossing violates the explicit no-collision-during-transitions bar. There is no reason to rebuild the ending.

**Implementation:** keep the name label and name input invisible until at least 61.23 s, after the CTA heading clears their area. Then reveal the field and retain the mobile/submit stagger. Verify 61.0–61.5 s at 1/60 s after this timing change. Evidence: `final-critic/cta-morph-details.jpg`.

## Visual findings

| Time | Finding |
|---|---|
| 0–5.85 s | Frame 0 is complete. Photoreal actor and packages read clearly. At 3.5 s, the question reaches the hair edge but covers no eyes, nose or mouth; no blocking face collision. |
| 5.85–17.9 s | Bag and overhead parcel imagery retain continuity. Persian remains correctly shaped; no clipped titles. |
| 17.9–26.1 s | Question and three equal rows remain readable. Progressive brass rules and colour changes provide visible information progression. |
| 26.1–37.95 s | Long question «چطور مطمئن‌تر می‌شی؟» fits with clear margins. Three explanations are correctly separated and legible. |
| 37.95–51.03 s | Product-first comparison and three-step route are clear. Magnifier stays in the left lane and does not obstruct labels. |
| 51.03–61.0 s | Consultation purpose is understandable on mute. Faces stay clear. Exact CTA «نیاز به مشاوره دارم» has roughly 2.8 s of settled button visibility before transforming. |
| 61.23–67.2 s | Name, mobile, request button and supporting instruction are visually distinct. No clipped field, title collision or false success message in the settled form. |

Dense checks found no flash bursts, garbled Persian, spliced titles or sustained blank frames. Very brief near-empty fade troughs around 37.90, 43.20 and 51.00 s are transitional and do not warrant another redesign pass.

## Measured limits

The supplied frozen-time script (10 fps, threshold 0.35) flags **22.5 s near-static**, including about 5 s of permitted final-form hold; long runs include 19.8–25.7 and 38.5–42.8 s. This does **not meet the literal numeric Motion frozen-time target**. Pixel inspection shows reading layouts, progressive line/emphasis animation and route reveals rather than decoder freezes. Preserve useful question-reading time; do not add arbitrary background drift solely to make this metric pass. Record this genre/timing exception openly rather than claiming every Motion target passed.

Measured final-master audio: **−17.4 LUFS integrated, 2.8 LU LRA, −4.7 dBFS true peak**. These are signal measurements only; timbre, SFX fit, pronunciation, speech clarity and synchronization were not listened to or accepted.

**ONE MORE PASS for the first-field reveal timing. No other visual blocker requested.**
