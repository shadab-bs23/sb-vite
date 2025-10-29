import { useJoinerTripStore, useSharebusStore, useTripStore } from "@/store";
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
    return {
      bookingReference: this.tripStore.getCurrentTrip.booking_reference,
      origin: this.tripStore.getCurrentTrip.outbound_from,
      destination: this.tripStore.getCurrentTrip.outbound_to,
      departureDateTime: this.tripStore.getCurrentTrip.outbound_from_datetime,
      arrivalDateTime: this.tripStore.getCurrentTrip.outbound_to_datetime,
      route_points: JSON.parse(this.tripStore.getCurrentTrip.route_points)
        .oneway,
    };
  });
  /*
   * getting departure trip mapping info based on API
   */
  static joinerDepartureInfo = computed(() => {
    return {
      bookingReference: this.joinerTripStore.getCurrentTrip.booking_reference,
      origin: this.joinerTripStore.getCurrentTrip.outbound_from,
      destination: this.joinerTripStore.getCurrentTrip.outbound_to,
      departureDateTime:
        this.joinerTripStore.getCurrentTrip.outbound_from_datetime,
      arrivalDateTime: this.joinerTripStore.getCurrentTrip.outbound_to_datetime,
      route_points: JSON.parse(this.joinerTripStore.getCurrentTrip.route_points)
        .oneway,
    };
  });

  /*
   * getting return trip mapping info based on API
   */
  static shareLeadReturnInfo = computed(() => {
    return {
      bookingReference: this.tripStore.getCurrentTrip.booking_reference,
      origin: this.tripStore.getCurrentTrip.return_from,
      destination: this.tripStore.getCurrentTrip.return_to,
      departureDateTime: this.tripStore.getCurrentTrip.return_from_datetime,
      arrivalDateTime: this.tripStore.getCurrentTrip.return_to_datetime,
      route_points: JSON.parse(this.tripStore.getCurrentTrip.route_points)
        .return,
    };
  });
  /*
   * getting return trip mapping info based on API
   */
  static joinerReturnInfo = computed(() => {
    return {
      bookingReference: this.joinerTripStore.getCurrentTrip.booking_reference,
      origin: this.joinerTripStore.getCurrentTrip.return_from,
      destination: this.joinerTripStore.getCurrentTrip.return_to,
      departureDateTime:
        this.joinerTripStore.getCurrentTrip.return_from_datetime,
      arrivalDateTime: this.joinerTripStore.getCurrentTrip.return_to_datetime,
      route_points: JSON.parse(this.joinerTripStore.getCurrentTrip.route_points)
        .return,
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
}
