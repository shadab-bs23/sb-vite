<template>
  <div class="row my-2 anchor-align-center">
    <h3 class="font-size-20 text-start mb-2 mt-2">
      → {{ t("viapoints.arrow_departure") }}
    </h3>
    <div class="col-lg-5 col-md-6 col-12 mt-1">
      <div class="d-flex gap-5 align-items-center">
        <label for="travel-from-location" class="text-start badge-gray">{{
          t("common.start")
        }}</label>
        <BaseLocationAutocomplete
          id="travel-from-location"
          label=""
          autocomplete="false"
          :search-types="[]"
          :class="`rounded ${
            !onewayFromToErrors.fromPoint && (hasInput.fromPoint || trySubmit)
              ? 'border border-danger'
              : ''
          }`"
          v-model="travelFrom.point"
          :placeholder="t('viapoints.from')"
          label-class="d-block w-100 font-size-14 text-start"
          :searchCountries="searchCountries"
          @input="setInput('fromPoint')"
          @onSelect="onFromLocationSelect"
        />
      </div>
      <FormError
        v-if="
          !onewayFromToErrors.fromPoint && (hasInput.fromPoint || trySubmit)
        "
        :message="t('viapoints.field_required')"
      />
    </div>
    <div class="col-md-2 col-12">
      <p class="w-100 text-center">{{ t("viapoints.eta") }}</p>
    </div>
    <div class="col-md-4 col-12">
      <label class="form-label w-100 text-start" for="fromLocation">{{
        t("viapoints.departure")
      }}</label>
      <div>
        <DatePickerAdapter
          v-model="travelFromDateModel"
          type="datetime"
          format="DD.MM.YYYY  HH:mm"
          :placeholder="t('viapoints.departure_dateTime')"
          :default-time="defaultDate"
          :class="`custom-calendar rounded w-100 ${
            !onewayFromToErrors.fromDepartureTime &&
            (hasInput.fromDepartureTime || trySubmit)
              ? 'border border-danger'
              : ''
          }`"
          :editable="true"
          :arrow-control="true"
          :minimum-date="defaultDate"
          :maximum-date="maxDepartureDate"
          :clearable="false"
          @blur="setInput('fromDepartureTime')"
          @change="() => dateTimeCalculation(-1)"
        />
      </div>
      <FormError
        v-if="
          !onewayFromToErrors.fromDepartureTime &&
          (hasInput.fromDepartureTime || trySubmit)
        "
        :message="t('viapoints.field_required')"
      />
    </div>
  </div>
  <ViaPoint
    v-model:via-point-list="viaPointList"
    :type="TRIP_TYPE.ONEWAY"
    :datetime-err="onewayDatetimeErrors"
    :try-submit="trySubmit"
    :companyInfo="companyInfo"
    :translations="translations"
    @onLocationSelect="onViaPointSelect"
    @onLocationDragDrop="onViaPointDragNDrop"
    @onLocationRemove="onViaPointRemove"
    @dateTimeUpdate="dateTimeCalculation"
  />

  <div class="my-3 ms-2 text-start">
    <div class="extended-light-green-bg via-point-add-btn py-1 px-2 rounded">
      <span
        @click="handleAddViaPoints"
        href="#"
        v-if="viaPointList.length <= 5"
      >
        + {{ t("viapoints.add_via_point") }}
      </span>
      <p v-else>{{ t("viapoints.maximum_point_reached") }}</p>
    </div>
  </div>

  <div class="row">
    <div class="col-lg-5 col-md-6 col-12">
      <div class="d-flex gap-5 align-items-center">
        <label for="travel-to-location " class="mt-1 badge-gray">{{
          t("common.to")
        }}</label>
        <BaseLocationAutocomplete
          id="travel-to-location"
          autocomplete="false"
          label=""
          :search-types="[]"
          :class="`rounded ms-3 ${
            !onewayFromToErrors.toPoint && (hasInput.toPoint || trySubmit)
              ? 'border border-danger'
              : ''
          }`"
          v-model="travelTo.point"
          :placeholder="t('common.to')"
          label-class="d-block w-100 font-size-14 text-start"
          :searchCountries="searchCountries"
          @input="setInput('toPoint')"
          @onSelect="onToLocationSelect"
        />
      </div>
      <FormError
        v-if="!onewayFromToErrors.toPoint && (hasInput.toPoint || trySubmit)"
        :message="t('viapoints.field_required')"
      />
    </div>
    <div class="col-lg-5 col-md-6 col-12">
      <!-- <label class="form-label w-100 text-start" for="fromLocation">{{
        t("viapoints.estimated_arrival_datetime")
      }}</label> -->
      <div class="mt-3 ms-1 ms-md-3 ms-lg-5 text-start">
        <span v-if="travelTo?.planned_arrival_time">
          <span>{{
            formatInCompanyTimezone(
              travelTo?.planned_arrival_time,
              "EEEE, dd.MM.yyyy HH:mm"
            )
          }}</span>
        </span>
        <span v-else class="ms-3">=</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import DatePickerAdapter from "@/components/common/DatePickerAdapter.vue";
import { useCompanyTimeFormat } from "@/composables/useCompanyTimeFormat";
import { showToast } from "@/services/toast/toast.service";
import BaseLocationAutocomplete from "@busgroup/vue3-base-location-autocomplete";
import { addMinutes } from "date-fns";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import FormError from "../components/common/FormError.vue";
import {
  calculateDistanceAndTimeForOneWayMapAPI,
  singleVpCalculateDistanceAndTimeForOneWayMapAPI,
  vpCalculateDistanceAndTimeForOneWayMapAPI,
} from "../composables/useLocationInput";
import ViaPointController from "../controllers/ViaPointController";
import { ACTIONS, TRIP_TYPE } from "../enums/enums";
import { TViaPoints } from "../types/types";
import { searchCountries } from "../utils/utils";
import { removeGMTAndBeyond } from "../utils/time.utils";
import ViaPoint from "./viapoint/ViaPoint.vue";
import { random5Digit } from "@/utils";

const props = defineProps({
  trySubmit: {
    type: Boolean,
    default: false,
  },
  companyInfo: {
    type: Object,
    required: true,
  },
  translations: {
    type: Object,
    required: true,
  },
  isRoundTrip: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "onReadyVpList",
  "onVpPointMissing",
  "onAddPointToReturnTrip",
  "onRemovePointFromReturnTrip",
  "onUpdateReturnTripForDragDrop",
  "onViaPointsChange",
]);

const { t } = useI18n();

const formatInCompanyTimezone = useCompanyTimeFormat();

const MILLISECONDS_TO_MINUTES = 60000;

const viaPointList = ref<TViaPoints[]>([]);

const travelFrom = ref<TViaPoints>({
  id: random5Digit(),
  point: "",
  point_latitude: "",
  point_longitude: "",
  point_formal: "", //expected from teq as empty string or point name.
  sequence: 0,
  type: "from",
  planned_arrival_time: null,
  planned_departure_time: null,
  actual_departure_time: null,
  pause_duration: props.companyInfo.default_pause_time,
});
const travelTo = ref<TViaPoints>({
  id: random5Digit(),
  point: "",
  point_latitude: "",
  point_longitude: "",
  point_formal: "", //expected from teq as empty string or point name.
  sequence: viaPointList.value.length + 1,
  type: "to",
  planned_arrival_time: null,
  planned_departure_time: null,
  actual_departure_time: null,
  pause_duration: props.companyInfo.default_pause_time,
});

const hasInput = ref({
  fromPoint: false,
  fromDepartureTime: false,
  toPoint: false,
});

const defaultDate = computed(() => {
  let today = new Date();
  const numberOfDaysToAdd = props.companyInfo.min_days_before_booking;
  return new Date(today.setDate(today.getDate() + numberOfDaysToAdd));
});
/**
 * This function sets the default planned departure time for `travelFrom` if it is not already defined.
 *
 * Note: This function is not currently in use but may be required for future functionality where
 * the planned departure time needs to default to `defaultDate` if the user has not specified it.
 *
 * Uncomment and use when needed.
 */

// const setDefaultDate = () => {
//   travelFrom.value.planned_departure_time =
//     travelFrom.value.planned_departure_time || defaultDate.value;
// };

const setInput = (fieldType) => {
  hasInput.value[fieldType] = true;
};

const singleVpTimeCalculationsWithMapApi = (index) => {
  const { leg_percentage } = props.companyInfo;
  singleVpCalculateDistanceAndTimeForOneWayMapAPI(
    index,
    leg_percentage,
    (points, vpIndex) => {
      assignAfterCalculate(points, vpIndex);
      // No sync here - this is only for time recalculation
    }
  );
};

const timeCalculationsWithMapAPI = () => {
  const { leg_percentage, default_pause_time } = props.companyInfo;
  calculateDistanceAndTimeForOneWayMapAPI(
    leg_percentage,
    default_pause_time,
    (points) => {
      assignAfterCalculate(points);
      // No sync here - this is only for time recalculation
    }
  );
};

const vpTimeCalculationsWithMapAPI = (index, action) => {
  const { leg_percentage, default_pause_time } = props.companyInfo;
  vpCalculateDistanceAndTimeForOneWayMapAPI(
    index,
    leg_percentage,
    default_pause_time,
    (points) => {
      assignAfterCalculate(points);
      if (props.isRoundTrip) {
        emit("onViaPointsChange", { points, action, index: index + 1 });
      }
    }
  );
};

const vpTimeCalculationsWithMapAPIForDragDrop = (dndIndices: {
  dragItemIndex: number;
  draggedOnItemIndex: number;
}) => {
  const { leg_percentage, default_pause_time } = props.companyInfo;
  vpCalculateDistanceAndTimeForOneWayMapAPI(
    dndIndices.draggedOnItemIndex,
    leg_percentage,
    default_pause_time,
    (points) => {
      assignAfterCalculate(points);
      if (props.isRoundTrip) {
        emit("onViaPointsChange", {
          points,
          action: ACTIONS.DRAG_DROP,
          dndIndices,
        });
      }
    }
  );
};

/**
 * Calculates date and time according to input changes.
 * @param index
 */
const dateTimeCalculation = (index = -1) => {
  setInput("fromDepartureTime");
  if (index === -1 && travelFrom.value.planned_departure_time) {
    if (
      viaPointList.value.length > 0 &&
      viaPointList.value[0]?.planned_arrival_time
    ) {
      singleVpTimeCalculationsWithMapApi(0);
      return;
    }
    if (travelTo.value.point) {
      timeCalculationsWithMapAPI();
    }
  } else if ((index as number) >= 1) {
    singleVpTimeCalculationsWithMapApi(index);
  }
};

let flag = false;

// Helper to safely convert nullable date values with timezone awareness
function safeDate(val) {
  if (!val) return null;

  // If it's already a Date object, return as-is
  if (val instanceof Date) {
    return val;
  }

  // If it's a string, clean it up to avoid timezone manipulation issues
  if (typeof val === "string") {
    // Remove GMT and timezone info to prevent automatic timezone conversion
    const cleanedDateString = removeGMTAndBeyond(val);
    return cleanedDateString ? new Date(cleanedDateString) : null;
  }

  // For numbers (timestamps) or other formats, create Date directly
  return new Date(val);
}

// Helper to safely convert nullable date values for v-model compatibility
const travelFromDateModel = ref(
  travelFrom.value.planned_departure_time ?? undefined
);

watch(
  () => travelFrom.value.planned_departure_time,
  (val) => {
    travelFromDateModel.value = val ?? undefined;
  }
);
watch(
  () => travelFromDateModel.value,
  (val) => {
    travelFrom.value.planned_departure_time = val ?? null;
  }
);

watch(
  () => ViaPointController.getTravelPointListOneWay(),
  (onewayRoutePoints) => {
    if (!flag) {
      const temp = [...onewayRoutePoints];
      if (temp.length) {
        let fromLocation = temp.shift() as TViaPoints;
        fromLocation = {
          ...fromLocation,
          planned_departure_time: safeDate(fromLocation.planned_departure_time),
          actual_departure_time: safeDate(fromLocation.actual_departure_time),
          planned_arrival_time: safeDate(fromLocation.planned_arrival_time),
        };
        let toLocation = temp.pop() as TViaPoints;
        toLocation = {
          ...toLocation,
          planned_departure_time: safeDate(toLocation.planned_departure_time),
          actual_departure_time: safeDate(toLocation.actual_departure_time),
          planned_arrival_time: safeDate(toLocation.planned_arrival_time),
        };
        travelFrom.value = fromLocation;
        travelTo.value = toLocation;
        viaPointList.value = temp.map((vp) => ({
          ...vp,
          planned_departure_time: safeDate(vp.planned_departure_time),
          actual_departure_time: safeDate(vp.actual_departure_time),
          planned_arrival_time: safeDate(vp.planned_arrival_time),
        }));
        dateTimeCalculation();
      }
    }
    flag = true;
  },
  {
    immediate: true,
  }
);

const onewayDatetimeErrors = computed(() =>
  ViaPointController.getOnewayErrors()
);
const onewayFromToErrors = computed(() =>
  ViaPointController.getFromToError(TRIP_TYPE.ONEWAY)
);

const handleAddViaPoints = () => {
  const lastIndex = viaPointList.value.length - 1;
  const lastVP =
    lastIndex >= 0 ? viaPointList.value[lastIndex] : travelFrom.value;
  if (lastVP && !lastVP.point) {
    showToast("error", t("viapoints.insert_location_last_field"));
    return;
  }

  // Always assign a new id for new via points, but never change existing ids
  viaPointList.value.push({
    id: random5Digit(),
    point: "",
    point_latitude: "",
    point_longitude: "",
    point_formal: "", //expected from teq as empty string or point name.
    sequence: viaPointList.value.length + 1,
    type: "via",
    planned_arrival_time: null,
    planned_departure_time: null,
    actual_departure_time: null,
    pause_duration: props.companyInfo.default_pause_time,
  });
};

const maxDepartureDate = computed(() => {
  return addMinutes(new Date(), props.companyInfo.max_departure);
});

watch(
  () => [viaPointList.value, travelFrom.value, travelTo.value],
  ([newViaPoint, newTravelForm, newTravelTo]) => {
    const temp = (newViaPoint as TViaPoints[]).map((value) => {
      return { ...value };
    });

    temp.push({
      ...newTravelTo,
      sequence: temp.length + 1,
    } as TViaPoints);
    temp.unshift({ ...(newTravelForm as TViaPoints) });
    ViaPointController.setFromToError(TRIP_TYPE.ONEWAY, {
      fromPoint: (newTravelForm as TViaPoints).point,
      fromDepartureTime: (newTravelForm as TViaPoints).planned_departure_time,
      toPoint: (newTravelTo as TViaPoints).point,
    });
    ViaPointController.setTravelPointListOneWay(temp);

    emit("onReadyVpList");

    const pointMissing = !!viaPointList.value.find(
      (vp) => !vp.point.length || !vp.planned_departure_time
    );
    emit("onVpPointMissing", TRIP_TYPE.ONEWAY, pointMissing);
  },
  {
    immediate: true,
    deep: true,
  }
);

onBeforeUnmount(() => {
  ViaPointController.setTravelPointListOneWay([]);
  ViaPointController.setTotalDistanceWithDuration(
    TRIP_TYPE.ONEWAY,
    "distance",
    0
  );
  ViaPointController.setTotalDistanceWithDuration(
    TRIP_TYPE.ONEWAY,
    "duration",
    0
  );
});

const onFromLocationSelect = (event: google.maps.GeocoderResult) => {
  travelFrom.value.point_latitude = event.geometry.location.lat();
  travelFrom.value.point_longitude = event.geometry.location.lng();

  if (
    travelTo.value.point_latitude &&
    travelFrom.value.planned_departure_time
  ) {
    timeCalculationsWithMapAPI();
  }
};

const onToLocationSelect = (event: google.maps.GeocoderResult) => {
  travelTo.value.point_latitude = event.geometry.location.lat();
  travelTo.value.point_longitude = event.geometry.location.lng();

  if (
    travelFrom.value.point_latitude &&
    travelFrom.value.planned_departure_time
  ) {
    timeCalculationsWithMapAPI();
  }
};

const onViaPointSelect = (index) => {
  // Determine if this is a new via point or updating an existing one

  vpTimeCalculationsWithMapAPI(index, ACTIONS.ADD);
};

const onViaPointDragNDrop = (dndIndices) => {
  vpTimeCalculationsWithMapAPIForDragDrop(dndIndices);
};

const onViaPointRemove = (index) => {
  viaPointList.value.splice(index, 1);
  ViaPointController.removeOnewayError(index + 1);
  //TODO: Need Optimization Releted 382 line @sanibs23
  ViaPointController.setTravelPointListOneWay(viaPointList.value);
  vpTimeCalculationsWithMapAPI(index, ACTIONS.REMOVE);
};

const assignAfterCalculate = (points, vpIndex = -1) => {
  if (!points) return;

  const calculateTotalTripDuration = (points) => {
    if (!points || points.length < 2) {
      console.warn("Insufficient points for duration calculation");
      return 0;
    }

    const startTime = new Date(points[0]?.planned_departure_time);
    const endTime = new Date(points[points.length - 1]?.planned_arrival_time);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      console.error("Invalid date values in trip duration calculation");
      return 0;
    }

    const duration = endTime.valueOf() - startTime.valueOf();

    // Additional validation to catch negative durations
    if (duration < 0) {
      console.error("Negative duration detected:", {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: duration,
      });
      return 0; // Return 0 for negative durations as they indicate data issues
    }

    return duration;
  };

  const totalDurationValue = calculateTotalTripDuration(points);

  ViaPointController.setTotalDistanceWithDuration(
    TRIP_TYPE.ONEWAY,
    "duration",
    totalDurationValue / MILLISECONDS_TO_MINUTES
  );
  travelTo.value = points[points.length - 1];
  travelFrom.value.actual_departure_time = points[0].planned_departure_time;
  if (points.length > 2) {
    const temp = [...points];
    temp.shift();
    temp.pop();
    viaPointList.value = temp;
    if (vpIndex >= 0) {
      const timeout = setTimeout(() => {
        ViaPointController.isDatetimeErr(vpIndex, TRIP_TYPE.ONEWAY);
        clearTimeout(timeout);
      }, 100);
    }
  }

  // Removed automatic sync - sync only happens for structural changes now
};
</script>
<style scoped lang="scss">
.via-point-add-btn {
  width: 12rem;
  text-align: center;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 10rem !important;
  text-decoration: none;
  color: #138340 !important;
  &:hover {
    background: #189148e3 !important;
    color: #fff !important;
  }
}
</style>
