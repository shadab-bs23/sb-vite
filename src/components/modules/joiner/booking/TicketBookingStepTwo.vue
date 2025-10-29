<template>
  <div class="row col-md-12 col-sm-12">
    <div class="col-md-7 col-lg-8 col-sm-12 mb-3">
      <BookingSummary
        :current-trip="currentTrip"
        :total="totalPrice"
        :tickets="tickets"
      />
    </div>
    <div class="payment col-md-5 col-lg-4 col-sm-12">
      <div class="text-center" v-if="!stripePayInitiated">
        <BaseButton
          v-if="country?.countryISO === 'NO'"
          button-class="sb-btn-lg sb-vipps-btn rounded-pill mw-100 col-sm-12 col-md-6 w-100 fw-600"
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
        class="mt-3 light-gray-bg p-3 error-bg text-start"
        v-if="errorMessage"
      >
        <p class="ship-gray fw-bold">
          {{ t("sharebus.booking.your_payment_did_not_go_through") }}
        </p>
        <p>{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, ComputedRef, inject, onMounted, PropType, ref } from "vue";
import { useI18n } from "vue-i18n";
import BaseButton from "@busgroup/vue3-base-button";
import BookingSummary from "./BookingSummary.vue";
import { useCartStore, useJoinerTripStore, usePaymentInfoStore } from "@/store";
import { Trip } from "@/store/trip/privateTrip/types";
import {
  removeZforISOString,
  routePush,
  scrollToHeight,
  serverTime,
} from "@/utils";
import StripeElement from "../../payment/StripeElement.vue";
import { showToast } from "@/services/toast/toast.service";
import { isAfter, isBefore } from "date-fns";
import { TRIP_STATUS } from "../../sharelead/trip/tripStatus/tripStatusEnum";
import { countryType } from "@/core/plugin/countryPlugin";
import { useToggle } from "@/composables/useToggle";

const { t } = useI18n();
const props = defineProps({
  currentTrip: {
    type: Object as PropType<Trip>,
    required: true,
  },
  prevStep: {
    type: Function,
    required: true,
  },
  nextStep: {
    type: Function,
    required: true,
  },
});

const errorMessage = ref("");
const paymentSummary = usePaymentInfoStore();
const cartStore = useCartStore();
const joinerTripStore = useJoinerTripStore();
const clickedVipps = useToggle();

onMounted(() => {
  if (cartStore.getJoinerTicketsExist().tripId !== props.currentTrip.id) {
    cartStore.$reset();
    props.prevStep();
  }
  scrollToHeight(-1);
});
const country = inject<ComputedRef<countryType>>("country");
const stripeBtnText = computed(() => {
  return country?.value.countryISO === "NO"
    ? t("sharebus.booking.pay_with_stripe")
    : t("sharebus.booking.proceed_with_payment");
});

const tickets = computed(() => {
  const joinerTickets = cartStore.getJoinerTickets(props.currentTrip);
  return joinerTickets;
});
const totalPrice = computed(() => {
  const early =
    tickets.value.earlyBirdTickets.count >= 1
      ? tickets.value.earlyBirdTickets.price
      : 0;
  const regular =
    tickets.value.regularTickets.count >= 1
      ? tickets.value.regularTickets.price
      : 0;

  return early + regular;
});

const stripePayInitiated = ref(false);

const cancelProcess = (value: boolean) => {
  stripePayInitiated.value = !value;
};

const stripePayload = computed(() => {
  return {
    trip_id: props.currentTrip.id,
    total_price: totalPrice.value,
    early_bird_tickets: tickets.value.earlyBirdTickets.count,
    regular_tickets: tickets.value.regularTickets.count,
  };
});

const updatedAt = joinerTripStore.getCurrentTrip.updated_at || serverTime();

const confirmPayment = () => {
  joinerTripStore.getPublicTrip(props.currentTrip.id).then((res) => {
    const trip = res as Trip;
    if (
      !trip?.is_published ||
      (trip.trip_status !== TRIP_STATUS.UNCONFIRMED &&
        trip.trip_status !== TRIP_STATUS.CONFIRMED) ||
      isAfter(
        new Date(removeZforISOString(serverTime())),
        new Date(removeZforISOString(trip.deadline_ticket_selling))
      ) ||
      (trip?.updated_at != null &&
        isBefore(
          new Date(removeZforISOString(updatedAt)),
          new Date(removeZforISOString(trip?.updated_at))
        ))
    ) {
      showToast("error", "Sorry,   the trip is not available at this moment");
      routePush("home");
    }
  });
  clickedVipps.toggleShow();
  paymentSummary
    .joinerTicketBookedAndFetchRedirectInfo({
      trip_id: props.currentTrip.id,
      total_price: totalPrice.value,
      early_bird_tickets: tickets.value.earlyBirdTickets.count,
      regular_tickets: tickets.value.regularTickets.count,
      last_updated_at: props.currentTrip.updated_at,
    })
    .then((res) => {
      window.location.href =
        res?.data.vippsJoinerTicketBookingAndPayment.vipps_redirect_url;
    })
    .catch((err) => {
      const { message } = err;
      errorMessage.value = message;
      showToast("error", "Sorry,   the trip is not available at this moment");
      clickedVipps.toggleShow();
      routePush("home");
    });
};
</script>
<style lang="scss">
.joiner-booking-summary ul {
  li {
    max-width: 100%;
    list-style-type: none;
  }
  padding: 0.7rem 0.7rem 0rem 0.7rem;
}
</style>
