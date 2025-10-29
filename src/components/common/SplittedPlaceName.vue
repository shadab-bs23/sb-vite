<template>
  <div :class="wrapperClass">
    <h4 :class="point1Class">
      <!-- {{ placeShortName(pointData.point) }} -->
      {{ splitAndGetFirstElement(point, ",") }}
    </h4>

    <p :class="point2Class">
      {{ replaceBeforeGivenIndex(point, ",", 1, "") }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from "vue";
import { replaceBeforeGivenIndex, splitAndGetFirstElement } from "@/utils";

defineProps({
  point: {
    type: String,
    required: true,
  },
  wrapperClass: {
    type: String,
    default: "text-start",
  },
  point1Class: {
    type: String,
    default: "fw-600 fs-18 text-dark",
  },
  point2Class: {
    type: String,
    default: "fs-16 fw-light text-muted text-truncate",
  },
});
</script>
