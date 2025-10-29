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
    <div class="col-lg-4 col-md-6 col-12 d-flex align-items-center">
      <i class="bi bi-list fi fi-list me-2 fs-3 mt-4 cursor-pointer"></i>
      <span class="d-flex flex-column">
        <BaseLocationAutocomplete
          :id="`${type}-location-${viaPoint.id}`"
          autocomplete="false"
          :search-types="[]"
          :class="`rounded ${
            !viaPoint.point && (hasInput.point || trySubmit)
              ? 'border border-danger'
              : ''
          }`"
          v-model="viaPoint.point"
          :placeholder="'Enter Via Point location'"
          label="Via"
          label-class="d-block w-100 font-size-14"
          :searchCountries="searchCountries"
          @onSelect="onViaPointLocationSelect($event, index)"
        />
        <FormError
          v-if="!viaPoint.point && (hasInput.point || trySubmit)"
          :message="translations.field_required"
          class="mb-0 w-auto px-0"
        />
      </span>
    </div>

    <div class="col-lg-3 col-md-6 col-12">
      <label class="form-label" for="fromLocation">{{
        translations.estimated_arrival_datetime
      }}</label>
      <div
        class="d-flex w-100 date-time-picker py-2 ps-2 pe-5 light-gray-bg border rounded"
      >
        <span v-if="viaPoint.planned_arrival_time">{{
          formatDateTime(new Date(viaPoint.planned_arrival_time))
        }}</span>
        <span v-else>=</span>
      </div>
    </div>

    <div class="col-lg-3 col-md-6 col-12">
      <label class="form-label" for="fromLocation">{{
        translations.departure_dateTime
      }}</label>
      <div v-if="viaPoint.planned_arrival_time">
        <div class="pv-datepicker">
          <el-date-picker
            v-model="viaPoint.planned_departure_time"
            type="datetime"
            format="DD.MM.YYYY HH:mm"
            :default-time="(viaPoint.planned_arrival_time as Date)"
            :placeholder="translations.departure_date"
            :class="`w-100 ${
              datetimeError[index + 1] || !viaPoint.planned_departure_time
                ? 'border border-danger rounded'
                : ''
            }`"
            :editable="true"
            :arrow-control="true"
            :disabled-date="(date) => disabledDate(date, index)"
            :disabled-hours="
              () =>
                Array.from(
                  {
                    length: viaPoint.planned_arrival_time
                      ? (viaPoint.planned_arrival_time as Date).getHours()
                      : new Date().getHours(),
                  },
                  (_, index) => index
                )
            "
            :disabled-minutes="
              () =>
                Array.from(
                  {
                    length: viaPoint.planned_arrival_time
                      ? (viaPoint.planned_arrival_time as Date).getMinutes()
                      : new Date().getMinutes(),
                  },
                  (_, index) => index
                )
            "
            @change="dateChangesOnViaPoint(index)"
          />
        </div>
      </div>
      <div v-else>
        <span>=</span>
      </div>
    </div>
    <div class="col-lg-2 col-md-12">
      <button
        type="button"
        class="d-flex align-items-center mx-auto mx-lg-1 bg-transparent border-0 mt-4 pt-1"
        @click="handleRemoveViaPoint(index)"
      >
        <i class="fi fi-x-circle-fill primary"></i>
        <i class="bi bi-x-circle-fill primary"></i>
      </button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import BaseLocationAutocomplete from "@busgroup/vue3-base-location-autocomplete";
import { PropType, computed, ref } from "vue";
import { formatDateTime } from "../../utils/time.utils";
import { TViaPoints } from "../../types/types";
import { searchCountries } from "../../utils/utils";
import { addMinutes } from "date-fns";
import { showToast } from "@/services/toast/toast.service";
import FormError from "../common/FormError.vue";

const emit = defineEmits([
  "modelValueUpdate",
  "onLocationSelect",
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
    type: String,
    required: true,
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
});

const itemRefs = ref([]);
const dragItem = ref(0);
const datetimeError = computed(() => props.datetimeErr);
const viaPointListComputed = computed(() => props.viaPointList);
const maxDepartureDate = (index: number) => {
  const minDeptTime = viaPointListComputed.value[index]
    .planned_arrival_time as Date;
  return addMinutes(new Date(minDeptTime), props.companyInfo.max_departure);
};

const dragStart = (event: DragEvent, id: number) => {
  dragItem.value = id;
};

const onDragOver = (event: DragEvent) => {
  event.preventDefault();
};

const onDrop = (event: DragEvent, id: number) => {
  event.preventDefault();

  const data = viaPointListComputed.value;
  let draggedOnItemIndex;
  if (data) {
    const item = data.find((item) => item.id === dragItem.value) as TViaPoints;

    if (!item.point) {
      dragItem.value = 0;
      showToast("error", "Please enter location for this viapoint first!");
      return;
    }
    const dragItemIndex = data.findIndex((item) => item.id === dragItem.value);
    draggedOnItemIndex = data.findIndex((item) => item.id === id);
    const draggedOnitem = data[draggedOnItemIndex];

    if (!draggedOnitem.point) {
      dragItem.value = 0;
      showToast("error", "Please enter location for this viapoint first!");
      return;
    }
    data.splice(dragItemIndex, 1);
    data.splice(draggedOnItemIndex, 0, item);
  }

  emit("modelValueUpdate", data);
  emit("onLocationSelect", draggedOnItemIndex);
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

const disabledDate = (date: Date, index: number) => {
  // setHours sets it to the beginning of day so it includes today also
  const viaPoint = viaPointListComputed.value[index];

  if (!viaPoint) return;

  const minDeptTime =
    (viaPoint && (viaPoint.planned_arrival_time as Date).valueOf()) ||
    Date.now();

  return (
    date.valueOf() < minDeptTime - 86400000 || // 24 hours in milliseconds is 86400000
    date.valueOf() > maxDepartureDate(index).valueOf()
  );
};

const hasInput = ref({
  point: false,
});
const setInput = () => {
  hasInput.value.point = true;
};
</script>
