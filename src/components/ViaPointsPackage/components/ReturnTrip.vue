<template>
  <hr class="my-3" />
  <!-- From location - display as static text -->
  <div class="row mb-2">
    <div class="col-md-5 col-12 mt-1">
      <p></p>
      <span v-if="!disableLocationChange">
        {{ t("viapoints.return_from") }}
        <div class="d-flex align-items-center gap-2">
          <label for="travel-from-location" class="text-start">{{
            t("common.start")
          }}</label>
          <BaseLocationAutocomplete
            id="return-from-Location"
            autocomplete="false"
            :search-types="[]"
            :class="`rounded ${
              !returnFromToErrors.fromPoint && (hasInput.fromPoint || trySubmit)
                ? 'border border-danger'
                : ''
            }`"
            v-model="travelFrom.point"
            :placeholder="'From'"
            label-class="d-block w-100 font-size-14 text-start"
            :searchCountries="searchCountries"
            @input="setInput('fromPoint')"
            @onSelect="onFromLocationSelect"
          />
        </div>
        <FormError
          v-if="
            !returnFromToErrors.fromPoint && (hasInput.fromPoint || trySubmit)
          "
          :message="translations.field_required"
        />
      </span>
      <span
        v-else
        class="location-text d-flex gap-5 align-items-center text-start mt-3"
      >
        <span class="text-start badge-gray">{{ t("common.start") }}</span>
        <span class="text-start">
          {{ travelFrom.point }}
        </span>
      </span>
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
          :default-time="minDepartureDate"
          :clearable="false"
          :class="`custom-calendar rounded w-100 ${
            (!returnFromToErrors.fromDepartureTime &&
              (hasInput.fromDepartureTime || trySubmit)) ||
            returnFromToErrors.fromDepartureTime === 'invalid'
              ? 'border border-danger'
              : ''
          }`"
          :editable="true"
          :arrow-control="true"
          :minimum-date="minDepartureDate"
          @focus="setDefaultDate"
          @blur="setInput('fromDepartureTime')"
          @change="() => dateTimeCalculation(-1)"
        />
      </div>
      <FormError
        v-if="
          !returnFromToErrors.fromDepartureTime &&
          (hasInput.fromDepartureTime || trySubmit)
        "
        :message="t('viapoints.field_required')"
      />
    </div>
    <div class="col-1">
      <!-- No remove button for From -->
    </div>
  </div>

  <ViaPoint
    v-model:via-point-list="viaPointList"
    :type="TRIP_TYPE.RETURN"
    :is-return-trip="true"
    :is-draggable="false"
    :disable-location-change="true"
    :disable-add-remove-viapoints="disableAddRemoveViapoints"
    :datetime-err="returnTripDatetimeErrors"
    :try-submit="trySubmit"
    :companyInfo="companyInfo"
    :translations="translations"
    @onLocationSelect="onViaPointSelect"
    @onLocationDragDrop="onViaPointSelect"
    @onLocationRemove="onViaPointRemove"
    @dateTimeUpdate="dateTimeCalculation"
  />

  <div class="my-3 text-start" v-if="!disableAddRemoveViapoints">
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

  <!-- To location - with input field -->
  <div class="row">
    <div class="col-lg-5 col-md-6 col-12">
      <span v-if="!disableLocationChange">
        <div class="d-flex gap-2 align-items-center">
          <label for="travel-to-location " class="mt-1 me-1">{{
            t("common.to")
          }}</label>
          <BaseLocationAutocomplete
            id="return-to-Location"
            autocomplete="false"
            :search-types="[]"
            :class="`rounded  ${
              !returnFromToErrors.toPoint && (hasInput.toPoint || trySubmit)
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
          v-if="!returnFromToErrors.toPoint && (hasInput.toPoint || trySubmit)"
          :message="translations.field_required"
        />
      </span>

      <span class="location-text text-start text-nowrap mt-2">
        <div class="d-flex align-items-center gap-5">
          <label
            for="travel-from-location badge rounded-pill bg-light text-dark"
            class="text-start mt-1 badge-gray"
            >{{ t("common.to") }}</label
          >
          <div :title="travelTo.point">
            <BaseLocationAutocomplete
              id="travel-from-location"
              label=""
              autocomplete="false"
              class="rounded ms-3"
              :placeholder="travelTo.point"
              label-class="d-block w-100 text-start"
              :disabled="true"
            />
          </div>
        </div>
      </span>
    </div>
    <div class="col time-return mt-4 ms-1 ms-md-3 ms-lg-5">
      <div class="text-start">
        <span
          v-if="
            travelTo?.planned_arrival_time &&
            isValidDate(travelTo.planned_arrival_time)
          "
        >
          <span>{{
            formatInCompanyTimezone(
              travelTo?.planned_arrival_time,
              "EEEE, dd.MM.yyyy HH:mm"
            )
          }}</span>
        </span>
        <span v-else class="blank-eta">=</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import BaseLocationAutocomplete from "@busgroup/vue3-base-location-autocomplete";
import ViaPoint from "./viapoint/ViaPoint.vue";
import { useI18n } from "vue-i18n";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { TViaPoints } from "../types/types";
import ViaPointController from "../controllers/ViaPointController";
import {
  calculateDistanceAndTimeForReturnMapAPI,
  singleVpCalculateDistanceAndTimeForReturnMapAPI,
  vpCalculateDistanceAndTimeForReturnMapAPI,
} from "../composables/useLocationInput";
import { TRIP_TYPE } from "../enums/enums";
import { isBefore, isEqual } from "date-fns";
import { showToast } from "@/services/toast/toast.service";
import FormError from "../components/common/FormError.vue";
import DatePickerAdapter from "@/components/common/DatePickerAdapter.vue";
import { useCompanyTimeFormat } from "@/composables/useCompanyTimeFormat";
import { random5Digit } from "@/utils";
import { searchCountries } from "../utils/utils";
import { removeGMTAndBeyond } from "../utils/time.utils";

const props = defineProps({
  busWaiting: {
    type: Boolean,
    default: false,
  },
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
  disableLocationChange: {
    type: Boolean,
    default: false,
  },
  disableAddRemoveViapoints: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["onReadyVpList", "onVpPointMissing"]);

const { t } = useI18n();
const formatInCompanyTimezone = useCompanyTimeFormat();

const oneWayTravelPoints = computed(() => {
  return ViaPointController.getTravelPointListOneWay();
});
const lastPointIndex = computed(() => oneWayTravelPoints.value.length - 1);

const viaPointList = ref<TViaPoints[]>(
  ViaPointController.getTravelViaPointListForReturn() ?? []
);

const travelFrom = ref<TViaPoints>({
  ...oneWayTravelPoints.value[lastPointIndex.value],
  // id: random5Digit(),
  type: "from",
  planned_arrival_time: null,
  planned_departure_time: null,
  actual_departure_time: null,
  sequence: 0,
});

const travelTo = ref<TViaPoints>({
  ...oneWayTravelPoints.value[0],
  // id: random5Digit(),
  type: "to",
  planned_departure_time: null,
  actual_departure_time: null,
  planned_arrival_time: null,
  sequence: lastPointIndex.value,
});

// Sync travelFrom point name with oneWay last point
watch(
  () => oneWayTravelPoints.value[lastPointIndex.value]?.point,
  (newPoint) => {
    if (newPoint !== travelFrom.value.point) {
      travelFrom.value.point = newPoint;
    }
  }
);
// Sync travelTo point name with oneWay first point
watch(
  () => oneWayTravelPoints.value[0]?.point,
  (newPoint) => {
    if (newPoint !== travelTo.value.point) {
      travelTo.value.point = newPoint;
    }
  }
);

const hasInput = ref({
  fromPoint: false,
  fromDepartureTime: false,
  toPoint: false,
});

const setDefaultDate = () => {
  travelFrom.value.planned_departure_time =
    travelFrom.value.planned_departure_time || minDepartureDate.value;
};

const setInput = (fieldType) => {
  hasInput.value[fieldType] = true;
};

const singleVpTimeCalculationsWithMapApi = (index) => {
  const { leg_percentage } = props.companyInfo;
  singleVpCalculateDistanceAndTimeForReturnMapAPI(
    index,
    leg_percentage,
    (points, vpIndex) => {
      assignAfterCalculate(points, vpIndex);

      // Validate datetime after single VP calculations
      if (vpIndex >= 0) {
        setTimeout(() => {
          ViaPointController.isDatetimeErr(vpIndex, TRIP_TYPE.RETURN);
        }, 150);
      }
    }
  );
};

const timeCalculationsWithMapAPI = () => {
  const { leg_percentage, default_pause_time } = props.companyInfo;
  calculateDistanceAndTimeForReturnMapAPI(
    leg_percentage,
    default_pause_time,
    (points) => {
      assignAfterCalculate(points);
    }
  );
};

const vpTimeCalculationsWithMapAPI = (index) => {
  const { leg_percentage, default_pause_time } = props.companyInfo;
  vpCalculateDistanceAndTimeForReturnMapAPI(
    index,
    leg_percentage,
    default_pause_time,
    (points) => {
      assignAfterCalculate(points);

      // Validate datetime after VP calculations
      setTimeout(() => {
        ViaPointController.isDatetimeErr(index, TRIP_TYPE.RETURN);
      }, 150);
    }
  );
};

const dateTimeCalculation = (index = -1) => {
  setInput("fromDepartureTime");

  if (index === -1 && travelFrom.value.planned_departure_time) {
    // Only validate if busWaiting is true and the oneway arrival time exists and is valid
    const onewayLastPoint =
      oneWayTravelPoints.value[oneWayTravelPoints.value.length - 1];
    if (
      props.busWaiting &&
      onewayLastPoint &&
      onewayLastPoint.planned_arrival_time &&
      isBefore(
        toDateOrNumber(travelFrom.value.planned_departure_time),
        onewayLastPoint.planned_arrival_time as Date
      )
    ) {
      showToast("error", t("error.date_error"));
      ViaPointController.setFromToError(TRIP_TYPE.RETURN, {
        fromPoint: travelFrom.value.point,
        fromDepartureTime: "invalid",
        toPoint: travelTo.value.point,
      });
      return;
    }

    if (
      viaPointList.value.length > 0 &&
      viaPointList.value[0].planned_arrival_time
    ) {
      updateRoutePointChanges();

      singleVpTimeCalculationsWithMapApi(0);

      // Validate datetime for the first viapoint after main departure time change
      setTimeout(() => {
        ViaPointController.isDatetimeErr(1, TRIP_TYPE.RETURN);
      }, 100);
      return;
    }

    if (travelTo.value.point) {
      updateRoutePointChanges();

      timeCalculationsWithMapAPI();
    }
  } else if ((index as number) >= 1) {
    updateRoutePointChanges();

    singleVpTimeCalculationsWithMapApi(index);

    // Validate datetime after viapoint changes
    setTimeout(() => {
      ViaPointController.isDatetimeErr(index, TRIP_TYPE.RETURN);
    }, 100);
  }
};

const minDepartureDate = computed(() => {
  const lastPoint =
    oneWayTravelPoints.value[oneWayTravelPoints.value.length - 1];
  const onewayLastArrivalTime =
    lastPoint && lastPoint.planned_arrival_time
      ? lastPoint.planned_arrival_time
      : undefined;
  if (onewayLastArrivalTime && isValidDate(onewayLastArrivalTime)) {
    const date = toDateOrNumber(onewayLastArrivalTime);
    return date instanceof Date ? date : new Date(date);
  }
  let today = new Date();
  const numberOfDaysToAdd = props.companyInfo.min_days_before_booking;
  return new Date(today.setDate(today.getDate() + numberOfDaysToAdd));
});

// Helper to ensure only Date or number is passed
function toDateOrNumber(val) {
  if (val instanceof Date || typeof val === "number") {
    return val;
  }
  if (val) {
    const date = new Date(val);
    return !isNaN(date.getTime()) ? date : new Date();
  }
  return new Date();
}

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

// Helper to check if a date value is valid
const isValidDate = (dateValue) => {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  return !isNaN(date.getTime());
};

/**
 * Updates the return trip's via point list and handles validation for the "from" departure time.
 *
 * - Builds a new via point list for the return trip, including the "from", all via points, and the "to" point.
 * - Validates that the return trip's departure is not before the one-way trip's arrival if busWaiting is true.
 * - Emits events to notify parent components about the updated via point list and any missing required fields.
 *
 * @returns {void}
 */
const updateRoutePointChanges = () => {
  // Clone the current via points to avoid mutating the original array
  const temp: TViaPoints[] = viaPointList.value.map((value) => {
    return { ...value };
  });

  // Add the "to" point at the end with updated sequence
  temp.push({
    ...travelTo.value,
    sequence: temp.length + 1,
  });

  // Add the "from" point at the start
  temp.unshift({ ...travelFrom.value });

  // Validate that the return trip's departure is not before the one-way trip's arrival if busWaiting is true
  const onewayLastPoint =
    oneWayTravelPoints.value[oneWayTravelPoints.value.length - 1];
  if (
    props.busWaiting &&
    onewayLastPoint &&
    onewayLastPoint.planned_arrival_time &&
    travelFrom.value.planned_departure_time &&
    isBefore(
      toDateOrNumber(travelFrom.value.planned_departure_time),
      onewayLastPoint.planned_arrival_time as Date
    ) &&
    !isEqual(
      toDateOrNumber(travelFrom.value.planned_departure_time),
      onewayLastPoint.planned_arrival_time as Date
    )
  ) {
    // Show error and set error state in controller
    showToast("error", t("error.date_error"));
    ViaPointController.setFromToError(TRIP_TYPE.RETURN, {
      fromPoint: travelFrom.value.point,
      fromDepartureTime: "invalid",
      toPoint: travelTo.value.point,
    });
  } else {
    // No error: update controller with valid values
    ViaPointController.setFromToError(TRIP_TYPE.RETURN, {
      fromPoint: (travelFrom.value as TViaPoints).point,
      fromDepartureTime: (travelFrom.value as TViaPoints)
        .planned_departure_time,
      toPoint: (travelTo.value as TViaPoints).point,
    });
  }

  // Update the controller with the new via point list for the return trip
  ViaPointController.setTravelPointListRound(temp);

  // Notify parent that the via point list is ready
  emit("onReadyVpList");

  // Check if any via point is missing required fields (point or planned_departure_time)
  const pointMissing = !!viaPointList.value.find(
    (vp) => !vp.point.length || !vp.planned_departure_time
  );
  // // Notify parent if any point is missing
  emit("onVpPointMissing", TRIP_TYPE.RETURN, pointMissing);
};

/**
 * This watcher will update the travel points when the return trip points change.
 * It checks if the points have changed before updating to avoid unnecessary reactivity.
 * @param returnRoutePoints - The list of return route points from the ViaPointController.
 * It extracts the first and last points as the travelFrom and travelTo locations,
 * and updates the viaPointList with the intermediate points.
 * It also recalculates the date and time for the travel points.
 */
watch(
  () => ViaPointController.getTravelPointListRound(),
  (returnRoutePoints) => {
    const temp = [...returnRoutePoints];
    if (temp.length) {
      let fromLocation = temp[0];
      let toLocation = temp[temp.length - 1];
      const viaPoints = temp.slice(1, -1);

      // Only update if values have actually changed
      const isSame =
        JSON.stringify(travelFrom.value) === JSON.stringify(fromLocation) &&
        JSON.stringify(travelTo.value) === JSON.stringify(toLocation) &&
        JSON.stringify(viaPointList.value) === JSON.stringify(viaPoints);

      if (!isSame) {
        // Check for newly added points BEFORE updating viaPointList
        const hasNewlyAddedPoints =
          viaPoints.length > viaPointList.value.length;

        travelFrom.value = {
          ...fromLocation,
          planned_departure_time: safeDate(fromLocation.planned_departure_time),
          actual_departure_time: safeDate(fromLocation.actual_departure_time),
          planned_arrival_time: safeDate(fromLocation.planned_arrival_time),
        };
        travelTo.value = {
          ...toLocation,
          planned_departure_time: safeDate(toLocation.planned_departure_time),
          actual_departure_time: safeDate(toLocation.actual_departure_time),
          planned_arrival_time: safeDate(toLocation.planned_arrival_time),
        };
        viaPointList.value = viaPoints.map((vp) => ({
          ...vp,
          planned_departure_time: safeDate(vp.planned_departure_time),
          actual_departure_time: safeDate(vp.actual_departure_time),
          planned_arrival_time: safeDate(vp.planned_arrival_time),
        }));

        const hasValidLocationsButMissingTimes = viaPoints.some(
          (vp) => vp.point && !vp.planned_arrival_time
        );

        if (
          (hasValidLocationsButMissingTimes || hasNewlyAddedPoints) &&
          travelFrom.value.planned_departure_time
        ) {
          // Trigger time calculation for return trip
          if (viaPoints.length > 0 && viaPoints[0].point) {
            updateRoutePointChanges();
            vpTimeCalculationsWithMapAPI(0);
          } else if (travelTo.value.point) {
            updateRoutePointChanges();
            timeCalculationsWithMapAPI();
          }
        } else {
          dateTimeCalculation();
        }
      }
    }
  },

  {
    immediate: true,
  }
);

onBeforeUnmount(() => {
  ViaPointController.setTravelPointListRound([]);
  ViaPointController.setTotalDistanceWithDuration("returnTrip", "distance", 0);
  ViaPointController.setTotalDistanceWithDuration("returnTrip", "duration", 0);
});

// Also patch any remaining direct usage in minDepartureDate computation
const returnTripDatetimeErrors = computed(() =>
  ViaPointController.getReturnTripErrors()
);

const returnFromToErrors = computed(() =>
  ViaPointController.getFromToError(TRIP_TYPE.RETURN)
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
    point_formal: "",
    sequence: viaPointList.value.length + 1,
    type: "via",
    planned_arrival_time: null,
    planned_departure_time: null,
    actual_departure_time: null,
    pause_duration: props.companyInfo.default_pause_time,
  });
};

