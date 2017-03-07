const COOKIE_NAME = 'accept-cookie-warning';

export const COOKIE_WARNING = "COOKIE_WARNING";

export function checkCookieWarning() {
  const requireWarning = true; //window.__zwiftGPS && window.__zwiftGPS.cookieWarning;
  const warnedCookie = document.cookie.indexOf(COOKIE_NAME) !== -1;

  return {
    type: COOKIE_WARNING,
    value: requireWarning && !warnedCookie
  };
}

export function dismissCookieWarning() {
  const expiryDate = (new Date());
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  document.cookie = `${COOKIE_NAME}=true;path=/;expires=${expiryDate.toUTCString()}`;

  return {
    type: COOKIE_WARNING,
    value: false
  };
}
