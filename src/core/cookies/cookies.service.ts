/*
 * alternatively we can use this package
 * @link https://github.com/js-cookie/js-cookie#converters
 */

/**
 *set a cookie here
 *
 * @link https://www.w3schools.com/js/js_cookies.asp
 * @param {string} cname -cookies name
 * @param {string} cvalue- cookies values
 * @param  {string }exdays- expires days
 */
export const setCookie = (
  cname: string,
  cvalue: string | number,
  exdays: number
) => {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  const expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
};
/**
 *get the cookies here
 *
 * @link https://www.w3schools.com/js/js_cookies.asp
 * @param cname -get a cookie here
 * @returns {string} -returning cookies here
 */
export const getCookie = (cname: string): string => {
  const name = cname + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
};
