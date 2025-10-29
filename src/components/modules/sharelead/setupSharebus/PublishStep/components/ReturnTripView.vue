<template>
  <div class="mt-3 ms-1" v-if="props.returnRoutePoints.length > 0">
    <!-- Table header with back arrow icon and date -->
    <div class="d-flex align-items-center mb-3">
      <i class="fi fi-arrow-left text-primary me-2 ms-1"></i>
      <span class="fw-bold"
        >{{ t("sharebus.return") }}: {{ returnDateFormatted }}</span
      >
    </div>

    <table class="table w-100">
      <tbody>
        <tr
          v-for="(point, index) in props.returnRoutePoints"
          :key="`return-${index}`"
        >
          <td class="py-3 px-2">
            <TimelineComponent
              :point="point"
              :show-connector-line="index < props.returnRoutePoints.length - 1"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import TimelineComponent from "@/components/common/TimelineComponent.vue";
import { useCompanyTimeFormat } from "@/composables/useCompanyTimeFormat";
import { TViaPoints } from "../../../../../ViaPointsPackage/types/types";

const props = defineProps({
  returnRoutePoints: {
    type: Array as () => TViaPoints[],
    default: () => [],
  },
});
const { t } = useI18n();
const formatInCompanyTimezone = useCompanyTimeFormat();

// Get return departure date formatted
const returnDateFormatted = computed(() => {
  if (props.returnRoutePoints.length === 0) return "";
  const departureTime = props.returnRoutePoints[0]?.planned_departure_time;
  if (!departureTime) return "";
  return formatInCompanyTimezone(departureTime, "EEEE, dd.MM.yyyy");
});
</script>

<style scoped>
.table tr:last-child td {
  border-bottom: none !important;
}
</style>
