import { showToast } from "@/services/toast/toast.service";
import { isAfter, isEqual } from "date-fns";
import { ref, toRaw } from "vue";
import { TRIP_TYPE } from "../enums/enums";
import { FromToError, TDistanceWithTime, TViaPoints } from "../types/types";
import { formatVPPayload } from "../utils/time.utils";
// import { getUniqueIntId } from "@/utils";

export const fromToErrInitValue: FromToError = {
  fromPoint: "",
  fromDepartureTime: null,
  toPoint: "",
};

export default class ViaPointController {
  private static _travelOneWayPointList = ref<TViaPoints[]>([]);
  private static _travelRoundTripPointList = ref<TViaPoints[]>([]);
  private static _distanceWithDuration = ref(<TDistanceWithTime>{
    oneway: {
      distance: 0,
      duration: 0,
    },
    returnTrip: { distance: 0, duration: 0 },
  });
  private static _onewayErrors = ref<{
    [key: number]: boolean;
  }>({});
  private static _returnTripErrors = ref<{
    [key: number]: boolean;
  }>({});

  private static _onewayfromToError = ref(fromToErrInitValue);
  private static _returnFromToError = ref(fromToErrInitValue);

  /**
   * Sets the list of travel points for a one-way trip.
   *
   * @param {TViaPoints[]} value - An array of travel points.
   */
  static setTravelPointListOneWay(value: TViaPoints[]) {
    this._travelOneWayPointList.value = value;
  }

  /**
   * Retrieves the list of travel points for a one-way trip.
   *
   * @returns {TViaPoints[]} An array of TViaPoints representing the travel points.
   */
  static getTravelPointListOneWay(): TViaPoints[] {
    return this._travelOneWayPointList.value;
  }

  /**
   * Sets the list of travel points for a round trip.
   * @param {TViaPoints[]} value - An array of travel points.
   */
  static setTravelPointListRound(value: TViaPoints[]) {
    this._travelRoundTripPointList.value = value;
  }

  /**
   * Retrieves the list of travel points for a round trip.
   * @returns {{TViaPoints[]}} An array of TViaPoints representing the travel points.
   */
  static getTravelPointListRound(): TViaPoints[] {
    return this._travelRoundTripPointList.value;
  }

  /**
   * Retrieves a list of travel via points for return.
   *
   * @returns {TViaPoints[]} An array of TViaPoints representing the travel via points for return.
   */
  static getTravelViaPointListForReturn(): TViaPoints[] {
    const temp = [...toRaw(this._travelOneWayPointList.value as TViaPoints[])];
    if (temp.length >= 2) {
      temp.shift(); // Remove the first element
      temp.pop(); // Remove the last element
    }
    let reversedArray = temp.slice().reverse(); // Making a copy to avoid modifying the original array
    reversedArray = reversedArray.map((obj, index) => ({
      ...obj,
      sequence: index + 1,
      planned_arrival_time: null,
      actual_departure_time: null,
      planned_departure_time: null,
    }));
    return reversedArray ?? [];
  }

  /**
   * getting distance and time for oneway and return trip
   * @returns {TDistanceWithTime} - The distance and time for both trip
   */
  static getTotalDistanceWithDuration(): TDistanceWithTime {
    return this._distanceWithDuration.value;
  }

  /**
   * Sets the total distance with duration for a specific type and key.
   * @param {string} type - The type of the distance with duration.
   * @param {string} key - The key of the distance with duration.
   * @param {number} value - The value to set for the distance with duration.
   * @returns {void}
   */
  static setTotalDistanceWithDuration(
    type: string,
    key: string,
    value: number
  ): void {
    this._distanceWithDuration.value[type][key] = value;
  }

  /**
   * Retrieves the origin and destination points based on the trip type.
   * @param type - The type of trip (e.g., "oneway", "roundtrip").
   * @returns An object containing the origin and destination points.
   */
  static getOriginDestination = (type: string) => {
    if (type !== TRIP_TYPE.ONEWAY) {
      return {
        origin: this._travelRoundTripPointList.value[0],
        destination:
          this._travelRoundTripPointList.value[
            this._travelRoundTripPointList.value.length - 1
          ],
      };
    }
    return {
      origin: this._travelOneWayPointList.value[0],
      destination:
        this._travelOneWayPointList.value[
          this._travelOneWayPointList.value.length - 1
        ],
    };
  };

