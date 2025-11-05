<template>
  <div class="row" v-if="!isConfigLoaded">
    <div class="col-sm-12 col-md-10 mx-auto">
      <StepNavigator
        :steps="stepsOption"
        :current-step="currentStep"
        :is-step-valid="isCurrentStepValid"
      />
      <!-- @previous="handlePrevious"
        @next="handleNext" -->
    </div>
    <div class="col-sm-12 col-md-10 mx-auto">
      <div class="col-sm-10 col-md-12 mx-auto">
        <!-- <h2
          class="text-start fw-bold my-4"
          v-show="
            stepEnum !== STEPS.PUBLISH &&
            stepEnum !== STEPS.PASSENGER_GOAL_AND_PRICES &&
            stepEnum !== STEPS.TRIP_INFO
          "
        >
          {{ t("home.set_up_a_sharebus") }}
        </h2> -->

        <div>
          <!-- Step 01: Route -->
          <RouteStep
            v-if="stepEnum === STEPS.ROUTE_PAGE"
            ref="routeStepComponentRef"
            :init-values="initValues"
            @validation-change="handleValidationChange"
            @request-next-step="nextStep"
          /><!-- Step 02: Passenger Goal and Prices -->
          <PassengerGoalAndPricesStep
            v-if="stepEnum === STEPS.PASSENGER_GOAL_AND_PRICES"
            ref="passengerGoalComponentRef"
            @validation-change="handleValidationChange"
          />
          <!-- Step 03: Trip Info -->
          <TripInfoStep
            v-if="stepEnum === STEPS.TRIP_INFO"
            ref="tripInfoComponentRef"
            :prev-step="prevStep"
            :next-step="nextStep"
            @validation-change="handleValidationChange"
          />
          <!-- Step 04: Publish -->
          <PublishStep
            v-if="stepEnum === STEPS.PUBLISH"
            @validation-change="handleValidationChange"
          />
        </div>
      </div>
    </div>
    <div class="col-10 mx-auto">
      <!-- Should show generic error msg only after submit button is clicked -->
      <!-- <div
        v-if="shouldShowGenericError"
        class="alert alert-danger py-2 px-3 mb-3"
      >
        {{ t("form.validation.field_missing_or_invalid") }}
      </div> -->
      <div class="d-flex justify-content-between">
        <!-- Show back button only on route step and publish step -->
        <BaseButton
          v-if="stepEnum !== STEPS.TRIP_INFO"
          button-class="sb-btn-lg sb-btn-secondary border-1 medium-gray-border fw-bold rounded-pill d-flex align-items-center"
          type="button"
          @click="handleStepBack"
        >
          <span class="pt-1"
            ><i class="fi fi-chevron-left fs-5 icon-text-stroke green-jewel"></i
          ></span>
          <span class="ms-2">{{ t("button.back") }}</span>
        </BaseButton>
        <!-- Empty div to maintain layout when back button is hidden -->
        <div v-else></div>
        <BaseButton
          type="button"
          @click="handleFormSubmission"
          button-class="sb-btn-primary sb-btn-lg rounded-pill border-0 fw-bold d-flex justify-content-center align-items-center"
        >
          <!-- :disabled="!isCurrentStepValid" -->
          <template v-slot:default>
            <span>{{ getButtonText() }}</span>
            <span class="fw-bold ms-2">
              <i class="fi fi-chevron-right fs-5"></i>
            </span>
          </template>
        </BaseButton>
      </div>
    </div>
  </div>

  <!-- Discard changes dialog -->
  <DiscardChangesDialog
    v-model:show="showDiscardDialog"
    @confirm="handleDiscardConfirm"
    @cancel="handleDiscardCancel"
  />
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import RouteStep from "@/components/modules/sharelead/setupSharebus/RouteStep.vue";
import TripInfoStep from "@/components/modules/sharelead/setupSharebus/TripInfoStep.vue";
import PublishStep from "@/components/modules/sharelead/setupSharebus/PublishStep/PublishStep.vue";
import { useI18n } from "vue-i18n";
import BaseButton from "@busgroup/vue3-base-button";
import {
  computed,
  onMounted,
  onBeforeUnmount,
  reactive,
  ref,
  watch,
} from "vue";
import { ROLE, STEPS } from "@/components/common/enums/enums";
import UriController from "@/components/controller/UriController";
import ShareBusSetUpController from "@/components/modules/sharelead/setupSharebus/Controllers/ShareBusSetUpController";
import { DISCOUNT_SCHEME } from "@/components/modules/sharelead/setupSharebus/enums/SetUpShareBusEnum";
// import { useToggle } from "@/composables/useToggle";
import { showToast } from "@/services/toast/toast.service";
import DiscardChangesDialog from "@/components/modules/sharelead/setupSharebus/DiscardChangesDialog.vue";
import { renameFile, s3FileUpload } from "@/composables/useS3Bucket";
import { ROUTE } from "@/router/enum/routeEnums";
import {
  convertDateToISOString,
  routePushTag,
  formatRoutePointsForAPI,
} from "@/utils";

