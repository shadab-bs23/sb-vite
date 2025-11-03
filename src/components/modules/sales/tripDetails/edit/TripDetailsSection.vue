<template>
  <div class="row">
    <!-- TripInfo slot for TripSummarySection -->
    <!-- Empty, handled by slot below -->
    <div class="col-12">
      <TripSummarySection
        :route-points="parsedRoutePoints"
        :ticket-pricing="tripTicketPricing"
        :departure-date="parsedRoutePoints.oneway[0]?.planned_departure_time"
        :show-edit-buttons="editingMode"
        :next-itinerary-route="'sales-edit-itinerary'"
        :next-ticket-prices-route="'sales-edit-ticket-prices'"
        :ticket-prices-route-params="{ tag: props.tripInfo.id }"
        :booking-reference="returnInfo.bookingReference"
        :discount-tiers="discountTiers"
        :discount-header="t('discount.discounts')"
        :show-discount-edit-button="!editingPriceMode && editingMode"
        :discount-edit-label="t('button.edit')"
        :discount-edit-icon="'/img/icons/edit.svg'"
        :discount-edit-route="'sales-edit-discount'"
        :discount-edit-route-params="{ tag: props.tripInfo.id }"
        from-sales
        :trip-info-data="tripGeneralInfo"
        :trip-id="props.tripInfo.id"
      >
        <template v-slot:itinerary-pricing-last-changed>
          <div class="d-flex align-items-center justify-content-between mb-3">
            <TripLastChangedInfo
              :trip-id="tripInfo.id"
              :change-key="SalesEditGroup.TRIP_LOCATION_TYPE"
              :update-history="updateHistory"
            />
            <div></div>
            <TripLastChangedInfo
              :trip-id="tripInfo.id"
              :change-key="SalesEditGroup.TRIP_TICKET_PRICING"
              :update-history="updateHistory"
            />
          </div>
        </template>

        <template v-slot:discount-last-changed-info>
          <TripLastChangedInfo
            v-if="updateHistory"
            :trip-id="tripInfo.id"
            :change-key="SalesEditGroup.TRIP_TICKET_DISCOUNTS"
            :update-history="updateHistory"
          />
        </template>

        <template v-slot:trip-info-last-changed>
          <TripLastChangedInfo
            v-if="updateHistory"
            :trip-id="tripInfo.id"
            :change-key="SalesEditGroup.TRIP_GENERAL_INFO"
            :update-history="updateHistory"
          />
        </template>
      </TripSummarySection>
    </div>
    <div>
      <div v-if="showRouteChangeAlert" class="alert alert-info" role="alert">
        {{ t("setup.route_point_changes_detected") }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, PropType, watch } from "vue";
import { Trip } from "@/store/trip/privateTrip/types";
import TripSummarySection from "@/components/common/TripSummarySection/TripSummarySection.vue";
import TripController from "@/components/modules/sharelead/controllers/TripController";
import { useI18n } from "vue-i18n";
import { useSalesStore } from "@/store";
import TripLastChangedInfo from "../../TripLastChangedInfo.vue";
import { SalesEditGroup, UpdateHistory } from "@/store/salesConsole/types";
import { TripLocationTime } from "@/store/salesConsole/types";
import { TicketDiscount, TripInfoData } from "@/store/sharebus/types";
import { useRoute } from "vue-router";

const props = defineProps({
  tripInfo: {
    type: Object as PropType<Trip>,
    required: true,
  },
  updateHistory: {
    type: Object as PropType<UpdateHistory>,
    required: true,
  },
});

const { t } = useI18n();
const salesStore = useSalesStore();
const route = useRoute();
const tripId = computed(() => props.tripInfo.id);

console.log("tripId:", tripId.value, "tripTag:", route.params.tag);

const discountTiers = computed(() => {
  const salesTrip = salesStore.salesEditTrip[tripId.value];
  return ((salesTrip?.trip_ticket_discounts as any)?.ticket_discounts ||
    props.tripInfo.ticket_discounts) as TicketDiscount[];
});

