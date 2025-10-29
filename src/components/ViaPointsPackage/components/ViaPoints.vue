<template>
  <div class="row" v-if="isEndedVpLoading">
    <div class="col-sm-12 col-md-12 col-lg-8 col-xl-8">
      <div class="mb-3 text-start">
        <SelectButton
          v-model="order_type"
          :options="tripTypes"
          optionLabel="label"
          optionValue="key"
          :unselectable="true"
        />
      </div>
      <OneWay
        :trySubmit="trySubmit"
        :company-info="companyInfo"
        :translations="translations"
        @on-vp-point-missing="setVpPointMissing"
        @on-ready-vp-list="handleEmitVpList"
      />
      <div class="row mt-4" v-if="isRoundTrip">
        <div class="toggle-button col-sm-12 col-md-4 text-start">
          <label class="form-label text-nowrap">{{
            translations.make_bus_availability
          }}</label>
          <div class="d-flex align-items-center">
            <input
              v-model="busAvailabilityComp"
              type="checkbox"
              id="returnTripswitch"
            />
            <label class="label" for="returnTripswitch"> </label>
          </div>
          <FormError
            v-if="busAvailabilityErrorMsg"
            :message="busAvailabilityErrorMsg"
          />
        </div>

        <div
          class="col-sm-12 col-md-4 align-middle"
          v-if="
            busAvailabilityComp &&
            ViaPointController.getFromToError(TRIP_TYPE.RETURN)
              .fromDepartureTime !== 'invalid'
          "
        >
          {{ translations.waiting_time }}:
          <span v-if="waitingTime.days">{{ waitingTime.days }} d</span>
          <span v-if="waitingTime.hours" class="mx-2"
            >{{ waitingTime.hours }} h</span
          >
          <span>{{ waitingTime?.minutes }}m</span>
        </div>
      </div>
      <ReturnTrip
        v-if="order_type === 'ROUND'"
        :bus-waiting="busAvailabilityComp"
        :trySubmit="trySubmit"
        :company-info="companyInfo"
        :translations="translations"
        @on-vp-point-missing="setVpPointMissing"
        @on-ready-vp-list="handleEmitVpList"
        @update:bus-waiting="$emit('update:busAvailability')"
      />
    </div>
    <div class="col-sm-12 col-md-12 col-lg-4 col-xl-4">
      <ViaPointMap map-id="viaPointMap" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, PropType } from "vue";
import OneWay from "./OneWay.vue";
import ReturnTrip from "./ReturnTrip.vue";
import ViaPointMap from "./ViaPointMap.vue";
import FormError from "./common/FormError.vue";
import { TRIP_TYPE } from "../enums/enums";
import ViaPointController from "../controllers/ViaPointController";
import { intervalToDuration } from "date-fns";
import SelectButton from "primevue/selectbutton";
import { removeDirectionResultReturn } from "../services/googleMap/map.service";
import { RoutePoints } from "../types/types";
import { getLoading } from "../composables/useLocationInput";

