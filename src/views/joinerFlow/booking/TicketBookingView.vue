<template>
  <div class="container h-100" v-if="currentTrip">
    <!-- Step Navigator -->
    <div class="row mb-2">
      <div class="col-12">
        <StepNavigator
          :steps="stepNavItems"
          :current-step="currentStep"
          :is-step-valid="true"
          @previous="prevStep"
          @next="nextStep"
        />
      </div>
    </div>

    <!-- Tripinfo and main content -->
    <template v-if="currentStep === Step.SELECT_TICKET">
      <TicketBookingStepOne
        :is-round-trip="isRoundTrip"
        :route-points="parsedRoutePoints"
        :support-page-url="supportPageUrl"
        @continue-checkout="onContinueCheckout"
      />

      <!-- Trip misc section -->
    </template>
    <template v-else-if="currentStep === Step.CHECKOUT">
      <CheckoutStep
        :checkoutInfo="checkoutInfo"
        :prev-step="prevStep"
        :next-step="proceedToPayment"
        :is-round-trip="isRoundTrip"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  ComputedRef,
  inject,
  onBeforeMount,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import {
  useConfigStore,
  useJoinerTripStore,
  useUserStore,
  useCartStore,
} from "@/store";
import { useRoute, useRouter } from "vue-router";
import {
  removeZforISOString,
  routePush,
  routePushTagQuery,
  scrollToHeight,
  serverTime,
} from "@/utils";
import StepNavigator from "@/views/ShareLeadFlow/StepNavigator/StepNavigator.vue";
import { showToast } from "@/services/toast/toast.service";
import { TRIP_STATUS } from "@/components/modules/sharelead/trip/tripStatus/tripStatusEnum";
import { isAfter } from "date-fns";
import { Trip } from "@/store/trip/privateTrip/types";
import { countryType } from "@/core/plugin/countryPlugin";
import { useRedirect } from "@/services/auth/redirect.service";
import { SHAREBUS_CONFIG } from "@/services/graphql/enums/sharebus-config";
import { Ref } from "vue";
import { CTA, LOCAL_VAR } from "@/components/common/enums/enums";
import TicketBookingStepOne from "@/components/modules/joiner/booking/TicketBookingStepOne.vue";
import CheckoutStep from "@/components/modules/joiner/booking/CheckoutStep.vue";
import { CheckoutInfo } from "@/components/modules/joiner/booking/types/checkout.types";

// Define PickupPoint interface
interface PickupPoint {
  id?: string | number;
  point?: string;
  point_formal?: string;
  planned_departure_time?: Date | string;
  point_latitude?: string | number;
  point_longitude?: string | number;
  sequence?: number;
}

enum Step {
  SELECT_TRIP = 1,
  SELECT_TICKET = 2,
  CHECKOUT = 3,
  PAYMENT = 4,
}

const route = useRoute();
const router = useRouter();
const user = useUserStore();
const joinerTripStore = useJoinerTripStore();
const config = useConfigStore();
const cartStore = useCartStore();
const configuration = computed(() => config.getSharebusSetupConfig);
const currentStep: Ref<Step> = ref(Step.SELECT_TICKET);
const rightArrowClicked = ref(false);
const country = inject<ComputedRef<countryType>>("country");

const currentTrip = computed(() => {
  return joinerTripStore.getCurrentTrip;
});

const checkoutInfo = computed((): CheckoutInfo => {
  return {
    id: currentTrip.value.id,
    name: currentTrip.value.name,
    booking_reference: currentTrip.value.booking_reference,
    updated_at: currentTrip.value.updated_at,
  };
});

const parsedRoutePoints = computed(() => {
  try {
    return JSON.parse(currentTrip.value.route_points);
  } catch (error) {
    console.error("Error parsing route points:", error);
    return { oneway: [], return: [] };
  }
});

// Check if this is a round trip
const isRoundTrip = computed(() => {
  return (
    parsedRoutePoints.value.return && parsedRoutePoints.value.return.length > 0
  );
});

