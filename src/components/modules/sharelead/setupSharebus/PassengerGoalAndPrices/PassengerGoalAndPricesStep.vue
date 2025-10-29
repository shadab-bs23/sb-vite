<template>
  <div class="passenger-goal-container text-start overflow-hidden">
    <h3 class="mb-5 fs-32 font-600">
      {{ t("setup.passenger_goal_and_prices") }}
    </h3>
    <!-- Bus Capacity Component -->
    <BusCapacity
      v-model:busCapacity="busCapacity"
      :busCapacityLimits="GET_BUS_CAPACITY_LIMIT"
      @validationChange="handleBusCapacityValidation"
    />

    <!-- Passenger Goal Slider Component -->
    <PassengerGoalSlider
      v-model:passengerGoal="passengerGoal"
      v-model:show-available-seats="show_available_seats"
      :busCapacity="busCapacity"
      :is-show-available-seats="show_available_seats"
      :passengerGoalLimits="PASSENGER_GOAL"
      :deadline-date="departureDate || undefined"
      @validationChange="handlePassengerGoalValidation"
    />

    <!-- Remaining Seats Toggle Component -->

    <!-- Ticket Price Display Component -->
    <TicketPriceDisplay :ticketPrice="ticketPrice" />

    <!-- Pickup Point Pricing Component -->
    <div class="mt-4">
      <PickupPointPricing ref="pickupPricing" />
    </div>

    <!-- Discount Manager Component -->
    <div class="mt-5">
      <DiscountManager
        ref="discountManager"
        @update:ticketDiscounts="updateTicketDiscounts"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useSharebusStore, useBusInfoStore } from "@/store";
import {
  RouteStepData,
  PassengerGoalAndPriceStepData,
  TicketDiscount,
} from "@/store/sharebus/types";
import { convertDateToISOString, deepClone } from "@/utils";
import { getNoDiscountPriceInfo } from "../service/executeJSONLogic";
import ShareBusSetUpController from "../Controllers/ShareBusSetUpController";

// Components
import BusCapacity from "./components/BusCapacity.vue";
import PassengerGoalSlider from "./components/PassengerGoalSlider.vue";
import TicketPriceDisplay from "./components/TicketPriceDisplay.vue";
import PickupPointPricing from "../PickupPointPricing/PickupPointPricing.vue";
import DiscountManager from "../TicketDiscount/DiscountManager.vue";

const emit = defineEmits(["validation-change"]);

const { t } = useI18n();
const sharebus = useSharebusStore();
const busInfoStore = useBusInfoStore();

// Create interface for the exposed methods from PickupPointPricing
interface PickupPriceComponentMethods {
  getPickupPriceData: () => {
    priceData: PickupPoint[];
    priceDataWithActiveStatus: Array<{
      location: string;
      departureTime: Date | string;
      pointId: number;
      prices: {
        categoryOne: string;
        categoryTwo: {
          value: string;
          active: boolean;
        };
        categoryThree: {
          value: string;
          active: boolean;
        };
      };
    }>;
    categoryActiveStatus: {
      categoryOne: boolean;
      categoryTwo: boolean;
      categoryThree: boolean;
    };
    categoryLabels: {
      categoryOne: string;
      categoryTwo: string;
      categoryThree: string;
    };
    isValid: boolean;
  };
  validateFields: (showErrors?: boolean) => Promise<boolean>;
  getTicketPricingPayload: () => {
    categories: Record<string, boolean>;
    via_points: Record<string, { category_prices: Record<string, number> }>;
  };
  updateStoreWithApiPayload: () => void;
}

// Create interface for the exposed methods from DiscountManager
interface DiscountManagerHandler {
  getDiscountPayload: () => Record<string, { value: number }>;
}

// Reference to the PickupPointPricing component
const pickupPricing = ref<PickupPriceComponentMethods | null>(null);

// Reference to the DiscountManager component
const discountManager = ref<DiscountManagerHandler | null>(null);

