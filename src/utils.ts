import router from "@/router";
import { DateTimeFormatOptions } from "@intlify/core-base";
import { utcToZonedTime } from "date-fns-tz";
import {
  AllowedFormats,
  convertDateIntoCompanyTimezone,
} from "@/utils/companyTimeFormat";
import { CTA, ROLE } from "./components/common/enums/enums";
import { ROUTE } from "./router/enum/routeEnums";
import { useSharebusStore, useTripStore, useUserStore } from "./store";
import { RouteRecordName } from "vue-router";
import { nanoid } from "nanoid";

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
export const splitAndGetFirstElement = (str: string, splittedBy = ",") => {
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
export const isValidURL = (url: string): boolean => {
  if (!url) return true;

  const pattern =
    /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

  return pattern.test(url);
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
 * @param dateFormat - specific date format string
 * @returns {string} -formated date time in readable format using company timezone
 */
export const getReadableDateFormat = (
  dateString: string,
  currentLocale = "en-US",
  options = defaultOptions,
  dateFormat: AllowedFormats = "dd.MM.yyyy"
) => {
  if (dateString) {
    // Default to Europe/Oslo timezone if no specific company timezone is available
    const companyTimezone = "Europe/Oslo";

    if (dateFormat) {
      // Use company timezone formatting with the specified format
      return convertDateIntoCompanyTimezone(
        dateString,
        dateFormat,
        companyTimezone
      );
    }

    // For locale-based formatting, first convert to company timezone then format
    const utcDate = new Date(dateString);
    const companyDate = utcToZonedTime(utcDate, companyTimezone);
    return companyDate.toLocaleDateString(currentLocale, options);
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
 * @param {number} number The float/number to limit.
 * @returns {number} Returns the float/number limited to two decimal points.
 */
export const limitDecimals = (number: number): number => {
  if (!number) return 0;

  return Number.isInteger(number) ? number : Number(number.toFixed(2));
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

export const redirectToContact = (tripId: string, bookingReference: string) => {
  routePushTagQuery(CTA.CONTACT, tripId as string, {
    bookingReference,
  });
};

/**
 * Generates a unique key by combining a timestamp and a random substring.
 *
 * @returns {string} A unique key.
 * @example
 * const uniqueKey = generateUniqueKey();
 * console.log(uniqueKey);
 */
export const generateUniqueKey = () => {
  /**
   * @type {string} timestamp - Current timestamp converted to base36.
   */
  const timestamp = new Date().getTime().toString(36);

  /**
   * @type {string} randomPart - Random alphanumeric substring.
   */
  const randomPart = Math.random().toString(36).substring(2, 7);

  /**
   * @type {string} uniqueKey - The unique key formed by concatenating the timestamp and randomPart.
   */
  const uniqueKey = `${timestamp}${randomPart}`;

  return uniqueKey;
};
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

/**
 * Creates a deep clone of an object or array without using structuredClone
 * @param obj The object to clone
 * @returns A deep copy of the input object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof RegExp) {
    return new RegExp(obj) as unknown as T;
  }

  if (obj instanceof Map) {
    return new Map(
      Array.from(obj.entries()).map(([key, value]) => [key, deepClone(value)])
    ) as unknown as T;
  }

  if (obj instanceof Set) {
    return new Set(
      Array.from(obj).map((value) => deepClone(value))
    ) as unknown as T;
  }

  const clonedObj = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }
  return clonedObj;
}

export const getUniqueIntId = (length = 6): number => {
  //  using nanoid npm package to generate a unique ID
  const uniqueId = nanoid(length);
  const parsed = parseInt(uniqueId, 36);
  // Ensure we always return a positive integer
  return Math.abs(parsed) || Math.abs(parseInt(nanoid(length), 36));
};

/**
 * Performs a deep equality check between two objects using JSON.stringify.
 * Note: Only works for plain objects and arrays, not for objects with functions, Dates, Maps, Sets, etc.
 *
 * @param obj1 - First object to compare
 * @param obj2 - Second object to compare
 * @returns {boolean} - True if deeply equal, false otherwise
 */
export function deepEqual(
  obj1: Record<string, unknown>,
  obj2: Record<string, unknown>
): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}
export const deleteTypeNameKeyRecursively = (obj: any) => {
  if (Array.isArray(obj)) {
    return obj.map(deleteTypeNameKeyRecursively);
  } else if (typeof obj === "object" && obj !== null) {
    const newObj: Record<string, any> = {};
    for (const k in obj) {
      if (k !== "__typename") {
        newObj[k] = deleteTypeNameKeyRecursively(obj[k]);
      }
    }
    return newObj;
  }
  return obj;
};

/**
 * Converts a given date (Date object, string, or null) to an ISO string format.
 * If the input is invalid or cannot be parsed as a date, returns an empty string.
 * The returned ISO string **OMITS MILLISECONDS**.
 *
 * @param date - The date to convert, which can be a Date object, a string, or null.
 * @returns The ISO string representation of the date without milliseconds, or an empty string if invalid.
 */
export const convertDateToISOString = (
  date: Date | string | null
): string | null => {
  if (!date) {
    console.log("Invalid date");
    return null;
  }
  const dateObj = new Date(date);
  if (dateObj.getTime()) {
    return dateObj.toISOString().replace(/\.\d{3}Z$/, "Z");
  }
  console.log("Invalid date");
  return null;
};

/**
 * Formats route points with sequence numbers and ISO datetime conversion
 *
 * @param routePoints - The route points object with oneway and return arrays
 * @returns Formatted route points with sequence and converted datetime fields
 */
export const formatRoutePointsForAPI = (routePoints: {
  oneway: Array<any>;
  return: Array<any>;
}) => {
  const formatRoutePointArray = (points: Array<any>) => {
    return points.map((item, index) => ({
      ...item,
      sequence: index,
      planned_departure_time: item.planned_departure_time
        ? convertDateToISOString(item.planned_departure_time) || ""
        : "",
      actual_departure_time: item.actual_departure_time
        ? convertDateToISOString(item.actual_departure_time) || ""
        : "",
      planned_arrival_time: item.planned_arrival_time
        ? convertDateToISOString(item.planned_arrival_time) || ""
        : "",
    }));
  };

  const formattedRoutePoints = {
    oneway: formatRoutePointArray(routePoints.oneway),
    return: formatRoutePointArray(routePoints.return),
  };
  return formattedRoutePoints;
};

export function random5Digit() {
  return Math.floor(10000 + Math.random() * 90000);
}
