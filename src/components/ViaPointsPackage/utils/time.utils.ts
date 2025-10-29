/**
 * Removed GMT and beyond for make sure its not manipulating timezone while new Date
 * @param {string} dateString -string which need to be removed
 * @returns {string} formatted str
 */
export const removeGMTAndBeyond = (dateString) => {
  return dateString ? dateString.replace(/GMT.*/, "").trim() : "";
};

export const isoFormatDateTime = (date: Date | string) => {
  let converted;
  if (typeof date === "string") {
    converted = new Date(removeGMTAndBeyond(date));
  } else {
    converted = new Date(date);
  }
  return `${converted.getFullYear()}-${setLeadingZero(
    converted.getMonth() + 1
  )}-${setLeadingZero(converted.getDate())}T${setLeadingZero(
    converted.getHours()
  )}:${setLeadingZero(converted.getMinutes())}:${setLeadingZero(
    converted.getSeconds()
  )}Z`;
};

export const setLeadingZero = (value: number) => {
  return value < 10 ? `0${value}` : value;
};

/**
 * Removed Z from string make sure its not manipulating timezone while new Date
 * @param {string} dateTime -string which need to be removed
 * @returns {string} formatted str
 */
export const removeZforISOString = (dateTime: string): string => {
  return dateTime && dateTime.toString().endsWith("Z")
    ? dateTime.replace("Z", "")
    : dateTime;
};

export const removeTZforISOString = (dateTime: string): string => {
  const modified = removeZforISOString(dateTime);
  return modified?.toString().includes("T")
    ? modified.replace("T", " ")
    : modified;
};

/**
 * Removed T from string make sure its not manipulating timezone while new Date
 * @param {TViaPoints[]} route_points -string which need to be removed
 * @returns {TViaPoints[]} formatted str
 */
export const formatVPPayload = (route_points) => {
  if (!route_points.length) return [];

  return route_points.map((vp, index) => {
    return {
      ...vp,
      point_latitude: vp.point_latitude.toString(),
      point_longitude: vp.point_longitude.toString(),
      // planned_departure_time: removeTZforISOString(
      //   isoFormatDateTime(vp.planned_departure_time)
      // ),
      planned_departure_time: vp.planned_departure_time,

      // actual_departure_time: removeTZforISOString(
      //   isoFormatDateTime(vp.actual_departure_time)
      // ),
      actual_departure_time: vp.actual_departure_time,

      planned_arrival_time: index > 0 ? vp.planned_arrival_time : null,
    };
  });
};

export const minToTime = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);

  return `${hours} hours ${minutes} minutes`;
};