const setUpInfo1 = computed<RouteStepData>(() => {
  return sharebus.getRouteStepData;
});

const setUpInfo3 = computed<PassengerGoalAndPriceStepData>(() => {
  return sharebus.getPassengerGoalAndPriceStepData;
});

const show_available_seats = ref(false);
const busCapacity = ref(50);
const invalidBusCapacityErr = ref(false);
const invalidSeatCountErr = ref(false);
const watchingTicketPriceChange = ref();

// Constants from ShareBusSetUpController
const PASSENGER_GOAL = computed(
  () => ShareBusSetUpController.getPassengerGoalLimit.value
);
const GET_BUS_CAPACITY_LIMIT = computed(
  () => ShareBusSetUpController.getBusCapacityLimit.value
);

// Setup reactive variables with initial values
// The actual value will be set in onMounted based on store or API default
const passengerGoal = ref<number>(0);
const passengerGoalCalculable = ref<number>(0);
const busInfo = computed(() => {
  return busInfoStore.getBusInfoData;
});

const tickets = computed(
  () => sharebus.getPassengerGoalAndPriceStepData.tickets as number
);

// Add computed property for ticket price
const ticketPrice = computed(() => {
  return setUpInfo3.value.ticketPrice || 0;
});

// Get the departure date from route step data
const departureDate = computed(() => {
  if (setUpInfo1.value?.route_points?.oneway?.length > 0) {
    const firstPoint = setUpInfo1.value.route_points.oneway[0];
    if (firstPoint.planned_departure_time) {
      return new Date(firstPoint.planned_departure_time);
    }
  }
  return null;
});

// Handle validation state from child components
const handleBusCapacityValidation = (hasError: boolean) => {
  invalidBusCapacityErr.value = hasError;
  validateBeforeNextStep();
};

const handlePassengerGoalValidation = (hasError: boolean) => {
  invalidSeatCountErr.value = hasError;
  validateBeforeNextStep();
};

// Helper function to check if a value is in range
const isInRange = (min: number, max: number, value: number) => {
  return min <= value && value <= max;
};

// Define a simplified, consistent validation method
const validateBeforeNextStep = async (showErrors = false) => {
  // Check pickup point pricing validation
  let isPriceDataValid = false;

  if (pickupPricing.value) {
    isPriceDataValid = await pickupPricing.value.validateFields(showErrors);
  }
  // Validate passenger goal is in valid range
  // Default to true if passengerGoal is not yet initialized
  const passengerGoalValue = passengerGoal.value || 0;
  const isPassengerGoalValid = isInRange(
    PASSENGER_GOAL.value.MIN,
    Math.min(busCapacity.value, 999),
    passengerGoalValue
  );

  if (!isPassengerGoalValid && passengerGoalValue > 0) {
    console.warn("Passenger goal validation failed:", passengerGoalValue);
  }

  const isValid =
    !invalidSeatCountErr.value &&
    !invalidBusCapacityErr.value &&
    isPassengerGoalValid &&
    isPriceDataValid; // Include price data validation

  // Single consistent event for validation state changes
  emit("validation-change", { step: 2, isValid });

  return isValid;
};

// Watch for changes in passengerGoalCalculable to update the store
watch(
  () => [passengerGoalCalculable.value, tickets.value],
  (values) => {
    if (
      isInRange(
        PASSENGER_GOAL.value.MIN,
        Math.min(busCapacity.value, 999),
        values[0] as number
      )
    ) {
      passengerGoal.value = values[0] as number;
      watchingTicketPriceChange.value = {
        ...watchingTicketPriceChange.value,
        passengerGoal: values[0],
      };
    }
  },
  {
    deep: true,
  }
);

// Watch for discount scheme changes
watch(
  () => setUpInfo3.value.discountScheme,
  (value) => {
    watchingTicketPriceChange.value = {
      ...watchingTicketPriceChange.value,
      discountScheme: value,
    };
  },
  { immediate: true, deep: true }
);

