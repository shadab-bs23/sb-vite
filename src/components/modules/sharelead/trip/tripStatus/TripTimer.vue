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
    <p class="d-inline">
      <span class="fw-600 me-2">{{ t("common.deadline") }}</span>
      {{ formatDateUsingDateFns(deadline) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { formatDateUsingDateFns, removeZforISOString } from "@/utils";
import { intervalToDuration, isAfter } from "date-fns";
import { onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps({
  deadline: {
    type: String,
    required: true,
  },
});

const { t } = useI18n();
const interval = ref();
const setTimer = () => {
  const start = new Date();
  const end = new Date(removeZforISOString(props.deadline));
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
