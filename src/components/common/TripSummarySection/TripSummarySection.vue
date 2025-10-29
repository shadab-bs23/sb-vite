<template>
  <div class="trip-summary-section">
    <div class="row">
      <!-- Trip Information -->
      <div
        class="col-12 col-xxl-4 text-start"
        :class="fromSales ? 'order-first mb-3' : 'order-3 order-xxl-2 mt-3'"
      >
        <slot name="trip-info-last-changed"></slot>
        <TripInfo
          :trip-data="tripInfoData"
          :route-data="routePoints"
          :trip-id="tripId"
          :edit-mode="showEditButtons"
        />
      </div>
      <!-- Itinerary Pricing -->
      <div class="col-12 order-1 col-xxl-8">
        <slot name="itinerary-pricing-last-changed"></slot>
        <ItineraryPricingTable
          :route-points="routePoints.oneway"
          :ticket-pricing="ticketPricing"
          :departure-date="departureDate"
          :show-edit-buttons="showEditButtons"
          :next-itinerary-route="nextItineraryRoute"
          :next-ticket-prices-route="nextTicketPricesRoute"
          :ticket-prices-route-params="ticketPricesRouteParams"
          :booking-reference="bookingReference"
          class="my-4"
        />
      </div>

      <!-- Return Trip Information and Discount section -->
      <div
        class="order-2 order-xxl-3"
        :class="
          fromSales
            ? 'col-12 col-xxl-8 offset-0 offset-xxl-4'
            : 'offset-0 col-12'
        "
      >
        <div class="row">
          <div v-if="routePoints.return?.length" class="col-12 col-xl-6">
            <ReturnTripView :return-route-points="routePoints.return" />
          </div>
          <div class="col-12 col-xl-6">
            <slot name="discount-last-changed-info"></slot>

            <div class="card shadow-sm border-0">
              <div class="card-body position-relative">
                <slot name="discount-header">
                  <BaseActionHeader
                    :header="discountHeader"
                    :is-img="true"
                    :icon-path="discountIconPath"
                    :show-edit-button="showDiscountEditButton"
                    :button-label="discountEditLabel"
                    :button-icon="discountEditIcon"
                    :button-alt-text="discountEditLabel"
                    :next-route="discountEditRoute"
                    :route-params="discountEditRouteParams"
                  />
                </slot>
                <div class="mt-4">
                  <DiscountTierList :discountTiers="discountTiers" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <slot name="footer"></slot>
  </div>
</template>

<script setup lang="ts">
import ItineraryPricingTable from "@/components/modules/sharelead/setupSharebus/PublishStep/components/ItineraryPricingTable.vue";
import ReturnTripView from "@/components/modules/sharelead/setupSharebus/PublishStep/components/ReturnTripView.vue";
import DiscountTierList from "@/components/modules/sharelead/setupSharebus/TicketDiscount/DiscountTierList.vue";
import BaseActionHeader from "@/components/common/reusable/BaseActionHeader.vue";
import TripInfo from "@/components/modules/sharelead/setupSharebus/TripInfo/TripInfo.vue";
import { RoutePoints } from "../../ViaPointsPackage/types/types";
import { PropType } from "vue";
import {
  TicketDiscount,
  TicketPricing,
  TripInfoData,
} from "@/store/sharebus/types";
import { is } from "date-fns/locale";

defineProps({
  routePoints: { type: Object as PropType<RoutePoints>, required: true },
  ticketPricing: { type: Object as PropType<TicketPricing>, required: true },
  departureDate: { type: [String, Date], default: "" },
  showEditButtons: { type: Boolean, default: false },
  nextItineraryRoute: { type: String, default: "" },
  nextTicketPricesRoute: { type: String, default: "" },
  ticketPricesRouteParams: { type: Object, default: () => ({}) },
  bookingReference: { type: String, default: "" },
  discountTiers: {
    type: Array as PropType<TicketDiscount[]>,
    default: () => [],
  },
  discountHeader: { type: String, default: "Discounts" },
  discountIconPath: {
    type: String,
    default: "/img/discount-icon/discount-icon.svg",
  },
  showDiscountEditButton: { type: Boolean, default: false },
  discountEditLabel: { type: String, default: "Edit" },
  discountEditIcon: { type: String, default: "/img/icons/edit.svg" },
  discountEditRoute: { type: String, default: "" },
  discountEditRouteParams: { type: Object, default: () => ({}) },
  fromSales: { type: Boolean, default: false },
  tripInfoData: { type: Object as PropType<TripInfoData>, required: true },
  tripId: { type: String, required: true },
});
</script>

<style scoped>
.trip-summary-section {
  width: 100%;
}
</style>