// Step Navigator configuration
const stepNavItems = computed(() => [
  { label: "Select Trip" },
  { label: "Select Ticket" },
  { label: "Checkout" },
]);

const onContinueCheckout = () => {
  // Validate that we have a selected via point and at least one ticket
  const hasSelectedViaPoint =
    cartStore.selectedViaPointId !== null ||
    cartStore.selectedViaPointId !== undefined;
  const hasTickets = cartStore.getCartItemCount() > 0;

  if (hasSelectedViaPoint && hasTickets) {
    // Step is valid, proceed to checkout
    nextStep();
  } else {
    // Step is not valid, show error message
    if (!hasSelectedViaPoint) {
      showToast("error", "Please select a pickup point before continuing");
    } else if (!hasTickets) {
      showToast("error", "Please select at least one ticket before continuing");
    }
  }
};

onBeforeMount(() => {
  config.fetchSetupSharebusConfig(SHAREBUS_CONFIG.SCHEDULED_CONFIG);
});

onMounted(() => {
  // currentStep.value = joinerTripStore.getCurrentStep;
  joinerTripStore.getPublicTrip(route.params.tag as string).then((res) => {
    const trip = res as unknown as Trip;

    // Clear cart if trip ID doesn't match current trip
    if (cartStore.tripId && trip.id && cartStore.tripId !== trip.id) {
      cartStore.clearCart();
    }

    if (
      !trip?.is_published ||
      (trip.trip_status !== TRIP_STATUS.UNCONFIRMED &&
        trip.trip_status !== TRIP_STATUS.CONFIRMED) ||
      isAfter(
        new Date(removeZforISOString(serverTime())),
        new Date(
          `${removeZforISOString(trip.deadline_ticket_selling).split("T")[0]} ${
            configuration.value.TicketSalesDeadlineTimeOfDay
          }`
        )
      )
    ) {
      showToast("error", "Sorry,   the trip is not available at this moment");
      routePush("home");
    }
    if (trip.country !== country?.value.countryISO) {
      showToast("error", "Sorry, permission denied");
      useRedirect().redirect();
    }
  });
});

// Should return the support page URL as
// http://localhost:8080/contact-us/ca22bd6b-8243-4ec0-a766-9ad60409c8ae?bookingReference=SB-2508-00027&country=SE
const supportPageUrl = computed(() => {
  if (!user.isAuthenticated) {
    localStorage.setItem(LOCAL_VAR.REDIRECT_URL, route.path);
    return "";
  }
  return `/${CTA.CONTACT}/${currentTrip.value.id}/?bookingReference=${currentTrip.value.booking_reference}&country=${country?.value.countryISO}`;
});

onUnmounted(() => {
  joinerTripStore.$reset();
});

const prevStep = () => {
  if (currentStep.value > 1) {
    scrollToHeight(-1);
    currentStep.value > 1 && currentStep.value--;
    joinerTripStore.setCurrentStep(currentStep.value);
  }
};

watch(currentStep, (newStep) => {
  if (newStep === 1) {
    router.push({ name: "home" });
  }
});

/**
 * Takes to the next step directly if authenticated.
 */
const nextStep = () => {
  if (!user.isAuthenticated) {
    routePushTagQuery("auth", "signin", { redirectUrl: `${route.path}` });
  } else {
    currentStep.value++;
    scrollToHeight(-1);
    joinerTripStore.setCurrentStep(currentStep.value);
    rightArrowClicked.value = false;
  }
};

/**
 * Proceed to payment
 */
const proceedToPayment = () => {
  // The existing step 2 payment flow becomes step 4
  currentStep.value = Step.PAYMENT;
  scrollToHeight(-1);
  joinerTripStore.setCurrentStep(currentStep.value);
};
</script>
<style lang="scss" scoped>
.booking-step-1 {
  min-height: 500px;
}
</style>
