# قبل از اینکه بخری

Persian interactive consultation film. The actual rendered Hyperframes film is divided into timed chapters; viewers answer two preference questions and then open a real name/mobile consultation form through «نیاز به مشاوره دارم».

`app/page.tsx` owns playback, accessible radio choices and submission states. `public/media.json` contains measured segment boundaries. Hold frames preserve question readability while audio reaches the chapter boundary. The film is user-started, supports pause/mute, and stops when the document becomes hidden.

`app/api/consultations/route.ts` validates JSON, same-origin submissions, name, normalized Iranian mobile, preferences, consent and UUID before a prepared D1 insert. The UUID makes identical retries idempotent. There is no public lead-read endpoint and no email/SMS integration. The generated migration creates schema only; local QA rows are not deployed.

Local checks: TypeScript; validation of Persian/Arabic/+98 phone formats and rejected inputs; browser playback/choices/form; actual local D1 write; error state retained input; 360/390/430 mobile layouts. WebMCP status-reading tool is feature-detected; no supported tool registration was exposed by the current QA browser.

Site remains private by default. Audio has technical analysis and alignment; subjective full listening and pronunciation acceptance remain pending and are documented in the media handoff audit.