  /**
   * Compares the arrival and departure times of a travel point in the order list.
   * @param vpIndex - The index of the travel point in the order list.
   * @param tripType - The type of the trip (e.g., "ONEWAY", "ROUNDTRIP").
   * @returns Returns true if the next departure time is greater than or equal to the next arrival time, otherwise returns false.
   */
  static compareArrivalAndDeparture = (vpIndex, tripType) => {
    const vpList =
      tripType === TRIP_TYPE.ONEWAY
        ? this._travelOneWayPointList.value
        : this._travelRoundTripPointList.value;

    // First check: arrival vs departure for the same point
    const arrivalTime = vpList[vpIndex]?.planned_arrival_time;
    const departureTime = vpList[vpIndex]?.planned_departure_time;

    // Only proceed if both times exist and are valid
    if (!arrivalTime || !departureTime) {
      return false;
    }

    const currentArrivalTime = new Date(arrivalTime as Date);
    const currentDepartureTime = new Date(departureTime as Date);

    // Check if dates are valid
    if (
      isNaN(currentArrivalTime.getTime()) ||
      isNaN(currentDepartureTime.getTime())
    ) {
      return false;
    }

    // Check if arrival > departure for same point
    if (isAfter(currentArrivalTime, currentDepartureTime)) {
      showToast(
        "error",
        "Departure time should be greater than the arrival time."
      );
      return true;
    }

    // Second check: cumulative sequence validation
    // Check if current departure is after previous point's departure
    if (vpIndex > 0) {
      const previousPoint = vpList[vpIndex - 1];
      const prevDepartureTime = previousPoint?.planned_departure_time;

      if (
        prevDepartureTime &&
        ViaPointController.isValidDate(prevDepartureTime)
      ) {
        const prevDeparture = new Date(prevDepartureTime as Date);

        if (
          isAfter(prevDeparture, currentDepartureTime) ||
          isEqual(prevDeparture, currentDepartureTime)
        ) {
          showToast(
            "error",
            "Departure time must be later than the previous viapoint's departure time."
          );
          return true;
        }
      }
    }

    return false;
  };

  // Helper method to validate date
  static isValidDate = (dateValue) => {
    if (!dateValue) return false;
    const date = new Date(dateValue);
    return !isNaN(date.getTime());
  };

  /**
   * Checks if there is a datetime error for a given index and trip type.
   * @param index - The index of the point in the list.
   * @param tripType - The type of trip (e.g., oneway, roundtrip).
   */
  static isDatetimeErr = (index, tripType) => {
    const finalError = {};
    const vpList =
      tripType === TRIP_TYPE.ONEWAY
        ? this._travelOneWayPointList.value
        : this._travelRoundTripPointList.value;

    // Check current point
    const currentIndexError = this.compareArrivalAndDeparture(index, tripType);
    if (currentIndexError) finalError[index] = currentIndexError;
    else {
      delete finalError[index];
      tripType === TRIP_TYPE.ONEWAY
        ? delete this._onewayErrors.value[index]
        : delete this._returnTripErrors.value[index];
    }

    // Check next point (if exists)
    if (index < vpList.length - 2) {
      const nextIndexError = this.compareArrivalAndDeparture(
        index + 1,
        tripType
      );
      if (nextIndexError) finalError[index + 1] = nextIndexError;
      else {
        delete finalError[index + 1];
        tripType === TRIP_TYPE.ONEWAY
          ? delete this._onewayErrors.value[index + 1]
          : delete this._returnTripErrors.value[index + 1];
      }
    }

    // Check previous point (if exists) - this ensures sequence validation
    if (index > 0) {
      const prevIndexError = this.compareArrivalAndDeparture(
        index - 1,
        tripType
      );
      if (prevIndexError) finalError[index - 1] = prevIndexError;
      else {
        delete finalError[index - 1];
        tripType === TRIP_TYPE.ONEWAY
          ? delete this._onewayErrors.value[index - 1]
          : delete this._returnTripErrors.value[index - 1];
      }
    }

    tripType === TRIP_TYPE.ONEWAY
      ? this.setOnewayErrors(finalError)
      : this.setReturnTripErrors(finalError);
  };

  static setOnewayErrors = (value) => {
    this._onewayErrors.value = { ...this._onewayErrors.value, ...value };
  };

  static getOnewayErrors = (): { [key: number]: boolean } => {
    return this._onewayErrors.value;
  };

  static removeOnewayError = (vpIndex) => {
    this._onewayErrors.value = Object.fromEntries(
      Object.entries(this._onewayErrors.value).filter(([key]) => key < vpIndex)
    );
  };

  static setReturnTripErrors = (value) => {
    this._returnTripErrors.value = {
      ...this._returnTripErrors.value,
      ...value,
    };
  };

  static resetReturnTripValuesAndErrors = () => {
    this._travelRoundTripPointList.value = [];
    this._returnTripErrors.value = {};
    this._returnFromToError.value = fromToErrInitValue;
    this._distanceWithDuration.value = {
      ...this._distanceWithDuration.value,
      returnTrip: { distance: 0, duration: 0 },
    };
  };

  static getReturnTripErrors = () => {
    return this._returnTripErrors.value;
  };

  static removeReturnTripError = (vpIndex) => {
    this._returnTripErrors.value = Object.fromEntries(
      Object.entries(this._returnTripErrors.value).filter(
        ([key]) => key < vpIndex
      )
    );
  };

  static setFromToError = (type: string, value: FromToError) => {
    if (type === TRIP_TYPE.ONEWAY) {
      this._onewayfromToError.value = value;
    } else {
      this._returnFromToError.value = value;
    }
  };

