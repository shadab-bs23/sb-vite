<!-- PassengerGoalNotice.vue -->
<template>
  <div
    class="yellow-notice p-4 text-center mt-4 mt-lg-0"
    style="background-color: #fff9e5; border-radius: 4px"
  >
    <p class="mb-2 fw-bold">
      {{ t("setup.bus_will_need", { count: passengerGoal }) }}
    </p>
    <p class="mb-3 fw-bold" v-if="deadlineDate">
      {{ t("setup.by_date", { date: formattedDeadlineDate }) }}
    </p>
    <img
      src="@/assets/img/waiting_ills.svg"
      :alt="t('setup.bus_illustration_alt')"
      style="height: 80px"
    />
  </div>
</template>

<script setup lang="ts">
import { useCompanyTimeFormat } from "@/composables/useCompanyTimeFormat";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps({
  passengerGoal: {
    type: Number,
    required: true,
  },
  deadlineDate: {
    type: Date,
    required: false,
    default: null,
  },
});

const { t } = useI18n();
const formatInCompanyTimezone = useCompanyTimeFormat();

// Format the deadline date in a user-friendly format
const formattedDeadlineDate = computed(() => {
  if (!props.deadlineDate) return "";

  try {
    return formatInCompanyTimezone(props.deadlineDate, "MMMM do, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
});
</script>

<style lang="scss" scoped>
.yellow-notice {
  background-color: #fff9e5;
  border-radius: 4px;
  transition: all 0.3s ease;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .yellow-notice {
    padding: 15px !important;
  }

  .yellow-notice img {
    height: 60px !important;
  }
}
</style>
