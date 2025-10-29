<template>
  <div class="pickup-point-selector" @click="handleOutsideClick">
    <h3 class="text-start fs-22 fw-semibold text-dark">
      {{ $t("sharebus.pickup_point_selector.select_embark_point") }}
    </h3>
    <div class="pickup-points-list">
      <div
        v-for="(pointData, index) in props.pickupPoints"
        :key="pointData.id || index"
        class="pickup-point-item d-flex align-items-center py-3 position-relative"
        :class="{
          destination: isLastPoint(index),
          collapsed: shouldHidePoint(index),
        }"
        :style="{
          cursor: getPointCursor(index),
          borderBottom: shouldHidePoint(index)
            ? 'none'
            : isLastPoint(index)
            ? 'none'
            : '1px solid #d2d7d2',
        }"
        @click.stop="handlePointClick(pointData.id, index)"
      >
        <!-- Departure Time -->
        <!-- Departure Time -->
        <div
          class="departure-time fw-semibold text-center fs-18 text-dark"
          :style="{
            color: '#0c1026',
            width: '90px',
            height: '33px',
          }"
        >
          {{ formatDepartureTime(pointData.planned_departure_time) }}
        </div>

        <!-- Timeline visualization -->
        <div
          class="timeline-container position-relative d-flex flex-column align-items-center"
          style="width: 75px; height: 100%"
        >
          <!-- Connector line to next pickup point -->
          <div
            v-if="shouldShowConnectorLine(index)"
            class="connector-line position-absolute"
            :style="{
              backgroundColor:
                selectedPickupIndex >= 0 && index >= selectedPickupIndex
                  ? '#138340'
                  : '#a8d5ba',
            }"
          ></div>

          <!-- Timeline node - radio button, checkmark, or filled circle for destination -->
          <div
            class="timeline-node d-flex align-items-center justify-content-center position-relative"
            style="width: 32px; height: 32px; z-index: 7"
          >
            <!-- Last point (destination): Always show filled green circle -->
            <div
              v-if="isLastPoint(index)"
              class="destination-circle"
              style="
                width: 12px;
                height: 12px;
                background-color: #138340;
                border-radius: 50%;
              "
            ></div>

            <!-- Selected state: Green circle with checkmark -->
            <div
              v-else-if="selectedPointId === pointData.id"
              class="selected-circle d-flex align-items-center justify-content-center"
              style="
                width: 32px;
                height: 32px;
                background-color: #138340;
                border-radius: 50%;
              "
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"
                  fill="white"
                />
              </svg>
            </div>

            <!-- Unselected state: Empty circle (radio button) -->
            <div
              v-else
              class="radio-circle d-flex align-items-center justify-content-center"
              style="
                width: 32px;
                height: 32px;
                border: 2px solid #138340;
                border-radius: 50%;
                background-color: white;
                cursor: pointer;
              "
            ></div>
          </div>
        </div>

        <!-- Location Information -->
        <div class="location-info flex-grow-1 text-start ms-5">
          <SplittedPlaceName :point="pointData.point" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from "vue";
import { TViaPoints } from "@/components/ViaPointsPackage/types/types";
import SplittedPlaceName from "@/components/common/SplittedPlaceName.vue";
import { useCartRestoration } from "@/composables/useCartRestoration";
import { useCompanyTimeFormat } from "@/composables/useCompanyTimeFormat";

interface Props {
  pickupPoints: TViaPoints[];
}

const props = defineProps<Props>();
const formatInCompanyTimezone = useCompanyTimeFormat();
const emit = defineEmits<{
  "pickup-point-selected": [pointId: number];
}>();

const { usePickupPointRestoration } = useCartRestoration({
  debugPrefix: "PickupPointingSelector",
  onRestore: (restoredData) => {
    if (restoredData.type === "pickup-point") {
      isCollapsed.value = true; // Start in collapsed state when restoring
    }
  },
});

const selectedPointId = ref<number | null>(null);
const isCollapsed = ref(false);

// Use the composable for pickup point restoration
usePickupPointRestoration(
  computed(() => props.pickupPoints),
  selectedPointId
);