// Watch for ticket price changes
watch(
  () => watchingTicketPriceChange.value,
  (value) => {
    if (value) {
      let busPrice = busInfo.value
        ? busInfo.value.total
        : busInfoStore.busData.total;
      const data = {
        bus_price: busPrice,
        passenger_goal:
          (setUpInfo3.value.passengerGoal as number) ||
          Math.min(busCapacity.value, 999),
        discount_scheme: "NONE",
      };

      const jsonLogicCalculatedNone = getNoDiscountPriceInfo(data);

      sharebus.setPassengerGoalAndPriceStepDataSpecific(
        "ticketPrice",
        jsonLogicCalculatedNone || 0
      );

      // Add other price calculations from the original component as needed
    }
  },
  {
    immediate: true,
  }
);

// For PickupPointPricing component
interface Price {
  categoryOne: string;
  categoryTwo: string;
  categoryThree: string;
}

interface PickupPoint {
  location: string;
  departureTime: Date | string;
  prices: Price;
  id: number; // Use id directly instead of pointId
}

// Initialize pickupPoints ref
const pickupPoints = ref<PickupPoint[]>([]);

// For discount management
const updateTicketDiscounts = (ticketDiscounts: TicketDiscount[]) => {
  // Update store with ticket discounts
  sharebus.setPassengerGoalAndPriceStepDataSpecific(
    "ticket_discounts",
    deepClone(ticketDiscounts)
  );
};

watch(
  () => show_available_seats.value,
  (value) => {
    sharebus.setPassengerGoalAndPriceStepDataSpecific(
      "show_available_seats",
      value
    );
  }
);

watch(
  () => busCapacity.value,
  (value) => {
    sharebus.setPassengerGoalAndPriceStepDataSpecific("max_pax", value);
  }
);

watch(
  () => passengerGoal.value,
  (value) => {
    sharebus.setPassengerGoalAndPriceStepDataSpecific("passengerGoal", value);
  }
);

// Initialize component data
onMounted(() => {
  const getPassengerGoalAndPriceStepData: PassengerGoalAndPriceStepData =
    sharebus.getPassengerGoalAndPriceStepData;

  show_available_seats.value =
    getPassengerGoalAndPriceStepData.show_available_seats;

  passengerGoal.value =
    getPassengerGoalAndPriceStepData.passengerGoal as number;

  // Initialize validation
  validateBeforeNextStep();

  // Initialize pickup points data from route points if available
  if (setUpInfo1.value?.route_points?.oneway?.length > 0) {
    // Check if there's existing ticket pricing data in the store first
    const existingTicketPricing =
      sharebus.getPassengerGoalAndPriceStepData.ticket_pricing;

    if (
      existingTicketPricing?.via_points &&
      Object.keys(existingTicketPricing.via_points).length > 0
    ) {
      // If we have existing data in the store, don't overwrite it
    } else {
      // Only initialize empty prices if we don't have any in the store
      pickupPoints.value = setUpInfo1.value.route_points.oneway.map((point) => {
        return {
          location: point.point || "",
          departureTime:
            point.planned_departure_time || convertDateToISOString(new Date()),
          id: point.id, // Use id directly
          prices: { categoryOne: "", categoryTwo: "", categoryThree: "" },
        };
      });

      // Initialize the ticket_pricing structure in the store
      if (pickupPoints.value.length > 0) {
        // Initialize empty via_points structure as an array (matching TicketPricing type)
        const initialViaPoints = pickupPoints.value.map((point) => ({
          id: point.id, // Use id directly
          category_prices: [
            { name: "Adult", price: 0 },
            { name: "Child", price: 0 },
            { name: "Senior", price: 0 },
          ],
        }));

        // Update the store with initial ticket_pricing structure
        sharebus.setPassengerGoalAndPriceStepDataSpecific("ticket_pricing", {
          categories: [
            { name: "Adult", enabled: true },
            { name: "Child", enabled: true },
            { name: "Senior", enabled: false },
          ],
          via_points: initialViaPoints,
        });
      }
    }
  }
});

