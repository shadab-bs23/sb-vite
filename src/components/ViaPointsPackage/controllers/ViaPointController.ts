import { TRIP_TYPE } from "../enums/enums";
import { showToast } from "@/services/toast/toast.service";
import { TDistanceWithTime, TViaPoints, FromToError } from "../types/types";
import { isAfter } from "date-fns";
import { ref, toRaw } from "vue";
import { formatVPPayload } from "../utils/time.utils";

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
    const currentArrivalTime = new Date(
      vpList[vpIndex]?.planned_arrival_time as Date
    );
    const currentDepartureTime = new Date(
      vpList[vpIndex]?.planned_departure_time as Date
    );

    if (currentArrivalTime && currentDepartureTime) {
      if (isAfter(currentArrivalTime, currentDepartureTime)) {
        showToast(
          "error",
          "Departure time should be less than the arrival time."
        );
        return true;
      }
    }
    return false;
  };

  /**
   * Checks if there is a datetime error for a given index and trip type.
   * @param index - The index of the point in the list.
   * @param tripType - The type of trip (e.g., oneway, roundtrip).
   */
  static isDatetimeErr = (index, tripType) => {
    const finalError = {};
    const currentIndexError = this.compareArrivalAndDeparture(index, tripType);
    if (currentIndexError) finalError[index] = currentIndexError;
    else {
      delete finalError[index];
      tripType === TRIP_TYPE.ONEWAY
        ? delete this._onewayErrors.value[index]
        : delete this._returnTripErrors.value[index];
    }

    const vpList =
      tripType === TRIP_TYPE.ONEWAY
        ? this._travelOneWayPointList.value
        : this._travelRoundTripPointList.value;

    let nextIndexError = false;

    if (index < vpList.length - 2) {
      nextIndexError = this.compareArrivalAndDeparture(index + 1, tripType);
      if (nextIndexError) finalError[index + 1] = nextIndexError;
      else {
        delete finalError[index + 1];
        tripType === TRIP_TYPE.ONEWAY
          ? delete this._onewayErrors.value[index + 1]
          : delete this._returnTripErrors.value[index + 1];
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
