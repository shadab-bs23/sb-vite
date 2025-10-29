<template>
  <div class="info-yellow-bg mt-5 mb-3 d-flex p-3">
    <span class="me-2">
      <i class="fi fi-exclamation-circle-fill orange-buttercup"></i>
    </span>
    <ul class="text-start mb-0">
      <li>{{ t("sharebus.public_bus") }}</li>
      <li>
        <i18n-t keypath="sharebus.at_least" tag="p">
          <template v-slot:passenger_goal>
            <strong>
              {{ passengerGoal }} {{ t("sharebus.passengers") }}
            </strong>

            {{ passengerGoalDeadline }}
          </template>
        </i18n-t>
      </li>
      <li class="mb-0">
        <i18n-t keypath="sharebus.cancel_bus_until" tag="p">
          <template v-slot:passenger_goal>
            <strong> {{ passengerGoal }} {{ t("sharebus.passengers") }}</strong>
          </template>
        </i18n-t>
      </li>
    </ul>
  </div>
</template>
<script lang="ts" setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();

defineProps({
  passengerGoal: {
    type: Number,
    required: true,
  },
  passengerGoalDeadline: {
    type: String,
    required: true,
  },
});
</script>
