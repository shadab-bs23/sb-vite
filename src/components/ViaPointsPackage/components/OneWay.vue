<template>
  <div class="row my-2">
    <div class="col-lg-5 col-md-6 col-12">
      <BaseLocationAutocomplete
        id="travel-from-Location"
        :label="t('common.from')"
        autocomplete="false"
        :search-types="[]"
        :class="`rounded ${
          !onewayFromToErrors.fromPoint && (hasInput.fromPoint || trySubmit)
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
          !onewayFromToErrors.fromPoint && (hasInput.fromPoint || trySubmit)
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
          :default-time="defaultDate"
          :class="`custom-calendar rounded w-100 ${
            !onewayFromToErrors.fromDepartureTime &&
            (hasInput.fromDepartureTime || trySubmit)
              ? 'border border-danger'
              : ''
          }`"
          :editable="true"
          :arrow-control="true"
          :disabled-date="disabledDate"
          :disabled-hours="disabledHours"
          :disabled-minutes="disabledMinutes"
          @focus="setDefaultDate"
          @blur="setInput('fromDepartureTime')"
          @visible-change="() => dateTimeCalculation(-1)"
        />
      </div>
      <FormError
        v-if="
          !onewayFromToErrors.fromDepartureTime &&
          (hasInput.fromDepartureTime || trySubmit)
        "
        :message="translations.field_required"
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
        id="travel-to-Location"
        autocomplete="false"
        :label="t('common.to')"
        :search-types="[]"
        :class="`rounded ${
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
      <FormError
        v-if="!onewayFromToErrors.toPoint && (hasInput.toPoint || trySubmit)"
        :message="translations.field_required"
      />
    </div>
    <div class="col-lg-5 col-md-6 col-12">
      <label class="form-label w-100 text-start" for="fromLocation">{{
        translations.estimated_arrival_datetime
      }}</label>
      <div
        class="d-flex w-100 date-time-picker py-2 ps-2 pe-5 light-gray-bg border rounded"
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
import ViaPoint from "./viapoint/ViaPoint.vue";
import { useI18n } from "vue-i18n";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { TViaPoints } from "../types/types";
import ViaPointController from "../controllers/ViaPointController";
import { searchCountries } from "../utils/utils";
import {
  calculateDistanceAndTimeForOneWayMapAPI,
  singleVpCalculateDistanceAndTimeForOneWayMapAPI,
  vpCalculateDistanceAndTimeForOneWayMapAPI,
} from "../composables/useLocationInput";
import { formatDateTime } from "../utils/time.utils";
import { TRIP_TYPE } from "../enums/enums";
import { showToast } from "@/services/toast/toast.service";
import FormError from "../components/common/FormError.vue";
import { addMinutes } from "date-fns";

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
});

const emit = defineEmits(["onReadyVpList", "onVpPointMissing"]);

const { t } = useI18n();

const viaPointList = ref<TViaPoints[]>([]);

const travelFrom = ref<TViaPoints>({
  id: viaPointList.value.length + Math.floor(Math.random() * 100),
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
  id: viaPointList.value.length + 1 + Math.floor(Math.random() * 100),
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

const setDefaultDate = () => {
  travelFrom.value.planned_departure_time =
    travelFrom.value.planned_departure_time || defaultDate.value;
};

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
    }
  );
};

const vpTimeCalculationsWithMapAPI = (index) => {
  const { leg_percentage, default_pause_time } = props.companyInfo;
  vpCalculateDistanceAndTimeForOneWayMapAPI(
    index,
    leg_percentage,
    default_pause_time,
    (points) => {
      assignAfterCalculate(points);
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

const disabledDate = (time: Date) => {
  // setHours sets it to the beginning of day so it includes today also
  const dayMS = defaultDate.value.setHours(0, 0, 0, 0);
  return (
    time.getTime() < dayMS || time.getTime() > maxDepartureDate.value.valueOf()
  );
};

const disabledHours = () => {
  // setHours sets it to the beginning of day so it includes today also
  const dayMS = defaultDate.value.setHours(0, 0, 0, 0);

  return Array.from(
    {
      length: new Date(dayMS).getHours(),
    },
    (_, index) => index
  );
};

const disabledMinutes = () => {
  // setHours sets it to the beginning of day so it includes today also
  const dayMS = defaultDate.value.setHours(0, 0, 0, 0);

  return Array.from(
    {
      length: new Date(dayMS).getMinutes(),
    },
    (_, index) => index
  );
};

let flag = false;

watch(
  () => ViaPointController.getTravelPointListOneWay(),
  (onewayRoutePoints) => {
    if (!flag) {
      const temp = [...onewayRoutePoints];
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
    showToast("error", props.translations.insert_location_last_field);
    return;
  }

  viaPointList.value.push({
    id: viaPointList.value.length + Math.floor(Math.random() * 100),
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

  if (travelTo.value.point_latitude && travelFrom.value.planned_departure_time)
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
  ViaPointController.removeOnewayError(index + 1);
  ViaPointController.setTravelPointListOneWay(viaPointList.value);
  vpTimeCalculationsWithMapAPI(index);
};

const assignAfterCalculate = (points, vpIndex = -1) => {
  if (!points) return;
  const totalDurationValue =
    new Date(points[points.length - 1].planned_arrival_time).valueOf() -
    new Date(points[0].planned_departure_time).valueOf();

  ViaPointController.setTotalDistanceWithDuration(
    TRIP_TYPE.ONEWAY,
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
        ViaPointController.isDatetimeErr(vpIndex, TRIP_TYPE.ONEWAY);
        clearTimeout(timeout);
      }, 100);
    }
  }
};
</script>
