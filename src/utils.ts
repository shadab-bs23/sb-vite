import router from "@/router";
import { DateTimeFormatOptions } from "@intlify/core-base";
import { format } from "date-fns";
import { CTA, ROLE } from "./components/common/enums/enums";
import { ROUTE } from "./router/enum/routeEnums";
import { useSharebusStore, useTripStore, useUserStore } from "./store";
import { RouteRecordName } from "vue-router";

/**
 * should return a redirect path based on deployed mode
 *
 * @param {string} toV3Path v3 path to redirect.
 * @returns {string} should return a redirect path based on deployed mode.
 */
export const getV3RedirectPath = (toV3Path: string): string => {
  /*
   * multiple condition can be given here to redirect specific url
   */
  return toV3Path;
};
export const routePushTagQuery = (
  name: string,
  tag: string,
  queryObj: object
) => {
  router.push({ name, params: { tag }, query: { ...queryObj } });
};
export const routePushQuery = (name: string, queryObj: object) => {
  router.push({ name, query: { ...queryObj } });
};
export const routePushTag = (name: string, tag: string) => {
  router.push({ name: name, params: { tag: tag } });
};
export const routePushMultipleTag = (name: string, paramObj: object) => {
  router.push({ name: name, params: { ...paramObj } });
};
export const routePush = (name: string) => {
  router.push({ name: name });
};
export const routerPushHash = (path: string) => {
  router.push(path);
};
export const goBack = () => {
  router.go(-1);
};

export const getObjKey = (obj, value) => {
  return Object.keys(obj).find((key) => obj[key] === value);
};

/**
 * Scroll to the top or bottom of a page
 * @param direction : Can be -1 or 1 ( 1 for scrolling to bottom and -1 for scrolling to top) ;
 */
export const scrollToHeight = (direction: number) => {
  window.scrollTo(0, direction * document.body.scrollHeight);
};

export const phoneNumberMinLength = {
  880: 10,
  47: 8,
  46: 7,
  45: 8,
};

export const phoneNumberMaxLength = {
  880: 10,
  47: 8,
  46: 13,
  45: 8,
};

/*************** Time utils ************* */
export const setLeadingZero = (value: number) => {
  return value < 10 ? `0${value}` : value;
};

export const removeZforISOString = (dateTime: string) => {
  return dateTime && dateTime.toString().endsWith("Z")
    ? dateTime.replace("Z", "")
    : dateTime;
};
/**
 *
 * @param {string} dateTimeString date time string
 * @returns {string}
 */
export const getFormattedTime = (dateTime: string): string => {
  if (dateTime) {
    const dateTimeString = removeZforISOString(dateTime);
    const dateObj: Date = new Date(dateTimeString);
    const hours = setLeadingZero(dateObj.getHours());
    const minutes = setLeadingZero(dateObj.getMinutes());
    return `${hours}:${minutes}`;
  }
  return "";
};

/*************** String utils ************* */

/**
 * Replace everything before the given index after splitting a string.
 * @param str         - Original string
 * @param splittedBy  - Character to split the string.
 * @param index       - Index of the split character to replace everything before it.
 * @param replaceBy   - Character or string that will replace.
 * @returns           - String
 */
export const replaceBeforeGivenIndex = (
  str: string,
  splittedBy: string,
  index: number,
  replaceBy: string
) => {
  const re = new RegExp(`^([^${splittedBy}]+\\${splittedBy}){${index}}`, "g");
  return str?.replace(re, replaceBy);
};

/**
 * Split a string and return first element of splitted array
 * @param str         - Original string
 * @param splittedBy  - Character to split the string.
 * @returns           - First element.
 */
export const splitAndGetFirstElement = (str: string, splittedBy: string) => {
  return str?.split(splittedBy)[0];
};

/**
 * will convert date to ISO string more validation will do later on next sprint
 *
 * @param {string} date -the field would like to convert into ISO STRING
 *
 * @returns {string}  -- ISO STRING
 */
