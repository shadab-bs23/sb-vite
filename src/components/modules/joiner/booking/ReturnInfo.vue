<template>
  <div
    v-if="isRoundTrip && selectedPickupPointId && returnRoutePoints.length"
    class="return-info"
  >
    <h4 class="text-start mb-3 fs-4 fw-semibold text-dark">
      {{ $t("sharebus.return_info.return") }}: {{ returnDate }}
    </h4>

    <div class="return-route-list">
      <div
        v-for="(point, index) in returnRouteFromSelectedPoint"
        :key="point.id || index"
        class="return-point-item d-flex align-items-start py-3 px-2 position-relative"
        :style="{
          borderBottom:
            index < returnRouteFromSelectedPoint.length - 1
              ? '1px solid #d2d7d2'
              : 'none',
          minHeight: '111px',
        }"
      >
        <!-- Departure Time -->
        <div
          class="departure-time fw-semibold text-center me-3 fs-4 text-dark"
          :style="{
            color: '#0c1026',
            width: '71px',
            height: '33px',
          }"
        >
          {{ formatDepartureTime(point.planned_departure_time) }}
        </div>

        <!-- Timeline visualization -->
        <div
          class="timeline-container position-relative me-3 d-flex align-items-center justify-content-center"
          style="width: 44px; height: 100%"
        >
          <!-- Connector line to next return point -->
          <div
            v-if="index < returnRouteFromSelectedPoint.length - 1"
            class="connector-line position-absolute"
            :style="{
              width: '2px',
              height: '111px',
              backgroundColor: '#138340',
              left: '50%',
              top: '16px',
              transform: 'translateX(-50%)',
              zIndex: 1,
            }"
          ></div>

          <!-- Timeline node - filled green circle for all return points -->
          <div
            class="timeline-node d-flex align-items-center justify-content-center position-relative"
            style="width: 32px; height: 32px; z-index: 2"
          >
            <div
              class="return-circle"
              style="
                width: 12px;
                height: 12px;
                background-color: #138340;
                border-radius: 50%;
              "
            ></div>
          </div>
        </div>

        <!-- Location Information -->
        <div class="ms-5">
          <SplittedPlaceName :point="point.point" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { TViaPoints } from "@/components/ViaPointsPackage/types/types";
import { useCompanyTimeFormat } from "@/composables/useCompanyTimeFormat";
import SplittedPlaceName from "@/components/common/SplittedPlaceName.vue";

interface Props {
  isRoundTrip: boolean;
  selectedPickupPointId: number | null;
  outboundRoutePoints: TViaPoints[];
  returnRoutePoints: TViaPoints[];
}

const props = defineProps<Props>();

const formatAsCompanyTime = useCompanyTimeFormat();

// Format departure time for display
const formatDepartureTime = (datetime: Date | string | null | undefined) => {
  if (!datetime) return "";

  try {
    return formatAsCompanyTime(datetime, "HH:mm");
  } catch (error) {
    return "";
  }
};

// Get the return date formatted
const returnDate = computed(() => {
  if (!props.returnRoutePoints.length) return "";

  const returnDateTime =
    props.returnRoutePoints[props.returnRoutePoints.length - 1]
      ?.planned_departure_time;
  return returnDateTime
    ? formatAsCompanyTime(returnDateTime, "EEEE, dd.MM.yyyy")
    : "";
});

// Get the return route showing only destination to selected pickup point (2 points only)
const returnRouteFromSelectedPoint = computed(() => {
  if (!props.selectedPickupPointId || !props.returnRoutePoints.length) {
    return [];
  }

  // Find the selected pickup point in outbound route
  const selectedPoint = props.outboundRoutePoints.find(
    (point) => point.id === props.selectedPickupPointId
  );

  if (!selectedPoint) return [];

  // Find corresponding return point (same location as selected pickup point)
  const returnToSelectedPoint = props.returnRoutePoints.find(
    (returnPoint) => returnPoint.point === selectedPoint.point
  );

  if (!returnToSelectedPoint) return [];

  // Return only 2 points: destination (first point) and selected pickup point
  return [
    props.returnRoutePoints[0], // Destination (first point in return route)
    returnToSelectedPoint, // Selected pickup point in return route
  ];
});
</script>

<style lang="scss" scoped>
.return-info {
  padding-top: 2rem;

  h3 {
    font-weight: 600; // Semi Bold
    color: #0c1026;
  }

  .return-point-item {
    border-color: #d2d7d2;
    background-color: #fefffe;
  }

  // Typography matching the pickup point selector
  .departure-time {
    font-weight: 600; // Semi Bold
    color: #0c1026;
  }

  .location-name {
    font-weight: 600; // Semi Bold
    color: #0c1026;
  }

  .formal-name {
    font-weight: 400; // Regular
    color: #606161;
  }
}
</style>
