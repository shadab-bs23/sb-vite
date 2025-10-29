<template>
  <div class="passenger-goal-text">
    <span class="h1 fw-bold me-1">{{ soldTickets }}</span>
    <span class="text-normal me-1">{{ t("common.of") }}</span>
    <span class="h1 fw-bold me-1">{{ tripInfo.max_pax }}</span>
    <span class="text-normal">{{
      t("sharebus.trip_page.possible_tickets_sold")
    }}</span>
  </div>
  <template v-if="isConfirmed">
    <PrimaryBanner
      :header="t('status.passenger_goal_reached')"
      :message="t('sharebus.bus_will_go_as_plan')"
    />
  </template>
</template>

<script lang="ts" setup>
import { PropType } from "vue";
import { Trip } from "@/store/trip/privateTrip/types";
import { useI18n } from "vue-i18n";
// import PrimaryBanner from "@/components/common/info/PrimaryBanner.vue";

const { t } = useI18n();

defineProps({
  tripInfo: {
    type: Object as PropType<Trip>,
    required: true,
  },
  soldTickets: {
    type: Number,
    required: true,
  },
  isConfirmed: {
    type: Boolean,
    required: true,
  },
});
</script>

<style scoped></style>
