<template>
  <div class="ship-gray">
    <p class="d-inline me-3">
      <i class="fi fi-stopwatch me-2"></i>
      <span class="fw-600" v-if="timer.months as number > 0"
        >{{ timer.months }} {{ t("common.months") }} &nbsp;
      </span>
      <span class="fw-600">{{ timer.days }}</span>
      {{ t("common.days") }} <span class="fw-600">{{ timer.hours }}</span>
      {{ t("common.hours") }} <span class="fw-600">{{ timer.minutes }}</span>
      {{ t("common.minutes") }}
      {{ t("common.remaining") }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useConfigStore } from "@/store";
import { SetupSharebusConfig } from "@/store/config/types";
import { convertDateToISOString, subtractDaysFromDate } from "@/utils";
import { intervalToDuration, isAfter } from "date-fns";
import { computed, onMounted, onUnmounted, ref, PropType } from "vue";
import { useI18n } from "vue-i18n";
import { PublicTrip } from "@/store/trip/joiner/types";

const props = defineProps({
  deadline: {
    type: String,
    required: false,
  },
  tripInfo: {
    type: Object as PropType<PublicTrip>,
    required: false,
  },
});

const { t } = useI18n();
const config = useConfigStore();

const setupConfig = computed<SetupSharebusConfig>(() => {
  return config.getSharebusSetupConfig;
});

const computedDeadline = computed(() => {
  if (props.deadline) {
    return props.deadline;
  }
  if (props.tripInfo?.deadline_passenger_goal) {
    return props.tripInfo.deadline_passenger_goal;
  }
  if (props.tripInfo?.outbound_from_datetime) {
    return subtractDaysFromDate(
      props.tripInfo.outbound_from_datetime,
      setupConfig.value.PassengerGoalDeadlineDays
    );
  }
  return null;
});

const interval = ref();
const setTimer = () => {
  const currentDeadline = computedDeadline.value;
  if (!currentDeadline) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      months: 0,
    };
  }

  const start = new Date();
  if (!currentDeadline) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      months: 0,
    };
  }
  const end = new Date(currentDeadline);
  if (isAfter(start, end)) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      months: 0,
    };
  }
  return intervalToDuration({
    start,
    end,
  });
};
const timer = ref(setTimer());

onMounted(() => {
  interval.value = setInterval(() => {
    timer.value = setTimer();
  }, 1000);
});
onUnmounted(() => {
  clearInterval(interval.value);
});
</script>
