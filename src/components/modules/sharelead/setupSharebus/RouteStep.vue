<template>
  <div class="pt-4 px-2 bg-white" v-if="isEditMode">
    <div :class="formClass">
      <h2 class="text-start fw-bold">
        {{ t("sales.details.edit_itinerary") }}
      </h2>
      <BaseSaveChanges
        @saveChanges="saveItineraryData"
        class="col-sm-12 col-md-12 my-3"
      />
    </div>
    <hr class="m-0" />
  </div>
  <form @submit.prevent :class="formClass">
    <h2 class="text-start">{{ t("setup.setup_route") }}</h2>
    <ViaPoints
      :init-values="routePointsComp"
      :trySubmit="submitBtnClicked"
      :is-edit-mode="isEditMode"
      :is-round-trip="routePointsComp?.return.length > 0"
      v-model:busAvailability="busAvailability"
      :busAvailabilityErrorMsg="busAvailabilityErrorMsg"
      :companyInfo="{
        logo: 'https://d188y0h7d3nwcc.cloudfront.net/bs23-dev/company_logo_s3_20221318_051356.png',
        leg_percentage: 15,
        default_pause_time: 5,
        max_departure: 720000,
        min_days_before_booking: isEditMode
          ? 0
          : config.getSharebusSetupConfig.MinimumDaysBeforeBooking,
        timezone: 'Europe/Oslo',
      }"
      :translations="viaPointTranslations"
      @on-via-point-loading="setVpLoading"
      @on-select-trip-type="setTripType"
      @on-ready-vp-list="setRoutePoints"
      @on-via-point-missing="setVpMissing"
      @on-via-point-error="setVpErrors"
    />

    <p
      class="error-input-color text-start"
      v-show="showGeneralErr && submitBtnClicked"
    >
      {{ t("form.validation.field_missing_or_invalid") }}
    </p>

    <FormError
      v-if="busPrice <= 0 && !busPriceApiResponse.isLoading"
      error-class="auth-error p-3 rounded mt-1 text-danger fw-bold fs-6 w-100"
      :error="{ message: t('common.bus_price_not_available') }"
    />
    <div class="d-flex my-4 justify-content-between" v-if="!isEditMode"></div>
  </form>
  <!-- AdHoc confirmation modal -->
  <BaseConfirmationModal
    modal-id="confirmAdHocModal"
    v-model="confirmationModal.show.value"
  >
    <template v-slot:header>
      <h3 title="Form modal">
        {{ t("sharebus.adhoc_trip_confirm") }}
      </h3>
    </template>
    <template v-slot:content>
      <span title="Form modal">
        <p class="fw-600">{{ t("sharebus.adhoc_trip_confirmation_msg") }}</p>
        <p class="fw-normal">{{ t("sharebus.adhoc_trip_confirm_desc") }}</p>
        <p class="fw-600">{{ t("sharebus.do_confirm_trip") }}</p>
      </span>
    </template>
    <template v-slot:footer>
      <BaseButton
        button-class="sb-btn-lg sb-btn-primary rounded-pill"
        button-text="Yes"
        @click="handleConfirmationAction"
      />
      <BaseButton
        button-text="No"
        button-class="sb-btn-lg sb-btn-danger rounded-pill"
        @click="closeModal"
      />
    </template>
  </BaseConfirmationModal>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  reactive,
  PropType,
  ComputedRef,
  inject,
} from "vue";
import BaseButton from "@busgroup/vue3-base-button";
import { useI18n } from "vue-i18n";
import {
  useSharebusStore,
  useUserStore,
  useBusInfoStore,
  useConfigStore,
  useLoaderStore,
} from "@/store";
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import ShareBusSetUpController from "./Controllers/ShareBusSetUpController";
import { ROLE, STEPS } from "@/components/common/enums/enums";
import { showToast } from "@/services/toast/toast.service";
import BaseSaveChanges from "@/components/common/reusable/BaseSaveChanges.vue";
import ViaPoints from "@/components/ViaPointsPackage/components/ViaPoints.vue";
import { TRIP_TYPE } from "../trip/tripStatus/tripStatusEnum";
import FormError from "@/components/common/error/FormError.vue";
import { differenceInDays } from "date-fns";
import TripController from "../controllers/TripController";
import { Coordinate } from "types/sharebus/map.type";
import BaseConfirmationModal from "@busgroup/vue3-base-confirmation-modal";
import { useToggle } from "@/composables/useToggle";
import { countryType } from "@/core/plugin/countryPlugin";
import {
  convertDateToISOString,
  routePushTagQuery,
  formatRoutePointsForAPI,
} from "../../../../utils";
import { RoutePoints } from "./TripDetailsStepOne.vue";

