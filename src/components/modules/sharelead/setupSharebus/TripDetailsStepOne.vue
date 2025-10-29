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
    <ViaPoints
      :init-values="routePointsComp"
      :trySubmit="submitBtnClicked"
      :is-edit-mode="isEditMode"
      :is-round-trip="routePointsComp.return.length > 0"
      v-model:busAvailability="busAvailability"
      :busAvailabilityErrorMsg="busAvailabilityErrorMsg"
      :companyInfo="{
        logo: 'https://d188y0h7d3nwcc.cloudfront.net/bs23-dev/company_logo_s3_20221318_051356.png',
        leg_percentage: 15,
        default_pause_time: 5,
        max_departure: 144000,
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
    <div class="d-flex my-4 justify-content-between" v-if="!isEditMode">
      <BaseButton
        button-class="sb-btn-lg sb-btn-secondary border-1 medium-gray-border fw-bold rounded-pill d-flex align-items-center"
        type="button"
        @click="() => prevStep()"
      >
        <span class="pt-1"
          ><i class="fi fi-chevron-left fs-5 icon-text-stroke green-jewel"></i
        ></span>
        <span class="ms-2">{{ t("button.back") }}</span>
      </BaseButton>
      <BaseButton
        type="button"
        @click="handleFormSubmission"
        button-class="sb-btn-primary sb-btn-lg rounded-pill border-0 fw-bold d-flex justify-content-center align-items-center"
      >
        <template v-slot:default>
          <span>{{ t("auth.common.continue") }}</span>
          <span class="fw-bold ms-2"
            ><i class="fi fi-chevron-right fs-5"></i
          ></span>
        </template>
      </BaseButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  reactive,
  PropType,
  inject,
  ComputedRef,
} from "vue";
import BaseButton from "@busgroup/vue3-base-button";
import { useI18n } from "vue-i18n";
import { Coordinate } from "./types/sharebus/map.type";
import {
  useSharebusStore,
  useUserStore,
  useBusInfoStore,
  useConfigStore,
  useLoaderStore,
} from "@/store";
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import { isoFormatDateTime, routePushTagQuery } from "@/utils";
import ShareBusSetUpController from "./Controllers/ShareBusSetUpController";
import { ROLE, STEPS } from "@/components/common/enums/enums";
import { showToast } from "@/services/toast/toast.service";
import BaseSaveChanges from "@/components/common/reusable/BaseSaveChanges.vue";
import { countryType } from "@/core/plugin/countryPlugin";
import ViaPoints from "@/components/ViaPointsPackage/components/ViaPoints.vue";
import { TRIP_TYPE } from "../trip/tripStatus/tripStatusEnum";
import FormError from "@/components/common/error/FormError.vue";