  static getFromToError = (type: string) => {
    return type === TRIP_TYPE.ONEWAY
      ? this._onewayfromToError.value
      : this._returnFromToError.value;
  };

  static getFormattedViaPointLists = () => {
    const oneWayViaPoints = formatVPPayload(this.getTravelPointListOneWay());
    const returnViaPoints = formatVPPayload(this.getTravelPointListRound());

    return {
      oneway: oneWayViaPoints,
      return: returnViaPoints,
    };
  };

  /**
   * Simple sync: reverse oneway points to create return trip
   * Preserves return start departure time and existing via point times when updating
   */
  static syncReturnTrip() {
    const onewayPoints = this.getTravelPointListOneWay();
    const existingReturnTrip = this.getTravelPointListRound();

    if (onewayPoints.length === 0) {
      this.setTravelPointListRound([]);
      return;
    }

    // Get existing return departure time if available
    const existingReturnDepartureTime =
      existingReturnTrip.length > 0
        ? existingReturnTrip[0]?.planned_departure_time
        : null;

    // Create a map of existing return trip points by their location (point property)
    // to preserve timing data when syncing
    const existingReturnPointsMap = new Map();
    existingReturnTrip.forEach((point) => {
      if (point.point) {
        existingReturnPointsMap.set(point.point, {
          planned_departure_time: point.planned_departure_time,
          planned_arrival_time: point.planned_arrival_time,
          actual_departure_time: point.actual_departure_time,
        });
      }
    });

    // Create reversed return trip
    const reversedPoints: TViaPoints[] = [];

    // Return trip starts where oneway ends (last becomes first)
    const returnStart = { ...onewayPoints[onewayPoints.length - 1] };
    // returnStart.id = getUniqueIntId();
    returnStart.type = "from";
    returnStart.sequence = 0;

    // Preserve existing departure time or use oneway end arrival time
    returnStart.planned_departure_time =
      existingReturnDepartureTime ||
      onewayPoints[onewayPoints.length - 1]?.planned_arrival_time ||
      null;
    returnStart.planned_arrival_time = null;
    returnStart.actual_departure_time = null;
    reversedPoints.push(returnStart);

    // Add via points in reverse order
    const viaPoints = onewayPoints.slice(1, -1);
    viaPoints.reverse().forEach((point, index) => {
      const reversePoint = { ...point };
      // reversePoint.id = getUniqueIntId();
      reversePoint.type = "via";
      reversePoint.sequence = index + 1;

      // Preserve existing times for this location if they exist
      // const existingTimes = existingReturnPointsMap.get(point.point);
      // if (existingTimes) {
      //   reversePoint.planned_departure_time =
      //     existingTimes.planned_departure_time;
      //   // reversePoint.planned_arrival_time = existingTimes.planned_arrival_time;
      //   reversePoint.actual_departure_time =
      //     existingTimes.actual_departure_time;
      // } else {
      //   reversePoint.planned_departure_time = null;
      //   reversePoint.planned_arrival_time = null;
      //   reversePoint.actual_departure_time = null;
      // }
      reversePoint.planned_departure_time = null;
      reversePoint.planned_arrival_time = null;
      reversePoint.actual_departure_time = null;
      reversedPoints.push(reversePoint);
    });

    // Return trip ends where oneway starts (first becomes last)
    const returnEnd = { ...onewayPoints[0] };
    // returnEnd.id = getUniqueIntId();
    returnEnd.type = "to";
    returnEnd.sequence = reversedPoints.length;

    // Preserve existing times for the end point if they exist
    const existingEndTimes = existingReturnPointsMap.get(onewayPoints[0].point);
    if (existingEndTimes) {
      returnEnd.planned_departure_time =
        existingEndTimes.planned_departure_time;
      returnEnd.planned_arrival_time = existingEndTimes.planned_arrival_time;
      returnEnd.actual_departure_time = existingEndTimes.actual_departure_time;
    } else {
      returnEnd.planned_departure_time = null;
      returnEnd.planned_arrival_time = null;
      returnEnd.actual_departure_time = null;
    }

    reversedPoints.push(returnEnd);
    this.setTravelPointListRound(reversedPoints);
  }

  /**
   * Checks if there are any errors in the via points.
   */
  static hasViapointErrors = () => {
    const onewayFromToError = this.getFromToError("oneway");
    const returnFromToError = this.getFromToError("returnTrip");
    const onewayError = this.getOnewayErrors();
    const returnTripError = this.getReturnTripErrors();

    return (
      !onewayFromToError.fromDepartureTime ||
      !onewayFromToError.fromPoint ||
      !onewayFromToError.toPoint ||
      Object.keys(onewayError).length > 0 ||
      Object.keys(returnTripError).length > 0 ||
      (this._travelRoundTripPointList.value.length > 0 &&
        (!returnFromToError.fromDepartureTime ||
          !returnFromToError.fromPoint ||
          !returnFromToError.toPoint))
    );
  };
}