export const isoFormatDateTime = (
  dateString: string,
  isOffSetNeeded = true
) => {
  if (dateString) {
    const date = dateString;
    if (dateString.charAt(dateString.length - 1) == "Z") {
      return date;
    }
    const converted = new Date(date);
    const dateConverted = `${converted.getFullYear()}-${setLeadingZero(
      converted.getMonth() + 1
    )}-${setLeadingZero(converted.getDate())}T${setLeadingZero(
      converted.getHours()
    )}:${setLeadingZero(converted.getMinutes())}:${setLeadingZero(
      converted.getSeconds()
    )}Z`;
    return !isOffSetNeeded ? removeZforISOString(dateConverted) : dateConverted;
  }
  return "";
};

/**
 * Check if a number is in defined range.
 * @param {number} min - minimum value
 * @param {number} max - maximum value
 * @param {number} value - Value to check
 * @returns
 */
export const isInRange = (min: number, max: number, value: number) => {
  return min <= value && value <= max;
};
/**
 * function for looping through number
 *
 * @param {number} times -how many times loop will execute
 * @param callback
 */
export const loopThroughNumber = (times: number, callback) => {
  for (let i = 0; i < times; i++) {
    callback(i);
  }
};
/**
 * making string to escape string
 *
 * @param {string} str ---- the string needs to be modified
 * @returns {string}
 */
