<template>
  <div
    :id="`via-points-${type}`"
    v-for="(viaPoint, index) in viaPointListComputed"
    draggable="true"
    ref="itemRefs"
    @dragstart="dragStart($event, viaPoint.id)"
    @drop="onDrop($event, viaPoint.id)"
    @dragover="onDragOver($event)"
    class="row my-2"
    :key="index"
  >
    <div class="col-md-5 col-12">
      <div class="d-flex gap-4 ms-1 align-items-center">
        <div
          class="d-flex mt-1 align-items-center gap-1 justify-content-between"
        >
          <p class="mt-2 badge-gray">{{ $t("viapoints.via") }}</p>
          <i
            v-if="!isReturnTrip"
            class="bi bi-list fi fi-list me-2 fs-3 cursor-pointer"
          ></i>
        </div>
        <div v-if="isReturnTrip">
          <span class="text-start ms-4">
            {{ viaPoint.point }}
          </span>
        </div>
        <div v-if="!isReturnTrip" class="d-flex flex-1 w-100 flex-column">
          <BaseLocationAutocomplete
            :id="`location-${viaPoint.id}`"
            autocomplete="false"
            :search-types="[]"
            :class="`rounded ${
              !viaPoint.point && (hasInput.point || trySubmit)
                ? 'border border-danger'
                : ''
            }`"
            v-model="viaPoint.point"
            :placeholder="$t('viapoints.enter_via_point_location')"
            label=""
            label-class="d-block w-100 font-size-14"
            :searchCountries="searchCountries"
            :disabled="disableLocationChange"
            @onSelect="onViaPointLocationSelect($event, index)"
          />
          <FormError
            v-if="!viaPoint.point && (hasInput.point || trySubmit)"
            :message="translations.field_required"
            class="mb-0 w-auto px-0"
          />
        </div>
      </div>
    </div>

    <div class="col-md-2 col-12">
      <div class="mt-3 text-center">
        <span
          v-if="
            viaPoint.planned_arrival_time &&
            isValidDate(viaPoint.planned_arrival_time)
          "
          >{{
            formatInCompanyTimezone(viaPoint.planned_arrival_time, "HH:mm")
          }}</span
        >
        <span v-else>=</span>
      </div>
    </div>

    <div class="col-md-4 col-12 mt-2">
      <div
        v-if="
          viaPoint.planned_arrival_time &&
          isValidDate(viaPoint.planned_arrival_time)
        "
      >
        <div class="pv-datepicker">
          <DatePickerAdapter
            :modelValue="viaPoint.planned_departure_time ?? undefined"
            @update:modelValue="
              (val) => (viaPoint.planned_departure_time = val)
            "
            type="datetime"
            format="DD.MM.YYYY  HH:mm"
            :clearable="false"
            :placeholder="translations.departure_date"
            :class="`w-100 ${
              datetimeError[index + 1] || !viaPoint.planned_departure_time
                ? 'border border-danger rounded'
                : ''
            }`"
            :editable="true"
            :arrow-control="true"
            :default-time="viaPoint.planned_arrival_time"
            :minimum-date="viaPoint.planned_arrival_time"
            :maximum-date="maxDepartureDates[index]"
            @change="dateChangesOnViaPoint(index)"
          />
        </div>
      </div>
      <div v-else>
        <span>=</span>
      </div>
    </div>
    <div class="col-1 mt-2" v-if="!disableAddRemoveViapoints">
      <button
        type="button"
        class="d-flex align-items-center mx-auto mx-lg-1 bg-transparent border-0 pt-1 mt-1"
        @click="handleRemoveViaPoint(index)"
      >
        <i class="fi fi-x-circle-fill primary"></i>
        <!-- <i class="bi bi-x-circle-fill primary"></i> -->
      </button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import DatePickerAdapter from "@/components/common/DatePickerAdapter.vue";
import { useCompanyTimeFormat } from "@/composables/useCompanyTimeFormat";
import { showToast } from "@/services/toast/toast.service";
import { useI18n } from "vue-i18n";
import BaseLocationAutocomplete from "@busgroup/vue3-base-location-autocomplete";
import { addMinutes } from "date-fns";
import { PropType, computed, ref } from "vue";
import { TViaPoints } from "../../types/types";
import { searchCountries } from "../../utils/utils";
import FormError from "../common/FormError.vue";
import { TRIP_TYPE } from "../../enums/enums";

const { t } = useI18n();

const emit = defineEmits([
  "modelValueUpdate",
  "onLocationSelect",
  "onLocationDragDrop",
  "onLocationRemove",
  "dateTimeUpdate",
]);

/**
 * warning
 * @link https://vuejs.org/guide/components/props.html#one-way-data-flow
 */
const props = defineProps({
  // a wrapper class for the wrapper component. It also has a default class.
  viaPointList: {
    type: Array as PropType<TViaPoints[]>,
    required: true,
  },
  type: {
    type: String as PropType<TRIP_TYPE>,
    required: true,
  },
  isDraggable: {
    type: Boolean,
    default: true,
  },
  disableLocationChange: {
    type: Boolean,
    default: false,
  },
  disableAddRemoveViapoints: {
    type: Boolean,
    default: false,
  },
  datetimeErr: {
    type: Object,
    required: true,
    default: () => ({}),
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
  isReturnTrip: {
    type: Boolean,
    default: false,
  },
});

const itemRefs = ref([]);
const dragItem = ref(0);
const datetimeError = computed(() => props.datetimeErr);
const viaPointListComputed = computed(() => props.viaPointList);
const maxDepartureDates = computed(() =>
  viaPointListComputed.value.map((vp, index) => {
    const arrival = viaPointListComputed.value[index]?.planned_arrival_time;
    if (!arrival || !isValidDate(arrival)) return undefined;
    return addMinutes(new Date(arrival), props.companyInfo.max_departure);
  })
);
const formatInCompanyTimezone = useCompanyTimeFormat();

// Helper to check if a date value is valid
const isValidDate = (dateValue) => {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  return !isNaN(date.getTime());
};

const dragStart = (event: DragEvent, id: number) => {
  if (props.isDraggable) {
    dragItem.value = id;
  }
};

const onDragOver = (event: DragEvent) => {
  if (props.isDraggable) {
    event.preventDefault();
  }
};

const onDrop = (event: DragEvent, id: number) => {
  if (!props.isDraggable) return;

  event.preventDefault();

  const data = viaPointListComputed.value;
  let dragItemIndex, draggedOnItemIndex;
  if (data) {
    const item = data.find((item) => item.id === dragItem.value) as TViaPoints;

    if (!item.point) {
      dragItem.value = 0;
      showToast("error", t("error.location_required"));
      return;
    }
    dragItemIndex = data.findIndex((item) => item.id === dragItem.value);
    draggedOnItemIndex = data.findIndex((item) => item.id === id);
    const draggedOnitem = data[draggedOnItemIndex];

    if (!draggedOnitem.point) {
      dragItem.value = 0;
      showToast("error", t("error.location_required"));
      return;
    }
    data.splice(dragItemIndex, 1);
    data.splice(draggedOnItemIndex, 0, item);
  }

  emit("modelValueUpdate", data);
  emit("onLocationDragDrop", { dragItemIndex, draggedOnItemIndex });
};

const handleRemoveViaPoint = (index: number) => {
  if (viaPointListComputed.value[index].point) {
    emit("onLocationRemove", index);
  }
};

const onViaPointLocationSelect = (
  event: google.maps.GeocoderResult,
  index: number
) => {
  setInput();
  if (viaPointListComputed.value[index]) {
    viaPointListComputed.value[index].point_latitude =
      event.geometry.location.lat();
    viaPointListComputed.value[index].point_longitude =
      event.geometry.location.lng();
    emit("onLocationSelect", index);
  }
};

const dateChangesOnViaPoint = (index) => {
  if (
    viaPointListComputed.value[index].actual_departure_time ===
    viaPointListComputed.value[index].planned_departure_time
  ) {
    return;
  }
  emit("dateTimeUpdate", index + 1);
};

const hasInput = ref({
  point: false,
});
const setInput = () => {
  hasInput.value.point = true;
};
</script>
