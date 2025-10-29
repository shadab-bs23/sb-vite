<template>
  <hr class="my-3" />
  <div class="row my-2">
    <div class="col-lg-5 col-md-6 col-12">
      <BaseLocationAutocomplete
        id="return-from-Location"
        label="Return from"
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
      <FormError
        v-if="
          !returnFromToErrors.fromPoint && (hasInput.fromPoint || trySubmit)
        "
        :message="translations.field_required"
      />
    </div>
    <div class="col-lg-5 col-md-6 col-12">
      <label class="form-label w-100 text-start" for="fromLocation">{{
        translations.departure_dateTime
      }}</label>
      <div>
        <el-date-picker
          v-model="travelFrom.planned_departure_time"
          type="datetime"
          format="DD.MM.YYYY HH:mm"
          :placeholder="translations.departure_dateTime"
          :class="`custom-calendar rounded w-100 ${
            (!returnFromToErrors.fromDepartureTime ||
              returnFromToErrors.fromDepartureTime === 'invalid') &&
            (hasInput.fromDepartureTime || trySubmit)
              ? 'border border-danger'
              : ''
          }`"
          :editable="true"
          :arrow-control="true"
          :disabled-hours="disabledHours"
          :disabled-minutes="disabledMinutes"
          @focus="setDefaultDate"
          @blur="setInput('fromDepartureTime')"
          @visible-change="() => dateTimeCalculation(-1)"
        />
        <FormError
          v-if="
            !returnFromToErrors.fromDepartureTime &&
            (hasInput.fromDepartureTime || trySubmit)
          "
          :message="translations.field_required"
        />
      </div>
    </div>
  </div>
  <ViaPoint
    v-model:via-point-list="viaPointList"
    :type="TRIP_TYPE.RETURN"
    :datetime-err="returnTripDatetimeErrors"
    :try-submit="trySubmit"
    :companyInfo="companyInfo"
    :translations="translations"
    @onLocationSelect="onViaPointSelect"
    @onLocationRemove="onViaPointRemove"
    @dateTimeUpdate="dateTimeCalculation"
  />

  <div class="my-3 text-start">
    <a @click="handleAddViaPoints" href="#" v-if="viaPointList.length <= 5"
      >Add Via Point(s)</a
    >
    <p v-else>{{ translations.maximum_point_reached }}</p>
  </div>

  <div class="row">
    <div class="col-lg-5 col-md-6 col-12">
      <BaseLocationAutocomplete
        id="return-to-Location"
        autocomplete="false"
        :label="t('common.to')"
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
      <FormError
        v-if="!returnFromToErrors.toPoint && (hasInput.toPoint || trySubmit)"
        :message="translations.field_required"
      />
    </div>
    <div class="col-lg-5 col-md-6 col-12">
      <label
        class="form-label w-100 text-start text-nowrap"
        for="fromLocation"
        >{{ translations.estimated_arrival_datetime }}</label
      >

      <div
        class="d-flex w-100 date-time-picker py-2 ps-2 pe-5 light-gray-bg border rounded"
        :class="travelTo.planned_arrival_time && 'border rounded'"
      >
        <span v-if="travelTo.planned_arrival_time">{{
          formatDateTime(new Date(travelTo.planned_arrival_time))
        }}</span>
        <span v-else>=</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import BaseLocationAutocomplete from "@busgroup/vue3-base-location-autocomplete";
import { formatDateTime } from "../utils/time.utils";
import ViaPoint from "./viapoint/ViaPoint.vue";
import { useI18n } from "vue-i18n";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { TViaPoints } from "../types/types";
import ViaPointController from "../controllers/ViaPointController";
import { searchCountries } from "../utils/utils";
import {
  calculateDistanceAndTimeForReturnMapAPI,
  singleVpCalculateDistanceAndTimeForReturnMapAPI,
  vpCalculateDistanceAndTimeForReturnMapAPI,
} from "../composables/useLocationInput";
import { TRIP_TYPE } from "../enums/enums";
import { isBefore, isEqual } from "date-fns";
import { showToast } from "@/services/toast/toast.service";
import FormError from "../components/common/FormError.vue";

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
});

const emit = defineEmits(["onReadyVpList", "onVpPointMissing"]);

const { t } = useI18n();

const oneWayTravelPoints = computed(() =>
  ViaPointController.getTravelPointListOneWay()
);
const lastPointIndex = oneWayTravelPoints.value.length - 1;

const viaPointList = ref<TViaPoints[]>(
  ViaPointController.getTravelViaPointListForReturn() ?? []
);

const travelFrom = ref<TViaPoints>({
  ...oneWayTravelPoints.value[lastPointIndex],
  type: "from",
  planned_arrival_time: null,
  planned_departure_time: null,
  actual_departure_time: null,
  sequence: 0,
});

const travelTo = ref<TViaPoints>({
  ...oneWayTravelPoints.value[0],
  type: "to",
  planned_departure_time: null,
  actual_departure_time: null,
  planned_arrival_time: null,
  sequence: lastPointIndex,
});

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
    }
  );
};

const dateTimeCalculation = (index = -1) => {
  setInput("fromDepartureTime");

  if (index === -1 && travelFrom.value.planned_departure_time) {
    if (
      props.busWaiting &&
      isBefore(
        travelFrom.value.planned_departure_time,
        oneWayTravelPoints.value[oneWayTravelPoints.value.length - 1]
          .planned_arrival_time as Date
      )
    ) {
      showToast("error", "date err");
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

/**
 * This code will be used later.
 */
// const disabledDate = (date: Date) => {
//   // setHours sets it to the beginning of day so it includes today also

//   return (
//     date.valueOf() < minDepartureDate.value.valueOf() - 86400000 || // 24 hours in milliseconds ||
//     date.valueOf() > maxDepartureDate.value.valueOf()
//   );
// };

const disabledHours = () => {
  // Disable all hours for past dates

  if (
    travelFrom.value.planned_departure_time &&
    (isBefore(
      travelFrom.value.planned_departure_time as Date,
      minDepartureDate.value
    ) ||
      isEqual(
        travelFrom.value.planned_departure_time as Date,
        minDepartureDate.value
      ))
  ) {
    return Array.from(
      { length: minDepartureDate.value.getHours() },
      (_, index) => index
    );
  }
  return [];
};

const disabledMinutes = () => {
  // Disable all minutes for past dates
  if (
    travelFrom.value.planned_departure_time &&
    (isBefore(
      travelFrom.value.planned_departure_time as Date,
      minDepartureDate.value
    ) ||
      isEqual(
        travelFrom.value.planned_departure_time as Date,
        minDepartureDate.value
      ))
  ) {
    return Array.from(
      { length: minDepartureDate.value.getMinutes() },
      (_, index) => index
    );
  }

  return [];
};

let flag = false;

watch(
  () => ViaPointController.getTravelPointListRound(),
  (returnRoutePoints) => {
    if (!flag) {
      const temp = [...returnRoutePoints];
      if (temp.length) {
        let fromLocation = temp.shift() as TViaPoints;
        fromLocation = {
          ...fromLocation,
          planned_departure_time: new Date(fromLocation.planned_departure_time),
          actual_departure_time: new Date(fromLocation.actual_departure_time),
          planned_arrival_time: new Date(fromLocation.planned_arrival_time),
        };
        let toLocation = temp.pop() as TViaPoints;
        toLocation = {
          ...toLocation,
          planned_departure_time: new Date(toLocation.planned_departure_time),
          actual_departure_time: new Date(toLocation.actual_departure_time),
          planned_arrival_time: new Date(toLocation.planned_arrival_time),
        };
        travelFrom.value = fromLocation;
        travelTo.value = toLocation;
        viaPointList.value = temp.map((vp) => ({
          ...vp,
          planned_departure_time: new Date(vp.planned_departure_time),
          actual_departure_time: new Date(vp.actual_departure_time),
          planned_arrival_time: new Date(vp.planned_arrival_time),
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

onBeforeUnmount(() => {
  ViaPointController.setTravelPointListRound([]);
  ViaPointController.setTotalDistanceWithDuration("returnTrip", "distance", 0);
  ViaPointController.setTotalDistanceWithDuration("returnTrip", "duration", 0);
});

const minDepartureDate = computed(() => {
  const onewayLastArrivalTime = oneWayTravelPoints.value[
    oneWayTravelPoints.value.length - 1
  ].planned_arrival_time as Date;

  if (onewayLastArrivalTime) return onewayLastArrivalTime;
  let today = new Date();
  const numberOfDaysToAdd = props.companyInfo.min_days_before_booking;
  return new Date(today.setDate(today.getDate() + numberOfDaysToAdd));
});

/**
 * This code will be used later.
 */

// const maxDepartureDate = computed(() => {
//   return addMinutes(minDepartureDate.value, props.companyInfo.max_departure);
// });

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
    showToast("error", props.translations.insert_location_last_field);
    return;
  }

  viaPointList.value.push({
    id: viaPointList.value.length + Math.floor(Math.random() * 100),
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

watch(
  () => [viaPointList.value, travelFrom.value, travelTo.value],
  ([newViaPoint, newTravelForm, newTravelTo]) => {
    const temp: TViaPoints[] = (newViaPoint as TViaPoints[]).map((obj) => ({
      ...obj,
    }));
    temp.push({
      ...newTravelTo,
      sequence: temp.length + 1,
    } as TViaPoints);

    temp.unshift({ ...(newTravelForm as TViaPoints) });

    if (
      props.busWaiting &&
      isBefore(
        (newTravelForm as TViaPoints).planned_departure_time as Date,
        oneWayTravelPoints.value[oneWayTravelPoints.value.length - 1]
          .planned_arrival_time as Date
      ) &&
      !isEqual(
        (newTravelForm as TViaPoints).planned_departure_time as Date,
        oneWayTravelPoints.value[oneWayTravelPoints.value.length - 1]
          .planned_arrival_time as Date
      )
    ) {
      ViaPointController.setFromToError(TRIP_TYPE.RETURN, {
        fromPoint: (newTravelForm as TViaPoints).point,
        fromDepartureTime: "invalid",
        toPoint: (newTravelTo as TViaPoints).point,
      });
    } else {
      ViaPointController.setFromToError(TRIP_TYPE.RETURN, {
        fromPoint: (newTravelForm as TViaPoints).point,
        fromDepartureTime: (newTravelForm as TViaPoints).planned_departure_time,
        toPoint: (newTravelTo as TViaPoints).point,
      });
    }

    ViaPointController.setTravelPointListRound(temp);
    emit("onReadyVpList");

    const pointMissing = !!viaPointList.value.find(
      (vp) => !vp.point.length || !vp.planned_departure_time
    );
    emit("onVpPointMissing", TRIP_TYPE.RETURN, pointMissing);
  },
  {
    immediate: true,
    deep: true,
  }
);

const onFromLocationSelect = (event: google.maps.GeocoderResult) => {
  travelFrom.value.point_latitude = event.geometry.location.lat();
  travelFrom.value.point_longitude = event.geometry.location.lng();
  if (travelTo.value.point_latitude && travelFrom.value.actual_departure_time)
    timeCalculationsWithMapAPI();
};

const onToLocationSelect = (event: google.maps.GeocoderResult) => {
  travelTo.value.point_latitude = event.geometry.location.lat();
  travelTo.value.point_longitude = event.geometry.location.lng();
  if (
    travelFrom.value.point_latitude &&
    travelFrom.value.planned_departure_time
  )
    timeCalculationsWithMapAPI();
};

const onViaPointSelect = (index) => {
  vpTimeCalculationsWithMapAPI(index);
};

const onViaPointRemove = (index) => {
  viaPointList.value.splice(index, 1);
  ViaPointController.removeReturnTripError(index + 1);
  ViaPointController.setTravelPointListRound(viaPointList.value);
  vpTimeCalculationsWithMapAPI(index);
};

const assignAfterCalculate = (points, vpIndex = -1) => {
  if (!points) return;
  const totalDurationValue =
    new Date(points[points.length - 1].planned_arrival_time).valueOf() -
    new Date(points[0].planned_departure_time).valueOf();

  ViaPointController.setTotalDistanceWithDuration(
    "returnTrip",
    "duration",
    totalDurationValue / 60000
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
        ViaPointController.isDatetimeErr(vpIndex, "returnTrip");
        clearTimeout(timeout);
      }, 100);
    }
  }
};

watch(
  () => [
    props.busWaiting,
    oneWayTravelPoints.value[oneWayTravelPoints.value.length - 1]
      .planned_arrival_time,
  ],
  ([bw, onewayToArrivalTime]) => {
    if (
      bw &&
      isBefore(
        travelFrom.value.planned_departure_time as Date,
        onewayToArrivalTime as Date
      )
    ) {
      showToast(
        "error",
        props.translations.return_trip_departure_should_not_before_arrival
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
</script>
