<template><div></div></template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { useLoaderStore, useUserStore } from "@/store/index";
import { ROLE } from "@/components/common/enums/enums";
import { routePushMultipleTag } from "@/utils";
import { showToast } from "@/services/toast/toast.service";

const route = useRoute();
const user = useUserStore();
const loader = useLoaderStore();
let stripe = window.Stripe(import.meta.env.VITE_APP_STRIPE_PUBLIC_KEY);

onMounted(() => {
  if ("payment_intent_client_secret" in route.query) {
    // Retrieve the "payment_intent_client_secret" query parameter appended to
    // your return_url by Stripe.js
    const clientSecret = route.query.payment_intent_client_secret;

    // Retrieve the PaymentIntent
    loader.changeLoadingStatus({ isLoading: true });
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      loader.changeLoadingStatus({ isLoading: false });

      // Inspect the PaymentIntent `status` to indicate the status of the payment
      // to your customer.
      //
      // Some payment methods will [immediately succeed or fail][0] upon
      // confirmation, while others will first enter a `processing` state.
      //
      // [0]: https://stripe.com/docs/payments/payment-methods#payment-notification
      switch (paymentIntent.status) {
        case "succeeded":
          if (user.currentRole === ROLE.JOINER) {
            routePushMultipleTag("payment", {
              tag: "book-ticket-confirmation",
              id: route.params.tag,
            });
          } else if (user.currentRole === ROLE.SHARELEAD) {
            routePushMultipleTag("payment", {
              tag: "confirmation",
              id: route.params.tag,
            });
          }
          break;

        case "processing":
          showToast(
            "info",
            "Payment processing. We'll update you when payment is received."
          );
          break;

        case "requires_payment_method":
          routePushMultipleTag("error", {
            tag: "payment-error",
            id: route.params.tag,
          });
          break;

        default:
          routePushMultipleTag("error", {
            tag: "payment-error",
            id: route.params.tag,
          });
          break;
      }
    });
  }
});
</script>
