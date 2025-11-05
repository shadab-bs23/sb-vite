<template>
  <div>
    <RouteStep
      form-class="col-sm-12 col-md-10 col-xl-10 mx-auto mt-3"
      :isEditMode="true"
      :initValues="initValues"
      @on-save="saveItineraryData"
    />
  </div>
</template>

<script setup lang="ts">
import RouteStep from "@/components/modules/sharelead/setupSharebus/RouteStep.vue";
import { useSalesStore, useTripStore } from "@/store";
import { TripLocationTime } from "@/store/salesConsole/types";
import {
  convertDateToISOString,
  formatRoutePointsForAPI,
  routePushTagQuery,
} from "@/utils";
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { Coordinate } from "types/sharebus/map.type";

const route = useRoute();
const tripStore = useTripStore();
const salesStore = useSalesStore();

onMounted(() => {
  /**
   * This is a temporary hack to refresh the page when the user navigates to it.
   * It is being used to resolve an immediate production release issue related to via points.
   * The issue is that the page becomes blank when a location input is entered.
   * This hack will be replaced with a proper solution after the production release.
   */

  tripStore.getTrip(route.params.tag as string);
});
const trip = computed(() => tripStore.getCurrentTrip);

const salesHistory = computed(
  () => salesStore.getSalesConsoleTrip()[route.params.tag as string]
);

function getBasePricing() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const historyPricing = (salesHistory.value?.trip_ticket_pricing as any)
    ?.ticket_pricing;
  return (
    historyPricing ||
    trip.value.ticket_pricing || {
      categories: [],
      via_points: [],
    }
  );
}

function getCategoriesAndViaPoints(basePricing) {
  const categories = Array.isArray(basePricing.categories)
    ? basePricing.categories
    : [];
  const existingViaPoints = Array.isArray(basePricing.via_points)
    ? basePricing.via_points
    : [];
  return { categories, existingViaPoints };
}

/**
 * Builds a reconciled list of via points with category prices for a trip itinerary.
 *
 * This function processes a one-way route and ensures that each route point has
 * appropriate category prices assigned. It reconciles existing via point data
 * with the current route structure and categories.
 *
 * @param {Array} consideredOneway - Array of route points to be processed
 * @param {Array} categories - Array of category objects with name property
 * @param {Array} existingViaPoints - Array of existing via points with id and category_prices
 * @returns {Array<{id: number, category_prices: Array<{name: string, price: number}>}>}
 *   Array of reconciled via points with ensured category prices
 *
 * @description
 * The function iterates through each route point in the considered one-way route:
 * - If a matching existing via point is found with valid category prices, it ensures
 *   all categories are present with their existing prices or defaults to 0
 * - If no match is found or category prices are invalid, it derives prices from
 *   the previous via point or initializes all categories to 0
 * - Returns a consistent structure where every via point has prices for all categories
 */
function buildReconciledViaPoints(
  consideredOneway,
  categories,
  existingViaPoints
) {
  const reconciledViaPoints = [] as Array<{
    id: number;
    category_prices: Array<{ name: string; price: number }>;
  }>;
  for (let i = 0; i < consideredOneway.length; i++) {
    // rp stands for "route point"
    const rp = consideredOneway[i];
    if (!rp) continue;
    const match = existingViaPoints.find((vp) => vp.id === rp.id);
    if (match && Array.isArray(match.category_prices)) {
      // cp stands for "category price"
      const existingPrices = match.category_prices.reduce((acc, cp) => {
        acc[cp.name] = typeof cp.price === "number" ? cp.price : 0;
        return acc;
      }, {} as Record<string, number>);
      const ensured = categories.map((cat) => ({
        name: cat.name,
        price:
          typeof existingPrices[cat.name] === "number"
            ? existingPrices[cat.name]
            : 0,
      }));
      reconciledViaPoints.push({ id: rp.id, category_prices: ensured });
    } else {
      const prev = reconciledViaPoints[reconciledViaPoints.length - 1];
      const derived = prev
        ? prev.category_prices.map((cp) => ({ name: cp.name, price: cp.price }))
        : categories.map((cat) => ({ name: cat.name, price: 0 }));
      reconciledViaPoints.push({ id: rp.id, category_prices: derived });
    }
  }
  return reconciledViaPoints;
}