// Define a single interface for all step components that have validation
interface StepComponent {
  validateBeforeNextStep: (showErrors?: boolean) => boolean;
  [key: string]: any;
}

import {
  useBusInfoStore,
  useConfigStore,
  useSharebusStore,
  useUserStore,
} from "@/store";
import { scrollToHeight } from "@/utils";
import { Coordinate } from "types/sharebus/map.type";
import { CreateShareBus } from "types/sharebus/ShareBusCreationProcess";
import StepNavigator from "../StepNavigator/StepNavigator.vue";
import { useRouter, onBeforeRouteLeave } from "vue-router";
import PassengerGoalAndPricesStep from "@/components/modules/sharelead/setupSharebus/PassengerGoalAndPrices/PassengerGoalAndPricesStep.vue";
import { TripInfoData } from "@/store/sharebus/types";
import { useCompanyTimeFormat } from "@/composables/useCompanyTimeFormat";
const { t } = useI18n();
const router = useRouter();

const formatInCompanyTimezone = useCompanyTimeFormat();

// Add state and handlers for discard confirmation
const showDiscardDialog = ref(false);

const handleDiscardConfirm = () => {
  // Set flag to disable warning since user is intentionally discarding changes
  isIntentionalLeave.value = true;
  sharebus.$reset();
  showDiscardDialog.value = false;
  router.push("/");
};

const handleDiscardCancel = () => {
  showDiscardDialog.value = false;
};

const handleStepBack = () => {
  if (currentStep.value === 1) {
    // On first step, immediately show the discard dialog
    showDiscardDialog.value = true;
    return;
  }
  // Otherwise, go back to previous step
  prevStep();
};

// NEW STEP FLOW
const stepsOption = [
  { label: t("setup.route") },
  { label: t("setup.passenger_goal_and_prices") },
  { label: t("setup.trip_info") },
  { label: t("setup.publish") },
];

const currentStep = ref(1);
// Define component refs with the simplified interface
const passengerGoalComponentRef = ref<StepComponent | null>(null);
const routeStepComponentRef = ref<StepComponent | null>(null);
const tripInfoComponentRef = ref<StepComponent | null>(null);

const user = useUserStore();
const sharebus = useSharebusStore();
const busInfo = useBusInfoStore();

// Page leave/reload warning system
const isIntentionalLeave = ref(false);

const hasUnsavedChanges = computed(() => {
  // Check if user has made any changes to the sharebus setup
  const routeData = sharebus.getRouteStepData;
  const goalData = sharebus.getPassengerGoalAndPriceStepData;
  const tripData = sharebus.getTripInfoData;

  // Consider changes made if any step has data or if we're past the first step
  return (
    !isIntentionalLeave.value &&
    ((step.value && routeData.route_points.oneway.length > 0) ||
      routeData.route_points.return.length > 0 ||
      (goalData.passengerGoal && goalData.passengerGoal > 0) ||
      (tripData.name && tripData.name.trim() !== ""))
  );
});

// Handle beforeunload event for browser refresh/close
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (hasUnsavedChanges.value) {
    event.preventDefault();
    event.returnValue = t("common.unsaved_changes_warning");
    return event.returnValue;
  }
};

// Setup and cleanup beforeunload listener
onMounted(() => {
  window.addEventListener("beforeunload", handleBeforeUnload);
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
});

