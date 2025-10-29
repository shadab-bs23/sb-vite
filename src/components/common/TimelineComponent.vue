<template>
  <div class="d-flex align-items-center">
    <div class="fw-600 fs-18 time-point">{{ getTimeFromPoint(point) }}</div>
    <div class="point-marker mx-2">
      <div class="point-dot"></div>
      <div class="point-line" v-if="showConnectorLine"></div>
    </div>
    <div class="d-flex flex-column text-start ms-4">
      <SplittedPlaceName :point="point.point" />
    </div>
  </div>
</template>

<script setup lang="ts">
import SplittedPlaceName from "@/components/common/SplittedPlaceName.vue";
import type { TViaPoints } from "@/components/ViaPointsPackage/types/types";
import { useCompanyTimeFormat } from "@/composables/useCompanyTimeFormat";

interface Props {
  point: TViaPoints; // The route point data
  showConnectorLine: boolean; // Whether to show the connecting line to next point
}

defineProps<Props>();
const formatInCompanyTimezone = useCompanyTimeFormat();

// Get time from point (either departure or arrival time) - fallback function
const getTimeFromPoint = (point) => {
  const time = point.planned_departure_time || point.planned_arrival_time;
  if (!time) return "";
  return formatInCompanyTimezone(time, "HH:mm");
};
</script>

<style lang="scss" scoped>
.point-marker {
  position: relative;
  width: 14px;
  min-height: 60px;
  margin-right: 1rem;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  padding-top: 8px;

  .point-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: #138340;
    z-index: 2;
    position: relative;
  }

  .point-line {
    position: absolute;
    top: 22px;
    left: 50%;
    transform: translateX(-50%);
    height: calc(100% + 32px);
    width: 2px;
    background-color: #138340;
    z-index: 1;
  }
}
.time-point {
  min-width: 89px;
  max-width: 90px;
  text-align: center;
}
</style>
