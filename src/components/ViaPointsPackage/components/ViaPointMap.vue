<template>
  <div class="map-card card d-flex flex-column p-2">
    <div :id="mapId" :class="mapClass"></div>
    <div
      v-if="totalDistAndDuration.oneway?.distance"
      :class="`${
        totalDistAndDuration.oneway?.distance ? 'light-gray-bg' : ''
      } p-5 text-center`"
    >
      <div v-if="totalDistAndDuration.oneway?.distance" class="row">
        <span class="col-md-6"
          >{{ totalDistAndDuration.oneway?.distance.toFixed(2) }} KM</span
        >
        <span class="col-md-6">{{
          minToTime(totalDistAndDuration.oneway?.duration)
        }}</span>
      </div>
      <div v-if="totalDistAndDuration.returnTrip?.distance" class="row mt-3">
        <span class="col-md-6">
          {{ totalDistAndDuration.returnTrip?.distance.toFixed(2) }} KM</span
        >
        <span class="col-md-6">
          {{ minToTime(totalDistAndDuration.returnTrip?.duration) }}</span
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ViaPointController from "../controllers/ViaPointController";
import { initViaPointMap } from "../services/googleMap/map.service";
import { computed, onMounted } from "vue";
import { minToTime } from "../utils/time.utils";

const props = defineProps({
  mapId: {
    type: String,
    required: false,
    default: "map",
  },

  mapClass: {
    type: String,
    required: false,
    default: "map",
  },
});

const totalDistAndDuration = computed(() =>
  ViaPointController.getTotalDistanceWithDuration()
);

onMounted(() => {
  initViaPointMap(props.mapId);
});
</script>

<style lang="scss" scoped>
.map {
  width: 100%;
  height: 400px;
  overflow: hidden;
}
</style>
