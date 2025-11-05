<template>
  <div class="w-90 mx-auto">
    <BaseBreadcrumbs
      modifier-class="divider p-0"
      crumb-class="crumb fw-bold"
      :current-crumb-label="t('sales.details.edit_passenger_goal_and_prices')"
      label-class="crumb-label"
      crumb-link-class="crumb-link ship-gray"
    />

    <div class="pt-4 px-2 bg-white mb-4">
      <div>
        <h2 class="text-start fw-bold">
          {{ t("sales.details.edit_passenger_goal_and_prices") }}
        </h2>
        <div class="d-flex flex-wrap">
          <BaseButton
            button-class="sb-btn-md sb-btn-secondary me-2"
            @click="handleSaveChanges(false)"
          >
            {{ t("button.cancel") }}
          </BaseButton>
          <BaseButton
            button-class="sb-btn-md sb-btn-primary"
            :disabled="!isFormValid"
            @click="handleSaveChanges(true)"
          >
            Save Changes
          </BaseButton>
        </div>
      </div>
    </div>

    <div v-if="trip.id" class="row">
      <div class="col-12 text-start">
        <div>
          <TripLastChangedInfo
            class="mt-2"
            :tripId="trip.id"
            :changeKey="SalesEditGroup.MAX_PAX"
            :updateHistory="trip.update_history"
          />
          <BusCapacity
            v-model:busCapacity="busCapacity"
            :busCapacityLimits="GET_BUS_CAPACITY_LIMIT"
            @validationChange="handleBusCapacityValidation"
          />
        </div>
        <!-- Passenger Goal Slider Component -->
        <div>
          <TripLastChangedInfo
            class="mt-2"
            :tripId="trip.id"
            :changeKey="SalesEditGroup.PASSENGER_GOAL"
            :updateHistory="trip.update_history"
          />
          <PassengerGoalSlider
            v-model:passengerGoal="passengerGoal"
            v-model:show-available-seats="show_available_seats"
            :is-show-available-seats="show_available_seats"
            :busCapacity="busCapacity"
            :passengerGoalLimits="PASSENGER_GOAL"
            :deadline-date="
              parsedRoutePoints.oneway[0]?.planned_departure_time || ''
            "
            @validationChange="handlePassengerGoalValidation"
          />
        </div>

        <!-- Remaining Seats Toggle Component -->
        <div>
          <TripLastChangedInfo
            :tripId="trip.id"
            :changeKey="SalesEditGroup.SHOW_TRIP_AVAILABLE_SEATS"
            :updateHistory="trip.update_history"
          />
          <!-- <RemainingSeatsToggle v-model="show_available_seats" /> -->
        </div>

        <!-- Ticket Price Display Component -->
        <TicketPriceDisplay :ticketPrice="ticketPrice" />

        <!-- Bus Price Error Display -->
        <FormError
          v-if="busPrice <= 0 && !busPriceApiResponse.isLoading"
          error-class="auth-error p-3 rounded mt-1 text-danger fw-bold fs-6 w-100"
          :error="{ message: t('common.bus_price_not_available') }"
        />

        <div class="mt-5">
          <ItineraryPricingTable
            ref="itineraryPricingTableRef"
            :route-points="parsedRoutePoints.oneway"
            :ticket-pricing="tripTicketPricing"
            :departure-date="
              parsedRoutePoints.oneway[0]?.planned_departure_time
            "
            :edit-mode="true"
            :show-edit-buttons="false"
            :nextItineraryRoute="''"
            :nextTicketPricesRoute="''"
            @pricing-updated="handlePricingUpdate"
            @validation-status-changed="onValidationStatusChanged"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  watch,
  nextTick,
  ComputedRef,
  inject,
  reactive,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useTripStore, useSalesStore, useBusInfoStore } from "@/store";