const props = defineProps({
  initValues: {
    type: Object as PropType<RoutePoints>,
    default: () => ({ oneway: [], return: [] }),
  },
  trySubmit: {
    type: Boolean,
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
  isRoundTrip: {
    type: Boolean,
    required: true,
  },
  busAvailability: {
    type: Boolean,
    required: true,
  },
  busAvailabilityErrorMsg: {
    type: String,
    default: "",
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

const emit = defineEmits([
  "update:busAvailability",
  "onSelectTripType",
  "onReadyVpList",
  "onViaPointMissing",
  "onViaPointError",
  "onViaPointLoading",
]);

const vpPointMissing = ref({
  [TRIP_TYPE.ONEWAY]: false,
  [TRIP_TYPE.RETURN]: false,
});

const tripTypes = computed(() => {
  const trip_types = [];

  if (!props.isEditMode || (props.isEditMode && !props.isRoundTrip)) {
    trip_types.push({
      label: props.translations.one_way,
      key: "SINGLE",
    });
  }

  if (!props.isEditMode || (props.isEditMode && props.isRoundTrip)) {
    trip_types.push({
      label: props.translations.return_trip,
      key: "ROUND",
    });
  }

  return trip_types;
});

const order_type = ref("SINGLE");
watch(
  () => order_type.value,
  (value) => {
    emit("onSelectTripType", value);
  }
);

watch(
  () => ViaPointController.hasViapointErrors(),
  (vpErrors) => {
    if (vpErrors) {
      emit("onViaPointError", vpErrors);
    } else {
      emit("onViaPointError", false);
    }
  },
  {
    immediate: true,
  }
);

const isRoundTrip = computed(() => order_type.value === "ROUND");
const busAvailabilityComp = computed({
  get: () => props.busAvailability,
  set: (value) => {
    emit("update:busAvailability", value);
  },
});

const oneWay = computed(() => ViaPointController.getTravelPointListOneWay());
const roundTrip = computed(() => ViaPointController.getTravelPointListRound());
const waitingTime = computed(() => {
  const start = oneWay.value[oneWay.value.length - 1]
    .planned_arrival_time as Date;
  const end = roundTrip.value[0]?.planned_departure_time as Date;

  if (!start || !end) return { minutes: 0 };
  return intervalToDuration({
    start: new Date(start),
    end: new Date(end),
  });
});

const setVpPointMissing = (tripType: string, isPointMissing: boolean) => {
  vpPointMissing.value[tripType] = isPointMissing;
  emit("onViaPointMissing", isPointMissing);
};

const handleEmitVpList = () => {
  emit("onReadyVpList", ViaPointController.getFormattedViaPointLists());
};

const isEndedVpLoading = ref(false);

watch(
  () => props.initValues,
  (route_points) => {
    if (route_points.oneway.length > 0) {
      ViaPointController.setTravelPointListOneWay(route_points.oneway);
      ViaPointController.setTravelPointListRound(route_points.return);
      if (route_points.return.length) order_type.value = "ROUND";
    }
    isEndedVpLoading.value = true;
  },
  {
    immediate: true,
  }
);

watch(order_type, (value) => {
  if (value === "SINGLE") {
    //reset bus availability option
    busAvailabilityComp.value = false;
    //clear map route for return trip
    removeDirectionResultReturn();
    //remove return trip errors
    ViaPointController.resetReturnTripValuesAndErrors();
    setVpPointMissing(TRIP_TYPE.RETURN, false);
  }
});

watch(
  () => getLoading(),
  (loading) => {
    emit("onViaPointLoading", loading);
  }
);
</script>
<style lang="scss">
.p-selectbutton .p-button {
  background: #ffffff !important;
  color: #0c1026 !important;
  border-color: #ced4da !important;
  &:hover {
    background: #ffffff !important;
    color: #0c1026 !important;
  }
}

.p-selectbutton .p-button.p-highlight {
  background: #138340 !important;
  color: #ffffff !important;
  border-color: #138340 !important;
}

.toggle-button {
  input[type="checkbox"] {
    height: 0;
    width: 0;
    visibility: hidden;
    background: #d5d6d5;
  }

  .label {
    cursor: pointer;
    text-indent: -9999px;
    width: 69px;
    height: 32px;
    background: #d5d6d5;
    border-radius: 16px;
    position: relative;
  }

  /* toggle button style */
  .label:after {
    content: "";
    position: absolute;
    background: #0c1026;
    left: 0;
    width: 32px;
    height: 32px;
    border-radius: 90px;
    transition: 0.3s;
  }

  input:checked + label {
    background: #a5f2c4;
  }

  input:checked + label:after {
    left: 100%;
    transform: translateX(-100%);
  }

  .label:active:after {
    width: 130px;
  }
}
</style>
