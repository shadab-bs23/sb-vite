<template>
  <div class="ship-gray">
    <p class="d-flex me-3">
      <span
        class="d-flex flex-column align-items-center"
        v-if="timer.months as number > 0"
      >
        <span class="fw-600 warning-c7-bg px-1 rounded fs-26">{{
          setLeadingZero(timer.months as number)
        }}</span>
        <span>{{ t("common.months") }}</span>
      </span>

      <span class="d-flex flex-column align-items-center ms-2">
        <span class="fw-600 warning-c7-bg px-1 rounded fs-26">{{
          setLeadingZero(timer.days as number)
        }}</span>
        <span>{{ t("common.days") }}</span>
      </span>

      <span class="d-flex flex-column align-items-center ms-2">
        <span class="fw-600 warning-c7-bg px-1 rounded fs-26">{{
          setLeadingZero(timer.hours as number)
        }}</span>
        <span>{{ t("common.hours") }}</span>
      </span>

      <span class="d-flex flex-column align-items-center ms-2">
        <span class="fw-600 warning-c7-bg px-1 rounded fs-26">{{
          setLeadingZero(timer.minutes as number)
        }}</span>
        <span>{{ t("common.minutes") }}</span>
      </span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { removeZforISOString, setLeadingZero } from "@/utils";
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