// Handle Vue Router navigation
onBeforeRouteLeave(() => {
  if (hasUnsavedChanges.value) {
    const confirmLeave = confirm(t("common.unsaved_changes_warning"));
    if (!confirmLeave) {
      return false; // Cancel navigation
    }
  }
  return true; // Allow navigation
});

// const confirmationModal = useToggle(); // Unused variable - commented out
const step = ref(sharebus.setup.currentStep);
const steps = 4; // Updated to 4 steps
const stepTrack = computed(() => sharebus.setup.currentStep);
const userDetails = computed(() => user);
const config = useConfigStore();

const passengerAndGoalStepData = computed(() => {
  return sharebus.getPassengerGoalAndPriceStepData;
});

// Track validation state for all steps
const stepsValidState = reactive({
  step1: false,
  step2: false,
  step3: false,
  step4: false,
});

// Convert numeric step to enum value
const stepEnum = computed(() => {
  let result;
  switch (step.value) {
    case 1:
      result = STEPS.ROUTE_PAGE;
      break;
    case 2:
      result = STEPS.PASSENGER_GOAL_AND_PRICES;
      break;
    case 3:
      result = STEPS.TRIP_INFO;
      break;
    case 4:
      result = STEPS.PUBLISH;
      break;
    default:
      result = STEPS.ROUTE_PAGE;
  }
  console.log("Computed stepEnum result:", result);
  return result;
});

// Track if the current step is valid
const submitAttempted = ref(false);
const isCurrentStepValid = computed(() => {
  // Only check validation state, do not trigger validation on mount/step change
  switch (stepEnum.value) {
    case STEPS.ROUTE_PAGE:
      return stepsValidState.step1;
    case STEPS.PASSENGER_GOAL_AND_PRICES:
      return stepsValidState.step2;
    case STEPS.TRIP_INFO:
      return stepsValidState.step3;
    case STEPS.PUBLISH:
      return stepsValidState.step4;
    default:
      return false;
  }
});

const isConfigLoaded = computed(() => config.$state.loading);
const uriCountry = computed(() => UriController.getQuery());

const prevStep = () => {
  if (step.value > 1) {
    scrollToHeight(-1);
    step.value > 1 && step.value--;
    sharebus.$patch({ setup: { currentStep: step.value } });
    currentStep.value = step.value; // Ensure sync
  }
};

// Just keeping the implementation simple since we're now handling steps directly

// Cast the initValues to any to avoid strict type checking issues
const initValues = computed(() => {
  if (sharebus.getRouteStepData.route_points.oneway.length > 0) {
    return {
      bus_availability: sharebus.getRouteStepData.busAvailability,
      route_points: sharebus.getRouteStepData.route_points,
    } as any;
  }
  return undefined;
});

