# Deploy to your own Cloudflare account

Status: deployment tooling prepared; GitHub repository and Cloudflare resources still need account access.
The existing public Sites URL remains live. No domain or production data has been moved.

## Architecture
Private GitHub repository -> GitHub Actions -> Cloudflare Worker.
D1 stores editable content and sessions. R2 stores uploaded media.
Changes through /admin do not need a Git commit or deployment.
The current application and pinned dependency lockfile are retained.

## One-time setup
1. Create a private GitHub repository and push the prepared source to main.
2. In your Cloudflare account, create a D1 database and R2 bucket. Keep R2 private; the Worker serves media.
3. Store the account ID, database UUID, database name, bucket name and Worker name as GitHub repository variables:
   CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_D1_DATABASE_NAME,
   CLOUDFLARE_R2_BUCKET, CLOUDFLARE_WORKER_NAME.
4. Create a Cloudflare API token restricted to the intended account with Worker deployment and D1 migration permissions, plus permissions needed to bind the R2 bucket. Store it as the GitHub production environment secret CLOUDFLARE_API_TOKEN. Never commit it.
5. The workflow runs checks only until repository variable DEPLOY_ENABLED is set to true.
6. Build, run scripts/prepare-cloudflare.mjs with those variables, apply schema migrations, and deploy. The script modifies only generated deployment configuration.
7. Set ADMIN_PASSWORD as an encrypted secret on the newly created Worker, using the Cloudflare dashboard or Wrangler's interactive secret prompt. Do not put it in GitHub source. It is not automatically transferred from Sites.
8. Transfer the latest saved content and uploaded files before switching the main URL. Use a fresh export from the old site's /api/content, enumerate /media/ URLs, copy each media object to the new bucket under the same key, then insert the content JSON into the new database. Keep exports outside source control. Do not migrate active sessions or login-attempt records.
9. Verify anonymous pages, password login, edit/save/readback, banner upload/readback, logout and mobile layout.
10. Attach your domain to the Worker after the new deployment passes checks. Keep the old site available during verification.

## Routine deployments
Pull requests run type checks and production builds without production credentials.
Merging main runs checks, applies outstanding D1 migrations, then deploys.
Never use automatic content seeding on each deployment: it would overwrite admin edits.
Do not change applied migration files; add new ones.
Use backward-compatible schema changes so a failed app rollout does not break the existing Worker.

## Recovery and maintenance
Keep the package lockfile; update dependencies deliberately with a test deployment.
Cloudflare Worker rollback restores code, not content or schema.
Use D1 Time Travel where available on your plan, plus exports before schema/content migrations.
Back up R2 media separately; database backups do not include uploaded files.
Use one deployment pipeline; do not also enable Cloudflare's native push-to-deploy for the same branch.
Domain renewal, account billing and dependency/security updates still require maintenance.

## AI generation
The proposed AI banner workflow has not been implemented. OpenAI and image-provider credentials
are not needed for the existing portfolio deployment. They can be added later as Worker secrets.