// Watch for PickupPointPricing validation
watch(
  pickupPricing,
  () => {
    // Check validation whenever the component reference is available
    if (pickupPricing.value) {
      validateBeforeNextStep();
    }
  },
  { immediate: true, deep: true }
);

// Watch for passengerGoal changes to update the store
watch(
  () => passengerGoal.value,
  (newValue) => {
    if (newValue !== undefined && passengerGoalCalculable.value !== newValue) {
      passengerGoalCalculable.value = newValue;
      sharebus.setPassengerGoalAndPriceStepDataSpecific(
        "passengerGoal",
        newValue
      );
    }
  }
);

// Watch for store changes to update local passengerGoal
watch(
  () => sharebus.getPassengerGoalAndPriceStepData.passengerGoal,
  (newValue) => {
    if (
      newValue !== undefined &&
      newValue > 0 &&
      passengerGoal.value !== newValue
    ) {
      passengerGoal.value = newValue;
    }
  }
);

// Watch for changes in the API's default passenger goal
watch(
  () => PASSENGER_GOAL.value,
  (newPassengerGoalLimits) => {
    if (newPassengerGoalLimits && newPassengerGoalLimits.DEFAULT > 0) {
      // Only update if we don't have a value yet
      if (passengerGoal.value === 0) {
        passengerGoal.value = newPassengerGoalLimits.DEFAULT;
        passengerGoalCalculable.value = newPassengerGoalLimits.DEFAULT;

        // Save to store
        sharebus.setPassengerGoalAndPriceStepDataSpecific(
          "passengerGoal",
          newPassengerGoalLimits.DEFAULT
        );
      }
    }
  },
  { immediate: true, deep: true }
);
// Generate the complete API payload
const generateApiPayload = () => {
  const payload: {
    suggested_ticket_price: number;
    ticket_pricing: {
      categories: Record<string, boolean>;
      via_points: Record<string, { category_prices: Record<string, number> }>;
    };
    discounts: Record<string, { value: number }>;
  } = {
    suggested_ticket_price: ticketPrice.value || 0,
    ticket_pricing: {
      categories: {},
      via_points: {},
    },
    discounts: {},
  };

  // Get ticket pricing from PickupPointPricing component
  if (pickupPricing.value) {
    const ticketPricingData = pickupPricing.value.getTicketPricingPayload();
    payload.ticket_pricing = ticketPricingData;

    // Update the store with the new API payload structure
    pickupPricing.value.updateStoreWithApiPayload();
  }

  // Get discounts from DiscountManager component
  if (discountManager.value) {
    payload.discounts = discountManager.value.getDiscountPayload();

    // Update the store with discounts
    sharebus.updateDiscounts(payload.discounts);
  }

  // Update suggested ticket price in store
  sharebus.setPassengerGoalAndPriceStepDataSpecific(
    "suggested_ticket_price",
    payload.suggested_ticket_price
  );

  return payload;
};

// Expose validation method and payload generation for parent component
defineExpose({
  validateBeforeNextStep,
  generateApiPayload,
});
</script>

<style lang="scss" scoped>
.passenger-goal-container {
  padding: 20px;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  h3.display-6 {
    font-size: 1.75rem;
  }

  h4 {
    font-size: 1.25rem;
  }
}

@media (max-width: 768px) {
  .passenger-goal-container {
    padding: 15px;
  }

  h3.display-6 {
    font-size: 1.5rem;
  }
}

@media (max-width: 576px) {
  .passenger-goal-container {
    padding: 10px;
  }

  h4,
  h5 {
    font-size: 1.1rem;
  }

  .form-control,
  .form-select {
    font-size: 0.9rem;
    padding: 0.25rem 0.5rem;
  }
}
</style>
