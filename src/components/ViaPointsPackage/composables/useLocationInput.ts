import ViaPointController from "../controllers/ViaPointController";
import { setVPDirection } from "../services/googleMap/map.service";
import { TViaPoints } from "../types/types";
import { showToast } from "@/services/toast/toast.service";
import { TRIP_TYPE } from "../enums/enums";
import { ref } from "vue";

const directionsService = new google.maps.DirectionsService();

const loading = ref(false);
const setLoading = (value) => (loading.value = value);
export const getLoading = () => loading.value;

/**
 * calculates the distance and time for origin and destination along with via points on one way trip.
 * - Full point time calculation initialize here.
 * - This function is called when the user put first date and time on the first point.
 * This function is similar to {@link calculateDistanceAndTimeForReturnMapAPI},
 * but the difference is that it is a wrapper for a one way trip.
 * @param {Function} callback - The callback function to be called after the calculation is complete.
 */
export const calculateDistanceAndTimeForOneWayMapAPI = (
  legPercent,
  pauseTime,
  callback
) => {
  setTimeout(() => {
    const locationsPoints = ViaPointController.getTravelPointListOneWay();
    calculateDistanceAndTimeWithMapAPI(
      locationsPoints,
      legPercent,
      pauseTime,
      (result, error) => {
        if (error) {
          if (error.show) showToast("error", error.message);
        } else if (callback) {
          totalDistanceCalculation(TRIP_TYPE.ONEWAY, result.mapResponse);
          setVPDirection(result.mapResponse);
          callback(result.points);
        }
      }
    );
  }, 1000);
};

/**
 * Calculates the distance and time for a one-way trip using the Map API.
 * - when adding location of a via point on one way trip.
 * - estimated arrival and departure time automatic fill up here for same row
 * This function is similar to {@link vpCalculateDistanceAndTimeForReturnMapAPI},
 * but the difference is that it is a wrapper for a one way trip.
 * @param index - The index of the trip.
 * @param callback - The callback function to be called with the calculated points.
 */
export const vpCalculateDistanceAndTimeForOneWayMapAPI = (
  index,
  legPercent,
  pauseTime,
  callback
) => {
  setTimeout(() => {
    const locationsPoints = ViaPointController.getTravelPointListOneWay();
    vpCalculateDistanceAndTimeWithMapAPI(
      index,
      locationsPoints,
      legPercent,
      pauseTime,
      (result, error) => {
        if (error) {
          if (error.show) showToast("error", error.message);
        } else if (callback) {
          totalDistanceCalculation(TRIP_TYPE.ONEWAY, result.mapResponse);
          setVPDirection(result.mapResponse);
          callback(result.points);
        }
      }
    );
  }, 1000);
};

/**
 * Calculates the distance and time for a single one-way trip using the Map API.
 * - when updating departure time of a via point calculating next arrival time for next location
 * This function is similar to {@link singleVpCalculateDistanceAndTimeForReturnMapAPI},
 * but the difference is that it is a wrapper for a oneway trip.
 * @param index - The index of the trip.
 * @param callback - The callback function to be called after the calculation is done.
 */
export const singleVpCalculateDistanceAndTimeForOneWayMapAPI = (
  index,
  legPercent,
  callback
) => {
  setTimeout(() => {
    const locationsPoints = ViaPointController.getTravelPointListOneWay();
    singleVpCalculateDistanceAndTimeWithMapAPI(
      index,
      locationsPoints,
      legPercent,
      (result, error) => {
        if (error) {
          if (error.show) showToast("error", error.message);
        } else if (callback) {
          if (result.mapResponse) {
            totalDistanceCalculation(TRIP_TYPE.ONEWAY, result.mapResponse);
            setVPDirection(result.mapResponse);
          }
          callback(result.points, index);
        }
      }
    );
  }, 1000);
};

/**
 * Calculates the distance and time for a single return trip using the Map API.
 * - when updating departure time of a via point calculating next arrival time
 * This function is similar to {@link singleVpCalculateDistanceAndTimeForOneWayMapAPI},
 * but the difference is that it is a wrapper for a return trip.
 * @param index - The index of the trip.
 * @param callback - The callback function to be called after the calculation is done.
 */
