<template>
  <div class="text-start">
    <div
      :class="`p-2 rounded ${
        isTicketsEqualRemainingPassGoal
          ? 'blue-malibu-rgba-bg'
          : 'warning-c6-bg'
      }`"
      v-if="remainingPassGoal"
    >
      <div v-if="tripInfo.trip_status === TRIP_STATUS.CONFIRMED">
        <div class="d-flex align-items-center w-90 mx-auto">
          <span class="ship-gray fw-600 w-75">
            {{ t("sharebus.joiner.booking.confirmed_bus") }}
          </span>
          <img src="/img/confirmed-bus.svg" />
        </div>
      </div>
      <div v-else-if="!isTicketsEqualRemainingPassGoal" class="p-2">
        <div class="d-flex">
          <span class="ship-gray fw-600 w-75">
            {{
              t("sharebus.joiner.booking.waiting_for_bookings", {
                count:
                  remainingPassGoal - ticketsCount > 0
                    ? remainingPassGoal - ticketsCount
                    : 0,
              })
            }}
          </span>
        </div>
        <div class="d-flex align-items-center justify-content-between">
          <TripTimerUpdated :deadline="passengerGoalDeadline" class="pt-4" />
          <img src="/img/trip-info/timer.svg" class="timer-img" />
        </div>
      </div>
      <span v-else>
        <div class="d-flex align-items-center w-90 mx-auto">
          <span class="ship-gray fw-600 w-75">
            {{
              t("sharebus.joiner.booking.if_you_book_selected_amount", {
                count:
                  remainingPassGoal - ticketsCount > 0
                    ? remainingPassGoal - ticketsCount
                    : 0,
              })
            }}
          </span>
          <img src="/img/will-confirmed-bus.svg" />
        </div>
      </span>
    </div>

    <div
      class="p-2 rounded extended-light-green-bg mt-3"
      v-else-if="!remainingPassGoal"
    >
      <div class="d-flex align-items-center w-90 mx-auto">
        <span class="ship-gray fw-600 w-75">
          {{ t("sharebus.joiner.booking.confirmed_bus") }}
        </span>
        <img src="/img/confirmed-bus.svg" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useConfigStore } from "@/store";
import { SetupSharebusConfig } from "@/store/config/types";
import { subtractDaysFromDate } from "@/utils";
import { computed, PropType } from "vue";
import { useI18n } from "vue-i18n";
import TripTimerUpdated from "./TripTimerUpdated.vue";
import { PublicTrip } from "@/store/trip/joiner/types";
import { TRIP_STATUS } from "./tripStatusEnum";
const props = defineProps({
  ticketsCount: {
    type: Number,
    required: true,
  },
  tripInfo: {
    type: Object as PropType<PublicTrip>,
    required: true,
  },
});
const { t } = useI18n();

const config = useConfigStore();

const setupConfig = computed<SetupSharebusConfig>(() => {
  return config.getSharebusSetupConfig;
});

const passengerGoalDeadline = computed(() => {
  if (props.tripInfo.deadline_passenger_goal) {
    return props.tripInfo.deadline_passenger_goal;
  }
  return subtractDaysFromDate(
    props.tripInfo.outbound_from_datetime,
    setupConfig.value.PassengerGoalDeadlineDays
  );
});

const remainingPassGoal = computed(() => {
  const currentTrip = props.tripInfo;
  const totalSoldTickets =
    currentTrip.total_earlybird_tickets +
    currentTrip.total_regular_tickets -
    (currentTrip.available_earlybird_tickets +
      currentTrip.available_regular_tickets);

  if (totalSoldTickets >= currentTrip.passenger_goal) {
    return 0;
  }
  return currentTrip.passenger_goal - totalSoldTickets;
});

const isTicketsEqualRemainingPassGoal = computed(
  () => props.ticketsCount >= remainingPassGoal.value
);
</script>

<style lang="scss" scoped>
.timer-img {
  width: 90px;
}
</style>
