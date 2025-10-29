<template>
  <div class="row" v-if="isEndedVpLoading">
    <div class="col-sm-12 col-md-12 col-lg-8 col-xl-8 mb-5">
      <div class="mb-3 text-start">
        <SelectButton
          v-model="order_type"
          :options="tripTypes"
          optionLabel="label"
          optionValue="key"
          :unselectable="true"
          :disabled="isDisabledTripTypeSelection"
        />
      </div>
      <OneWay
        :trySubmit="trySubmit"
        :company-info="companyInfo"
        :translations="translations"
        :is-round-trip="isRoundTrip"
        @onVpPointMissing="setVpPointMissing"
        @onReadyVpList="handleEmitVpList"
        @onViaPointsChange="handleViaPointsChange"
      />
      <div class="row mt-4" v-if="isRoundTrip">
        <div class="col-sm-12 col-md-4 text-start">
          <h3 class="font-size-20 text-start mb-3">
            ← {{ $t("viapoints.return") }}
          </h3>

          <label class="form-label text-nowrap">{{
            translations.make_bus_availability
          }}</label>
          <div class="d-flex align-items-center">
            <InputSwitch v-model="busAvailabilityComp" :disabled="isEditMode" />
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
        :disable-location-change="true"
        :disable-add-remove-viapoints="true"
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
import { intervalToDuration } from "date-fns";
import InputSwitch from "primevue/inputswitch";
import SelectButton from "primevue/selectbutton";
import { computed, PropType, ref, watch } from "vue";
import { getLoading } from "../composables/useLocationInput";
import ViaPointController from "../controllers/ViaPointController";
import { TRIP_TYPE } from "../enums/enums";
import { removeDirectionResultReturn } from "../services/googleMap/map.service";
import { RoutePoints } from "../types/types";
import OneWay from "./OneWay.vue";
import ReturnTrip from "./ReturnTrip.vue";
import ViaPointMap from "./ViaPointMap.vue";
import FormError from "./common/FormError.vue";

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
  const trip_types: {
    label: string;
    key: string;
  }[] = [];

  // Always show One-way button
  trip_types.push({
    label: props.translations.one_way,
    key: "SINGLE",
  });

  // Always show Return trip button
  trip_types.push({
    label: props.translations.return_trip,
    key: "ROUND",
  });

  return trip_types;
});

// Create a new computed property for when to disable the SelectButton
const isDisabledTripTypeSelection = computed(() => {
  return props.isEditMode || isDisabledTripType.value;
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
  //TODO: Calling 3 times need to be optimized @sanibs23
  const start = oneWay.value[oneWay.value.length - 1]
    ?.planned_arrival_time as Date;
  const end = roundTrip.value[0]?.planned_departure_time as Date;

  if (!start || !end) return { minutes: 0 };
  return intervalToDuration({
    start: new Date(start),
    end: new Date(end),
  });
});

const isDisabledTripType = computed(() => {
  return (
    oneWay.value.length === 0 ||
    !oneWay.value[0].point ||
    !oneWay.value[oneWay.value.length - 1].point
  );
});

const setVpPointMissing = (tripType: string, isPointMissing: boolean) => {
  vpPointMissing.value[tripType] = isPointMissing;
  emit("onViaPointMissing", isPointMissing);
};

const handleEmitVpList = () => {
  emit("onReadyVpList", ViaPointController.getFormattedViaPointLists());
};

/**
 * Unified handler for all via point changes in the one-way trip
 * that affect the return trip. This simplifies the logic by centralizing
 * all return trip update operations in one place.
 *
 * @param {Object} payload - Contains all necessary data for updates
 */
const handleViaPointsChange = () => {
  if (!isRoundTrip.value) return;

  // Just sync - no need for complex switching
  ViaPointController.syncReturnTrip();
};

const isEndedVpLoading = ref(false);

watch(
  () => props.initValues,
  (route_points) => {
    if (route_points && route_points.oneway.length > 0) {
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

.el-date-picker__header {
  display: contents !important;
}

.p-inputswitch .p-inputswitch-slider {
  border-radius: 30px;
}
.p-inputswitch .p-inputswitch-slider::before {
  border-radius: 50%;
}
</style>
