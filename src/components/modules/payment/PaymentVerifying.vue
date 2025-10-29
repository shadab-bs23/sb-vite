<template>
  <BaseLoader
    :active="true"
    loader-icon="/img/logo.svg"
    overlay-background-color="gray-white-bg"
  />
</template>
<script lang="ts" setup>
import BaseLoader from "@busgroup/vue3-base-loader";
import router from "@/router";
import { usePaymentInfoStore } from "@/store";
import { onMounted } from "vue";
import { PaymentConfirmationPayload } from "@/store/payment/types";
import { routePushMultipleTag } from "@/utils";
const paymentStore = usePaymentInfoStore();

const paymentFromRoute = router.currentRoute.value.query.payment_from as string;
const tripIDFromRoute = router.currentRoute.value.query.trip_id;
const transactionIdFromRoute = router.currentRoute.value.query
  .transaction_id as string;
/**
 * verify payment function
 *
 * @param {PaymentConfirmationPayload} payload  - payment verifying payload
 */
const verifyPayment = (payload: PaymentConfirmationPayload) => {
  paymentStore
    .handleVippsPaymentConfirmation(payload)
    .then((res) => {
      if (res?.data.vippsPaymentConfirm.status) {
        if (paymentFromRoute === "SHARELEAD") {
          routePushMultipleTag("payment", {
            tag: "confirmation",
            id: tripIDFromRoute,
          });
        } else if (paymentFromRoute === "JOINER") {
          routePushMultipleTag("payment", {
            tag: "book-ticket-confirmation",
            id: tripIDFromRoute,
          });
        } else {
          routePushMultipleTag("error", {
            tag: "payment-error",
            id: tripIDFromRoute,
          });
        }
      } else {
        routePushMultipleTag("error", {
          tag: "payment-error",
          id: tripIDFromRoute,
        });
      }
    })
    .catch((error) => {
      if (error) {
        routePushMultipleTag("error", {
          tag: "payment-error",
          id: tripIDFromRoute,
        });
      }
    });
};
onMounted(() => {
  if (tripIDFromRoute && transactionIdFromRoute && paymentFromRoute) {
    verifyPayment({
      transaction_id: transactionIdFromRoute,
    });
  } else {
    routePushMultipleTag("error", {
      tag: "payment-error",
      id: tripIDFromRoute,
    });
  }
});
</script>