export const addSlashes = (str: string): string => {
  // eslint-disable-next-line no-control-regex
  return (str + "").replace(/[\\"']/g, "$&").replace(/\u0000/g, "\0");
};

/**
 * Checks if a given url is valid or not.
 *
 * @param {string} url - URL to validate.
 * @returns {boolean}
 */
export const isValidURL = (url) => {
  if (!url) return true;

  const pattern =
    /^((http|https):\/\/)(www.|[a-zA-Z]{2,256}.)?[a-zA-Z0-9\-_$]+\.[a-zA-Z]{2,5}/;

  return url.match(pattern);
};
const defaultOptions: DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
};
/**
 *
 * @param {string} dateTime -date time string format
 * @param {string} currentLocale - current chosen language
 * @param options - date format option
 * @returns {string} -formated date time in readable format
 */
export const getReadableDateFormat = (
  dateString: string,
  currentLocale = "en-US",
  options = defaultOptions,
  dateFormat = ""
) => {
  if (dateString) {
    const isoFormat = isoFormatDateTime(dateString);
    const dateTime = isoFormat.replace("Z", "");
    if (dateFormat) {
      return format(new Date(dateTime), dateFormat);
    }
    return new Date(dateTime).toLocaleDateString(currentLocale, options);
  }
  return "";
};

export const subtractDaysFromDate = (
  dateString: string,
  subDays: number,
  isoFormat = false,
  currentLocale = "en-US",
  options = defaultOptions
) => {
  if (!dateString) {
    return "";
  }
  const date = new Date(removeZforISOString(dateString));
  const newDate = new Date(date.setDate(date.getDate() - subDays)).toString();
  if (isoFormat) {
    return isoFormatDateTime(newDate);
  }
  return getReadableDateFormat(newDate, currentLocale, options);
};

/**
 *
 * @param {string} dateString -date time string format
 */
export const formatDateUsingDateFns = (
  dateString: string,
  formatType = "dd.MM.yyyy"
) => {
  if (dateString) {
    const date = removeZforISOString(dateString);

    return format(new Date(date), formatType);
  }
  return "";
};
/**
 *pagination function may be will be use later on
 *
 * @param data -- the data ned to paginate
 * @param page_size -- the page size
 * @param page_number -- the page number
 * @returns
 */
export const paginate = (data: [], page_size: number, page_number: number) => {
  //page numbers usually start with 1, so we reduce 1 in the first argument
  return data.slice((page_number - 1) * page_size, page_number * page_size);
};

export const generatePhotoUrlBasedOnEnv = (imagePath: string) => {
  if (import.meta.env.VITE_APP_DOMAIN_URL?.includes("localhost")) {
    return `https://dev.sharebus.co${imagePath}`;
  }
  const domainUrl = import.meta.env.VITE_APP_DOMAIN_URL as string;
  /** if last character in domainUrl is / then remove it. */
  if (domainUrl.lastIndexOf("/") === domainUrl.length - 1) {
    return `${domainUrl.replace(/.$/, "")}${imagePath}`;
  }
  return `${domainUrl}${imagePath}`;
};

/**
 * getting last x digit of a string
 *
 * @param {string} value -value is the string of number which we want to manipulate
 * @param {number} x -x is the length that what we want to show
 */
export const getLastXDigit = (value, x = 2) => {
  return String(value).slice(-x);
};

export const getRedirectLink = (role: string): string => {
  const userStore = useUserStore();

  const redirectionLink = {
    [ROLE.SHARELEAD]: "/my-buses",
    [ROLE.JOINER]: "/my-trips",
    [ROLE.FERDIA_SALES]: "/sales-console-buses",
    [ROLE.PARTNER_SHARELEAD]: "/sales-console-buses",
  };
  return role
    ? redirectionLink[role]
    : !role && userStore.roles.length > 0
    ? "/user/select-role"
    : redirectionLink[ROLE.JOINER];
};

export const getRedirectLinkForLandingRole = (role: string): string => {
  const redirectionLink = {
    [ROLE.SHARELEAD]: "/setup-sharebus",
    [ROLE.JOINER]: "/",
  };
  return role ? redirectionLink[role] : "/user/select-role";
};

/** checks if it's a mobile device or not */
export const isMobile = () =>
  Math.min(window.screen.width, window.screen.height) < 768 ||
  navigator.userAgent.indexOf("Mobi") > -1;

/**
 * This function helps us to create the ripple effect on any html element if we do a mouse event
 *
 * @param { MouseEvent } e - The mouse event
 */
export const createRippleEffect = (e: MouseEvent) => {
  // if (isMobile()) {
  const el = e.currentTarget as HTMLElement;
  const x = e.pageX - el.offsetLeft;
  const y = e.pageY - el.offsetTop;

  const duration = 1000;
  let animationFrame, animationStart;

  const animationStep = function (timestamp) {
    if (!animationStart) {
      animationStart = timestamp;
    }

    const frame = timestamp - animationStart;
    if (frame < duration) {
      const easing = (frame / duration) * (2 - frame / duration);

      const circle = "circle at " + x + "px " + y + "px";
      const color = "rgba(0, 0, 0, " + 0.3 * (1 - easing) + ")";
      const stop = 90 * easing + "%";

      el.style.backgroundImage =
        "radial-gradient(" +
        circle +
        ", " +
        color +
        " " +
        stop +
        ", transparent " +
        stop +
        ")";

      animationFrame = window.requestAnimationFrame(animationStep);
    } else {
      (el.style.backgroundImage = "none"),
        window.cancelAnimationFrame(animationFrame);
    }
  };

  animationFrame = window.requestAnimationFrame(animationStep);
  // }
};

export const firstLastInitials = (name) => {
  const rgx = new RegExp(/(\p{L}{1})\p{L}+/, "gu");

  let initials = [...name.matchAll(rgx)] || [];

  initials = (
    (initials.shift()?.[1] || "") + (initials.pop()?.[1] || "")
  ).toUpperCase();
  return initials;
};

export const capitalizeFirstLetterWithRegex = (word) => {
  return word.replace(/^\w/, (match) => match.toUpperCase());
};

export const placeShortName = (placeName: string) => {
  const shortName = placeName.replaceAll(",", "").split(" ");

  if (shortName.length > 1) {
    return shortName[0] + " " + shortName[1][0].toUpperCase();
  } else return shortName[0];
};

export const redirect = () => {
  window.open(CTA.CONTACT, "_blank", "noreferrer");
};

export const categoryIcon = {
  music: "music",
  other: "other",
  sport: "sports",
  vacation: "vacation",
  wellness: "wellness",
};

export const roleIcon = {
  [ROLE.JOINER]: "joiner",
  [ROLE.SHARELEAD]: "sharelead",
  [ROLE.PARTNER_SHARELEAD]: "sales",
  [ROLE.FERDIA_SALES]: "sales",
};

export const roleLabel = {
  [ROLE.JOINER]: "Joiner",
  [ROLE.SHARELEAD]: "Sharelead",
  [ROLE.PARTNER_SHARELEAD]: "Sharelead",
  [ROLE.FERDIA_SALES]: "Sales",
};

/**
 * This functions creates object url for an image so that it can be viewable locally in an image tag.
 *
 * @param {File} file - Image file to create url
 * @return {String} - Returns an object url.
 */
export const getLocalImageUrl = (file) => {
  if (!file) return "";
  if (typeof file == "string" && (file as string).includes("asset"))
    return generatePhotoUrlBasedOnEnv(file as string);

  return file ? URL.createObjectURL(file as File) : "";
};

export const isEmptyObject = (object) => {
  return Object.keys(object).length === 0;
};

export const serverTime = (timezone = "Europe/Oslo") => {
  const date = new Date();
  // ✅ Get a string according to a provided Time zone
  const dateTime = date.toLocaleString("en-US", {
    timeZone: timezone,
  });
  return isoFormatDateTime(dateTime, false);
};

/**
 * Limits a float to two decimal points.
 * @param {Number} number The float/number to limit.
 * @returns {Number} Returns the float/number limited to two decimal points.
 */
export const limitDecimals = (number: number) => {
  const stringRep = number.toString();
  const splitUp = stringRep.split(".");
  if (splitUp[1] && splitUp[1].length > 2) {
    return Number(number.toFixed(2));
  } else {
    return number;
  }
};
/**
 * This function replaces the query on the current route with a new query supplied by the argument.
 *
 * @param {object} query the query that need to set
 */
export const setRouteQuery = (query: object) => {
  router.replace({
    ...router.currentRoute,
    query: {
      ...router.currentRoute.value.query,
      ...query,
    },
  });
};

/**
 * Recursive function to rename keys in nested object or array
 *
 * @param obj     - Object to update
 * @param oldKey  - old key
 * @param newKey  - new key
 * @returns       - Updated object
 */
export const renameNestedKeys = (obj, oldKey: string, newKey: string) => {
  if (!obj || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Array) {
    return obj.map((item) => renameNestedKeys(item, oldKey, newKey));
  }

  const newObj = {};

  for (const key in obj) {
    let val = obj[key];

    if (typeof val === "object") {
      val = renameNestedKeys(val, oldKey, newKey);
    }

    if (key === oldKey) {
      newObj[newKey] = val;
    } else {
      newObj[key] = val;
    }
  }

  return newObj;
};

/**
 * Calculate distance betweeen two elements in JS.
 * @param div1
 * @param div2
 * @returns
 */
export const calculateDivDistance = (div1, div2) => {
  const rect1 = div1.getBoundingClientRect(); // Get the position of the first div
  const rect2 = div2.getBoundingClientRect(); // Get the position of the second div

  const x1 = rect1.left + rect1.width / 2; // X-coordinate of the center of the first div
  const y1 = rect1.top + rect1.height / 2; // Y-coordinate of the center of the first div

  const x2 = rect2.left + rect2.width / 2; // X-coordinate of the center of the second div
  const y2 = rect2.top + rect2.height / 2; // Y-coordinate of the center of the second div

  const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2); // Calculate the Euclidean distance

  return distance;
};

