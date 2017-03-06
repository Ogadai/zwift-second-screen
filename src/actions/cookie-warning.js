const COOKIE_NAME = 'accept-cookie-warning';

export const COOKIE_WARNING = "COOKIE_WARNING";

export function checkCookieWarning() {
  const requireWarning = window.__zwiftGPS && window.__zwiftGPS.cookieWarning;
  const warnedCookie = document.cookie.indexOf(COOKIE_NAME) !== -1;

  return {
    type: COOKIE_WARNING,
    value: requireWarning && !warnedCookie
  };
}

export function dismissCookieWarning() {
  document.cookie = `${COOKIE_NAME}=true`;

  return {
    type: COOKIE_WARNING,
    value: false
  };
}