const props = defineProps({
  formClass: {
    type: String,
    default: "",
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
  initValues: {
    type: Object as PropType<ValidationSchemaType>,
    default: () => ({ route_points: { oneway: [], return: [] } }),
  },
});

const emit = defineEmits([
  "onSave",
  "getValue",
  "validation-change",
  "departure-date-changed",
  "request-next-step",
]);

const country = inject<ComputedRef<countryType>>("country");
const { t } = useI18n();
// Removed unused variables: originErr, destinationErr, returnDatetimeErr, noReturnTripNeeded
const hasVpErrors = ref(false);
const vpMissing = ref(false);
const hasBusPriceError = ref(false);
const submitBtnClicked = ref(false);
const tripType = ref(TRIP_TYPE.SINGLE);
const remainingDays = ref(-1);
const confirmationModal = useToggle(); // For AdHoc confirmation modal
const MINIMUM_ADHOC_DAYS = 6; // Constant for the minimum days for AdHoc trips

const user = useUserStore();
const sharebus = useSharebusStore();
const busStore = useBusInfoStore();
const config = useConfigStore();
const loader = useLoaderStore();
const busPriceStore = useBusInfoStore();

const busPriceApiResponse = reactive({
  error: {},
  isLoading: {},
});

const busPrice = computed(() =>
  busPriceStore.getBusInfoData ? busPriceStore.getBusInfoData.total : 0
);

const route_points = ref<RoutePoints>({ oneway: [], return: [] });

const routePointsComp = computed(() => {
  if (!props.initValues) {
    return { oneway: [], return: [] };
  }

  if (props.isEditMode) {
    return TripController.updateRoutePointDates(props.initValues.route_points);
  }

  return props.initValues.route_points;
});

const userDetails = computed(() => user);

const viaPointTranslations = computed(() => ({
  make_bus_availability: t("viapoints.make_bus_availability"),
  waiting_time: t("viapoints.waiting_time"),
  departure_dateTime: t("viapoints.departure_dateTime"),
  departure: t("viapoints.departure"),
  field_required: t("viapoints.field_required"),
  estimated_arrival_datetime: t("viapoints.estimated_arrival_datetime"),
  insert_location_last_field: t("viapoints.insert_location_last_field"),
  return_trip_departure_should_not_before_arrival: t(
    "viapoints.return_trip_departure_should_not_before_arrival"
  ),
  maximum_point_reached: t("viapoints.maximum_point_reached"),
  one_way: t("viapoints.one_way"),
  return_trip: t("viapoints.return_trip"),
}));
/**


/*
 * validation schema for email form
 */
const stepOneValidationSchema = computed(() =>
  yup.object({
    bus_availability: yup.boolean(),
  })
);

export type {
  TViaPoints,
  RoutePoints,
} from "@/components/ViaPointsPackage/types/types";

export type ValidationSchemaType = {
  tripId: string;
  signage: string;
  origin: string;
  originLatLng: Coordinate;
  destination: string;
  destinationLatLng: Coordinate;
  departureDate: Date;
  bus_availability: boolean;
  departureTime: Date;
  returnDate: Date | null;
  returnTime: Date | null;
  route_points: RoutePoints;
};

/*
 * getting validated value and also if form validated or not as meta
 */
const stepOneForm = useForm({
  // Why we have used 'any' as a type please see the reference https://vee-validate.logaretm.com/v4/api/composition-helpers#api-reference
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validationSchema: stepOneValidationSchema,
  initialValues: {
    bus_availability: false,
  },
});

const { errorMessage: busAvailabilityErrorMsg, value: busAvailability } =
  useField<boolean>("bus_availability");

watch(
  () => props.initValues,
  (values) => {
    busAvailability.value = !!values?.bus_availability;
  },
  { immediate: true }
);

const saveItineraryData = (isSave: boolean) => {
  if (isSave) {
    handleFormSubmission();
  } else
    routePushTagQuery("trip-sales-page", props.initValues?.tripId || "", {
      tabindex: 1,
    });
};

const setTripType = (value) => {
  tripType.value = value;
  if (value === TRIP_TYPE.SINGLE) {
    setRoutePoints({
      oneway: route_points.value.oneway,
      return: [],
    });
  }
};

const setVpLoading = (value) => {
  loader.changeLoadingStatus({ isLoading: value });
};
const setVpErrors = (err) => (hasVpErrors.value = err);

const setVpMissing = (viaPointMissing) => {
  vpMissing.value = viaPointMissing;
};

const showGeneralErr = computed(
  () =>
    // Removed references to unused variables: originErr, destinationErr, returnDatetimeErr, noReturnTripNeeded
    !stepOneForm.meta.value.valid
);

// Simplified validation method used consistently across all steps
const validateBeforeNextStep = (showErrors = false) => {
  // Only set submitBtnClicked to true when explicitly requested (from submit button)
  if (showErrors) {
    submitBtnClicked.value = true;
  }

  // Check if departure date is in the past
  const isPastDeparture = checkForPastDeparture();

  const isValid =
    !showGeneralErr.value &&
    !hasVpErrors.value &&
    !vpMissing.value &&
    !isPastDeparture &&
    !hasBusPriceError.value; // Keep bus price error in validation

  // Single consistent event for validation state changes
  emit("validation-change", { step: 1, isValid });

  return isValid;
};

const fetchBusPrice = async () => {
  const plannedDepartureTime =
    route_points.value.oneway[0]?.planned_departure_time;
  const departureInfo = {
    outbound_from: {
      place: route_points.value.oneway[0]?.point,
      point_latitude: route_points.value.oneway[0]?.point_latitude,
      point_longitude: route_points.value.oneway[0]?.point_longitude,
    },
    outbound_to: {
      place:
        route_points.value.oneway?.[route_points.value.oneway.length - 1]
          ?.point,
      point_latitude:
        route_points.value.oneway?.[route_points.value.oneway.length - 1]
          ?.point_latitude,
      point_longitude:
        route_points.value.oneway?.[route_points.value.oneway.length - 1]
          ?.point_longitude,
    },
    outbound_datetime: {
      departure_datetime: plannedDepartureTime
        ? convertDateToISOString(plannedDepartureTime)
        : "",
      tz: country?.value.timezone || "Europe/Oslo",
    },
  };

  const returnDepartureDatetime =
    route_points.value?.return[0]?.planned_departure_time;
  const returnInfo =
    tripType.value === TRIP_TYPE.ROUND
      ? {
          return_from: {
            place: route_points.value?.return[0]?.point,
            point_latitude: route_points.value?.return[0]?.point_latitude,
            point_longitude: route_points.value?.return[0]?.point_longitude,
          },
          return_to: {
            place:
              route_points.value?.return?.[
                route_points.value?.return.length - 1
              ].point,
            point_latitude:
              route_points.value?.return?.[
                route_points.value?.return.length - 1
              ]?.point_latitude,
            point_longitude:
              route_points.value?.return?.[
                route_points.value?.return.length - 1
              ].point_longitude,
          },
          bus_availability: busAvailability.value,
          return_datetime: {
            departure_datetime: returnDepartureDatetime
              ? convertDateToISOString(returnDepartureDatetime)
              : "",
            tz: country?.value.timezone || "Europe/Oslo",
          },
        }
      : {};

  // Format route points using common utility
  const formattedRoutePoints = formatRoutePointsForAPI(route_points.value);

  let queryPayload = {
    country: country?.value.countryISO,
    ...departureInfo,
    ...returnInfo,
    route_points: JSON.stringify(formattedRoutePoints),
  };
  busPriceApiResponse.isLoading = true;

  return busStore
    .fetchBusInfoData(queryPayload)
    .then(
      (res: {
        errors?: unknown;
        loading?: boolean;
        data?: { getBusPrice?: unknown };
      }) => {
        busPriceApiResponse.error = res.errors || {};
        busPriceApiResponse.isLoading = res.loading || false;
        if (res?.data?.getBusPrice) {
          hasBusPriceError.value = false;
        } else {
          hasBusPriceError.value = true;
        }
        return res;
      }
    )
    .catch((error) => {
      console.error("Error in fetchBusPrice:", error);
      throw error;
    });
};

const handleAdhocConfirmationModal = () => {
  // First check if departure date is in the past
  if (checkForPastDeparture()) {
    // If departure is in the past, return early and don't proceed
    console.log("Cannot proceed: departure date is in the past");
    return;
  }

  // Calculate the number of days between departure date and today
  if (
    route_points.value.oneway &&
    route_points.value.oneway[0]?.planned_departure_time
  ) {
    remainingDays.value = differenceInDays(
      new Date(route_points.value.oneway[0]?.planned_departure_time as Date),
      new Date()
    );

    // If the trip is not an ad-hoc trip (departure is 6 or more days away)
    if (remainingDays.value >= MINIMUM_ADHOC_DAYS) {
      // Use a direct timeout to ensure Vue's reactivity has a chance to update
      setTimeout(() => {
        fetchBusPrice()
          .then(() => {
            // Make a final validation check before proceeding
            if (validateBeforeNextStep()) {
              emit("request-next-step");
            } else {
              console.log("Validation failed after fetchBusPrice");
            }
          })
          .catch((error) => {
            console.error("Error fetching bus price:", error);
          });
      }, 100);

      ShareBusSetUpController.setFetchPrice(false);
    } else {
      // Show confirmation modal for ad-hoc trip
      confirmationModal.toggleShowByValue(true);
    }
  } else {
    console.error("No departure date found in route points");
  }
};

/*
 * after validating form calling here to access api
 */
const onSubmit = stepOneForm.handleSubmit((values) => {
  if (
    props.isEditMode &&
    userDetails.value.currentRole !== ROLE.FERDIA_SALES &&
    userDetails.value.currentRole !== ROLE.PARTNER_SHARELEAD
  ) {
    showToast("info", t("auth.common.select_sales_role"), 3000, "top-left");
    ShareBusSetUpController.setSubmitState(STEPS.ROUTE_PAGE, false);
    return;
  }

  if (
    !props.isEditMode &&
    userDetails.value.currentRole !== ROLE.SHARELEAD &&
    userDetails.value.currentRole !== ROLE.PARTNER_SHARELEAD &&
    userDetails.value.isAuthenticated
  ) {
    showToast("info", t("home.joiner_warning"), 3000, "top-left");
    ShareBusSetUpController.setSubmitState(STEPS.ROUTE_PAGE, false);
    return;
  }

  if (hasVpErrors.value || vpMissing.value) {
    showToast("error", t("error.fix_all_errors"), 3000, "bottom-center");
    ShareBusSetUpController.setSubmitState(STEPS.ROUTE_PAGE, false);
    return;
  }

  // If there's a bus price error, try to fetch the price again
  if (hasBusPriceError.value) {
    showToast(
      "error",
      t("common.bus_price_not_available"),
      3000,
      "bottom-center"
    );

    // Try to fetch bus price again when user clicks submit
    if (route_points.value.oneway && route_points.value.oneway.length > 0) {
      console.log("Retrying bus price fetch due to user submit action");
      fetchBusPrice()
        .then(() => {
          // If fetch is successful, proceed with the submission
          if (!hasBusPriceError.value) {
            console.log(
              "Bus price fetch successful, proceeding with submission"
            );
            // Proceed with the rest of the submission logic
            proceedWithSubmission(values);
          }
        })
        .catch((error) => {
          console.error("Bus price fetch failed again:", error);
          ShareBusSetUpController.setSubmitState(STEPS.ROUTE_PAGE, false);
        });
    } else {
      ShareBusSetUpController.setSubmitState(STEPS.ROUTE_PAGE, false);
    }
    return;
  }

  // Proceed with normal submission if no bus price error
  proceedWithSubmission(values);
});

// Extract the submission logic into a separate function
const proceedWithSubmission = (values) => {
  /**
   * FEEDBACK: Removed all data which were handled before since BE mapped all the data from route_points.
   */
  if (props.isEditMode) {
    emit("onSave", {
      ...values,
      bus_signage: props.initValues?.signage,
      bus_availability: !!busAvailability.value,
      route_points: route_points.value,
    });
    return;
  }
  /**
   * FEEDBACK: saving the return data by reversiong the oneway data (e.g. destination as origin for return.) as per my investigation.
   */
  // Use type assertion to work around store type issues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (sharebus as any).setRouteStepData({
    busAvailability: !!busAvailability.value,
    no_return_trip_needed: tripType.value !== TRIP_TYPE.ROUND,
    route_points: route_points.value,
  });

  handleAdhocConfirmationModal();
};

