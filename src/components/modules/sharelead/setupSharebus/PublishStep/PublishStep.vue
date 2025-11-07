<template>
  <div class="publish-step-container">
    <h3 class="mb-4 display-6 font-bold text-start">
      {{ t("setup.publish") }}
    </h3>
    <div class="row">
      <TripSummarySection
        :route-points="routePoints"
        :ticket-pricing="ticketPricing"
        :departure-date="routePoints.oneway[0]?.planned_departure_time || ''"
        :show-edit-buttons="false"
        :next-itinerary-route="''"
        :next-ticket-prices-route="''"
        :booking-reference="currenttrip.booking_reference"
        :discount-tiers="discountTiers"
        :trip-info-data="tripData"
        :trip-id="currenttrip.id"
        :discount-header="t('discount.discounts')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSharebusStore, useTripStore } from "@/store";
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import TripSummarySection from "@/components/common/TripSummarySection/TripSummarySection.vue";
// Discount tiers for summary section
import { computed as vueComputed } from "vue";
import TripController from "../../controllers/TripController";
const discountTiers = vueComputed(
  () => sharebus.getPassengerGoalAndPriceStepData.ticket_discounts || []
);

const emit = defineEmits(["validation-change", "request-next-step"]);

const { t } = useI18n();
const sharebus = useSharebusStore();
const tripStore = useTripStore();
const currenttrip = computed(() => tripStore.currentTrip);

// Computed properties for itinerary display
const routePoints = computed(() => sharebus.getRouteStepData.route_points);

// Safe computed property for ticket pricing
const ticketPricing = computed(() => {
  return (
    sharebus.getPassengerGoalAndPriceStepData.ticket_pricing || {
      categories: [],
      via_points: [],
    }
  );
});

// Computed properties for trip data and route data
const tripData = computed(() => sharebus.getTripInfoData);
const routeData = computed(() => {
  const routeStepData = sharebus.getRouteStepData;
  return routeStepData?.route_points || { oneway: [], return: [] };
});

const tripControllerStore = TripController.getShareleadTripStore();

// Set the publish step as valid by default on mount
onMounted(() => {
  emit("validation-change", { step: 4, isValid: true });
  const tripId = sharebus.setup.createdTripId;
  if (tripId) {
    tripControllerStore.getTrip(tripId);
  }
});
</script>

<style lang="scss" scoped>
.publish-step-container {
  padding: 20px;
}

h3 {
  font-weight: bold;
}

@media (max-width: 992px) {
  .publish-step-container {
    padding: 15px;
  }

  h3.display-6 {
    font-size: 1.75rem;
  }
}

@media (max-width: 768px) {
  .publish-step-container {
    padding: 10px;
  }

  h3.display-6 {
    font-size: 1.5rem;
  }
}
</style>