//it will be used while backend give us api we will send information to them
const tripPayload = computed((): CreateShareBus => {
  const onewayRoutePoints = sharebus.getRouteStepData.route_points.oneway;
  const returnRoutePoints = sharebus.getRouteStepData.route_points.return;

  /**
   * Extracts latitude and longitude coordinates for the start and end points of both one-way and return routes.
   *
   * - `fromLocationLatLong`: The latitude and longitude of the starting point of the one-way route.
   * - `toLocationLatLong`: The latitude and longitude of the ending point of the one-way route.
   * - `returnFromLocationLatLong`: The latitude and longitude of the starting point of the return route (if available).
   * - `returnToLocationLatLong`: The latitude and longitude of the ending point of the return route (if available).
   *
   * Coordinates are parsed as floats for one-way routes and as numbers for return routes.
   */
  let fromLocationLatLong = {
    lat: parseFloat(onewayRoutePoints[0].point_latitude as string),
    lng: parseFloat(onewayRoutePoints[0].point_longitude as string),
  };

  console.log("From Location:", fromLocationLatLong);
  let toLocationLatLong = {
    lat: parseFloat(
      onewayRoutePoints[onewayRoutePoints.length - 1].point_latitude as string
    ),
    lng: parseFloat(
      onewayRoutePoints[onewayRoutePoints.length - 1].point_longitude as string
    ),
  };

  let returnFromLocationLatLong: Coordinate = {};
  let returnToLocationLatLong: Coordinate = {};

  if (returnRoutePoints.length > 0) {
    returnFromLocationLatLong = {
      lat: returnRoutePoints[0]?.point_latitude as number,
      lng: returnRoutePoints[0]?.point_longitude as number,
    };

    returnToLocationLatLong = {
      lat: returnRoutePoints[returnRoutePoints?.length - 1]
        ?.point_latitude as number,
      lng: returnRoutePoints[returnRoutePoints?.length - 1]
        ?.point_longitude as number,
    };
  }

  /**
   * Extracts and converts planned departure and arrival times from route points to UTC ISO strings from client time not company time.
   *
   * - `outboundFromDatetime`: Planned departure time of the first outbound route point.
   * - `outboundFromDatetimeUTC`: UTC ISO string of the outbound departure time.
   * - `outboundToDatetime`: Planned arrival time of the last outbound route point.
   * - `outboundToDatetimeUTC`: UTC ISO string of the outbound arrival time.
   * - `returnFromDatetime`: Planned departure time of the first return route point.
   * - `returnFromDatetimeUTC`: UTC ISO string of the return departure time.
   * - `returnToDatetime`: Planned arrival time of the last return route point.
   * - `returnToDatetimeUTC`: UTC ISO string of the return arrival time.
   *
   */

  const outboundFromDatetime = onewayRoutePoints[0]?.planned_departure_time;
  const outboundFromDatetimeUTC = outboundFromDatetime
    ? convertDateToISOString(outboundFromDatetime) || ""
    : "";
  const outboundToDatetime =
    onewayRoutePoints[onewayRoutePoints.length - 1]?.planned_arrival_time;
  const outboundToDatetimeUTC = outboundToDatetime
    ? convertDateToISOString(outboundToDatetime) || ""
    : "";

  const returnFromDatetime = returnRoutePoints[0]?.planned_departure_time;
  const returnFromDatetimeUTC = returnFromDatetime
    ? convertDateToISOString(returnFromDatetime)
    : null;
  const returnToDatetime =
    returnRoutePoints[returnRoutePoints.length - 1]?.planned_arrival_time;
  const returnToDatetimeUTC = returnToDatetime
    ? convertDateToISOString(returnToDatetime)
    : null;

  // console the time as table with columns company time and UTC

  console.table([
    {
      Type: "Outbound",
      "Departure (Client Time)": outboundFromDatetime,
      "Departure (Company Time)": formatInCompanyTimezone(
        outboundFromDatetime as string
      ),
      "Departure (UTC)": outboundFromDatetimeUTC,
      "Arrival (Client Time)": outboundToDatetime,
      "Arrival (Company Time)": formatInCompanyTimezone(
        outboundToDatetime as string
      ),
      "Arrival (UTC)": outboundToDatetimeUTC,
    },
    {
      Type: "Return",
      "Departure (Client Time)": returnFromDatetime,
      "Departure (Company Time)": formatInCompanyTimezone(
        returnFromDatetime as string
      ),
      "Departure (UTC)": returnFromDatetimeUTC,
      "Arrival (Client Time)": returnToDatetime
        ? new Date(returnToDatetime).toUTCString()
        : "N/A",
      "Arrival (Company Time)": formatInCompanyTimezone(
        returnToDatetime as string
      ),
      "Arrival (UTC)": returnToDatetimeUTC,
    },
  ]);

  // Formatting route points
  /**
   * `formattedRoutePoints` is an object containing formatted route point data for both 'oneway' and 'return' journeys.
   *
   * For each route point:
   * - Copies all properties from the original item.
   * - Adds a `sequence` property representing the index of the route point in the array.
   * - Converts `planned_departure_time` and `actual_departure_time` to UTC ISO string format if present; otherwise sets them to `null`.
   *
   * Structure:
   * {
   *   oneway: Array<RoutePoint>,
   *   return: Array<RoutePoint>
   * }
   *
   * Each `RoutePoint` object includes:
   * - All original properties from the source item.
   * - `sequence`: number (index in the array)
   * - `planned_departure_time`: string | null (UTC ISO format)
   * - `actual_departure_time`: string | null (UTC ISO format)
   */
  // Format route points using common utility
  const formattedRoutePoints = formatRoutePointsForAPI(
    sharebus.getRouteStepData.route_points
  );

  // Creating final payload object
  return {
    outbound_from: onewayRoutePoints[0].point,
    outbound_from_lat_long: fromLocationLatLong,
    outbound_to: onewayRoutePoints[onewayRoutePoints.length - 1]
      .point as string,
    outbound_to_lat_long: toLocationLatLong,
    // convert outbound times to UTC
    outbound_from_datetime: outboundFromDatetimeUTC,
    outbound_to_datetime: outboundToDatetimeUTC,
    outbound_timezone: "Europe/Oslo",
    return_from: returnRoutePoints.length ? returnRoutePoints[0]?.point : "",
    return_from_lat_long: returnFromLocationLatLong,
    return_to: returnRoutePoints.length
      ? returnRoutePoints[returnRoutePoints?.length - 1]?.point
      : "",
    return_to_lat_long: returnToLocationLatLong,
    return_from_datetime: returnFromDatetimeUTC,
    return_to_datetime: returnToDatetimeUTC,
    return_timezone: "Europe/Oslo",
    no_return_trip_needed: sharebus.getRouteStepData
      .no_return_trip_needed as boolean,
    organization_id: sharebus.getOrganizationStepData.organizationId || null,
    passenger_goal: passengerAndGoalStepData.value.passengerGoal as number,
    total_bus_price: busInfo.getBusInfoData.total,
    tickets_reserved: passengerAndGoalStepData.value.tickets,
    discount_scheme: DISCOUNT_SCHEME.NONE,
    discount_percentage: 0,
    sharelead_contributed_amount: 0,
    club_share_per_extra_ticket: 0,
    sharelead_ticket_reserved_price: 0,
    sharelead_total_payable_amount: 0,
    regular_ticket_price: 0,
    earlybird_ticket_price: 0,
    country: uriCountry.value.country as string,
    currency:
      UriController.countryMap.value[uriCountry.value.country as string]
        .currency,
    bus_availability: sharebus.getRouteStepData.busAvailability,
    route_points: JSON.stringify(formattedRoutePoints),
    max_pax: passengerAndGoalStepData.value.max_pax || 50,
    show_available_seats: passengerAndGoalStepData.value.show_available_seats,
    // New API payload fields
    ticket_pricing: {
      categories:
        passengerAndGoalStepData.value.ticket_pricing?.categories || [],
      via_points:
        passengerAndGoalStepData.value.ticket_pricing?.via_points || [],
    },
    ticket_discounts: passengerAndGoalStepData.value.ticket_discounts || [],
  };
});
const createRequestNotPlaced = ref(true);

