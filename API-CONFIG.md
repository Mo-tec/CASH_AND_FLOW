# API Configuration

Run Node.js 20+ with `node serve.cjs`, open `http://127.0.0.1:4173`, unlock the app and choose **Zaidi → API Configuration**. Create an owner password of at least 12 characters, then save a named config. You can retain up to 20 configs and choose the active one without editing code.

The backend deliberately listens only on this computer. The first person with access to its localhost interface can create the owner password; set it before sharing the computer. This is a single-owner local backend, not a hosted multi-user service. GitHub Pages and other static hosting cannot run it. Do not expose this server through a tunnel or public reverse proxy. A shared hosted version requires a deployed backend, HTTPS, verified user identity and server-side administrator permissions.

## Supported protocols

- OpenAI-compatible / Custom: enter a provider's HTTPS base URL ending at its API prefix (commonly `/v1`) and a model ID. The gateway appends `/chat/completions` or `/models`. Compatibility depends on the provider supporting Chat Completions, `max_tokens`, and SSE streaming; models requiring a different API need another adapter.
- Anthropic Messages: base URL `https://api.anthropic.com/v1`; model ID from your account. Uses `/messages`, `x-api-key`, `anthropic-version: 2023-06-01`, and SSE text deltas. [Official API overview](https://platform.claude.com/docs/en/api/overview).
- Gemini GenerateContent: base URL `https://generativelanguage.googleapis.com/v1beta`; model ID from your account. Uses `generateContent` for tests and `streamGenerateContent?alt=sse` for chat with `x-goog-api-key`. [Official API reference](https://ai.google.dev/api/generate-content).
- Ollama: start Ollama separately, use `http://127.0.0.1:11434/v1`, no API key, and an installed model ID. This is the sole exception to the public HTTPS URL rule.

**Pata models** loads a provider's first page (up to 500 entries). Some providers do not expose model discovery; enter the model ID manually. Listing does not prove a model supports chat or your account has access. **Test Connection** sends a small generation request using the saved config and can incur a charge. Save edits before testing. Nothing contacts a provider automatically when opening Settings.

## Use in MO AI

Open MO AI's options (`•••`), choose **Njia ya kujibu → Model ya API**. Sign into API Settings and activate a config first. Responses stream into the chat; **Sitisha jibu** cancels the request. Only the current typed question is sent. Transaction records, account identity, saved owner knowledge, prior chat messages and local instructions are not attached. Text you type can itself contain sensitive information: it goes to your chosen provider.

The default **MO AI · Data na miamala (ndani)** preserves the existing financial analysis and confirmation workflow. API mode cannot read records, save transactions or invoke app actions. It is for text questions, not tool calling, images or financial reports. Completed API responses are saved in the app's existing chat history; incomplete/cancelled responses are discarded. There is no automatic provider fallback.

## Secret storage and limits

Keys and profiles live in `.private/api-vault.json`, encrypted with AES-256-GCM using a scrypt-derived owner-password key. The password is not stored. `.private/` is excluded from Git and cannot be served by `serve.cjs`. Keep this directory out of deployments and external backups unless you intend to preserve the encrypted vault. File permissions depend on your operating system; disk administrators and malicious local software are outside this protection boundary. Forgotten passwords cannot recover keys; keep the password safely. No password reset/rotation UI is supplied in this version.

Sessions last 30 minutes and tokens remain in page memory. Reload, account change, app lock or **Funga API session** requires sign-in again. Existing keys are returned only as a masked hint; leaving the key field blank preserves the saved key. Keys never enter localStorage, Firebase backups or the PWA cache. The key being typed exists transiently in the browser and is cleared after a save attempt.

The gateway checks host and origin, rejects redirects and URL credentials, validates resolved public IP addresses, and pins outbound connections to the checked address. Private network URLs are rejected except the fixed Ollama endpoint. Login attempts are throttled; generation has a maximum of two concurrent requests and twelve requests per minute across the local server.

Each profile has a persisted daily request limit (UTC), timeout and maximum output token limit. Tests, model-list requests and failed upstream calls count against that limit. This is not a currency budget: set spending limits with the provider too. Max tokens also depends on the provider/model and may be rejected. Requests are never automatically retried, avoiding duplicate charges. Response-size limits and timeout bound incoming data. The gateway does not log request bodies, keys or provider error bodies.

## Verification

`node verify-api-config.cjs` tests owner auth, origin checks, encrypted persistence, masked keys, preserved keys, streaming, request quotas across gateway restarts, deletion, and private URL rules using a fake provider. It does not use a real key or contact a paid service.

`node verify-api-protocols.cjs` checks the three external protocol adapters with mocked HTTPS/DNS. `node verify-api-browser.cjs` uses installed Edge (override with `BROWSER_PATH`) to check owner setup, config editing, key clearing, model listing, connection tests, streaming chat, mobile sizing and session revocation. It blocks external HTTPS and uses a temporary vault and browser profile. Screenshots are in `test-artifacts/api-config/`. These checks and the existing MO AI browser regression passed. No real provider credentials were available, so paid/live provider connectivity remains to be tested with your own config.
