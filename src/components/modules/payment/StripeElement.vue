<template>
  <form id="payment-form" @submit.prevent="paymentSubmit">
    <div id="payment-element">
      <!-- Elements will create form elements here -->
    </div>
    <div class="mt-4">
      <BaseButton
        :disabled="stripeInfo.submitBtn || stripeInfo.status"
        id="submit"
        :button-text="t('sharebus.booking.pay')"
        button-class="sb-btn-primary sb-btn-md w-30 fw-600"
      >
      </BaseButton>
    </div>
    <div id="error-message">
      {{ stripeInfo.errMessage }}
      <!-- Display error message to your customers here -->
    </div>
  </form>
  <BaseButton
    button-class="sb-btn-md medium-gray-border mt-3 w-30 fw-600"
    @click="cancelProcess"
    >{{ t("button.cancel") }}</BaseButton
  >
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ComputedRef, inject } from "vue";
import {
  usePaymentInfoStore,
  useSharebusStore,
  useLoaderStore,
  useUserStore,
} from "@/store/index";
import BaseButton from "@busgroup/vue3-base-button";
import { useI18n } from "vue-i18n";
import { ROLE } from "@/components/common/enums/enums";
import { countryType } from "@/core/plugin/countryPlugin";
import { showToast } from "@/services/toast/toast.service";

const props = defineProps({
  stripePayload: {
    type: Object,
    default: () => ({}),
  },
});
const { t } = useI18n();
const emit = defineEmits(["cancelProcess"]);

const cancelProcess = () => {
  emit("cancelProcess", true);
};
const stripeInfo = reactive({
  errMessage: null,
  status: false,
  submitBtn: false,
});
const country = inject<ComputedRef<countryType>>("country");
let stripe = window.Stripe(import.meta.env.VITE_APP_STRIPE_PUBLIC_KEY);

onMounted(() => {
  /*
   * on Mounted calling the view
   */
  initiateView();
});
let elements;
/*
 * in this function the stripe view will generate
 */
const initiateView = () => {
  const options = {
    mode: "payment",
    amount: Math.round(
      (grandTotal.value || props.stripePayload.total_price) * 100
    ),
    currency: country?.value.currency?.toLowerCase(),
    // Fully customizable with appearance API.
    appearance: {
      theme: "stripe",
    },
  };

  // Set up Stripe.js and Elements to use in checkout form
  elements = stripe.elements(options);
  // Create and mount the Payment Element
  const paymentElement = elements.create("payment");
  paymentElement.mount("#payment-element");
  paymentElement.addEventListener("change", (event) => {
    if (event.complete) {
      stripeInfo.status = false;
    } else {
      stripeInfo.status = true;
    }
  });
};
/*
 * will store stripe error message
 */
const shareBusStore = useSharebusStore();
const grandTotal = computed(() => {
  return shareBusStore.getPassengerGoalAndPriceStepData.grandTotalPrice;
});
const loader = useLoaderStore();
const user = useUserStore();
const payment = usePaymentInfoStore();

const paymentByRole = {
  [ROLE.SHARELEAD]: {
    paymentAction: payment.fetchShareleadPaymentIntentData,
    gqlKey: "stripeShareleadPaymentInit",
  },
  [ROLE.JOINER]: {
    paymentAction: payment.fetchJoinerPaymentIntentData,
    gqlKey: "stripeJoinerTicketBookingAndPayment",
  },
};
/**
 * payment will submit BE API will call and will provide client secret
 */
const paymentSubmit = () => {
  if (stripeInfo.submitBtn) {
    return;
  }
  stripeInfo.submitBtn = true;
  elements.submit();
  loader.changeLoadingStatus({ isLoading: true });

  if (user.currentRole === ROLE.SHARELEAD) {
    delete props.stripePayload["total_price"];
  }
  /*
   * BE API is calling here for client secret
   */
  paymentByRole[user.currentRole]
    .paymentAction(props.stripePayload)
    .then(async (result) => {
      /*
       * After getting client secret calling confirm payment function from stripe
       */
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret:
          result?.data[paymentByRole[user.currentRole].gqlKey].client_secret,
        confirmParams: {
          return_url: `${
            import.meta.env.VITE_APP_DOMAIN_URL
          }/payment-confirmation/${props.stripePayload.trip_id}`,
          payment_method_data: {
            billing_details: {
              name: user.data.attributes.name,
              email: user.data.attributes.email,
            },
          },
        },
      });

      if (error) {
        // This point will only be reached if there is an immediate error when
        // confirming the payment. Show error to your customer (for example, payment
        // details incomplete)
        loader.changeLoadingStatus({ isLoading: false });
        showToast("error", t("common.payment_details_incomplete"));
      }
    });
};
</script>
<style lang="scss">
.stripe-element ul {
  padding: 0.7rem 0.7rem 0rem 0.7rem;
  li {
    max-width: 100%;
    list-style-type: none;
  }
}
</style>
