<template>
  <div class="booking-step-1 row">
    <div class="col-12 col-lg-6">
      <TripInfo
        :trip-id="currentTrip.id"
        :trip-data="tripInfoData"
        :route-data="routePoints"
      />
    </div>
    <div class="col-12 col-lg-6">
      <!-- Step 1: Pickup Point Selection -->
      <div class="pickup-selection-step">
        <div class="text-start">
          <h2 class="font-bold ship-gray fs-24 mb-3 text-start">
            {{ t("sharebus.checkout.select_tickets") }}
          </h2>
          <p>{{ t("sharebus.checkout.departure") }}: {{ departureDateTime }}</p>
        </div>
        <PickupPointingSelector
          :pickup-points="routePoints.oneway"
          @pickup-point-selected="onPickupPointSelected"
        />
        <ReturnInfo
          :is-round-trip="isRoundTrip"
          :selected-pickup-point-id="selectedPickupPointId"
          :outbound-route-points="routePoints.oneway"
          :return-route-points="routePoints.return"
        />

        <!-- Ticket Selection  -->
        <div v-if="selectedPickupPoint" class="ticket-selection-step">
          <TicketSelector
            :selected-pickup-point="selectedPickupPoint"
            :destination-point="destinationPoint"
            :route-points="routePoints.oneway"
            :return-route="routePoints.return"
            :departure-date="
              routePoints.oneway[0]?.planned_departure_time as string
            "
            :ticket-pricing="currentTrip.ticket_pricing"
            :ticket-discounts="currentTrip.ticket_discounts"
            :available-seats="currentTrip.available_regular_tickets"
            :show-available-seats="!!currentTrip.show_available_seats"
            @cart-updated="onCartUpdated"
            @add-embark-point="onAddEmbarkPoint"
          />
        </div>

        <!-- Booking Cart -->
        <div v-if="cartItems.length > 0" class="mt-4">
          <BookingCart
            :cart-items="cartItems"
            :selected-pickup-point="selectedPickupPoint"
            :destination-point="destinationPoint"
            :is-round-trip="isRoundTrip"
            @ticket-removed="onTicketRemoved"
          />
        </div>

        <!-- Misc info and Buttons -->
        <div class="d-flex flex-column flex-md-row gap-2 justify-content-end">
          <!-- Get in touch button -->
          <div class="order-2 order-md-1">
            <a :href="supportPageUrl" target="_blank" rel="noopener noreferrer">
              <button class="sb-btn-secondary sb-btn-lg rounded-pill px-3 my-2">
                <span class="me-2">{{ t("common.get_in_touch") }}</span>
                <i class="fi fi-box-arrow-up-right green-jewel fs-6"></i>
              </button>
            </a>
          </div>

          <!-- Continue button -->
          <div class="order-1 order-md-2">
            <button
              class="btn-primary sb-btn-lg rounded-pill px-3 my-2"
              @click="handleContinueToCheckout"
            >
              <span class="me-2">{{
                t("sharebus.checkout.continue_to_checkout")
              }}</span>
            </button>
          </div>
        </div>
        <div class="my-4">
          <template
            v-if="
              !!currentTrip.show_available_seats ||
              currentTrip.trip_status === TRIP_STATUS.CONFIRMED
            "
          >
            <TripBookingStatus
              :tickets-count="ticketsCount"
              :trip-info="currentTrip"
            />
          </template>
          <div class="d-flex flex-column gap-3">
            <TripMiscInfo
              :trip-info="currentTrip"
              :tickets-count="ticketsCount"
            />
          </div>
        </div>
      </div>
      <!-- <pre>selectedPickupPoint : {{ selectedPickupPoint }}</pre> -->
      <!-- Step 2: Ticket Selection -->
    </div>
  </div>
</template>

<script setup lang="ts">
import PickupPointingSelector from "./PickupPointingSelector.vue";
import ReturnInfo from "./ReturnInfo.vue";
import TicketSelector from "./TicketSelector.vue";
import BookingCart from "./BookingCart.vue";
import { computed, defineEmits, onMounted, ref, watchEffect } from "vue";
import {
  RoutePoints,
  TViaPoints,
} from "@/components/ViaPointsPackage/types/types";
import { useCompanyTimeFormat } from "@/composables/useCompanyTimeFormat";
import TripInfo from "../../sharelead/setupSharebus/TripInfo/TripInfo.vue";
import { useJoinerTripStore, useCartStore } from "@/store";
import { useI18n } from "vue-i18n";
import TripMiscInfo from "./TripMiscInfo.vue";
import TripBookingStatus from "../../sharelead/trip/tripStatus/TripBookingStatus.vue";
import { TRIP_STATUS } from "../../sharelead/trip/tripStatus/tripStatusEnum";
interface TicketBookingStepOneProps {
  routePoints: RoutePoints;
  supportPageUrl: string;
  isRoundTrip: boolean;
}

