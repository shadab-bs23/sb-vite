import {
  RoutePoints,
  TViaPoints,
} from "@/components/ViaPointsPackage/types/types";
import { useJoinerTripStore, useSharebusStore, useTripStore } from "@/store";
import { deepClone, removeZforISOString } from "@/utils";
import { computed } from "vue";

export type DepartureReturnType = {
  bookingReference: string;
  origin: string;
  destination: string;
  departureDateTime: string;
  arrivalDateTime: string;
};
export default class TripController {
  private static tripStore = useTripStore();
  private static joinerTripStore = useJoinerTripStore();
  private static shareBusStore = useSharebusStore();

  /*
   * sharebus store store
   */
  static getShareBusStore = () => {
    return this.shareBusStore;
  };
  /*
   * sharelead trip store
   */
  static getShareleadTripStore = () => {
    return this.tripStore;
  };
  /*
   * getting joiner current trip
   */
  static getJoinerStore = () => {
    return this.joinerTripStore;
  };
  /*
   * getting sharelead current trip
   */
  static getCurrentTrip = computed(() => this.tripStore.getCurrentTrip);
  /*
   * getting departure trip mapping info based on API
   */
  static shareLeadDepartureInfo = computed(() => {
    const onewayRoutePoints = JSON.parse(
      this.tripStore.getCurrentTrip.route_points
    ).oneway;

    return {
      bookingReference: this.tripStore.getCurrentTrip.booking_reference,
      origin: onewayRoutePoints[0]?.point,
      destination: onewayRoutePoints[onewayRoutePoints.length - 1]?.point,
      departureDateTime: onewayRoutePoints[0]?.planned_departure_time,
      arrivalDateTime:
        onewayRoutePoints[onewayRoutePoints.length - 1]?.planned_arrival_time,
      route_points: onewayRoutePoints,
    };
  });
  /*
   * getting departure trip mapping info based on API
   */
  static joinerDepartureInfo = computed(() => {
    const onewayRoutePoints = JSON.parse(
      this.joinerTripStore.getCurrentTrip.route_points
    ).oneway;

    return {
      bookingReference: this.joinerTripStore.getCurrentTrip.booking_reference,
      origin: onewayRoutePoints[0]?.point,
      destination: onewayRoutePoints[onewayRoutePoints.length - 1]?.point,
      departureDateTime: onewayRoutePoints[0]?.planned_departure_time,
      arrivalDateTime:
        onewayRoutePoints[onewayRoutePoints.length - 1]?.planned_arrival_time,
      route_points: onewayRoutePoints,
    };
  });

  /*
   * getting return trip mapping info based on API
   */
  static shareLeadReturnInfo = computed(() => {
    const returnRoutePoints = JSON.parse(
      this.tripStore.getCurrentTrip.route_points
    ).return;

    return {
      bookingReference: this.tripStore.getCurrentTrip.booking_reference,
      origin: returnRoutePoints[0]?.point,
      destination: returnRoutePoints[returnRoutePoints.length - 1]?.point,
      departureDateTime: returnRoutePoints[0]?.planned_departure_time,
      arrivalDateTime:
        returnRoutePoints[returnRoutePoints.length - 1]?.planned_arrival_time,
      route_points: returnRoutePoints,
    };
  });
  /*
   * getting return trip mapping info based on API
   */
  static joinerReturnInfo = computed(() => {
    const returnRoutePoints = JSON.parse(
      this.joinerTripStore.getCurrentTrip.route_points
    ).return;

    return {
      bookingReference: this.joinerTripStore.getCurrentTrip.booking_reference,
      origin: returnRoutePoints[0]?.point,
      destination: returnRoutePoints[returnRoutePoints.length - 1]?.point,
      departureDateTime: returnRoutePoints[0]?.planned_departure_time,
      arrivalDateTime:
        returnRoutePoints[returnRoutePoints.length - 1]?.planned_arrival_time,
      route_points: returnRoutePoints,
    };
  });
  /**
   *get trip departure based on decision
   *
   * @param {boolean} isPrivate -- is for share lead or joiner
   * @returns
   */
  static getTripDeparture = (isPrivate = true) => {
    if (isPrivate) {
      return this.shareLeadDepartureInfo;
    }
    return this.joinerDepartureInfo;
  };
  /**
   *get trip departure based on decision
   *
   * @param {boolean} isPrivate -- is for share lead or joiner
   * @returns
   */
  static getTripReturn = (isPrivate = true) => {
    if (isPrivate) {
      return this.shareLeadReturnInfo;
    }
    return this.joinerReturnInfo;
  };

  /**
   * Updates the planned arrival and departure times in the viaPoints array based on a new trip departure date.
   * @param {TViaPoints[]} viaPoints - Array of via points containing the planned arrival and departure times.
   *                               the original trip and the new trip.
   * @returns {TViaPoints[]} Updated array of via points with adjusted times.
   */
  static updateDatesInPointsArray = (viaPoints: TViaPoints[]) => {
    for (const point of viaPoints) {
      point.planned_departure_time = point.planned_departure_time || null;

      point.planned_arrival_time = point.planned_arrival_time || null;

      point.actual_departure_time = point.actual_departure_time || null;
    }

    return viaPoints;
  };

  /**
   * Updates the planned arrival and departure times for the oneway and return trips in the routePoints object.
   * @param {RoutePoints} routePoints - The route points object containing oneway and return trip points.
   * @param {number} diffWithOriginalTrip - The time difference (in milliseconds) between
   *                               the original trip and the new trip.
   * @returns {RoutePoints} The updated route points with adjusted times.
   */
  static updateRoutePointDates = (routePoints: RoutePoints): RoutePoints => {
    const tempUpdatedRoutePoints = deepClone(routePoints);

    const updatedRoutePoints = {
      oneway: this.updateDatesInPointsArray(tempUpdatedRoutePoints.oneway),
      return:
        routePoints.return.length > 0
          ? this.updateDatesInPointsArray(tempUpdatedRoutePoints.return)
          : [],
    };
    return updatedRoutePoints;
  };
}