const onFromLocationSelect = (event: google.maps.GeocoderResult) => {
  travelFrom.value.point_latitude = event.geometry.location.lat();
  travelFrom.value.point_longitude = event.geometry.location.lng();
  if (travelTo.value.point_latitude && travelFrom.value.actual_departure_time)
    timeCalculationsWithMapAPI();
};

const onToLocationSelect = (event: google.maps.GeocoderResult) => {
  travelTo.value.point_latitude = event.geometry.location.lat();
  travelTo.value.point_longitude = event.geometry.location.lng();
  console.log(travelTo.value);
  if (
    travelFrom.value.point_latitude &&
    travelFrom.value.planned_departure_time
  )
    timeCalculationsWithMapAPI();
};

const onViaPointSelect = (index) => {
  updateRoutePointChanges();
  vpTimeCalculationsWithMapAPI(index);
};

const onViaPointRemove = (index) => {
  viaPointList.value.splice(index, 1);
  ViaPointController.removeReturnTripError(index + 1);
  ViaPointController.setTravelPointListRound(viaPointList.value);
  updateRoutePointChanges();
  vpTimeCalculationsWithMapAPI(index);
};

const assignAfterCalculate = (points, vpIndex = -1) => {
  if (!points) return;

  // Get existing points to check if structure changed
  const existingPoints = ViaPointController.getTravelPointListRound();
  const isNewPointAdded = points.length > existingPoints.length;

  // When new points are added, use all calculated times from map API
  // When no structural change, preserve existing valid times to avoid unnecessary updates
  const finalPoints = points.map((calculatedPoint, index) => {
    const existingPoint = existingPoints[index];
    const isDestinationPoint = index === points.length - 1;
    // If new points were added, always use fresh calculated times for proper sync
    if (isNewPointAdded) {
      return { ...calculatedPoint };
    }

    // If no new points added and existing point has valid times, preserve them
    if (
      index < existingPoints.length &&
      existingPoint &&
      existingPoint.planned_arrival_time &&
      existingPoint.planned_departure_time &&
      isValidDate(existingPoint.planned_arrival_time) &&
      isValidDate(existingPoint.planned_departure_time) &&
      !isDestinationPoint
    ) {
      return {
        ...calculatedPoint,
        planned_arrival_time: existingPoint.planned_arrival_time,
        planned_departure_time: existingPoint.planned_departure_time,
      };
    }

    // Otherwise use calculated times
    return { ...calculatedPoint };
  });

  // Safely calculate duration with valid date checking
  let totalDurationValue = 0;
  const lastPoint = finalPoints[finalPoints.length - 1];
  const firstPoint = finalPoints[0];

  if (
    lastPoint?.planned_arrival_time &&
    firstPoint?.planned_departure_time &&
    isValidDate(lastPoint.planned_arrival_time) &&
    isValidDate(firstPoint.planned_departure_time)
  ) {
    totalDurationValue =
      new Date(lastPoint.planned_arrival_time).valueOf() -
      new Date(firstPoint.planned_departure_time).valueOf();
  }

  ViaPointController.setTravelPointListRound(finalPoints);

  ViaPointController.setTotalDistanceWithDuration(
    "returnTrip",
    "duration",
    totalDurationValue / 60000
  );

  if (finalPoints.length > 2) {
    if (vpIndex >= 0) {
      const timeout = setTimeout(() => {
        ViaPointController.isDatetimeErr(vpIndex, TRIP_TYPE.RETURN);
        clearTimeout(timeout);
      }, 100);
    }
  }
};

