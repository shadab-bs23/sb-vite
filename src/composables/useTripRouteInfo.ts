import { Trip } from "@/store/trip/privateTrip/types";

/**
 * Trip route information interface
 */
export interface TripRouteInfo {
  origin: string;
  destination: string;
  departureDateTime: string | null;
  arrivalDateTime: string | null;
}

/**
 * Composable for handling trip route information
 * Extracts departure and return info from trip data
 */
export const useTripRouteInfo = () => {
  /**
   * Get departure (oneway) route information from trip
   * @param trip - Trip object containing route points and fallback data
   * @returns TripRouteInfo object with departure details
   */
  const getDepartureInfo = (trip: Trip): TripRouteInfo => {
    try {
      const onewayRoutePoints = JSON.parse(trip.route_points)?.oneway;

      return {
        origin: onewayRoutePoints
          ? onewayRoutePoints[0]?.point
          : trip.outbound_from,
        destination: onewayRoutePoints
          ? onewayRoutePoints[onewayRoutePoints?.length - 1]?.point
          : trip.outbound_to,
        departureDateTime: onewayRoutePoints
          ? onewayRoutePoints[0]?.planned_departure_time
          : trip.outbound_from_datetime,
        arrivalDateTime: onewayRoutePoints
          ? onewayRoutePoints[onewayRoutePoints.length - 1]
              ?.planned_arrival_time
          : trip.outbound_to_datetime,
      };
    } catch (error) {
      console.error("Error parsing departure info:", error);
      // Fallback to trip-level data if route_points parsing fails
      return {
        origin: trip.outbound_from,
        destination: trip.outbound_to,
        departureDateTime: trip.outbound_from_datetime,
        arrivalDateTime: trip.outbound_to_datetime,
      };
    }
  };

  /**
   * Get return route information from trip
   * @param trip - Trip object containing route points and fallback data
   * @returns TripRouteInfo object with return details
   */
  const getReturnInfo = (trip: Trip): TripRouteInfo => {
    try {
      const returnRoutePoints = JSON.parse(trip.route_points)?.return;

      return {
        origin: returnRoutePoints
          ? returnRoutePoints[0]?.point
          : trip.outbound_from,
        destination: returnRoutePoints
          ? returnRoutePoints[returnRoutePoints?.length - 1]?.point
          : trip.outbound_to,
        departureDateTime: returnRoutePoints
          ? returnRoutePoints[0]?.planned_departure_time
          : trip.return_from_datetime,
        arrivalDateTime: returnRoutePoints
          ? returnRoutePoints[returnRoutePoints.length - 1]
              ?.planned_arrival_time
          : trip.return_to_datetime,
      };
    } catch (error) {
      console.error("Error parsing return info:", error);
      // Fallback to trip-level data if route_points parsing fails
      return {
        origin: trip.outbound_from,
        destination: trip.outbound_to,
        departureDateTime: trip.return_from_datetime,
        arrivalDateTime: trip.return_to_datetime,
      };
    }
  };

  return {
    getDepartureInfo,
    getReturnInfo,
  };
};
