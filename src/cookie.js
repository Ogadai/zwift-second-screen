export const getCookie = (name, defaultValue) => {
  const cookiePair = document.cookie.split(';')
    .map(str => str.trim().split('='))
    .find(([n, v]) => name.toLowerCase() == n.toLowerCase());
  return cookiePair ? JSON.parse(cookiePair[1]) : defaultValue;
};

export const setCookie = (name, value) => {
  const date = new Date();
  date.setTime(date.getTime() + (365*24*60*60*1000));

  document.cookie = `${name}=${JSON.stringify(value)}; expires=${date.toUTCString()}; path=/`;
}