const handleFormSubmission = () => {
  submitBtnClicked.value = true;
  if (!stepOneForm.meta.value.valid) {
    onSubmit();
    return;
  }

  onSubmit();
};

watch(
  () => ShareBusSetUpController.getSubmitState(STEPS.ROUTE_PAGE),
  (value) => {
    if (value) {
      // Reset the submit state flag to avoid duplicated submissions
      ShareBusSetUpController.setSubmitState(STEPS.ROUTE_PAGE, false);

      // Handle the form submission
      handleFormSubmission();
    }
  },
  {
    immediate: true,
  }
);

// Watch for fetch price flag from controller
watch(
  () => ShareBusSetUpController.getFetchPrice(),
  (shouldFetchPrice) => {
    if (shouldFetchPrice && validateBeforeNextStep()) {
      // Reset the flag to avoid duplicate fetches
      ShareBusSetUpController.setFetchPrice(false);

      // Handle ad-hoc confirmation which will trigger fetchBusPrice
      handleAdhocConfirmationModal();
    }
  }
);

// Watch for form changes to emit validation state
watch(
  [() => hasVpErrors.value, () => stepOneForm.meta.value.valid],
  () => validateBeforeNextStep(),
  { deep: true }
);

const setRoutePoints = (routePoints) => {
  route_points.value = routePoints;

  // Check if we have departure date and recalculate remaining days
  if (routePoints?.oneway?.[0]?.planned_departure_time) {
    const newRemainingDays = differenceInDays(
      new Date(routePoints.oneway[0]?.planned_departure_time),
      new Date()
    );

    // Update the remaining days value
    remainingDays.value = newRemainingDays;

    // Emit event to inform parent component of departure date change
    emit("departure-date-changed", {
      date: routePoints.oneway[0]?.planned_departure_time,
      remainingDays: newRemainingDays,
      requiresConfirmation: newRemainingDays < MINIMUM_ADHOC_DAYS,
    });

    // Check if departure date is in the past
    checkForPastDeparture();
  }

  validateBeforeNextStep();
};

