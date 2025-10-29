<template>
  <div class="d-flex align-items-start mb-2 p-3 bg-light">
    <span
      class="ship-gray text-nowrap"
      :class="`${!tripStatus && 'fw-bold time-font-size'} ${
        isDisabled && 'text-muted'
      }`"
      >{{
        getFormattedTime(
          isLast
            ? viaPoint.planned_arrival_time
            : viaPoint.planned_departure_time
        )
      }}</span
    >
    <span class="ms-3" :class="!tripStatus && 'mt-1'">
      <p
        class="ship-gray fw-bold text-start mb-0"
        :class="isDisabled && 'text-muted'"
      >
        {{ replaceBeforeGivenIndex(viaPoint?.point as string, ",", 1, "") }}
      </p>
      <p class="text-start ship-gray mb-0" :class="isDisabled && 'text-muted'">
        {{ splitAndGetFirstElement(viaPoint?.point as string, ",") }}
      </p>
    </span>
  </div>
</template>

<script setup lang="ts">
import {
  getFormattedTime,
  replaceBeforeGivenIndex,
  splitAndGetFirstElement,
} from "@/utils";

defineProps({
  viaPoint: {
    type: Object,
    required: true,
  },
  tripStatus: {
    type: String,
    required: false,
    defautl: "",
  },
  isDisabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  isLast: {
    type: Boolean,
    required: false,
    default: false,
  },
});
</script>
