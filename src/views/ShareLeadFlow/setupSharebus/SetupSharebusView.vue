<template>
  <div class="row" v-if="!isConfigLoaded">
    <div class="col-sm-12 col-md-10 mx-auto">
      <div
        class="col-sm-10 col-md-12 mx-auto stepper-container d-flex justify-content-around my-3 pe-4"
        v-if="step < 3"
      >
        <a class="sb-tertiary fw-bold me-2" @click="prevStep">
          <i class="fi fi-chevron-left icon-text-stroke"></i>
        </a>
        <div class="stepper bg-light rounded-pill w-100 position-relative">
          <div
            class="loading extended-green-bg position-absolute top-0 bottom-0 left-0 right-0 rounded-pill"
            :class="[step === 1 ? 'w-50' : 'w-100']"
          ></div>
          <p class="stepper-count position-absolute">
            {{ step }} / {{ steps - 1 }}
          </p>
        </div>
        <a
          class="bg-white sb-tertiary border-0 p-0 text-primary fw-bold ms-2"
          v-show="step <= 2"
          @click="handleGoToNextStep"
          ><i class="fi fi-chevron-right icon-text-stroke"></i
        ></a>
      </div>
    </div>
    <div class="col-sm-12 col-md-10 mx-auto">
      <div class="col-sm-10 col-md-12 mx-auto">
        <h2 class="text-start fw-bold my-4" v-show="step < 3">
          {{ t("home.set_up_a_sharebus") }}
        </h2>

        <div>
          <!-- Step 01 -->
          <TripDetailsStepOne
            v-if="step === 1"
            :init-values="initValues"
            :prev-step="prevStep"
            :next-step="nextStep"
          />
          <!-- Step 02 -->
          <TripDetailsStepTwo
            v-if="step === 2"
            :prev-step="prevStep"
            :next-step="nextStep"
          />
        </div>
      </div>
      <div class="col-sm-10 col-md-12 mx-auto">
        <!-- Step 03 -->
        <TripDetailsStepThree
          v-if="step === 3"
          :prev-step="prevStep"
          :next-step="nextStep"
        />
      </div>
    </div>
  </div>

  <BaseConfirmationModal
    modal-id="confirmResetModal"
    v-model="confirmationModal.show.value"
  >
    <template v-slot:header>
      <h3 title="Form modal">{{ t("auth.common.are_u_sure") }}</h3>
    </template>
    <template v-slot:content>
      <h3 title="Form modal">{{ t("common.all_data_will_clear") }}</h3>
    </template>
    <template v-slot:footer>
      <BaseButton
        button-class="sb-btn-lg sb-btn-primary rounded-pill"
        button-text="Yes"
        @click="handleReset"
      />
      <BaseButton
        button-text="No"
        button-class="sb-btn-lg sb-btn-danger rounded-pill"
        @click="confirmationModal.toggleShow"
      />
    </template>
  </BaseConfirmationModal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import BaseButton from "@busgroup/vue3-base-button";
import BaseConfirmationModal from "@busgroup/vue3-base-confirmation-modal";
import TripDetailsStepOne from "@/components/modules/sharelead/setupSharebus/TripDetailsStepOne.vue";
import TripDetailsStepTwo from "@/components/modules/sharelead/setupSharebus/TripDetailsStepTwo.vue";
import TripDetailsStepThree from "@/components/modules/sharelead/setupSharebus/TripDetailsStepThree.vue";
import { useI18n } from "vue-i18n";
import {
  goBack,
  isoFormatDateTime,
  loopThroughNumber,
  routePush,
  routePushMultipleTag,
  routePushTag,
  scrollToHeight,
} from "@/utils";
import { useToggle } from "@/composables/useToggle";
import { computed } from "@vue/reactivity";
import {
  useSharebusStore,
  useBusInfoStore,
  useUserStore,
  useConfigStore,
} from "@/store";
import {
  CreateShareBus,
  Tickets,
} from "./types/sharebus/ShareBusCreationProcess";
import { DISCOUNT_SCHEME } from "@/components/modules/sharelead/setupSharebus/enums/SetUpShareBusEnum";
import ShareBusSetUpController from "@/components/modules/sharelead/setupSharebus/Controllers/ShareBusSetUpController";
import { ROLE, STEPS } from "@/components/common/enums/enums";
import { showToast } from "@/services/toast/toast.service";
import UriController from "@/components/controller/UriController";

const { t } = useI18n();
const user = useUserStore();
const sharebus = useSharebusStore();
const busInfo = useBusInfoStore();
const confirmationModal = useToggle();
const step = ref(sharebus.setup.currentStep);
const steps = 3;
const stepTrack = computed(() => sharebus.setup.currentStep);
const userDetails = computed(() => user);
const config = useConfigStore();