export const singleVpCalculateDistanceAndTimeForReturnMapAPI = (
  index,
  legPercent,
  callback
) => {
  setTimeout(() => {
    const locationsPoints = ViaPointController.getTravelPointListRound();
    singleVpCalculateDistanceAndTimeWithMapAPI(
      index,
      locationsPoints,
      legPercent,
      (result, error) => {
        if (error) {
          if (error.show) showToast("error", error.message);
        } else if (callback) {
          if (result.mapResponse) {
            totalDistanceCalculation("returnTrip", result.mapResponse);
            setVPDirection(result.mapResponse, TRIP_TYPE.RETURN);
          }
          callback(result.points, index);
        }
      }
    );
  }, 1000);
};

/**
 * calculates the distance and time for origin and destination along with via points on return trip.
 * - Full point time calculation initialize here.
 * - This function is called when the user put first date and time on the first point.
 * This function is similar to {@link calculateDistanceAndTimeForOneWayMapAPI},
 * but the difference is that it is a wrapper for a return trip.
 * @param {Function} callback - The callback function to be called after the calculation is complete.
 */
export const calculateDistanceAndTimeForReturnMapAPI = (
  legPercent,
  pauseTime,
  callback
) => {
  setTimeout(() => {
    const locationsPoints = ViaPointController.getTravelPointListRound();
    calculateDistanceAndTimeWithMapAPI(
      locationsPoints,
      legPercent,
      pauseTime,
      (result) => {
        if (callback) {
          totalDistanceCalculation("returnTrip", result.mapResponse);
          setVPDirection(result.mapResponse, TRIP_TYPE.RETURN);
          callback(result.points);
        }
      }
    );
  }, 1000);
};

/**
 * Calculates the distance and time for a return trip using the Map API.
 * - when adding location of a via point on one way trip.
 * - estimated arrival and departure time automatic fill up here
 * This function is similar to {@link vpCalculateDistanceAndTimeForOneWayMapAPI},
 * but the difference is that it is a wrapper for a return trip.
 * @param index - The index of the trip.
 * @param callback - The callback function to be called with the calculated points.
 */
export const vpCalculateDistanceAndTimeForReturnMapAPI = (
  index,
  legPercent,
  pauseTime,
  callback
) => {
  setTimeout(() => {
    const locationsPoints = ViaPointController.getTravelPointListRound();
    vpCalculateDistanceAndTimeWithMapAPI(
      index,
      locationsPoints,
      legPercent,
      pauseTime,
      (result) => {
        if (callback) {
          totalDistanceCalculation("returnTrip", result.mapResponse);
          setVPDirection(result.mapResponse, TRIP_TYPE.RETURN);
          callback(result.points);
        }
      }
    );
  }, 1000);
};

/**
 * Calculates the distance and time between multiple locations using a map API.
 * - recalculate all point time calculation here according to first departure time
 * -   call from {@link calculateDistanceAndTimeForOneWayMapAPI}
 * -   call from {@link calculateDistanceAndTimeForReturnMapAPI}
 * @param locationsPoints - An array of TViaPoints representing the locations and departure times.
 * @param callback - A callback function that handles the result or error.
 * @returns The result of the map API request or an error message.
 */
export const calculateDistanceAndTimeWithMapAPI = (
  locationsPoints: TViaPoints[],
  legPercent: number,
  pauseTime: number,
  callback
) => {
  const lastIndex = locationsPoints.length - 1;
  const onlyLocation = locationsPoints.map((e) => e.point).filter((i) => i);
  const goNext = locationsPoints.length === onlyLocation.length;
  if (
    locationsPoints.length >= 2 &&
    goNext &&
    locationsPoints[0].planned_departure_time
  ) {
    // Create the object
    const routeObject = {
      origin: locationsPoints[0].point, // The first point is the origin
      destination: locationsPoints[lastIndex].point, // The last point is the destination
      waypoints: locationsPoints.slice(1, lastIndex).map((location) => ({
        location: location.point,
      })), // All points between the origin and destination are waypoints
      travelMode: "DRIVING" as google.maps.TravelMode, // You can change the travel mode
      provideRouteAlternatives: false, // Set to true if you want multiple route options
    };
    setLoading(true);
    return directionsService.route(routeObject, function (result, status) {
      setLoading(false);
      if (status === "OK") {
        const legs = result.routes[0].legs;
        const tempPoints = [...locationsPoints];
        let tempLastCalculatedPoint = {} as TViaPoints;
        const newTempPoint = tempPoints.map((item, index) => {
          if (index > 0) {
            const pauseTimeValue = pauseTime * 60000,
              legDuration = legs[index - 1].duration.value * 1000,
              legDurationWithLegPercent =
                legDuration + (legDuration * legPercent) / 100,
              previousDepartureValue = (
                tempLastCalculatedPoint.planned_departure_time as Date
              ).valueOf();
            let departureDateTime;
            if (index < lastIndex) {
              departureDateTime = new Date(
                previousDepartureValue +
                  legDurationWithLegPercent +
                  pauseTimeValue
              );
            } else {
              departureDateTime = new Date(
                previousDepartureValue + legDurationWithLegPercent
              );
            }
            tempLastCalculatedPoint = {
              ...item,
              planned_arrival_time: new Date(
                previousDepartureValue + legDurationWithLegPercent
              ),
              planned_departure_time: departureDateTime,
              actual_departure_time: departureDateTime,
            };
            return tempLastCalculatedPoint;
          }
          tempLastCalculatedPoint = { ...item };
          return tempLastCalculatedPoint;
        });
        callback({ points: newTempPoint, mapResponse: result }, null);
      } else {
        callback(null, {
          show: true,
          message:
            "Distance and direction information could not be retrieved from the map API.",
        });
      }
    });
  } else {
    callback(null, {
      show: false,
      message: "Not calling api",
    });
  }
};