import ItineraryPricingTable from "@/components/modules/sharelead/setupSharebus/PublishStep/components/ItineraryPricingTable.vue";
import BaseButton from "@busgroup/vue3-base-button";
import BaseBreadcrumbs from "@/components/common/reusable/BaseBreadcrumbs.vue";
import type { TicketPricing } from "@/store/sharebus/types";
import {
  SalesEditGroup,
  TripLocationTime,
  TripGoal,
} from "@/store/salesConsole/types";
import {
  convertDateToISOString,
  deleteTypeNameKeyRecursively,
  isInRange,
  routePushTagQuery,
  formatRoutePointsForAPI,
} from "@/utils";
import BusCapacity from "@/components/modules/sharelead/setupSharebus/PassengerGoalAndPrices/components/BusCapacity.vue";
import ShareBusSetUpController from "@/components/modules/sharelead/setupSharebus/Controllers/ShareBusSetUpController";
import TicketPriceDisplay from "@/components/modules/sharelead/setupSharebus/PassengerGoalAndPrices/components/TicketPriceDisplay.vue";
import PassengerGoalSlider from "@/components/modules/sharelead/setupSharebus/PassengerGoalAndPrices/components/PassengerGoalSlider.vue";
import { getNoDiscountPriceInfo } from "@/components/modules/sharelead/setupSharebus/service/executeJSONLogic";
import { TRIP_TYPE } from "@/components/modules/sharelead/trip/tripStatus/tripStatusEnum";
import { countryType } from "@/core/plugin/countryPlugin";
import TripLastChangedInfo from "@/components/modules/sales/TripLastChangedInfo.vue";
import FormError from "@/components/common/error/FormError.vue";

// Define interface for changed pricing data
interface ChangedPricingPoint {
  id: number;
  category_prices: Array<{
    name: string;
    price: number;
  }>;
}

const country = inject<ComputedRef<countryType>>("country");
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const tripStore = useTripStore();
const salesStore = useSalesStore();
const busInfoStore = useBusInfoStore();
const trip = computed(() => tripStore.getCurrentTrip);
const busPrice = ref(0);

// Add reactive state for bus price API like in RouteStep.vue
const busPriceApiResponse = reactive({
  error: {},
  isLoading: {},
});
const hasBusPriceError = ref(false);

const isPriceTableValid = ref(false);
const busCapacity = ref(trip.value.max_pax || 0);
const invalidBusCapacityErr = ref(false);
const invalidSeatCountErr = ref(false);
const show_available_seats = ref(trip.value.show_available_seats || false);

const passengerGoal = ref(
  trip.value.passenger_goal || Math.min(busCapacity.value, 999)
);
const passengerGoalCalculable = ref(0);

// Constants from ShareBusSetUpController
const PASSENGER_GOAL = computed(
  () => ShareBusSetUpController.getPassengerGoalLimit.value
);
const GET_BUS_CAPACITY_LIMIT = computed(
  () => ShareBusSetUpController.getBusCapacityLimit.value
);

const isFormValid = computed(() => {
  // Check if the form is valid based on child component validation
  return (
    isPriceTableValid.value &&
    !invalidBusCapacityErr.value &&
    !invalidSeatCountErr.value
  );
});

// Handle validation state from child components
const handleBusCapacityValidation = (hasError: boolean) => {
  invalidBusCapacityErr.value = hasError;
  // validateBeforeNextStep();
};

const handlePassengerGoalValidation = (hasError: boolean) => {
  invalidSeatCountErr.value = hasError;
  // validateBeforeNextStep();
};

// Ref for ItineraryPricingTable component
const itineraryPricingTableRef = ref<{
  validateFields: () => boolean;
  isPriceTableValid: { value: boolean };
  getUpdatedPricingData: () => TicketPricing;
  getChangedPricingData: () => ChangedPricingPoint[];
} | null>(null);

// Update form validity based on child component validation
const onValidationStatusChanged = (isValid: boolean) => {
  isPriceTableValid.value = isValid;
};

const ticketPrice = ref(trip.value.regular_ticket_price || 0);