watch(
  () => [
    props.busWaiting,
    oneWayTravelPoints.value[oneWayTravelPoints.value.length - 1]
      ?.planned_arrival_time,
  ],
  ([bw, onewayToArrivalTime]) => {
    // Only validate if busWaiting is true and both times are available and valid
    if (
      bw &&
      onewayToArrivalTime &&
      travelFrom.value.planned_departure_time &&
      isBefore(
        travelFrom.value.planned_departure_time as Date,
        onewayToArrivalTime as Date
      )
    ) {
      showToast(
        "error",
        t("viapoints.return_trip_departure_should_not_before_arrival")
      );
      ViaPointController.setFromToError(TRIP_TYPE.RETURN, {
        fromPoint: travelFrom.value.point,
        fromDepartureTime: "invalid",
        toPoint: travelTo.value.point,
      });
    } else {
      ViaPointController.setFromToError(TRIP_TYPE.RETURN, {
        fromPoint: travelFrom.value.point,
        fromDepartureTime: travelFrom.value.planned_departure_time,
        toPoint: travelTo.value.point,
      });
    }
  }
);

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
</script>

<style scoped lang="scss">
.btn-outline-success.rounded-circle.remove-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-color: #28a745;
  color: #28a745;
}

.eta-time {
  font-weight: 500;
}

.departure-time {
  color: #555;
}

.departure-field {
  display: flex;
  align-items: center;
}

.location-text {
  font-weight: 500;
  padding: 0.375rem 0;
}

.location-to {
  margin-left: 2.2rem;
}

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

.time-return {
  margin-top: 0.75rem;
}

.blank-eta {
  margin-left: 1.25rem;
}

.multiline-address {
  display: block;
  margin-left: 4rem;
}
</style>