const createSharebus = (cb: () => void) => {
  createRequestNotPlaced.value = false;
  console.log("Creating sharebus with payload:", tripPayload.value);
  // Use type assertion to work around store type issues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sharebus
    .createSharebus(tripPayload.value)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then((result: any) => {
      const tripId = JSON.parse(result?.data.createSharebus).trip_id;
      console.log("sharebus created tripId ", tripId);
      if (tripId) {
        sharebus.$state.setup.createdTripId = tripId;
        cb();
      }
    })
    .catch(() => {
      createRequestNotPlaced.value = true;
    })
    .finally(() => {
      console.log("Sharebus creation request completed.");
    });
};

const publishSharebus = () => {
  const tripId = sharebus.$state.setup.createdTripId;
  if (!tripId) {
    console.error("No trip ID available for publishing");
    showToast("error", t("setup.no_trip_id_error"), 3000, "top-left");
    return;
  }

  const tripInfoData = sharebus.getTripInfoData;
  if (!tripInfoData) {
    console.log("No trip info data available");
    showToast("error", t("setup.no_trip_info_error"), 3000, "top-left");
    return;
  }

  // Check if there's a image_url to upload
  if (tripInfoData.image_url && typeof tripInfoData.image_url !== "string") {
    // Upload image_url first, then publish
    const file = tripInfoData.image_url as File;
    const ext = file.name.split(".").pop();
    const renamedFile = renameFile(file, `${tripId}.${ext}`);

    // Upload the file to S3
    s3FileUpload(renamedFile, {
      uploadedBy: user.getUserInfo?.attributes?.email || "",
      userId: user.getUserInfo?.id || "",
      tripId: tripId,
    })
      .then((uploadResult) => {
        console.log("Image uploaded to S3:", uploadResult);

        // Now publish with the uploaded image URL
        performPublish(tripId, tripInfoData, uploadResult || "");
      })
      .catch((error) => {
        console.error("Error uploading image_url:", error);
        showToast("error", t("setup.photo_upload_error"), 3000, "top-left");
      });
  } else {
    // No image_url to upload, publish directly
    console.log("Publishing sharebus without image upload");
    performPublish(tripId, tripInfoData, tripInfoData.image_url || "");
  }
};