/**
 * Calculates the distance and time using the Map API for a given set of locations.
 * - via point adding arrival time and departure time calculate here based on previous departure time
 * -   call from {@link vpCalculateDistanceAndTimeForOneWayMapAPI}
 * -   call from {@link vpCalculateDistanceAndTimeForReturnMapAPI}
 * @param vpIndex - The index of the current via point.
 * @param locationsPoints - An array of via points with their corresponding locations.
 * @param callback - The callback function to handle the result or error.
 * @returns The result of the calculation or an error message.
 */
export const vpCalculateDistanceAndTimeWithMapAPI = (
  vpIndex: number,
  locationsPoints: TViaPoints[],
  legPercent: number,
  pauseTime: number,
  callback
) => {
  const lastIndex = locationsPoints.length - 1;
  const noPoint = !!locationsPoints.find((e) => e.point.length === 0);

  if (
    locationsPoints.length >= 2 &&
    locationsPoints[0].planned_departure_time &&
    !noPoint
  ) {
    // Create the object
    const routeObject = {
      origin: locationsPoints[0].point, // The first point is the origin
      destination: locationsPoints[lastIndex].point, // The last point is the destination
      waypoints: locationsPoints.slice(1, lastIndex).map((location) => ({
        location: location.point,
      })), // All points between the origin and destination are waypoints
      travelMode: "DRIVING" as google.maps.TravelMode, // You can change the travel mode
      provideRouteAlternatives: false, // Set to true if you want multiple route options
    };
    setLoading(true);
    return directionsService.route(routeObject, function (result, status) {
      setLoading(false);
      if (status === "OK") {
        const legs = result.routes[0].legs;

        let tempPoints = vpIndex > 0 ? locationsPoints.slice(0, vpIndex) : [];
        const tempPoints2 =
          vpIndex > 0
            ? locationsPoints.slice(vpIndex, lastIndex + 1)
            : [...locationsPoints];

        let tempLastCalculatedPoint = {} as TViaPoints;
        const newTempPoint = tempPoints2.map((item, index) => {
          if (index > 0) {
            const pauseTimeValue = pauseTime * 60000,
              duration = legs[vpIndex + index - 1]?.duration,
              legDuration = (duration ? duration.value : 0) * 1000,
              legDurationWithLegPercent =
                legDuration + (legDuration * legPercent) / 100,
              previousDepartureValue = (
                tempLastCalculatedPoint.planned_departure_time as Date
              ).valueOf();
            let departureDateTime;
            if (index < lastIndex) {
              departureDateTime = new Date(
                previousDepartureValue +
                  legDurationWithLegPercent +
                  pauseTimeValue
              );
            } else {
              departureDateTime = new Date(
                previousDepartureValue + legDurationWithLegPercent
              );
            }
            tempLastCalculatedPoint = {
              ...item,
              planned_arrival_time: new Date(
                previousDepartureValue + legDurationWithLegPercent
              ),
              planned_departure_time: departureDateTime,
              actual_departure_time: departureDateTime,
            };
            return tempLastCalculatedPoint;
          }
          tempLastCalculatedPoint = { ...item };
          return tempLastCalculatedPoint;
        });
        if (tempPoints.length) tempPoints = tempPoints.concat(newTempPoint);
        else tempPoints = newTempPoint;

        callback(
          {
            points: tempPoints,
            mapResponse: result,
          },
          null
        );
      } else {
        callback(null, {
          show: true,
          message:
            "Distance and direction information could not be retrieved from the map API.",
        });
      }
    });
  } else {
    setVPDirection(null);
    callback(null, {
      show: false,
      message: "Not calling api",
    });
  }
};

