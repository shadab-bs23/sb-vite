<template>
  <div class="confirm-book d-flex flex-column align-items-center container">
    <div class="col-md-11 col-sm-11 mb-2">
      <h2 class="offset-md-1 col-md-11 col-sm-12 text-start fw-bold">
        {{ t("sharebus.booking.confirm_book") }}
      </h2>
    </div>
    <div class="row col-sm-11 col-md-11 col-xl-11">
      <div class="col-sm-12 offset-md-1 offset-xl-1 col-md-11 col-xl-5 p-0">
        <PriceSummary
          custom-class="payment-summary border rounded"
          :price-summary="priceSummaryInfo"
          :vat-percent="tripInfo.vat_percent"
        >
          <template v-slot:details>
            <ToogleTripInfoWrapper>
              <template v-slot:ticketPriceInfo>
                <span> <hr /></span>
                <PriceInfo :tripInfo="tripInfo" />
              </template>
            </ToogleTripInfoWrapper>
          </template>
          <template v-slot:grandTotal>
            <li class="d-flex justify-content-end" v-if="grandTotalPrice">
              <span class="fw-bold fs-3"
                >{{ country?.value?.currency ?? '' }} {{ grandTotalPrice }}, -</span
              >
            </li>
          </template>
        </PriceSummary>
      </div>
      <div class="col-sm-12 offset-md-1 offset-xl-1 col-md-11 col-xl-5 p-0">
        <div class="p-2" v-if="!stripePayInitiated">
          <BaseButton
            v-if="country?.countryISO === 'NO'"
            button-class="sb-btn-primary sb-btn-lg sb-vipps-btn rounded-pill mw-100 col-sm-12 col-md-6 w-100 fw-600"
            @click="confirmPayment"
            :is-disabled="clickedVipps.show.value"
          >
            <img src="/img/vipss-icon.svg" alt="vipps-icon" class="me-2" />
            {{ t("sharebus.booking.pay_with_vipps") }}
          </BaseButton>
          <BaseButton
            button-class="sb-btn-primary sb-btn-lg rounded-pill mw-100 col-sm-12 col-md-6 mt-3 w-100 fw-600"
            @click="() => (stripePayInitiated = true)"
          >
            <img src="/img/card-payment.svg" alt="card-icon" class="me-2" />
            {{ stripeBtnText }}
          </BaseButton>
        </div>
        <div v-if="stripePayInitiated" class="text-center">
          <StripeElement
            :stripe-payload="stripePayload"
            @cancel-process="cancelProcess"
          />
        </div>
        <div
          class="mt-2 light-gray-bg p-3 error-bg text-start"
          v-if="errorMessage"
        >
          <p class="ship-gray fw-bold">
            {{ t("sharebus.booking.your_payment_did_not_go_through") }}
          </p>
          <p>{{ errorMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import PriceSummary from "@/components/modules/sharelead/setupSharebus/PriceSummary/PriceSummary.vue";
import ToogleTripInfoWrapper from "../trip/ToogleTripInfoWrapper.vue";
import PriceInfo from "../sharelead/trip/PriceInfo.vue";
import { computed, ComputedRef, inject, PropType, ref } from "vue";
import BaseButton from "@busgroup/vue3-base-button";
import { useI18n } from "vue-i18n";
import { usePaymentInfoStore } from "@/store";
import { Trip } from "@/store/trip/privateTrip/types";
import StripeElement from "./StripeElement.vue";
import { useRoute } from "vue-router";
import { countryType } from "@/core/plugin/countryPlugin";
import { useToggle } from "@/composables/useToggle";

const paymentSummary = usePaymentInfoStore();
const route = useRoute();
const clickedVipps = useToggle();

const props = defineProps({
  tripInfo: {
    type: Object as PropType<Trip>,
    required: true,
  },
});
const { t } = useI18n();
const errorMessage = ref("");
const stripePayload = computed(() => ({
  total_price: grandTotalPrice.value,
  trip_id: route.params.id,
}));

const country = inject<ComputedRef<countryType>>("country");
const stripeBtnText = computed(() => {
  return country?.value.countryISO === "NO"
    ? t("sharebus.booking.pay_with_stripe")
    : t("sharebus.booking.proceed_with_payment");
});
/*
 * handle payment here it will fetch redirect URL and will redirect it to payment
 * error will be handled here
 */
const confirmPayment = () => {
  clickedVipps.toggleShow();
  paymentSummary
    .shareleadFetchPaymentRedirectURL(props.tripInfo.id)
    .then((res) => {
      window.location.href =
        res?.data.vippsShareleadPaymentInit.vipps_redirect_url;
    })
    .catch((err) => {
      const { message } = err;
      errorMessage.value = message;
      clickedVipps.toggleShow();
    });
};
const stripePayInitiated = ref(false);

const cancelProcess = (value: boolean) => {
  stripePayInitiated.value = !value;
};

const grandTotalPrice = computed(() => {
  const contributedAmount = props.tripInfo.sharelead_contributed_amount ?? 0;
  const ticketReservedPrice = props.tripInfo.sharelead_ticket_reserved_price ?? 0;
  return contributedAmount + ticketReservedPrice;
});
/*
 * getting price info
 */
const priceSummaryInfo = computed(() => {
  const contributedAmount = props.tripInfo.sharelead_contributed_amount ?? 0;
  const ticketReservedPrice = props.tripInfo.sharelead_ticket_reserved_price ?? 0;
  return {
    deductibleAmount: contributedAmount,
    chosenDiscount: props.tripInfo.discount_scheme,
    grandTotalPrice: grandTotalPrice.value,
    tickets: props.tripInfo.tickets_reserved,
    ticketPrice: props.tripInfo.regular_ticket_price,
    totalTicketPrice: ticketReservedPrice,
  };
});
</script>