const performPublish = (
  tripId: string,
  tripInfoData: TripInfoData,
  imageUrl: string
) => {
  // Set flag to disable warning since user is intentionally publishing
  isIntentionalLeave.value = true;

  // Use type assertion to work around store type issues
  sharebus
    .publishSharebus({
      id: tripId,
      name: tripInfoData.name,
      category: tripInfoData.category || "",
      info_to_travellers: tripInfoData.info_to_travellers || "",
      website_url: tripInfoData.website_url || "",
      image_url: imageUrl,
      trip_organizer: tripInfoData.trip_organizer || "",
    })
    .then(() => {
      console.log("Sharebus published successfully");

      // Navigate to appropriate trip page based on user role
      const tripPageRoute =
        user.currentRole === ROLE.PARTNER_SHARELEAD
          ? ROUTE.PARTNER_SHARELEAD_TRIP_PAGE
          : ROUTE.SHARELEAD_TRIP_PAGE;

      routePushTag(tripPageRoute, tripId);
    })
    .catch((error) => {
      console.error("Error publishing sharebus:", error);
      // Reset flag if publish failed
      isIntentionalLeave.value = false;
      showToast("error", t("setup.publish_error"), 3000, "top-left");
    });
};

const nextStep = () => {
  console.log("Next step called, current step:", step.value);
  if (
    userDetails.value.currentRole !== ROLE.SHARELEAD &&
    userDetails.value.currentRole !== ROLE.PARTNER_SHARELEAD &&
    userDetails.value.isAuthenticated
  ) {
    showToast("info", t("home.joiner_warning"), 6000, "top-left");
    return;
  }

  // Ensure we only increment by one step at a time
  scrollToHeight(-1);

  // Log current step before incrementing
  // Always just increment by one step
  if (step.value < steps) {
    const newStepValue = step.value + 1;

    // Update both the local step and the store atomically
    step.value = newStepValue;
    sharebus.$patch({ setup: { currentStep: newStepValue } });
  }
};

const handleFormSubmission = async () => {
  submitAttempted.value = true;

  // Get the appropriate component ref based on current step
  const stepComponentRef =
    stepEnum.value === STEPS.ROUTE_PAGE
      ? routeStepComponentRef.value
      : stepEnum.value === STEPS.PASSENGER_GOAL_AND_PRICES
      ? passengerGoalComponentRef.value
      : stepEnum.value === STEPS.TRIP_INFO
      ? tripInfoComponentRef.value
      : null;

  // If we have a valid component ref with validation method
  if (stepComponentRef && stepComponentRef.validateBeforeNextStep) {
    // Validate current step and show errors since this is triggered by submit button
    const isValid = await stepComponentRef.validateBeforeNextStep(true);

    // For RouteStep, allow submission to proceed even if validation fails
    // This allows the RouteStep to handle bus price errors internally
    if (!isValid && stepEnum.value !== STEPS.ROUTE_PAGE) {
      console.log("Validation failed for step:", stepEnum.value);
      return;
    }
  }

  // For Publish step, handle differently
  if (stepEnum.value === STEPS.PUBLISH) {
    publishSharebus();
    return;
  }

  // Special handling for RouteStep (Step 1) - handle ad-hoc confirmation
  if (stepEnum.value === STEPS.ROUTE_PAGE) {
    // Set controller state
    ShareBusSetUpController.setSubmitState("one", true);
    ShareBusSetUpController.setFetchPrice(true);

    // For Route step, we'll let the component handle the next step request
    // The RouteStep component will emit "request-next-step" after handling ad-hoc confirmation
    return;
  }
  // Set appropriate controller state based on step
  else if (stepEnum.value === STEPS.PASSENGER_GOAL_AND_PRICES) {
    ShareBusSetUpController.setSubmitState("two", true);
    ShareBusSetUpController.setFetchPrice(true);
    createSharebus(nextStep);
    return;
  } else if (stepEnum.value === STEPS.TRIP_INFO) {
    ShareBusSetUpController.setSubmitState("three", true);
  }

  // Navigate to next step
  nextStep();
};