/**
 * Checks if trip country and url country is different. If yes then redirect to respected url.
 *
 * @param {string} routeName
 * @param {string} country
 */
export const checkTripCountry = (routeName: string, country: string) => {
  const userRole = localStorage.getItem("userRole");
  const countryRedirectRouteDict = {
    [ROUTE.SHARELEAD_TRIP_PAGE]: ROUTE.SHARELEAD_BUSSES,
    [ROUTE.JOINER_TRIP_PAGE]: ROUTE.JOINER_TRIPS,
    [ROUTE.SALES_TRIP_PAGE]: ROUTE.SALES_TRIPS,
    [ROUTE.PAYMENT]:
      userRole === ROLE.SHARELEAD
        ? ROUTE.SHARELEAD_BUSSES
        : userRole === ROLE.JOINER
        ? ROUTE.JOINER_TRIPS
        : ROUTE.HOME,
  };

  const tripStore = useTripStore();
  const currentTrip = tripStore.getCurrentTrip;
  if (currentTrip.country !== country) {
    routePushQuery(countryRedirectRouteDict[routeName], { country });
  }
};

/**
 * Clear all data for current page and redirect to required url.
 * @param string routeName
 */
export const clearDataAndRedirect = (
  routeName: RouteRecordName | null | undefined,
  country = ""
) => {
  const sharebusStore = useSharebusStore();

  switch (routeName) {
    case ROUTE.SETUP_SHAREBUS:
    case ROUTE.PUBLISH_SHAREBUS:
    case ROUTE.SHAREBUS_CREATE_CONFIRMATION:
      sharebusStore.$reset();
      routePushQuery(ROUTE.SHARELEAD_BUSSES, { country });
      break;

    case ROUTE.JOINER_BOOK_TICKET:
      routePushQuery(ROUTE.HOME, { country });
      break;
    case ROUTE.SHARELEAD_TRIP_PAGE:
    case ROUTE.JOINER_TRIP_PAGE:
    case ROUTE.SALES_TRIP_PAGE:
    case ROUTE.PAYMENT:
      checkTripCountry(routeName, country);
      break;
  }
};

