<template>
  <div class="d-flex flex-column offset-md-2 col-sm-12 col-md-5">
    <div class="d-flex mb-2">
      <span class="rounded-circle trip-sign-rounded"
        ><img class="align-baseline" src="/img/trip-info/check-sign.svg"
      /></span>
      <span class="ms-2 ship-gray"
        ><h3 class="fw-bold ship-gray">
          {{ t("sharebus.booking.thank_you_booking") }} #{{
            tripInfo.booking_reference
          }}
        </h3></span
      >
    </div>
    <div class="border rounded">
      <PriceSummary
        :vat-percent="tripInfo.vat_percent"
        custom-class="payment-summary"
        :price-summary="priceSummaryInfo"
      >
        <template v-slot:details>
          <hr />
          <ToogleTripInfoWrapper>
            <template v-slot:ticketPriceInfo>
              <span> <hr /></span>
              <PriceInfo :tripInfo="tripInfo" />
            </template>
          </ToogleTripInfoWrapper>
        </template>
      </PriceSummary>
    </div>

    <div
      class="text-start d-flex flex-column justify-content-center align-items-start"
    >
      <div class="vertical-line d-inline-block ms-2"></div>
      <span class="fw-bold">
        <i class="fi fi-circle light-gray-2 me-2"> </i>
        {{ t("common.almost_done") }}
      </span>
    </div>
    <PublishSharebus />
  </div>
</template>
<script setup lang="ts">
import { useI18n } from "vue-i18n";
import PriceSummary from "@/components/modules/sharelead/setupSharebus/PriceSummary/PriceSummary.vue";
import PublishSharebus from "./PublishSharebus.vue";
import ToogleTripInfoWrapper from "../trip/ToogleTripInfoWrapper.vue";
import PriceInfo from "../sharelead/trip/PriceInfo.vue";
import { Trip } from "@/store/trip/privateTrip/types";
import { computed, PropType } from "vue";

const { t } = useI18n();
const props = defineProps({
  tripInfo: {
    type: Object as PropType<Trip>,
    required: true,
  },
});
const priceSummaryInfo = computed(() => {
  return {
    deductibleAmount: props.tripInfo.sharelead_contributed_amount,
    chosenDiscount: props.tripInfo.discount_scheme,
    grandTotalPrice:
      props.tripInfo.sharelead_contributed_amount +
      props.tripInfo.sharelead_ticket_reserved_price,
    tickets: props.tripInfo.tickets_reserved,
    ticketPrice: props.tripInfo.regular_ticket_price,
    totalTicketPrice: props.tripInfo.sharelead_ticket_reserved_price,
  };
});
</script>
