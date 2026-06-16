# UI development

This UI is a Next.js application.

## Run locally for development

From the `UI/` directory:

```bash
npm install
npm run dev
```

The development server is configured to start with:

```bash
next dev --hostname 0.0.0.0 --port 5173
```

### Development environment assumption

- The UI runs in a local or containerized development environment where binding to `0.0.0.0` is required for external/preview access.
- The app listens on port `5173`.
- Use `npm run dev` instead of passing a generic `--host` flag, because Next.js expects `--hostname`.
