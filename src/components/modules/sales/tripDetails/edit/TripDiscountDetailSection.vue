<template>
  <div class="container-fluid edit-trip-discount-detail-section">
    <h2 class="mb-4 ms-2 text-start fw-bold">
      {{ t("discount.edit_discounts") }}
    </h2>
    <BaseSaveChanges @saveChanges="saveDiscountTier" class="mb-4" />
    <div class="trip-discount-detail-section border rounded p-4">
      <TimeBasedDiscount
        :discount-tiers="discountTiers"
        @update:discountTiers="handleDiscountConfigUpdate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import useTripStore from "@/store/trip/privateTrip/trip.store";
import { useRoute, useRouter } from "vue-router";
import { useSalesStore } from "@/store";
import { useI18n } from "vue-i18n";
import { TicketDiscount } from "@/store/sharebus/types";
import { routePushTagQuery } from "@/utils";
import TimeBasedDiscount from "@/components/modules/sharelead/setupSharebus/TicketDiscount/TimeBasedDiscount.vue";

const route = useRoute();
const salesStore = useSalesStore();
const { t } = useI18n();

const tripId = computed(() => route.params.tag as string);

const tripStore = useTripStore();
const localDiscountTiers = ref<TicketDiscount[]>([]); // Local variable to manage discount tiers

function isDiscountThere(discounts: unknown): discounts is TicketDiscount[] {
  return Array.isArray(discounts);
}

const discountTiers = computed<TicketDiscount[]>({
  get() {
    const salesTrip = salesStore.salesEditTrip[tripId.value];
    if (
      salesTrip &&
      salesTrip.trip_ticket_discounts &&
      isDiscountThere((salesTrip.trip_ticket_discounts as any).ticket_discounts)
    ) {
      return (salesTrip.trip_ticket_discounts as any).ticket_discounts;
    }
    const trip = tripStore.getCurrentTrip;
    if (trip && isDiscountThere(trip.ticket_discounts)) {
      return trip.ticket_discounts;
    }
    return [];
  },
  set(newTiers) {
    localDiscountTiers.value = newTiers; // Update local variable
  },
});

// 2. When adding new discounts, update only the array variable, not the store
const handleDiscountConfigUpdate = (tiers) => {
  if (tiers && Array.isArray(tiers)) {
    discountTiers.value = tiers; // Update via computed setter
  }
};

// 3. When clicking save, update the actual store before routing
const saveDiscountTier = (value: boolean) => {
  if (value) {
    const tripTag = route.params.tag as string;
    const ticketDiscount = JSON.parse(JSON.stringify(localDiscountTiers.value));

    salesStore.setSalesConsoleTripChangeRequest({
      trip_ticket_discounts: {
        ticket_discounts: ticketDiscount,
      },
      trip_id: tripTag,
    });
  }
  salesStore.$state.editing_mode = true;
  routePushTagQuery("trip-sales-page", route.params.tag as string, {
    tabindex: 1,
  });
};
</script>

<style scoped>
.edit-trip-discount-detail-section {
  padding: 5rem 10rem;
  background-color: #fefffe;
}
.trip-discount-detail-section {
  border-color: #fff !important;
  position: relative;
}
</style>
