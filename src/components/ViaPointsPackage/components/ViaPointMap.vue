<template>
  <div class="map-card card d-flex flex-column p-2">
    <div :id="mapId" :class="mapClass"></div>
    <div class="trip-info p-3">
      <div
        v-if="totalDistAndDuration.returnTrip?.duration"
        class="text-start my-2 w-100"
      >
        <span><i class="fi fi-arrow-left-right mx-1"></i></span>
        <span> {{ $t("viapoints.round_trip") }} </span>
      </div>
      <div class="trip-row text-start">
        <span class="trip-label">{{ $t("viapoints.trip_time") }}</span>
        <span class="trip-value">
          {{ minToTime(totalDistAndDuration.oneway?.duration) }}
        </span>
      </div>
      <div
        v-if="totalDistAndDuration.returnTrip?.duration"
        class="trip-row text-start"
      >
        <span class="trip-label">{{ $t("viapoints.return_trip_time") }}</span>
        <span class="trip-value">
          {{ minToTime(totalDistAndDuration.returnTrip?.duration) }}
        </span>
      </div>
      <div class="trip-row text-start">
        <span class="trip-label">{{ $t("viapoints.distance") }}</span>
        <span class="trip-value">
          {{ totalDistAndDuration.oneway?.distance.toFixed(0) }} km
        </span>
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

.trip-info {
  background-color: white;
  border-top: 1px solid #e0e0e0;
}

.trip-row {
  font-size: 1rem;
  display: grid;
  grid-template-columns: 140px auto auto;
  align-items: center;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
}

.trip-label {
  font-weight: bold;
  color: #000;
}

.trip-type {
  color: #666;
  font-size: 0.875rem;
}

.trip-value {
  text-align: right;
  color: #000;
  justify-self: end;
}
</style>