const isConfigLoaded = computed(() => config.$state.loading);
const uriCountry = computed(() => UriController.getQuery());

const prevStep = () => {
  if (step.value > 1) {
    scrollToHeight(-1);
    step.value > 1 && step.value--;
    sharebus.$patch({ setup: { currentStep: step.value } });
  } else {
    confirmationModal.toggleShow();
  }
};

/**
 * Sets the submit state so that child component can call the next step function.
 */
const handleGoToNextStep = () => {
  const stepValue =
    step.value === 1 ? STEPS.ONE : step.value === 2 ? STEPS.TWO : STEPS.THREE;
  ShareBusSetUpController.setSubmitState(stepValue, true);
};

const initValues = computed(() => {
  if (sharebus.getStepOneData.viaPoints.oneway.length > 0) {
    return {
      // tripId: route.params.tag as string,
      // signage: salesHistory.value.trip_location_time.bus_signage,
      origin: sharebus.getStepOneData.origin,
      originLatLng: sharebus.getStepOneData.originLatLng,
      destination: sharebus.getStepOneData.destination,
      destinationLatLng: sharebus.getStepOneData.destinationLatLng,
      departureDate: sharebus.getStepOneData.departureDateTime
        ? isoFormatDateTime(sharebus.getStepOneData.departureDateTime)
        : sharebus.getStepOneData.departureDateTime,
      departureTime: sharebus.getStepOneData.departureDateTime
        ? isoFormatDateTime(sharebus.getStepOneData.departureDateTime)
        : sharebus.getStepOneData.departureDateTime,
      bus_availability: sharebus.getStepOneData.busAvailability,
      returnDate: sharebus.getStepOneData.returnDateTime
        ? isoFormatDateTime(sharebus.getStepOneData.returnDateTime)
        : sharebus.getStepOneData.returnDateTime,
      returnTime: sharebus.getStepOneData.returnDateTime
        ? isoFormatDateTime(sharebus.getStepOneData.returnDateTime)
        : sharebus.getStepOneData.returnDateTime,
      route_points: sharebus.getStepOneData.viaPoints,
    };
  }
});