watch(
  () => stepTrack.value,
  (newValue, oldValue) => {
    if (oldValue !== newValue) {
      // Convert newValue to enum equivalent
      const newStepEnum =
        newValue === 1
          ? STEPS.ROUTE_PAGE
          : newValue === 2
          ? STEPS.PASSENGER_GOAL_AND_PRICES
          : newValue === 3
          ? STEPS.TRIP_INFO
          : STEPS.PUBLISH;

      // Make sure the step increment is only by 1 (safeguard against skipping)
      if (newValue > oldValue && newValue - oldValue > 1) {
        // Reset to the previous step + 1 to prevent skipping
        const correctedStep = oldValue + 1;
        sharebus.$patch({ setup: { currentStep: correctedStep } });
      }

      // Reset validation state for previous steps if needed
      if (newStepEnum !== STEPS.TRIP_INFO) {
        ShareBusSetUpController.setSubmitState("three", false);
      }

      // Force update the step reference to match store
      step.value = sharebus.setup.currentStep;
    }
  }
);

const handleValidationChange = ({ step, isValid }) => {
  // Convert numeric step to enum mapping for validation state
  if (step === 1 || step === STEPS.ROUTE_PAGE) stepsValidState.step1 = isValid;
  else if (step === 2 || step === STEPS.PASSENGER_GOAL_AND_PRICES)
    stepsValidState.step2 = isValid;
  else if (step === 3 || step === STEPS.TRIP_INFO)
    stepsValidState.step3 = isValid;
  else if (step === 4 || step === STEPS.PUBLISH)
    stepsValidState.step4 = isValid;
};

// Function to get button text based on current step
const getButtonText = () => {
  switch (stepEnum.value) {
    case STEPS.ROUTE_PAGE:
      return t("auth.common.continue");
    case STEPS.PASSENGER_GOAL_AND_PRICES:
      return t("button.draft_and_continue");
    case STEPS.TRIP_INFO:
      return t("auth.common.continue");
    case STEPS.PUBLISH:
      return t("button.publish");
    default:
      return t("auth.common.continue");
  }
};

// AdHoc modal management has been moved entirely to the RouteStep component

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

// AdHoc modal handling has been moved to the RouteStep component

// Watch step changes to validate the current step immediately when it becomes active
watch(
  () => stepEnum.value,
  (newStepEnum) => {
    // Get the appropriate component ref based on new step
    const stepComponentRef =
      newStepEnum === STEPS.ROUTE_PAGE
        ? routeStepComponentRef.value
        : newStepEnum === STEPS.PASSENGER_GOAL_AND_PRICES
        ? passengerGoalComponentRef.value
        : newStepEnum === STEPS.TRIP_INFO
        ? tripInfoComponentRef.value
        : null;

    // If we have a valid component ref with validation method, validate it
    if (stepComponentRef && stepComponentRef.validateBeforeNextStep) {
      stepComponentRef.validateBeforeNextStep();
    }
  }
);

// Update currentStep when step changes
watch(
  () => step.value,
  (newStepValue) => {
    // Important: Update store first, then local currentStep ref
    sharebus.$patch({ setup: { currentStep: newStepValue } });
    currentStep.value = newStepValue;
    submitAttempted.value = false; // Reset submitAttempted when step changes
  },
  { immediate: true }
);

// Update step when currentStep changes
watch(
  () => currentStep.value,
  (newCurrentStep) => {
    // Only update step if different to avoid circular updates
    if (step.value !== newCurrentStep) {
      step.value = newCurrentStep;
    }
  }
);

onMounted(() => {
  // sharebus.$reset();
});
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
