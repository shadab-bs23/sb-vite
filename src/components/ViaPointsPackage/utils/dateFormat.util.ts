import { DateTimeFormatOptions } from "@intlify/core-base";

const time_options: DateTimeFormatOptions = {
  day: "numeric",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  weekday: "long",
};

const padTo2Digits = (num: number): string => {
  return num.toString().padStart(2, "0");
};

export const formatDate = (date: Date, join = "-"): string => {
  return [
    date.getFullYear(),
    padTo2Digits(date.getMonth() + 1),
    padTo2Digits(date.getDate()),
  ].join(join);
};

export const convertUTCtoLocale = (
  dateTime: string,
  locale = "no-No"
): string => {
  if (!dateTime) return "";
  // UTC time string
  // const utcTimeString = "2023-08-09T12:00:00Z"; // Replace this with your UTC time string
  const utcTimeString = dateTime + "Z";
  // Create a Date object from the UTC time string
  const utcDate = new Date(utcTimeString);

  // should have worked with node v-18 according to mdn
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getTimeZones

  // console.log("-------- 38------", localTimeZone.timeZones[0]);

  const options = {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: Unreachable code error
    timeZone: useUserStore().$state.selectedCompanyInfo.timezone,
  };

  // Create a DateTimeFormat object with the local time zone
  const localFormatter = new Intl.DateTimeFormat(locale, {
    ...time_options,
    ...options,
  });

  const localFormatter2 = new Intl.DateTimeFormat("no-No", {
    ...time_options,
    ...options,
  });

  // Format the UTC Date object in the local time zone
  const localTimeString = localFormatter.format(utcDate).split(/[ ,]+/);

  const localTimeString2 = localFormatter2.format(utcDate).split(" ");

  return `${localTimeString[0]}, ${localTimeString2[1]} ${localTimeString[2]}`;
};
