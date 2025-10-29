<template>
  <div
    class="text-start ship-gray col-sm-12 col-md-10 col-xl-8 mx-auto"
    v-if="currentTrip"
  >
    <div
      class="col-sm-12 col-md-12 mx-auto stepper-container d-flex justify-content-around my-3 pe-4"
      v-if="step < 3"
    >
      <a class="sb-tertiary p-0 fw-bold me-2" @click="prevStep">
        <i class="fi fi-chevron-left icon-text-stroke"></i>
      </a>
      <div class="stepper bg-light rounded-pill w-100 position-relative">
        <div
          class="loading extended-green-bg position-absolute top-0 bottom-0 left-0 right-0 rounded-pill"
          :class="[step === 1 ? 'w-50' : 'w-100']"
        ></div>
        <p class="stepper-count position-absolute">{{ step }} / {{ steps }}</p>
      </div>
      <a
        class="sb-tertiary p-0 fw-bold ms-2"
        v-show="step === 1"
        @click="rightArrowClicked = true"
        ><i class="fi fi-chevron-right icon-text-stroke"></i
      ></a>
    </div>
    <!-- Step 1 -->
    <TicketBookingStepOne
      :current-trip="currentTrip"
      :prev-step="prevStep"
      :next-step="nextStep"
      :right-arrow-clicked="rightArrowClicked"
      v-if="step === 1"
    />
    <!-- step 2 -->
    <div v-else-if="step === 2">
      <h2 class="fw-bold">{{ t("sharebus.joiner.booking.your_booking") }}</h2>
      <TicketBookingStepTwo
        :current-trip="currentTrip"
        :prev-step="prevStep"
        :next-step="nextStep"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ComputedRef, inject, onMounted, onUnmounted, ref, watch } from "vue";
import { useJoinerTripStore, useUserStore } from "@/store";
import { useRoute } from "vue-router";
import {
  goBack,
  removeZforISOString,
  routePush,
  routePushTagQuery,
  scrollToHeight,
  serverTime,
} from "@/utils";
import { useI18n } from "vue-i18n";
import TicketBookingStepOne from "@/components/modules/joiner/booking/TicketBookingStepOne.vue";
import TicketBookingStepTwo from "@/components/modules/joiner/booking/TicketBookingStepTwo.vue";
import { showToast } from "@/services/toast/toast.service";
import { TRIP_STATUS } from "@/components/modules/sharelead/trip/tripStatus/tripStatusEnum";
import { isAfter } from "date-fns";
import { Trip } from "@/store/trip/privateTrip/types";
import { countryType } from "@/core/plugin/countryPlugin";
import { useRedirect } from "@/services/auth/redirect.service";

const { t } = useI18n();
const route = useRoute();
const user = useUserStore();
const joinerTripStore = useJoinerTripStore();

const step = ref(1);
const steps = 2;
const currentTrip = ref();
const rightArrowClicked = ref(false);
const country = inject<ComputedRef<countryType>>("country");

onMounted(() => {
  step.value = joinerTripStore.getCurrentStep;
  joinerTripStore.getPublicTrip(route.params.tag as string).then((res) => {
    const trip = res as Trip;

    if (
      !trip?.is_published ||
      (trip.trip_status !== TRIP_STATUS.UNCONFIRMED &&
        trip.trip_status !== TRIP_STATUS.CONFIRMED) ||
      isAfter(
        new Date(removeZforISOString(serverTime())),
        new Date(removeZforISOString(trip.deadline_ticket_selling))
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

onUnmounted(() => {
  joinerTripStore.$reset();
});

watch(
  () => joinerTripStore.trip,
  () => {
    currentTrip.value = joinerTripStore.getCurrentTrip;
  }
);

const prevStep = () => {
  if (step.value > 1) {
    scrollToHeight(-1);
    step.value > 1 && step.value--;
    joinerTripStore.setCurrentStep(step.value);
  } else {
    const backUrl = window.history.state.back;

    if (backUrl) goBack();
    else routePush("joiner-trips");
  }
};

/**
 * Takes to the next step directly if authenticated.
 */
const nextStep = () => {
  if (!user.isAuthenticated) {
    routePushTagQuery("auth", "signin", { redirectUrl: `${route.path}` });
  } else {
    step.value++;
    scrollToHeight(-1);
    joinerTripStore.setCurrentStep(step.value);
    rightArrowClicked.value = false;
  }
};
</script>

<style lang="scss" scoped>
.stepper-container {
  height: 25px;
  .stepper {
    .loading {
      transition: 0.4s all ease-in-out;
    }
    .stepper-count {
      right: 20px;
    }
  }
}
</style>
