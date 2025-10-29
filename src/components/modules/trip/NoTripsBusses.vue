<template>
  <div :class="isFilterActive && 'light-gray-bg text-center'">
    <h3 v-if="isFilterActive">
      {{ t("common.no_active_trips") }}
    </h3>
    <p v-else>
      {{ t("common.no_archived_trips") }}
    </p>
    <span v-if="isFilterActive">
      <img src="/img/no_trips_or_busses.svg" class="my-3" />
      <p>
        {{ description }}
      </p>
      <slot name="actionButton"> </slot>
    </span>
  </div>
</template>
<script setup lang="ts">
import { TRIP_FILTER } from "../sharelead/trip/tripStatus/tripStatusEnum";
import { useI18n } from "vue-i18n";
import { computed } from "vue";
const props = defineProps({
  description: {
    type: String,
    default: "",
  },

  tripFilterType: {
    type: Number,
    default: TRIP_FILTER.ACTIVE,
  },
});

const { t } = useI18n();

const isFilterActive = computed(
  () => props.tripFilterType === TRIP_FILTER.ACTIVE
);
</script>