// Check if point should be hidden (collapsed)
const shouldHidePoint = (index: number) => {
  if (!isCollapsed.value || !selectedPointId.value) return false;

  // When collapsed, hide all points except selected and destination
  const isSelected = props.pickupPoints[index]?.id === selectedPointId.value;
  const isDestination = isLastPoint(index);

  return !isSelected && !isDestination;
};

// Check if connector line should be shown
const shouldShowConnectorLine = (index: number) => {
  // Don't show connector after the last point
  if (index >= props.pickupPoints.length - 1) return false;

  // If not collapsed, show all connectors between consecutive points
  if (!isCollapsed.value) {
    return true;
  }

  // In collapsed mode, only show connector between selected point and destination
  if (isCollapsed.value && selectedPointId.value) {
    const isCurrentSelected =
      props.pickupPoints[index]?.id === selectedPointId.value;
    const isCurrentDestination = isLastPoint(index);

    // Show connector from selected point to destination
    if (isCurrentSelected && !isCurrentDestination) {
      return true;
    }
  }

  return false;
};

// Format departure time for display
const formatDepartureTime = (datetime: Date | string | null | undefined) => {
  if (!datetime) return "";

  try {
    return formatInCompanyTimezone(datetime, "HH:mm");
  } catch (error) {
    return "";
  }
};

// Get appropriate cursor for each point
const getPointCursor = (index: number) => {
  if (isLastPoint(index)) return "default";
  return "pointer";
};

// Handle point click (select, toggle expand/collapse)
const handlePointClick = (pointId: number, index: number) => {
  if (isLastPoint(index)) {
    // Click on destination - expand if collapsed
    if (isCollapsed.value) {
      isCollapsed.value = false;
    }
    return;
  }

  const isCurrentlySelected = selectedPointId.value === pointId;

  if (isCurrentlySelected && isCollapsed.value) {
    // Click on selected point when collapsed - expand
    isCollapsed.value = false;
  } else if (isCurrentlySelected && !isCollapsed.value) {
    // Click on selected point when expanded - collapse
    isCollapsed.value = true;
  } else {
    // Select new point and collapse
    selectedPointId.value = pointId;
    emit("pickup-point-selected", pointId);
    isCollapsed.value = true;
  }
};

// Handle outside click - collapse if point is selected
const handleOutsideClick = () => {
  if (selectedPointId.value && !isCollapsed.value) {
    isCollapsed.value = true;
  }
};

// Check if the current point is the last one (destination)
const isLastPoint = (index: number) => {
  return index === props.pickupPoints.length - 1;
};

// Find the index of the selected pickup point
const selectedPickupIndex = computed(() => {
  if (!selectedPointId.value) return -1;
  return props.pickupPoints.findIndex(
    (point) => point.id === selectedPointId.value
  );
});
</script>

<style lang="scss" scoped>
.pickup-point-selector {
  .pickup-point-item {
    flex-shrink: 0;
    border-color: #d2d7d2;
    background-color: #fefffe;
    margin-bottom: 3px;
    // overflow: hidden;
    min-height: 111px;
    transition: all 0.4s ease-out;
    position: relative;
    // z-index: 1;

    // Collapsed state
    &.collapsed {
      height: 0 !important;
      min-height: 0 !important;
      max-height: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
      border: none !important;
      opacity: 0;
    }

    &:not(.destination):hover {
      background-color: #f4f5f4 !important;
    }

    &.destination {
      cursor: default;
    }
  }

  .connector-line {
    width: 2px;
    height: 125px;
    left: 50%;
    top: 0px;
    transform: translateX(-50%);
    z-index: 5;
    transition: all 0.44s ease;
  }

  .departure-time {
    flex-shrink: 0;
    max-width: 90px;
    font-weight: 600; // Semi Bold
    color: #0c1026;
  }
  .location-name {
    font-weight: 600; // Semi Bold
    color: #0c1026;
  }

  .formal-name {
    font-weight: 400; // Regular
  }
}
.timeline-container {
  flex-shrink: 0;
  // flex-grow: 1;
  max-width: 75px;
}
</style>
