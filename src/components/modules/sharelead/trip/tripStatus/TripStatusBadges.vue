<template>
  <div>
    <BaseBadge
      :label="status.text"
      :badge-class="`rounded-pill mb-3 ship-gray fw-normal ${status.class}`"
    >
      <template v-slot:label v-if="useCustomSlot">
        <span>
          <p class="mb-0">
            <i class="me-1 fs-5" :class="status.icon"></i>{{ status.text }}
          </p>
        </span>
      </template>
    </BaseBadge>
  </div>
</template>

<script setup lang="ts">
import BaseBadge from "@/components/common/reusable/BaseBadge.vue";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { TRIP_STATUS } from "./tripStatusEnum";

const props = defineProps({
  tripStatus: {
    type: String,
    required: true,
  },
});

const { t } = useI18n();

const useCustomSlot = computed(() => {
  const tripStatus = props.tripStatus;
  return (
    tripStatus === TRIP_STATUS.FINISHED ||
    tripStatus === TRIP_STATUS.CANCELED_BY_ORGANIZER ||
    tripStatus === TRIP_STATUS.CANCELED_BY_FERDIA ||
    tripStatus === TRIP_STATUS.CANCELED_BY_SALES ||
    tripStatus === TRIP_STATUS.EXPIRED ||
    tripStatus === TRIP_STATUS.TERMINATED
  );
});

const status = computed(() => {
  switch (props.tripStatus) {
    case TRIP_STATUS.WAITING_TO_START:
      return {
        text: t("status.waiting_to_start"),
        class: "info-yellow-bg",
        icon: "",
      };
    case TRIP_STATUS.ONGOING:
      return {
        text: t("status.trip_ongoing"),
        class: "info-ongoing-bg",
        icon: "",
      };
    case TRIP_STATUS.FINISHED:
      return {
        text: t("status.finished"),
        class: "light-gray-bg",
        icon: "fi fi-check2",
      };
    case TRIP_STATUS.CANCELED_BY_ORGANIZER:
      return {
        text: t("status.cancelled"),
        class: "light-red-bg ",
        icon: "fi fi-x-circle-fill error-input-color",
      };
    case TRIP_STATUS.CANCELED_BY_FERDIA:
      return {
        text: t("status.cancelled"),
        class: "light-red-bg",
        icon: "fi fi-x-circle-fill error-input-color",
      };
    case TRIP_STATUS.CANCELED_BY_SALES:
      return {
        text: t("status.cancelled"),
        class: "light-red-bg",
        icon: "fi fi-x-circle-fill error-input-color",
      };
    case TRIP_STATUS.EXPIRED:
      return {
        text: t("status.expired"),
        class: "light-red-bg",
        icon: "fi fi-x-circle-fill error-input-color",
      };
    case TRIP_STATUS.TERMINATED:
      return {
        text: t("status.terminated"),
        class: "light-red-bg",
        icon: "fi fi-x-circle-fill error-input-color",
      };
    default:
      return {
        text: "",
        class: "",
      };
  }
});
</script>
