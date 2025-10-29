<template>
  <div class="row justify-content-center">
    <!-- Payment Summary Section (Always visible) using PrimeVue -->
    <div class="col-md-8 col-sm-10 mb-5">
      <Card class="price-card shadow-lg">
        <template v-slot:title>
          <div class="text-center text-uppercase fw-bold my-2">
            {{ t("sharebus.checkout.amount_to_pay") }}
          </div>
        </template>
        <template v-slot:content>
          <div class="text-center fs-1 fw-bold text-primary mb-2">
            {{ cartStore.getTotalPrice() }} Kr
          </div>
          <div class="text-center text-secondary small">
            <i class="fi fi-lock me-1"></i>
            {{ t("sharebus.checkout.secure_payment_label") }}
          </div>
        </template>
      </Card>
    </div>
    <div
      class="col-md-8 col-sm-10 mx-auto payment-options"
      v-if="!stripePayInitiated"
    >
      <div class="payment-methods-divider">
        <span>{{ t("sharebus.checkout.select_payment_method") }}</span>
      </div>

      <div class="payment-buttons">
        <BaseButton
          v-if="country?.countryISO === 'NO'"
          button-class="sb-btn-lg sb-vipps-btn rounded-pill payment-button"
          @click="confirmPayment"
          :is-disabled="clickedVipps.show.value"
        >
          <div class="payment-button-content">
            <img
              src="/img/vipss-icon.svg"
              alt="vipps-icon"
              class="payment-icon-img"
            />
            <span>{{ t("sharebus.booking.pay_with_vipps") }}</span>
          </div>
        </BaseButton>

        <BaseButton
          button-class="sb-btn-primary sb-btn-lg rounded-pill payment-button"
          @click="() => (stripePayInitiated = true)"
        >
          <div class="payment-button-content">
            <img
              src="/img/card-payment.svg"
              alt="card-icon"
              class="payment-icon-img"
            />
            <span>{{ stripeBtnText }}</span>
          </div>
        </BaseButton>
      </div>
    </div>
    <div v-if="stripePayInitiated" class="text-center">
      <StripeElement
        :stripe-payload="paymentPayload"
        @cancel-process="cancelProcess"
      />
    </div>
    <div class="mt-3 light-gray-bg p-3 error-bg text-start" v-if="errorMessage">
      <p class="ship-gray fw-bold">
        {{ t("sharebus.booking.your_payment_did_not_go_through") }}
      </p>
      <p>{{ errorMessage }}</p>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, ComputedRef, inject, onMounted, PropType, ref } from "vue";
import { useI18n } from "vue-i18n";
import BaseButton from "@busgroup/vue3-base-button";
import Card from "primevue/card";
import { useCartStore, useConfigStore, usePaymentInfoStore } from "@/store";
import { routePush, scrollToHeight, serverTime } from "@/utils";
import StripeElement from "../../payment/StripeElement.vue";
import { showToast } from "@/services/toast/toast.service";
import { countryType } from "@/core/plugin/countryPlugin";
import { useToggle } from "@/composables/useToggle";
import { SHAREBUS_CONFIG } from "@/services/graphql/enums/sharebus-config";
import { CheckoutInfo } from "./types/checkout.types";

const { t } = useI18n();
const props = defineProps({
  checkoutInfo: {
    type: Object as PropType<CheckoutInfo>,
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
const clickedVipps = useToggle();
const config = useConfigStore();

onMounted(() => {
  if (cartStore.$state.tripId !== props.checkoutInfo.id) {
    cartStore.$reset();
    props.prevStep();
  }
  scrollToHeight(-1);
  config.fetchSetupSharebusConfig(SHAREBUS_CONFIG.SCHEDULED_CONFIG);
});
const country = inject<ComputedRef<countryType>>("country");
const stripeBtnText = computed(() => {
  return country?.value.countryISO === "NO"
    ? t("sharebus.booking.pay_with_stripe")
    : t("sharebus.booking.proceed_with_payment");
});

const stripePayInitiated = ref(false);

const cancelProcess = (value: boolean) => {
  stripePayInitiated.value = !value;
};

const paymentPayload = computed(() => {
  // Calculate total tickets count based on the cart data
  const totalTicketsCount = cartStore.getCartItemCount();
  // Get total price from the cart store
  const totalPrice = cartStore.$state.totalPayablePrice;

  const tripId = cartStore.$state.tripId;

  return {
    trip_id: tripId,
    total_price: totalPrice,
    early_bird_tickets: 0, // Always 0 as per the comment
    regular_tickets: totalTicketsCount, // Total purchased tickets count
    last_updated_at: updatedAt,
    category_tickets: cartStore.getFormattedTickets(),
  };
});

const updatedAt = props.checkoutInfo.updated_at || serverTime();

const confirmPayment = () => {
  // joinerTripStore.getPublicTrip(props.tripInfo.id).then((res) => {
  //   const trip = res as Trip;
  //   if (
  //     !trip?.is_published ||
  //     (trip.trip_status !== TRIP_STATUS.UNCONFIRMED &&
  //       trip.trip_status !== TRIP_STATUS.CONFIRMED) ||
  //     isAfter(
  //       new Date(removeZforISOString(serverTime())),
  //       new Date(
  //         `${removeZforISOString(trip.deadline_ticket_selling).split("T")[0]} ${
  //           configuration.value.TicketSalesDeadlineTimeOfDay
  //         }`
  //       )
  //     ) ||
  //     (trip?.updated_at != null &&
  //       isBefore(
  //         new Date(removeZforISOString(updatedAt)),
  //         new Date(removeZforISOString(trip?.updated_at))
  //       ))
  //   ) {
  //     showToast("error", "Sorry,   the trip is not available at this moment");
  //     routePush("home");
  //   }
  // });
  clickedVipps.toggleShow();
  paymentSummary
    .joinerTicketBookedAndFetchRedirectInfo(paymentPayload.value)
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

.price-card {
  border-radius: 1.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
  overflow: hidden;
  border: none;

  :deep(.p-card-header) {
    background-color: var(--primary-color, #1a73e8);
    padding: 0;
    position: relative;
    height: 60px;
  }

  .payment-icon-wrapper {
    background: var(--primary-color, #1a73e8);
    width: 56px;
    height: 56px;
    border-radius: 50%;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    border: 3px solid white;
    color: white;
    z-index: 1;
  }

  :deep(.p-card-title) {
    color: var(--primary-color, #1a73e8);
  }

  :deep(.p-card-content) {
    padding: 1rem 0 2rem;
  }
}

.payment-options {
  margin-bottom: 3rem;
}

.payment-methods-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 2rem 0;

  &::before,
  &::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid #dee2e6;
  }

  span {
    padding: 0 1rem;
    color: #6c757d;
  }
}

.payment-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.payment-button {
  width: 80%;
  height: 60px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
}

.payment-button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  .payment-icon-img {
    height: 24px;
    width: auto;
  }
}

:deep(.sb-vipps-btn) {
  background-color: #ff5b24;
  border-color: #ff5b24;
  color: white;

  &:hover {
    background-color: #e54e1c;
    border-color: #e54e1c;
  }
}
</style>