const props = defineProps({
  formClass: {
    type: String,
    default: "",
  },
  prevStep: {
    type: Function,
    default: () => null,
  },
  nextStep: {
    type: Function,
    default: () => null,
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
  initValues: {
    type: Object as PropType<ValidationSchemaType>,
    default: () => undefined,
  },

  tripOtherData: {
    type: Object,
    default: () => null,
  },
});

const emit = defineEmits(["onSave", "getValue"]);

const { t } = useI18n();
const country = inject<ComputedRef<countryType>>("country");
const originErr = ref("");
const destinationErr = ref("");
const returnDatetimeErr = ref("");
const hasVpErrors = ref(false);
const vpMissing = ref(false);
const noReturnTripNeeded = ref(false);
const submitBtnClicked = ref(false);
const tripType = ref(TRIP_TYPE.SINGLE);

const user = useUserStore();
const sharebus = useSharebusStore();
const busStore = useBusInfoStore();
const config = useConfigStore();
const loader = useLoaderStore();

const routePointsComp = computed(() => {
  return props.initValues
    ? props.initValues.route_points
    : { oneway: [], return: [] };
});
const userDetails = computed(() => user);

const viaPointTranslations = computed(() => ({
  make_bus_availability: t("viapoints.make_bus_availability"),
  waiting_time: t("viapoints.waiting_time"),
  departure_dateTime: t("viapoints.departure_dateTime"),
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

export type TViaPoints = {
  id: number;
  point: string;
  point_latitude: string | number;
  point_longitude: string | number;
  point_formal: string;
  sequence: number;
  type: string;
  planned_arrival_time: Date | null;
  planned_departure_time: Date | null;
  actual_departure_time: Date | null;
  pause_duration: number;
};

export type RoutePoints = {
  oneway: TViaPoints[];
  return: TViaPoints[];
};

type ValidationSchemaType = {
  tripId: string;
  signage: string;
  origin: string;
  originLatLng: Coordinate;
  destination: string;
  destinationLatLng: Coordinate;
  departureDate: Date;
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
    busAvailability.value = values?.departureDate
      ? values?.bus_availability
      : false;
  },
  { immediate: true }
);

const saveItineraryData = (isSave: boolean) => {
  if (isSave) {
    handleFormSubmission();
  } else
    routePushTagQuery("trip-sales-page", props.initValues.tripId, {
      tabindex: 1,
    });
};

const setTripType = (value) => {
  tripType.value = value;
  // if (props.isEditMode) {
  if (value === TRIP_TYPE.SINGLE) {
    setRoutePoints({
      oneway: route_points.value.oneway,
      return: [],
    });
  }
  // }
};

const setVpLoading = (value) => {
  loader.changeLoadingStatus({ isLoading: value });
};
const setVpErrors = (err) => (hasVpErrors.value = err);

const setVpMissing = (viaPointMissing) => {
  vpMissing.value = viaPointMissing;
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
    ShareBusSetUpController.setSubmitState(STEPS.ONE, false);
    return;
  }

  if (
    !props.isEditMode &&
    userDetails.value.currentRole !== ROLE.SHARELEAD &&
    userDetails.value.currentRole !== ROLE.PARTNER_SHARELEAD &&
    userDetails.value.isAuthenticated
  ) {
    showToast("info", t("home.joiner_warning"), 3000, "top-left");
    ShareBusSetUpController.setSubmitState(STEPS.ONE, false);
    return;
  }

  if (hasVpErrors.value || vpMissing.value) {
    showToast("error", "Please fix all the errors", 3000, "bottom-center");
    ShareBusSetUpController.setSubmitState(STEPS.ONE, false);
    return;
  }

  if (props.isEditMode) {
    emit("onSave", {
      ...values,
      bus_signage: props.initValues?.signage,
      outbound_from_lat_long: {
        lat: route_points.value.oneway[0].point_latitude,
        lng: route_points.value.oneway[0].point_longitude,
      },
      outbound_to_lat_long: {
        lat: route_points.value.oneway[route_points.value.oneway.length - 1]
          .point_latitude,
        lng: route_points.value.oneway[route_points.value.oneway.length - 1]
          .point_longitude,
      },
      outbound_to_date_time:
        route_points.value.oneway[0].planned_departure_time || null,
      bus_availability: busAvailability.value,
      return_to_date_time:
        route_points.value.oneway[route_points.value.oneway.length - 1]
          .planned_arrival_time || null,
      route_points: route_points.value,
    });
    return;
  }

  sharebus.setStepOneData({
    origin: route_points.value.oneway[0].point,
    originLatLng: {
      lat: route_points.value.oneway[0].point_latitude,
      lng: route_points.value.oneway[0].point_longitude,
    },
    destination:
      route_points.value.oneway[route_points.value.oneway.length - 1].point,
    destinationLatLng: {
      lat: route_points.value.oneway[route_points.value.oneway.length - 1]
        .point_latitude,
      lng: route_points.value.oneway[route_points.value.oneway.length - 1]
        .point_longitude,
    },
    departureDateTime: route_points.value.oneway[0].planned_departure_time,
    departureArrivalDateTime:
      route_points.value.oneway[route_points.value.oneway.length - 1]
        .planned_departure_time,
    busAvailability: busAvailability.value,
    returnDateTime:
      tripType.value === TRIP_TYPE.ROUND
        ? route_points.value.return[0].planned_departure_time
        : null,
    returnArrivalDateTime:
      tripType.value === TRIP_TYPE.ROUND
        ? route_points.value.return[route_points.value.return.length - 1]
            .planned_departure_time
        : null,

    viaPoints: route_points.value,
  });
  fetchBusPrice();
});

const handleFormSubmission = () => {
  submitBtnClicked.value = true;
  if (!stepOneForm.meta.value.valid) {
    onSubmit();
    return;
  }

  onSubmit();
};

watch(
  () => ShareBusSetUpController.getSubmitState(STEPS.ONE),
  (value) => {
    if (value) {
      ShareBusSetUpController.setSubmitState(STEPS.ONE, false);
      handleFormSubmission();
    }
  },
  {
    immediate: true,
  }
);

const showGeneralErr = computed(
  () =>
    !!originErr.value ||
    !!destinationErr.value ||
    (!noReturnTripNeeded.value && !!returnDatetimeErr.value) ||
    !stepOneForm.meta.value.valid
);

const busPriceApiResponse = reactive({
  error: {},
  isLoading: {},
});
const busPriceStore = useBusInfoStore();

const busPrice = computed(() =>
  busPriceStore.getBusInfoData ? busPriceStore.getBusInfoData.total : 0
);

watch(
  () => busPrice.value,
  (newValue) => {
    if (newValue > 0) {
      props.nextStep();
    }
  },
  { deep: true }
);

const fetchBusPrice = async () => {
  const departureInfo = {
    outbound_from: {
      place: route_points.value.oneway[0].point,
      point_latitude: route_points.value.oneway[0].point_latitude,
      point_longitude: route_points.value.oneway[0].point_longitude,
    },
    outbound_to: {
      place:
        route_points.value.oneway[route_points.value.oneway.length - 1].point,
      point_latitude:
        route_points.value.oneway[route_points.value.oneway.length - 1]
          .point_latitude,
      point_longitude:
        route_points.value.oneway[route_points.value.oneway.length - 1]
          .point_longitude,
    },
    outbound_datetime: {
      departure_datetime: isoFormatDateTime(
        route_points.value.oneway[0].planned_departure_time
      ),
      tz: "Europe/Oslo",
    },
  };
  const returnInfo =
    tripType.value === TRIP_TYPE.ROUND
      ? {
          return_from: {
            place: route_points.value.return[0].point,
            point_latitude: route_points.value.return[0].point_latitude,
            point_longitude: route_points.value.return[0].point_longitude,
          },
          return_to: {
            place:
              route_points.value.return[route_points.value.return.length - 1]
                .point,
            point_latitude:
              route_points.value.return[route_points.value.return.length - 1]
                .point_latitude,
            point_longitude:
              route_points.value.return[route_points.value.return.length - 1]
                .point_longitude,
          },
          bus_availability: busAvailability.value,
          return_datetime: {
            departure_datetime: isoFormatDateTime(
              route_points.value.return[0].planned_departure_time
            ),

            tz: "Europe/Oslo",
          },
        }
      : {};

  let queryPayload = {
    country: country?.value.countryISO,
    ...departureInfo,
    ...returnInfo,
    route_points: JSON.stringify(route_points.value),
  };
  busPriceApiResponse.isLoading = true;
  busStore.fetchBusInfoData(queryPayload).then((res) => {
    busPriceApiResponse.error = res.error;
    busPriceApiResponse.isLoading = res.loading;
  });
};

const route_points = ref({ oneway: [], return: [] });
const setRoutePoints = (routePoints) => {
  route_points.value = routePoints;
};
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