export const isValidEmail = (mail: string) => {
  if (/^\w+([\\.-]?\w+)*@\w+([\\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
    return true;
  }

  return false;
};
/** Checking if user has permission to the last saved role */
export const checkRolePermissions = (availableRoles: string[]) => {
  const currentRole = localStorage.getItem("userRole");
  if (
    currentRole &&
    currentRole !== ROLE.JOINER &&
    !availableRoles.includes(currentRole)
  ) {
    localStorage.removeItem("userRole");
  }
};

export const countryDialCodeMap = {
  SE: 46,
  NO: 47,
};

// eslint-disable-next-line no-useless-escape
export const regexPasswordValidation =
  /(.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?].*)/;

export const countryAccepted = [
  "BD", // Bangladesh
  "NO", // Norway
  "SE", // Sweden
  "DK", // Denmark
  "AT", // Austria
  "BE", // Belgium
  "BG", // Bulgaria
  "HR", // Croatia
  "CY", // Cyprus
  "CZ", // Czech Republic
  "EE", // Estonia
  "FI", // Finland
  "FR", // France
  "DE", // Germany
  "GR", // Greece
  "HU", // Hungary
  "IE", // Ireland
  "IT", // Italy
  "LV", // Latvia
  "LT", // Lithuania
  "LU", // Luxembourg
  "MT", // Malta
  "NL", // Netherlands
  "PL", // Poland
  "PT", // Portugal
  "RO", // Romania
  "SK", // Slovakia
  "SI", // Slovenia
  "ES", // Spain
  "AL", // Albania
  "AD", // Andorra
  "AM", // Armenia
  "BY", // Belarus
  "BA", // Bosnia and Herzegovina
  "FO", // Faroe Islands
  "GE", // Georgia
  "GI", // Gibraltar
  "IS", // Iceland
  "IM", // Isle of Man
  "XK", // Kosovo
  "LI", // Liechtenstein
  "MK", // Macedonia
  "MD", // Moldova
  "MC", // Monaco
  "ME", // Montenegro
  "RU", // Russia
  "SM", // San Marino
  "RS", // Serbia
  "CH", // Switzerland
  "TR", // Turkey
  "UA", // Ukraine
  "GB", // United Kingdom
  "VA", // Vatican City
];
