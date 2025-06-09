export const getCallbackUrl = (
  callbackUrlBase?: string,
  fallbackUrl = "/account",
) => {
  const searchParams = new URLSearchParams(window.location.search);
  const callbackUrlParams = searchParams.get("callbackUrl");
  const callbackUrl = callbackUrlBase ?? callbackUrlParams;

  if (!callbackUrl) {
    return fallbackUrl;
  }

  if (callbackUrl.startsWith("http")) {
    const url = new URL(callbackUrl);
    return url.pathname;
  }

  if (!callbackUrl.startsWith("/")) {
    return fallbackUrl;
  }

  return callbackUrl;
};