const props = defineProps<TicketBookingStepOneProps>();
const { t } = useI18n();

const emit = defineEmits(["continue-checkout"]);
const joinerTripStore = useJoinerTripStore();

const cartStore = useCartStore();
const currentTrip = computed(() => {
  return joinerTripStore.getCurrentTrip;
});

// Ensure trip ID is set in cart store when current trip becomes available
watchEffect(() => {
  if (currentTrip.value?.id && !cartStore.tripId) {
    cartStore.setTripId(currentTrip.value.id);
    console.log("Set trip ID in cart store:", currentTrip.value.id);
  }
});

// Restore selected pickup point from persisted cart store when route points are available
watchEffect(() => {
  // Only run when we have both cart data and route points
  if (
    cartStore.selectedViaPointId &&
    props.routePoints.oneway &&
    props.routePoints.oneway.length > 0 &&
    !selectedPickupPoint.value // Don't override if already selected
  ) {
    // Find the pickup point from route points that matches the persisted ID
    const persistedPoint = props.routePoints.oneway.find(
      (point) => point.id === cartStore.selectedViaPointId
    );

    console.log("Restoring pickup point:", {
      persistedViaPointId: cartStore.selectedViaPointId,
      foundPoint: persistedPoint,
      routePointsCount: props.routePoints.oneway.length,
    });

    if (persistedPoint) {
      selectedPickupPointId.value = persistedPoint.id;
      selectedPickupPoint.value = persistedPoint;
    }
  }
});

const tripInfoData = computed(() => {
  return {
    name: currentTrip.value.name,
    category: currentTrip.value.category,
    image_url: currentTrip.value.image_url,
    website_url: currentTrip.value.website_url,
    info_to_travellers: currentTrip.value.info_to_travellers,
    trip_organizer: currentTrip.value.trip_organizer,
    // Add other relevant trip data fields here
  };
});

const formatAsCompanyTime = useCompanyTimeFormat();
const selectedPickupPointId = ref<number | null>(null);
const selectedPickupPoint = ref<TViaPoints | null>(null);

// Cart data state - use store instead of local state
const cartItems = computed(() => {
  return cartStore.getTickets();
});

// Calculate total ticket count from cart items
const ticketsCount = computed(() => {
  return cartItems.value.reduce((total, item) => total + item.quantity, 0);
});

// Get destination point (last point in the route)
const destinationPoint = computed(() => {
  const points = props.routePoints.oneway;
  return points.length > 0 ? points[points.length - 1] : null;
});

function onPickupPointSelected(pointId: number) {
  selectedPickupPointId.value = pointId;

  const selectedPoint = props.routePoints.oneway.find(
    (point) => point.id === pointId
  );

  if (selectedPoint) {
    selectedPickupPoint.value = selectedPoint;
    cartStore.setSelectedViaPointId(pointId);
    if (currentTrip.value?.id) {
      cartStore.setTripId(currentTrip.value.id);
    }
  }
}

function onAddEmbarkPoint() {
  // Reset to pickup selection step but keep cart data
  // This allows users to add multiple embark points to their cart
}

function onCartUpdated(cartData: {
  tickets: Array<{
    categoryName: string;
    quantity: number;
    price: number;
  }>;
  eligibleDiscountPercent: number;
}) {
  // Clear only tickets and reset discount, but preserve trip and via point IDs
  cartStore.tickets = [];
  cartStore.totalPayablePrice = 0;
  cartStore.eligibleDiscountPercent = 0;

  // Add each ticket to cart
  cartData.tickets.forEach((ticket) => {
    if (ticket.quantity > 0) {
      cartStore.addTicket(ticket);
    }
  });

  // Set eligible discount
  cartStore.setEligibleDiscount(cartData.eligibleDiscountPercent);
}

// Handle ticket removal from cart
function onTicketRemoved(categoryName: string) {
  cartStore.removeTicket(categoryName);
}

function handleContinueToCheckout() {
  emit("continue-checkout");
}

const departureDateTime = computed(() => {
  const dateTime =
    props.routePoints.oneway[0]?.actual_departure_time ||
    props.routePoints.oneway[0]?.planned_departure_time;
  // format the datetime before return as like Friday, 24.03.23
  return dateTime ? formatAsCompanyTime(dateTime, "EEEE, dd.MM.yyyy") : null;
});

// sync selected pickup point from cart store in onmount if any available
onMounted(() => {
  if (cartStore.selectedViaPointId && props.routePoints.oneway) {
    const selectedPoint = props.routePoints.oneway.find(
      (point) => point.id === cartStore.selectedViaPointId
    );
    if (selectedPoint) {
      selectedPickupPointId.value = selectedPoint.id;
      selectedPickupPoint.value = selectedPoint;
    }
  }
});
</script>

<style scoped>
.booking-step-1 {
  min-height: 500px;
}
</style>