const fetchBusPrice = async (): Promise<void> => {
  const route_points = parsedRoutePoints.value;
  if (route_points && route_points.oneway.length) {
    const plannedDepartureTime = route_points.oneway[0]?.planned_departure_time;
    const departureInfo = {
      outbound_from: {
        place: route_points.oneway[0]?.point,
        point_latitude: route_points.oneway[0]?.point_latitude,
        point_longitude: route_points.oneway[0]?.point_longitude,
      },
      outbound_to: {
        place: route_points.oneway?.[route_points.oneway.length - 1]?.point,
        point_latitude:
          route_points.oneway?.[route_points.oneway.length - 1]?.point_latitude,
        point_longitude:
          route_points.oneway?.[route_points.oneway.length - 1]
            ?.point_longitude,
      },
      outbound_datetime: {
        departure_datetime: plannedDepartureTime
          ? convertDateToISOString(plannedDepartureTime)
          : "",
        tz: country?.value.timezone || "Europe/Oslo",
      },
    };

    const plannedReturnDepartureTime =
      route_points?.return[0]?.planned_departure_time;
    const returnInfo =
      trip.value.trip_type === TRIP_TYPE.ROUND
        ? {
            return_from: {
              place: route_points?.return[0]?.point,
              point_latitude: route_points?.return[0]?.point_latitude,
              point_longitude: route_points?.return[0]?.point_longitude,
            },
            return_to: {
              place:
                route_points?.return?.[route_points?.return.length - 1].point,
              point_latitude:
                route_points?.return?.[route_points?.return.length - 1]
                  ?.point_latitude,
              point_longitude:
                route_points?.return?.[route_points?.return.length - 1]
                  .point_longitude,
            },
            bus_availability: trip.value.bus_availability,
            return_datetime: {
              departure_datetime: plannedReturnDepartureTime
                ? convertDateToISOString(plannedReturnDepartureTime)
                : "",
              tz: country?.value.timezone || "Europe/Oslo",
            },
          }
        : {};

    // Format route points using common utility
    const formattedRoutePoints = formatRoutePointsForAPI(route_points);

    let queryPayload = {
      country: country?.value.countryISO,
      ...departureInfo,
      ...returnInfo,
      route_points: JSON.stringify(formattedRoutePoints),
    };

    busPriceApiResponse.isLoading = true;
    hasBusPriceError.value = false;

    busInfoStore
      .fetchBusInfoData(queryPayload)
      .then((res) => {
        busPriceApiResponse.isLoading = false;

        if (res && typeof res === "object" && "data" in res) {
          const data = (res as any).data;
          if (data?.getBusPrice) {
            busPrice.value = data.getBusPrice.total || 0;
            hasBusPriceError.value = false;
          } else {
            hasBusPriceError.value = true;
            console.error("No bus price data received");
          }
        } else {
          hasBusPriceError.value = true;
          console.error("Invalid response format");
        }
      })
      .catch((error) => {
        console.error("Error in fetchBusPrice:", error);
        hasBusPriceError.value = true;
        busPriceApiResponse.isLoading = false;
        throw error;
      });
  }
};

// Get sales history for persisted changes
const salesHistory = computed(() => {
  const history = salesStore.$state.salesEditTrip[route.params.tag as string];
  return history;
});

// Safe parsing of route points with try-catch
const parsedRoutePoints = computed(() => {
  try {
    // First check if there are persisted itinerary changes in sales store
    if (
      salesHistory.value &&
      salesHistory.value.update_history?.trip_location_time &&
      (salesHistory.value.trip_location_time as TripLocationTime)?.route_points
    ) {
      // Return the persisted route points directly (they're already parsed)
      return (salesHistory.value.trip_location_time as TripLocationTime)
        .route_points;
    }

    // Otherwise use the original trip data
    if (!trip.value.route_points) {
      return { oneway: [], return: [] };
    }
    return JSON.parse(trip.value.route_points);
  } catch (error) {
    console.error("Error parsing route_points:", error);
    return { oneway: [], return: [] };
  }
});