// Check if departure date is in the past
const checkForPastDeparture = () => {
  // Make sure we have a departure date
  if (
    route_points.value.oneway &&
    route_points.value.oneway[0]?.planned_departure_time
  ) {
    const departureDate = new Date(
      route_points.value.oneway[0]?.planned_departure_time as Date
    );
    const currentDate = new Date();
    // Compare dates - if departure is before current time, it's in the past
    if (!stepOneForm.meta.value.valid && departureDate < currentDate) {
      // Show a toast message
      showToast("error", t("error.departure_date_past"));
      return true; // Indicates there's a past date error
    }
  }

  return false; // No past date error
};

// Handle modal close (No button)
const closeModal = () => {
  // Simply close the modal without taking any action
  // User will remain on current step
  confirmationModal.toggleShowByValue(false);
};

// Handle confirmation action (Yes button)
const handleConfirmationAction = () => {
  // Fetch the bus price data first
  fetchBusPrice()
    .then(() => {
      // Close the modal
      closeModal();

      // Wait a bit to ensure the UI is updated before proceeding
      setTimeout(() => {
        // Tell parent component to proceed to next step

        // Directly emit the event instead of using requestNextStep
        if (validateBeforeNextStep()) {
          emit("request-next-step");
        } else {
          console.log("Validation failed after ad-hoc confirmation");
        }
      }, 400);
    })
    .catch((error) => {
      console.error("Error fetching bus price:", error);
    });

  // Set fetch price flag to false since we've already fetched it
  ShareBusSetUpController.setFetchPrice(false);
};

// Watch for changes in departure date to re-check if ad-hoc confirmation is needed
watch(
  () => route_points.value.oneway[0]?.planned_departure_time,
  (newDate) => {
    if (newDate) {
      remainingDays.value = differenceInDays(new Date(newDate), new Date());

      // Check for past date whenever departure date changes
      checkForPastDeparture();

      // Revalidate the form
      validateBeforeNextStep();
    }
  }
);

// Single watcher for departure date changes
watch(
  () => route_points.value?.oneway?.[0]?.planned_departure_time,
  (newDepartureTime, oldDepartureTime) => {
    // Check for change in departure date to emit event for parent components
    if (newDepartureTime !== oldDepartureTime) {
      emit("departure-date-changed", newDepartureTime);

      // Also check for past dates when departure date changes
      checkForPastDeparture();
    }
  },
  { immediate: true }
);

// Expose validateBeforeNextStep for parent component
defineExpose({
  validateBeforeNextStep,
});
</script>

<style lang="scss">
.map {
  width: 100%;
  height: 300px;
  overflow: hidden;
}

.pv-datepicker-input {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.pv-timepicker-input {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-left: 0;
}
</style>