/**
 * Compares two arrays of via points to determine if they differ in structure or content.
 *
 * Performs a deep comparison checking:
 * - Array lengths
 * - Via point IDs at each position
 * - Category prices array lengths for each via point
 * - Individual category price names and values
 *
 * @param {Array} existingViaPoints - The current array of via points to compare against
 * @param {Array} reconciledViaPoints - The new array of via points to compare
 * @returns {boolean} True if the arrays differ in any way, false if they are identical
 */
function differs(existingViaPoints, reconciledViaPoints) {
  if (existingViaPoints.length !== reconciledViaPoints.length) return true;
  for (let i = 0; i < reconciledViaPoints.length; i++) {
    const a = existingViaPoints[i];
    const b = reconciledViaPoints[i];
    if (!a || a.id !== b.id) return true;
    if ((a.category_prices?.length || 0) !== (b.category_prices?.length || 0))
      return true;
    for (let j = 0; j < b.category_prices.length; j++) {
      const ac = a.category_prices[j];
      const bc = b.category_prices[j];
      if (!ac || ac.name !== bc.name || ac.price !== bc.price) return true;
    }
  }
  return false;
}

/**
 * Reconciles ticket pricing when route points are modified in a one-way trip.
 *
 * This function ensures that the ticket pricing structure remains consistent
 * when new points are added to or removed from the trip itinerary. It processes
 * the oneway route points (excluding the final destination) and updates the
 * via_points in the ticket pricing structure if changes are detected.
 *
 * @param {Object} values - The form values containing route configuration
 * @param {Object} values.route_points - The route points object
 * @param {Array} values.route_points.oneway - Array of oneway route points
 *
 * @throws {Error} Silently catches and logs any errors to prevent blocking itinerary save operations
 *
 * @example
 * reconcileTicketPricing({
 *   route_points: {
 *     oneway: [pointA, pointB, pointC, pointD]
 *   }
 * });
 *
 * @remarks
 * - Only considers points from start to second-to-last (excludes final destination)
 * - Updates sales store with trip change request if pricing differences are detected
 * - Includes error handling to ensure pricing failures don't block itinerary operations
 */
const reconcileTicketPricing = (values) => {
  // Reconcile ticket_pricing for oneway when new points are added
  try {
    const onewayPoints = values?.route_points?.oneway || [];
    if (onewayPoints.length > 0) {
      // Inclusion: include start point (index 0), exclude destination (last index)
      const consideredOneway = onewayPoints.slice(
        0,
        Math.max(0, onewayPoints.length - 1)
      );
      const basePricing = getBasePricing();
      const { categories, existingViaPoints } =
        getCategoriesAndViaPoints(basePricing);
      const reconciledViaPoints = buildReconciledViaPoints(
        consideredOneway,
        categories,
        existingViaPoints
      );
      if (differs(existingViaPoints, reconciledViaPoints)) {
        salesStore.setSalesConsoleTripChangeRequest({
          trip_ticket_pricing: {
            ticket_pricing: {
              categories,
              via_points: reconciledViaPoints,
            },
          },
          trip_id: route.params.tag as string,
        });
      }
    }
  } catch (err) {
    // Silent safeguard; pricing reconciliation failures should not block itinerary save
    console.error("Ticket pricing reconciliation failed:", err);
  }
};