// Computed property for trip ticket pricing with persisted changes
const tripTicketPricing = computed(() => {
  const routePointLength = parsedRoutePoints.value.oneway.length - 1;
  const originalTripPricing = trip.value.ticket_pricing;
  const originalPricingPointsLength =
    originalTripPricing?.via_points?.length || 0;

  // Helper function to map route points with pricing
  const mapRoutePointsWithPricing = (
    routePoints: Array<{ id: number }>,
    priceViaPoints: Array<{
      id: number;
      category_prices: Array<{ name: string; price: number }>;
    }>,
    categories: Array<{ name: string; enabled: boolean }>
  ) => {
    const newViaPoints: Array<{
      id: number;
      category_prices: Array<{ name: string; price: number }>;
    }> = [];

    // Create via points following the route sequence (skip origin at index 0)
    for (let i = 0; i < routePointLength; i++) {
      const routePoint = routePoints[i];
      if (!routePoint) continue;

      // Find existing via_point with matching ID
      const existingViaPoint = priceViaPoints.find(
        (vp) => vp.id == routePoint.id
      );

      if (existingViaPoint) {
        // Keep existing pricing data, update point name if needed
        newViaPoints.push({
          id: routePoint.id,
          category_prices: existingViaPoint.category_prices,
        });
      } else {
        // New route point - inherit prices from the immediate previous route point
        const previousViaPoint = newViaPoints[newViaPoints.length - 1];
        const defaultCategoryPrices = previousViaPoint
          ? previousViaPoint.category_prices.map((categoryPrice) => ({
              name: categoryPrice.name,
              price: categoryPrice.price, // Inherit price from previous route point
            }))
          : categories.map((category) => ({
              name: category.name,
              price: 0, // Default to 0 only if no previous point exists
            }));

        newViaPoints.push({
          id: routePoint.id,
          category_prices: defaultCategoryPrices,
        });
      }
    }

    return newViaPoints;
  };

  // Check if there are persisted pricing changes in sales store
  if (
    salesHistory.value &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (salesHistory.value.trip_ticket_pricing as any)?.ticket_pricing
  ) {
    const salesHistoryTicketPricing =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (salesHistory.value.trip_ticket_pricing as any).ticket_pricing;

    const ticketPricingPointsLength =
      salesHistoryTicketPricing.via_points?.length || 0;

    // If route points and pricing points match, return as-is
    if (routePointLength === ticketPricingPointsLength) {
      return salesHistoryTicketPricing;
    } else {
      // Route points have been added/removed, need to map pricing to new structure
      const remoteTripPricing = trip.value.ticket_pricing;
      const newTicketPricing = {
        ...salesHistoryTicketPricing,
        via_points: mapRoutePointsWithPricing(
          parsedRoutePoints.value.oneway,
          salesHistoryTicketPricing.via_points ||
            remoteTripPricing?.via_points ||
            [],
          salesHistoryTicketPricing.categories ||
            remoteTripPricing?.categories ||
            []
        ),
      };

      return newTicketPricing;
    }
  } else if (routePointLength !== originalPricingPointsLength) {
    // If route structure has changed, we need to map the original pricing to new structure
    return {
      ...originalTripPricing,
      via_points: mapRoutePointsWithPricing(
        parsedRoutePoints.value.oneway,
        originalTripPricing?.via_points || [],
        originalTripPricing?.categories || []
      ),
    };
  }

  // Otherwise use the original trip ticket pricing
  return JSON.parse(
    JSON.stringify(trip.value.ticket_pricing || {})
  ) as TicketPricing;
});

onMounted(() => {
  // Load trip data if not already loaded
  if (!trip.value.id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (tripStore as any).getTrip(route.params.tag as string, fetchBusPrice);
  } else {
    // Fetch bus price when trip is already loaded
    fetchBusPrice();
  }

  // Initialize form validity state after component is mounted
  nextTick(() => {
    if (itineraryPricingTableRef.value) {
      isPriceTableValid.value =
        itineraryPricingTableRef.value.isPriceTableValid.value;
    }
  });
});

// Watch for changes in the child component's form validity
watch(
  () => itineraryPricingTableRef.value?.isPriceTableValid.value,
  (newValue) => {
    if (newValue !== undefined) {
      isPriceTableValid.value = newValue;
    }
  },
  { immediate: true }
);

// Watch for changes in passengerGoalCalculable to update the store
watch(
  () => [passengerGoalCalculable.value],
  (values) => {
    if (
      isInRange(
        PASSENGER_GOAL.value.MIN,
        Math.min(busCapacity.value, 999),
        values[0] as number
      )
    ) {
      passengerGoal.value = values[0] as number;
    }
  },
  {
    deep: true,
  }
);

watch(
  () => trip.value,
  () => {
    // Sync with sales edit data first, then fallback to trip values

    // Bus capacity - check sales edit data first
    if (salesHistory.value?.[SalesEditGroup.MAX_PAX]?.max_pax !== undefined) {
      busCapacity.value = salesHistory.value[SalesEditGroup.MAX_PAX].max_pax;
    } else {
      busCapacity.value = trip.value.max_pax || 0;
    }

    // Passenger goal - check sales edit data first
    if (
      (salesHistory.value?.[SalesEditGroup.PASSENGER_GOAL] as TripGoal)
        ?.passenger_goal !== undefined
    ) {
      passengerGoal.value = (
        salesHistory.value[SalesEditGroup.PASSENGER_GOAL] as TripGoal
      ).passenger_goal;
    } else {
      passengerGoal.value =
        trip.value.passenger_goal || Math.min(busCapacity.value, 999);
    }

    // Show available seats - check sales edit data first
    if (salesHistory.value?.show_available_seats !== undefined) {
      show_available_seats.value = !!salesHistory.value.show_available_seats;
    } else {
      show_available_seats.value = !!trip.value.show_available_seats;
    }
  },
  { immediate: true, deep: true }
);

