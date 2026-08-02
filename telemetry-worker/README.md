# WebDataScope telemetry Worker

This subproject implements the opt-out-by-version registration service announced in extension V1.2.2 and enabled in V1.3.0. It records one row per installation, WQ account and extension version. It does not collect feature events or page activity, so it cannot provide DAU/WAU or usage-frequency metrics.

## Data handling

- The registration endpoint accepts only schema version, installation UUID, WQ ID, country, extension version, previous version and reason.
- Request bodies are limited to 2 KiB and unknown fields are rejected.
- The raw WQ ID is HMAC-indexed and AES-256-GCM encrypted before D1 writes. D1 never stores it as plaintext.
- WorldQuant cookies never reach this Worker. Extension requests use `credentials: "omit"`.
- Cloudflare's connecting IP is used only as an ephemeral rate-limit key and is not written to D1.
- Worker code does not log request bodies, WQ IDs or decrypted values.
- `COLLECTION_ENABLED=false` is the emergency stop.

Because the same browser installation may switch WQ accounts, the database idempotency key is `(installation_id, account_hash, version)`. This is the smallest key that both prevents duplicate retries and preserves the required account-switch record.

## Local verification

1. Install dependencies with `pnpm install`.
2. Run `pnpm run secrets:generate`; the ignored files `.generated-secrets.json`, `.dev.vars` and `.admin-credentials.txt` are created without printing secret values.
3. Apply `pnpm run db:migrate:local`.
4. Run `pnpm test` and `pnpm run check`.

## Deployment order

1. Create separate D1 databases named `webdatascope-telemetry-staging` and `webdatascope-telemetry`.
2. Replace the placeholder database IDs in `wrangler.jsonc`.
3. Upload `.generated-secrets.json` with `wrangler secret bulk` to staging and production. Never commit it.
4. Apply remote migrations to staging, deploy staging, and perform the synthetic registration/admin/deletion checks.
5. Apply remote migrations to production, deploy production, repeat the checks, then place the production `/v1/registrations` URL in the extension.

The administrator credentials are stored only in the ignored `.admin-credentials.txt`. Rotate them by generating a new password, updating `ADMIN_AUTH_DIGEST`, and securely retaining the new local credential.