const saveItineraryData = (values) => {
  const plannedOnewayDepartureTime =
    values.route_points.oneway[0].planned_departure_time;
  const plannedOnewayArrivalTime =
    values.route_points.oneway[values.route_points.oneway.length - 1]
      .planned_arrival_time;

  const plannedReturnDepartureTime =
    values.route_points.return[0]?.planned_departure_time;
  const plannedReturnArrivalTime =
    values.route_points.return?.[values.route_points.return.length - 1]
      ?.planned_arrival_time;

  const updatedObj = {
    bus_signage: values.bus_signage,
    outbound_from: values.route_points.oneway[0]?.point,
    outbound_from_lat_long: {
      lat: values.route_points.oneway[0].point_latitude,
      lng: values.route_points.oneway[0].point_longitude,
    },
    outbound_to:
      values.route_points.oneway[values.route_points.oneway.length - 1]?.point,
    outbound_to_lat_long: {
      lat: values.route_points.oneway[values.route_points.oneway.length - 1]
        .point_latitude,
      lng: values.route_points.oneway[values.route_points.oneway.length - 1]
        .point_longitude,
    },
    outbound_from_datetime:
      values.route_points.oneway.length > 0
        ? plannedOnewayDepartureTime
          ? convertDateToISOString(plannedOnewayDepartureTime)
          : null
        : null,
    outbound_to_datetime:
      values.route_points.oneway.length > 0
        ? plannedOnewayArrivalTime
          ? convertDateToISOString(plannedOnewayArrivalTime)
          : null
        : null,
    return_from: values.route_points.return[0]?.point,
    return_from_lat_long:
      values.route_points.return.length > 0
        ? {
            lat: values.route_points.return[0].point_latitude,
            lng: values.route_points.return[0].point_longitude,
          }
        : {},
    return_from_datetime:
      values.route_points.return.length > 0
        ? plannedReturnDepartureTime
          ? convertDateToISOString(plannedReturnDepartureTime)
          : null
        : null,
    return_to:
      values.route_points.return[values.route_points.return.length - 1]?.point,
    return_to_lat_long:
      values.route_points.return.length > 0
        ? {
            lat: values.route_points.return[
              values.route_points.return.length - 1
            ].point_latitude,
            lng: values.route_points.return[
              values.route_points.return.length - 1
            ].point_longitude,
          }
        : {},
    return_to_datetime:
      values.route_points.return.length > 0
        ? plannedReturnDepartureTime
          ? convertDateToISOString(plannedReturnArrivalTime)
          : null
        : null,
    route_points: formatRoutePointsForAPI(values.route_points),
    bus_availability: values.bus_availability,
  };

  salesStore.setSalesConsoleTripChangeRequest({
    trip_location_time: updatedObj,
    trip_id: route.params.tag as string,
  });

  reconcileTicketPricing(values);

  // Enable edit mode before navigating back to maintain editing state
  salesStore.$state.editing_mode = true;

  routePushTagQuery("trip-sales-page", route.params.tag as string, {
    tabindex: 1,
  });
};

const parsedRoutePoints = computed(() => {
  try {
    return JSON.parse(trip.value?.route_points || "{}");
  } catch (error) {
    console.error("Failed to parse route points:", error);
    return { oneway: [], return: [] };
  }
});

const initValues = computed(() => {
  const salesHistoryTripLocTime = salesHistory.value
    ?.trip_location_time as TripLocationTime;
  const routePoints = salesHistory.value && salesHistoryTripLocTime?.route_points
    ? salesHistoryTripLocTime.route_points
    : trip.value.route_points
    ? parsedRoutePoints.value
    : { oneway: [], return: [] };

  const oneway = routePoints.oneway || [];
  const returnRoute = routePoints.return || [];
  const firstOneway = oneway[0];
  const lastOneway = oneway[oneway.length - 1];
  const firstReturn = returnRoute[0];
  const lastReturn = returnRoute[returnRoute.length - 1];

  const baseValues = {
    tripId: route.params.tag as string,
    signage: salesHistoryTripLocTime?.bus_signage || trip.value?.booking_reference || "",
    bus_availability: salesHistoryTripLocTime?.bus_availability ?? trip.value?.bus_availability ?? false,
    route_points: routePoints,
    origin: firstOneway?.point || "",
    originLatLng: firstOneway
      ? {
          lat: parseFloat(String(firstOneway.point_latitude || 0)),
          lng: parseFloat(String(firstOneway.point_longitude || 0)),
        }
      : { lat: 0, lng: 0 },
    destination: lastOneway?.point || "",
    destinationLatLng: lastOneway
      ? {
          lat: parseFloat(String(lastOneway.point_latitude || 0)),
          lng: parseFloat(String(lastOneway.point_longitude || 0)),
        }
      : { lat: 0, lng: 0 },
    departureDate: firstOneway?.planned_departure_time
      ? new Date(firstOneway.planned_departure_time)
      : new Date(),
    departureTime: firstOneway?.planned_departure_time
      ? new Date(firstOneway.planned_departure_time)
      : new Date(),
    returnDate: firstReturn?.planned_departure_time
      ? new Date(firstReturn.planned_departure_time)
      : null,
    returnTime: firstReturn?.planned_departure_time
      ? new Date(firstReturn.planned_departure_time)
      : null,
  };

  return baseValues;
});
</script>