// Safe parsing of route points with try-catch
const parsedRoutePoints = computed(() => {
  try {
    // First check if there are persisted changes in sales store
    if (
      salesHistory.value &&
      salesHistory.value.update_history?.trip_location_time &&
      (salesHistory.value.trip_location_time as TripLocationTime)?.route_points
    ) {
      return (salesHistory.value.trip_location_time as TripLocationTime)
        .route_points;
    }

    // Otherwise use the original trip data
    if (!props.tripInfo.route_points) {
      return { oneway: [], return: [] };
    }
    return JSON.parse(props.tripInfo.route_points);
  } catch (error) {
    console.error("Error parsing route_points:", error);
    return { oneway: [], return: [] };
  }
});

const returnInfo = computed(() => {
  if (
    salesHistory.value &&
    salesHistory.value.update_history?.trip_location_time
  ) {
    const returnRoutePoints = (
      salesHistory.value.trip_location_time as TripLocationTime
    )?.route_points?.return;
    return {
      origin: returnRoutePoints?.[0]?.point,
      destination: returnRoutePoints?.[1]?.point,
      bookingReference: (
        salesHistory.value?.trip_location_time as TripLocationTime
      )?.bus_signage,
      departureDateTime: returnRoutePoints?.[0]?.planned_departure_time,
      arrivalDateTime: returnRoutePoints?.[1]?.planned_arrival_time,
      route_points: returnRoutePoints,
    };
  }
  return TripController.getTripReturn().value;
});

const editingPriceMode = ref(false);

const tripGeneralInfo = computed(() => {
  const salesTrip = salesStore.$state.salesEditTrip[props.tripInfo.id];
  const saleaTripGnInfo = salesTrip?.trip_general_info as TripInfoData;
  return {
    trip_organizer:
      saleaTripGnInfo?.trip_organizer || props.tripInfo.trip_organizer,
    name: saleaTripGnInfo?.name || props.tripInfo.name,
    website_url: saleaTripGnInfo?.website_url || props.tripInfo.website_url,
    // Use nullish coalescing to check if image_url exists in sales store
    // This allows empty string "" (file removed) to override the original value
    image_url:
      saleaTripGnInfo && "image_url" in saleaTripGnInfo
        ? saleaTripGnInfo.image_url
        : props.tripInfo.image_url,
    category: saleaTripGnInfo?.category || props.tripInfo.category,
    info_to_travellers:
      saleaTripGnInfo?.info_to_travellers || props.tripInfo.info_to_travellers,
  };
});

// Computed property for trip ticket pricing with persisted changes
const tripTicketPricing = computed(() => {
  // Check if there are persisted pricing changes in sales store
  if (
    salesHistory.value &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (salesHistory.value.trip_ticket_pricing as any)?.ticket_pricing
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (salesHistory.value.trip_ticket_pricing as any).ticket_pricing;
  }

  // Otherwise use the original trip ticket pricing
  return props.tripInfo.ticket_pricing;
});

/**Edit prices */

const salesHistory = computed(
  () => salesStore.$state.salesEditTrip[props.tripInfo.id]
);
const editingMode = computed(() => salesStore.$state.editing_mode);

// Alert logic for route and price changes
const showRouteChangeAlert = ref(false);

// Watch for route points changes - compare with original API data
watch(
  () => parsedRoutePoints.value,
  (currentRoutePoints) => {
    // Don't show alert if already shown or if no original data
    if (showRouteChangeAlert.value || !props.tripInfo.route_points) {
      return;
    }

    try {
      // Get original route points from API data
      const originalRoutePoints = JSON.parse(props.tripInfo.route_points);

      // Helper to flatten route points (oneway/return) into a single array
      const flattenPoints = (pointsObj) => {
        if (!pointsObj) return [];
        const oneway = Array.isArray(pointsObj.oneway) ? pointsObj.oneway : [];
        const ret = Array.isArray(pointsObj.return) ? pointsObj.return : [];
        return [...oneway, ...ret];
      };

      const currentFlat = flattenPoints(currentRoutePoints);
      const originalFlat = flattenPoints(originalRoutePoints);

      // Only show alert if the number of route points changed (added/removed)
      if (currentFlat.length !== originalFlat.length) {
        showRouteChangeAlert.value = true;
      }
    } catch (error) {
      console.error("Error comparing route points:", error);
    }
  },
  { deep: true, immediate: true }
);

watch(
  () => editingMode.value,
  (newValue) => {
    if (!newValue) {
      editingPriceMode.value = false;
    }
  }
);
</script>
