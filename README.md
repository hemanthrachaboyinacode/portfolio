# Hemanth — AI portfolio
React / Vinext on Cloudflare Workers, with D1 content storage and R2 media storage.

## Content editing
Open /admin and sign in with the configured password. Use the section tabs to add, edit, delete or reorder entries. Upload PNG, JPEG or WebP banners (5 MB maximum), or upload a PDF résumé. Click **Publish changes** to save all edits to the cloud. Changes become visible on the next page load.

Projects support title, subtitle, description, technology tags, live link, GitHub link, banner, and overview visibility. Publications support article/research-paper type, title, description, link, and banner. Custom pages support a unique URL slug, title, banner, and text. Profile, contact, experience, skills, education, milestones, accent color and animation are editable.

## Runtime configuration
ADMIN_PASSWORD is a server-side secret configured through Sites. No password is embedded in frontend source. Authentication uses random, server-recorded eight-hour sessions, HttpOnly SameSite cookies, origin checks and login throttling. Hosting uses the existing Sites access boundary in addition to admin login.

Cloud resources are declared in .openai/hosting.json: DB (D1), BUCKET (R2).
Initial content comes from lib/content.ts until the first saved edit. The supplied background is adapted in public/pixel-background.js and respects reduced motion.

## Development
Install with npm run install:ci. Build with npm run build. Apply generated D1 migrations to the local database using the Sites workflow before npm run dev.
Local preview data and hosted data are separate. ADMIN_PASSWORD must be configured for any runtime where login is required.
Run npx tsc --noEmit for type checking. With the dev server at 127.0.0.1:5173, run node scripts/smoke.mjs for local persistence and access-control checks. The smoke test restores original content.