/**
 * Calculates the distance and time between two points using the Map API.
 * - departure time update next arrival time calculate here based on previous departure time
 * -   call from {@link singleVpCalculateDistanceAndTimeForOneWayMapAPI}
 * -   call from {@link singleVpCalculateDistanceAndTimeForReturnMapAPI}
 * @param vpIndex - The index of the current via point.
 * @param locationsPoints - An array of via points.
 * @param callback - The callback function to handle the result or error.
 * @returns
 */
export const singleVpCalculateDistanceAndTimeWithMapAPI = (
  vpIndex: number,
  locationsPoints: TViaPoints[],
  legPercent: number,
  callback
) => {
  if (vpIndex <= locationsPoints.length - 1) {
    const nextIndex = vpIndex + 1;
    const lastIndex = locationsPoints.length - 1;
    const onlyLocation = locationsPoints.map((e) => e.point).filter((i) => i);
    const goNext = locationsPoints.length === onlyLocation.length;
    if (
      locationsPoints.length >= 2 &&
      goNext &&
      locationsPoints[0].planned_departure_time
    ) {
      // Create the object
      const routeObject = {
        origin: locationsPoints[0].point, // The first point is the origin
        destination: locationsPoints[lastIndex].point, // The last point is the destination
        waypoints: locationsPoints.slice(1, lastIndex).map((location) => ({
          location: location.point,
        })), // All points between the origin and destination are waypoints
        travelMode: "DRIVING" as google.maps.TravelMode, // You can change the travel mode
        provideRouteAlternatives: false, // Set to true if you want multiple route options
      };
      setLoading(true);
      return directionsService.route(routeObject, function (result, status) {
        setLoading(false);
        if (status === "OK") {
          const legs = result.routes[0].legs;

          /**
           * Create 3 diffrent arrays.
           * temppoints: holds first location to vpIndex-1 location.
           * tempPoints2: holds vpIndex to vpIndex+1 location. (We will operate on this array)
           * tempPoints2: holds vpIndex+1 to last location.
           */

          let tempPoints = vpIndex > 0 ? locationsPoints.slice(0, vpIndex) : [];
          const tempPoints2 =
            vpIndex > -1 ? locationsPoints.slice(vpIndex, nextIndex + 1) : [];

          const tempPoints3 =
            nextIndex < lastIndex
              ? locationsPoints.slice(nextIndex + 1, lastIndex + 1)
              : [];

          let tempLastCalculatedPoint = {} as TViaPoints;

          const newTempPoint = tempPoints2.map((item, index) => {
            if (index > 0) {
              const duration = legs[vpIndex + index - 1]?.duration,
                legDuration = (duration ? duration.value : 0) * 1000,
                legDurationWithLegPercent =
                  legDuration + (legDuration * legPercent) / 100,
                previousDepartureValue = new Date(
                  tempLastCalculatedPoint.planned_departure_time as Date
                ).valueOf();

              tempLastCalculatedPoint = {
                ...item,
                planned_arrival_time: new Date(
                  previousDepartureValue + legDurationWithLegPercent
                ),
              };
              return tempLastCalculatedPoint;
            }
            tempLastCalculatedPoint = { ...item };
            return tempLastCalculatedPoint;
          });
          /**
           * merge all three arrays into one which will be used in UI
           */
          tempPoints = [...tempPoints, ...newTempPoint, ...tempPoints3];

          callback(
            {
              points: tempPoints,
              mapResponse: result,
            },
            null
          );
        } else {
          callback(null, {
            show: true,
            message:
              "Distance and direction information could not be retrieved from the map API.",
          });
        }
      });
    } else {
      setVPDirection(null);
      callback(null, {
        show: false,
        message: "Not calling api",
      });
    }
  }
};

/**
 * Calculates the total distance for a given type and map response.
 * - call from all wrap function while successfully call map api
 * @param type - The type of calculation.
 * @param mapResponse - The map response object.
 */
const totalDistanceCalculation = (type: string, mapResponse) => {
  let totalDistance = 0;

  //Loop through the legs of the route to calculate distance
  for (const leg of mapResponse.routes[0].legs) {
    totalDistance += leg.distance.value;
  }

  totalDistance = totalDistance / 1000; // Convert to kilometers

  ViaPointController.setTotalDistanceWithDuration(
    type,
    "distance",
    totalDistance
  );
};
