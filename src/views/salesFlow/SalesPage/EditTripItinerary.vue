<template>
  <div>
    <TripDetailsStepOne
      form-class="col-sm-12 col-md-10 col-xl-10 mx-auto mt-3"
      :isEditMode="true"
      :initValues="initValues"
      :trip-other-data="tripOtherData"
      @on-save="saveItineraryData"
      @get-value="showValue"
    />
  </div>
</template>

<script setup lang="ts">
import TripDetailsStepOne from "@/components/modules/sharelead/setupSharebus/TripDetailsStepOne.vue";
import { useConfigStore, useSalesStore, useTripStore } from "@/store";
import {
  isoFormatDateTime,
  removeZforISOString,
  routePushTagQuery,
} from "@/utils";
import { Coordinate } from "./types/sharebus/map.type";
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const tripStore = useTripStore();
const salesStore = useSalesStore();
const configStore = useConfigStore();

onMounted(() => {
  /**
   * This is a temporary hack to refresh the page when the user navigates to it.
   * It is being used to resolve an immediate production release issue related to via points.
   * The issue is that the page becomes blank when a location input is entered.
   * This hack will be replaced with a proper solution after the production release.
   */

  if (!window.location.hash) {
    window.location.hash = "#loaded";
    window.location.reload();
  } else {
    tripStore.getTrip(route.params.tag as string);
  }
});
const trip = computed(() => tripStore.getCurrentTrip);

const salesHistory = computed(
  () => salesStore.getSalesConsoleTrip()[route.params.tag as string]
);

const tripOtherData = computed(() => {
  const { MinimumDaysBeforeBooking, PassengerGoalDeadlineDays } =
    configStore.getSharebusSetupConfig;

  const blockedDaysBeforeDeparture =
    MinimumDaysBeforeBooking - PassengerGoalDeadlineDays || 1;

  let deadlinePassengerGoal;

  if (
    salesHistory.value &&
    salesHistory.value.update_history.trip_deadline_passenger_goal
  ) {
    deadlinePassengerGoal = new Date(
      removeZforISOString(
        salesHistory.value.trip_deadline_passenger_goal.deadline_passenger_goal
      )
    );
  } else {
    deadlinePassengerGoal = new Date(
      removeZforISOString(trip.value.deadline_passenger_goal)
    );
  }

  return {
    blockedDaysBeforeDeparture: new Date(
      deadlinePassengerGoal.setDate(
        deadlinePassengerGoal.getDate() + blockedDaysBeforeDeparture
      )
    ),
  };
});

const saveItineraryData = (values) => {
  const setObj = {
    [route.params.tag as string]: {
      trip_location_time: {
        bus_signage: values.bus_signage,
        outbound_from: values.origin,
        outbound_from_lat_long: values.outbound_from_lat_long,
        outbound_to: values.destination,
        outbound_to_lat_long: values.outbound_to_lat_long,
        outbound_from_datetime:
          values.route_points.oneway.length > 0
            ? isoFormatDateTime(
                values.route_points.oneway[0].planned_departure_time
              )
            : null,
        outbound_to_datetime:
          values.route_points.oneway.length > 0
            ? isoFormatDateTime(
                values.route_points.oneway[
                  values.route_points.oneway.length - 1
                ].planned_arrival_time
              )
            : null,
        return_from: values.destination,
        return_from_lat_long: values.outbound_to_lat_long,
        return_from_datetime:
          values.route_points.return.length > 0
            ? isoFormatDateTime(
                values.route_points.return[0].planned_departure_time
              )
            : null,
        return_to: values.origin,
        return_to_lat_long: values.outbound_from_lat_long,
        return_to_datetime:
          values.route_points.return.length > 0
            ? isoFormatDateTime(
                values.route_points.return[
                  values.route_points.return.length - 1
                ].planned_departure_time
              )
            : null,
        route_points: values.route_points,
        bus_availability: values.bus_availability,
      },
      update_history: {
        trip_location_time: new Date(),
      },
    },
  };

  salesStore.setSalesConsoleTripChangeRequest(setObj);

  routePushTagQuery("trip-sales-page", route.params.tag as string, {
    tabindex: 1,
  });
};

const showValue = (values) => {
  console.log(values);
};

const initValues = computed(() => {
  if (
    salesHistory.value &&
    salesHistory.value.update_history.trip_location_time
  ) {
    return {
      tripId: route.params.tag as string,
      signage: salesHistory.value.trip_location_time.bus_signage,
      origin: salesHistory.value.trip_location_time.outbound_from,
      originLatLng: salesHistory.value.trip_location_time
        .outbound_from_lat_long as Coordinate,
      destination: salesHistory.value.trip_location_time.outbound_to,
      destinationLatLng: salesHistory.value.trip_location_time
        .outbound_to_lat_long as Coordinate,
      departureDate: new Date(
        salesHistory.value.trip_location_time.outbound_from_datetime
      ),
      departureTime: new Date(
        salesHistory.value.trip_location_time.outbound_from_datetime
      ),
      bus_availability: salesHistory.value.trip_location_time.bus_availability,
      returnDate: salesHistory.value.trip_location_time.return_from_datetime
        ? new Date(salesHistory.value.trip_location_time.return_from_datetime)
        : null,
      returnTime: salesHistory.value.trip_location_time.return_from_datetime
        ? new Date(salesHistory.value.trip_location_time.return_from_datetime)
        : null,
      route_points: salesHistory.value.trip_location_time.route_points,
    };
  }

  return {
    tripId: route.params.tag as string,
    signage: trip.value && trip.value.booking_reference,
    origin: trip.value && trip.value.outbound_from,
    originLatLng:
      trip.value && (trip.value.outbound_from_lat_long as Coordinate),
    destination: trip.value && trip.value.outbound_to,
    destinationLatLng:
      trip.value && (trip.value.outbound_to_lat_long as Coordinate),
    departureDate:
      trip.value &&
      new Date(removeZforISOString(trip.value.outbound_from_datetime)),
    departureTime:
      trip.value &&
      new Date(removeZforISOString(trip.value.outbound_from_datetime)),
    bus_availability: trip.value.bus_availability,
    returnDate:
      trip.value && trip.value.return_from_datetime
        ? new Date(removeZforISOString(trip.value.return_from_datetime))
        : null,
    returnTime:
      trip.value && trip.value.return_from_datetime
        ? new Date(removeZforISOString(trip.value.return_from_datetime))
        : null,
    route_points: trip.value.route_points
      ? JSON.parse(trip.value.route_points)
      : {},
  };
});
</script>