// Watch for ticket price changes
watch(
  () => [busPrice.value, passengerGoal.value],
  ([busPrice, passengerGoal]) => {
    const data = {
      bus_price: busPrice,
      passenger_goal: passengerGoal,
      discount_scheme: "NONE",
    };

    const jsonLogicCalculatedNone = getNoDiscountPriceInfo(data);

    ticketPrice.value = jsonLogicCalculatedNone || 0;
  },
  {
    immediate: true,
    deep: true,
  }
);

const handlePricingUpdate = () => {
  // When pricing data changes (category toggle, rename, or price changes),
  // we should validate the form and enable the save button if valid
  // Trigger validation to update the form validity state
  nextTick(() => {
    if (itineraryPricingTableRef.value) {
      const isValid = itineraryPricingTableRef.value.validateFields();
      isPriceTableValid.value = isValid;
    }
  });
};

// Methods to get updated data from ItineraryPricingTable child component
const getUpdatedPricingData = () => {
  if (itineraryPricingTableRef.value) {
    const updatedData = itineraryPricingTableRef.value.getUpdatedPricingData();
    return updatedData;
  }
  return null;
};

const validatePricingData = () => {
  if (itineraryPricingTableRef.value) {
    const isValid = itineraryPricingTableRef.value.validateFields();
    return isValid;
  }
  return false;
};

const checkIfChangedWithKey = (key, value) => {
  if (trip.value[key] !== undefined) {
    // Check if the key exists in the trip object and has changed
    try {
      if (key === "ticket_pricing") {
        const rawTripValue = deleteTypeNameKeyRecursively(trip.value[key]);
        const rawNewValue = deleteTypeNameKeyRecursively(value);
        // Compare the raw values after removing type names
        return JSON.stringify(rawNewValue) !== JSON.stringify(rawTripValue);
      } else {
        return JSON.stringify(value) !== JSON.stringify(trip.value[key]);
      }
    } catch (error) {
      console.warn(`Error comparing values for key ${key}:`, error);
      // Fallback to simple equality check if JSON.stringify fails
      return value !== trip.value[key];
    }
  }
  return false;
};

const returnChangedObj = () => {
  const changeableKeysWithValue = [
    {
      key: SalesEditGroup.TRIP_TICKET_PRICING,
      value: getUpdatedPricingData(),
      actualKey: "ticket_pricing",
    },
    {
      key: SalesEditGroup.MAX_PAX,
      value: busCapacity.value,
      actualKey: "max_pax",
    },
    {
      key: SalesEditGroup.PASSENGER_GOAL,
      value: passengerGoal.value,
      actualKey: "passenger_goal",
    },
    {
      key: SalesEditGroup.SHOW_TRIP_AVAILABLE_SEATS,
      value: show_available_seats.value,
      actualKey: "show_available_seats",
    },
  ];
  const changedObj: { [key: string]: unknown } = {};
  for (const { key, value, actualKey } of changeableKeysWithValue) {
    const isChanged = checkIfChangedWithKey(actualKey, value);

    if (isChanged) {
      if (actualKey) {
        // If actualKey is provided, use it to structure the object
        changedObj[key] = {
          [actualKey]: value,
        };
      } else {
        changedObj[key] = value;
      }
    }
  }
  return { changedObj };
};

const handleSaveChanges = async (value) => {
  if (value) {
    // Validate pricing data before saving
    if (!validatePricingData()) {
      // You might want to show a toast or alert here
      return;
    }

    try {
      // Get the updated pricing data
      const { changedObj } = returnChangedObj();
      if (Object.keys(changedObj).length === 0) {
        console.log("No changes detected, navigating back.");
        // No changes to save, just navigate back
        salesStore.$state.editing_mode = true;
        routePushTagQuery("trip-sales-page", trip.value.id, { tabindex: 1 });
        return;
      } else {
        for (const [key, value] of Object.entries(changedObj)) {
          console.log(`Changed ${key}:`, value);
          salesStore.setSalesConsoleTripChangeRequest({
            [key]: value,
            trip_id: trip.value.id,
          });
        }
      }

      // Enable edit mode before navigating back to maintain editing state
      salesStore.$state.editing_mode = true;

      // Navigate back to trip sales page
      routePushTagQuery("trip-sales-page", trip.value.id, { tabindex: 1 });
    } catch (error) {
      console.error("Failed to save pricing data:", error);
      // Handle error - show toast/alert
    }
  } else {
    salesStore.$state.editing_mode = true;
    // Cancel changes - go back to previous route
    router.back();
  }
};
</script>

<style scoped>
.w-90 {
  width: 90%;
}
</style>