//it will be used while backend give us api we will send information to them
const tripPayload = computed((): CreateShareBus => {
  const ticketArray: Tickets[] = [];
  loopThroughNumber(50, (i: number) => {
    ticketArray.push({
      issue_number: i + 1,
      ticket_price:
        i < 10 &&
        sharebus.getStepThreeData.discountScheme === DISCOUNT_SCHEME.EARLY_BIRD
          ? (sharebus.getStepThreeData.earlyBirdTicketPrice as number)
          : (sharebus.getStepThreeData.ticketPrice as number),
    });
  });
  let fromLocationLatLong = {
    lat: sharebus.getStepOneData.originLatLng?.lat as number,
    lng: sharebus.getStepOneData.originLatLng?.lng as number,
  };
  let toLocationLatLong = {
    lat: sharebus.getStepOneData.destinationLatLng?.lat as number,
    lng: sharebus.getStepOneData.destinationLatLng?.lng as number,
  };

  return {
    outbound_from: sharebus.getStepOneData.origin as string,
    outbound_from_lat_long: fromLocationLatLong,
    outbound_to: sharebus.getStepOneData.destination as string,
    outbound_to_lat_long: toLocationLatLong,
    outbound_from_datetime: (sharebus.getStepOneData.departureDateTime
      ? isoFormatDateTime(sharebus.getStepOneData.departureDateTime)
      : sharebus.getStepOneData.departureDateTime) as string,
    outbound_to_datetime: (sharebus.getStepOneData.departureArrivalDateTime
      ? isoFormatDateTime(sharebus.getStepOneData.departureArrivalDateTime)
      : sharebus.getStepOneData.departureArrivalDateTime) as string,
    outbound_timezone: "Europe/Oslo",
    return_from: sharebus.getStepOneData.destination as string,
    return_from_lat_long: toLocationLatLong,
    return_to: sharebus.getStepOneData.origin as string,
    return_to_lat_long: fromLocationLatLong,
    return_from_datetime: (sharebus.getStepOneData.returnDateTime
      ? isoFormatDateTime(sharebus.getStepOneData.returnDateTime)
      : sharebus.getStepOneData.returnDateTime) as string,
    return_to_datetime: (sharebus.getStepOneData.returnArrivalDateTime
      ? isoFormatDateTime(sharebus.getStepOneData.returnArrivalDateTime)
      : sharebus.getStepOneData.returnArrivalDateTime) as string,
    return_timezone: "Europe/Oslo",
    no_return_trip_needed:
      sharebus.getStepOneData.viaPoints.return.length === 0,
    organization_id: sharebus.getStepTwoData.organizationId || null,
    passenger_goal: sharebus.getStepThreeData.passengerGoal as number,
    total_bus_price: busInfo.getBusInfoData.total,
    tickets_reserved: sharebus.getStepThreeData.tickets,
    discount_scheme:
      (sharebus.getStepThreeData.discountPercentage as number) > 0
        ? (sharebus.getStepThreeData.discountScheme as string)
        : DISCOUNT_SCHEME.NONE,
    discount_percentage: sharebus.getStepThreeData.discountPercentage as number,
    ticket: ticketArray,
    sharelead_contributed_amount: sharebus.getStepThreeData
      .deductibleAmount as number,
    club_share_per_extra_ticket: sharebus.getStepTwoData.organizationId
      ? (sharebus.getStepThreeData.bonus as number)
      : 0,
    sharelead_ticket_reserved_price: sharebus.getStepThreeData
      .totalTicketPrice as number,
    sharelead_total_payable_amount: sharebus.getStepThreeData
      .grandTotalPrice as number,
    regular_ticket_price: sharebus.getStepThreeData.ticketPrice as number,
    earlybird_ticket_price: sharebus.getStepThreeData
      .earlyBirdTicketPrice as number,
    country: uriCountry.value.country as string,
    currency:
      UriController.countryMap.value[uriCountry.value.country as string]
        .currency,
    bus_availability: sharebus.getStepOneData.busAvailability,
    route_points: JSON.stringify({
      oneway: sharebus.getStepOneData.viaPoints.oneway.map((item, index) => {
        return { ...item, sequence: index };
      }),
      return: sharebus.getStepOneData.viaPoints.return.map((item, index) => {
        return { ...item, sequence: index };
      }),
    }),
  };
});
const createRequestNotPlaced = ref(true);
const nextStep = () => {
  if (
    userDetails.value.currentRole !== ROLE.SHARELEAD &&
    userDetails.value.currentRole !== ROLE.PARTNER_SHARELEAD &&
    userDetails.value.isAuthenticated
  ) {
    showToast("info", t("home.joiner_warning"), 6000, "top-left");
    return;
  }
  if (step.value === 3) {
    if (!createRequestNotPlaced.value) return;
    createRequestNotPlaced.value = false;
    sharebus
      .createSharebus(tripPayload.value)
      .then((result) => {
        const tripId = JSON.parse(result?.data.createSharebus).trip_id;
        if (tripId) {
          let grandTotal = sharebus.getStepThreeData.grandTotalPrice;
          sharebus.$reset();
          // If user is not partner sharelead, payment is not required.
          // otherwise redirect to payment page.
          if (
            (!user.partner ||
              (user.partner && user.currentRole === ROLE.SHARELEAD)) &&
            grandTotal
          ) {
            routePushMultipleTag("payment", {
              tag: "confirm-and-book",
              id: tripId,
            });
          } else {
            routePushTag("sharbus-confirmation", tripId);
          }
        }
      })
      .catch(() => {
        createRequestNotPlaced.value = true;
      });
  }
  scrollToHeight(-1);
  step.value < steps && step.value++;
  sharebus.$patch({ setup: { currentStep: step.value } });
};

watch(
  () => stepTrack.value,
  (oldValue, newValue) => {
    if (oldValue != newValue) {
      if (newValue != 3) {
        ShareBusSetUpController.setSubmitState(STEPS.THREE, false);
      }
    }
  }
);
const handleReset = () => {
  sharebus.$reset();
  busInfo.$reset();
  confirmationModal.toggleShow();

  const backUrl = window.history.state.back;

  if (backUrl) goBack();
  else routePush("share-lead-buses");
};
/**
 *addEventListener in Vue 3
  -To globally disable window overflow when an input element (type="number") is interacted with, and enable window overflow on end focus.

  -Disable here when focus in
 */
document.addEventListener(
  "focus",
  (event) => {
    if (typeof event.target === "object" && event.target !== null) {
      if ((event.target as HTMLInputElement).matches('input[type="number"]')) {
        document.body.style.overflowY = "hidden";
      }
    }
  },
  true
);
/*
 * Enable window overflow on end focus
 */
document.addEventListener(
  "blur",
  (event) => {
    if (typeof event.target === "object" && event.target !== null) {
      if ((event.target as HTMLInputElement).matches('input[type="number"]')) {
        document.body.style.overflowY = "auto";
      }
    }
  },
  true
);
</script>

<style lang="scss">
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

.custom-btn {
  background-color: var(--ferdia-c1-green-jewel1);
  width: 100%;
  height: 50px;
  &:disabled {
    background-color: #f4f5f4;
    color: #000000 !important;
  }
}
</style>
