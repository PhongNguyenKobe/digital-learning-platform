const configuredApiUrl = import.meta.env.VITE_API_URL

// Vite proxies local paths in development; Render's API URL is supplied in production.
export const apiOrigin = configuredApiUrl
  ? configuredApiUrl.replace(/\/api\/?$/, '')
  : window.location.origin
