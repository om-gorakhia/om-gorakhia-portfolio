# Portfolio Build — Project Constitution

## Owner
- GitHub username: om-gorakhia
- Resume: ./resume.pdf (parse with the pdf skill at the start of the build)
- Avatar source: ./selfie.jpg (process with sharp + custom shader; fall back to procedural avatar if missing)

## Audience & Goal
This site serves four audiences simultaneously: technical recruiters, senior industry contacts, the LinkedIn community, and random high-signal leads who discover the site via social sharing. The primary goal is to make every visitor want to connect — whether that's an email, a LinkedIn follow, or a direct message. Every design and copy decision must optimize for "first 10 seconds = intrigue, next 30 seconds = credibility, final action = contact."

## Creative Direction — "Operator Console"
The site presents the owner as if the visitor is logging into a personal command center. A live 3D scene is the centerpiece: a stylized holographic projection of the owner's face (processed from selfie.jpg) floating in a dark futuristic environment, reacting to cursor movement. Around it sit floating glass panels for each section. The aesthetic is bold on first glance but every panel is clean, scannable, and recruiter-friendly underneath. Bold shell, professional core.

One signature interactive moment: clicking the avatar triggers a "contact transmission" state — the camera pushes in, panels fold away, and a terminal-style contact interface takes over. This is the moment designed to be screenshot-worthy for LinkedIn sharing.

## Visual Vocabulary (locked)
- Base: deep space black (#05060A or darker)
- Accent: to be chosen after scanning GitHub — pick one accent color that echoes the owner's dominant language/domain (electric cyan for web, plasma violet for AI/ML, amber for systems, etc.). Lock the choice before writing any component.
- Typography: monospaced display font for headers (JetBrains Mono, Space Mono, or Geist Mono), geometric sans for body (Inter, Geist, or similar)
- Texture: subtle film grain overlay, volumetric lighting in the 3D scene
- Forbidden: stock particle.js, matrix rain, generic "tech" clichés, default Tailwind purple/blue gradients, Vercel-template look, Linear-clone look

## Structure (single page, anchor-scrolling)
1. Hero — live 3D scene + one sentence that states who the owner is
2. Live "Now" strip — pulled from latest GitHub commit activity via GitHub MCP, shows currently-active work, auto-updates via ISR
3. Selected Work — 3D tilted cards sourced live from GitHub (stars, language, last push, description)
4. Timeline — resume parsed from PDF, rendered as a horizontal scrollable arc (not a vertical list)
5. Signals — if the owner has written READMEs or essays worth surfacing, pull them; otherwise skip this section entirely (do not pad)
6. Contact — terminal-style input, feels like messaging a console

## Tech Stack (locked — do not substitute)
- Next.js 15 (App Router) + TypeScript
- React Three Fiber + @react-three/drei for the 3D scene
- Framer Motion for UI motion
- Tailwind CSS v4 (use the v4 config syntax — verify with Context7 before writing)
- sharp for local image processing (selfie processing, no external services)
- Deployment: Vercel via Vercel MCP
- Data refresh: ISR with revalidate interval so GitHub data stays fresh without manual rebuilds

## Workflow Rules
1. Before writing any code that touches Next.js 15, React Three Fiber, Tailwind v4, or Framer Motion, call Context7 MCP to pull current docs for that library. Do not rely on training data for these fast-moving libraries.
2. After each major UI section is built, use Chrome DevTools MCP to launch the dev server, take a screenshot, and self-review before moving on. Flag any visual issues before continuing.
3. Use the pdf skill to read resume.pdf. Use sharp to process selfie.jpg. Do not install any image processing tools beyond sharp.
4. Never commit the GitHub PAT, the resume PDF, or the selfie to the repo. Add them to .gitignore immediately after init.
5. Do not add unrequested libraries. The stack above is locked. If a need arises for a library not listed here, stop and ask me first.
6. Write commit messages as you go. The final GitHub repo should read like a real human built it, not one giant "initial commit."

## Hidden / Downplayed
None. Use everything.

## Domain
Default to the *.vercel.app subdomain assigned at deploy time. No custom domain.
