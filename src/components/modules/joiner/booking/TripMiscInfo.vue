<template>
  <ul
    class="list-unstyled mt-2 rounded"
    :class="qnAState.how_works && 'green-jewel-border'"
  >
    <li
      class="d-flex justify-content-between sb-dropdown cursor-pointer rounded mw-100 py-2 ps-24px pe-16px light-mid-gray-border border-top-0 border-start-0 border-end-0 mb-0"
      :class="qnAState.how_works && 'border-0 extended-light-green-bg'"
      @click="qnAState.how_works = !qnAState.how_works"
    >
      <p class="text-start fw-normal mb-0">
        {{ t("common.how_does_it_work") }}
      </p>
      <a>
        <div
          v-if="!qnAState.how_works"
          class="bg-white rounded-circle light-mid-gray-border"
        >
          <i class="fi fi-chevron-down px-1 text-stroke-2"></i>
        </div>
        <div
          v-if="qnAState.how_works"
          class="extended-green-bg rounded-circle green-jewel-border"
        >
          <i class="fi fi-chevron-up px-1 text-stroke-2"></i>
        </div>
      </a>
    </li>
    <li v-if="qnAState.how_works" class="text-start ps-24px pe-16px mw-100">
      <p class="mt-16px mb-16px">
        {{ t("sharebus.joiner.booking.when_trip_gets_enough_booking") }}
      </p>
      <p v-if="!isTicketsEqualRemainingPassGoal">
        {{ t("sharebus.joiner.booking.when_trip_not_gets_enough_booking") }}
      </p>
      <hr v-if="!isTicketsEqualRemainingPassGoal" class="mt-16px mb-16px" />
      <div v-if="!isTicketsEqualRemainingPassGoal">
        <div class="mb-16px">
          <p class="fw-600">
            {{ t("sharebus.joiner.booking.booking_deadline") }}
          </p>
          <p>
            {{
              getReadableDateFormat(passengerGoalDeadline, currentLocale, {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            }}
          </p>
        </div>
        <div class="mb-16px">
          <p class="fw-600">
            {{ t("sharebus.joiner.booking.will_get_money_back") }}
          </p>
          <p>
            {{ t("sharebus.joiner.booking.yes_money_back") }}
          </p>
        </div>
      </div>
      <div class="mb-24px">
        <p class="fw-600">
          {{ t("sharebus.joiner.booking.can_i_cancel_booking") }}
        </p>
        <p v-if="!isTicketsEqualRemainingPassGoal" class="mb-0">
          {{ t("sharebus.joiner.booking.cancellation_is_possible") }}
        </p>
        <p v-else class="mb-0">
          {{ t("sharebus.joiner.booking.trip_will_be_confirmed") }}
          <strong>{{
            t("sharebus.joiner.booking.can_not_be_cancelled")
          }}</strong
          >.
        </p>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { Trip } from "@/store/trip/privateTrip/types";
import { reactive, PropType, computed } from "vue";
import { useI18n } from "vue-i18n";
import { getReadableDateFormat, subtractDaysFromDate } from "@/utils";
import { SetupSharebusConfig } from "@/store/config/types";
import { useConfigStore } from "@/store";
import { locales } from "@/locales";

const props = defineProps({
  ticketsCount: {
    type: Number,
    required: true,
  },
  tripInfo: {
    type: Object as PropType<Trip>,
    required: true,
  },
});

const { locale, t } = useI18n();

const currentLocale = computed(() => locales[locale.value]);

const qnAState = reactive({
  how_works: false,
});

const config = useConfigStore();
const setupConfig = computed<SetupSharebusConfig>(() => {
  return config.getSharebusSetupConfig;
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

const passengerGoalDeadline = computed(() => {
  if (props.tripInfo.deadline_passenger_goal) {
    return props.tripInfo.deadline_passenger_goal;
  }
  return subtractDaysFromDate(
    props.tripInfo.outbound_from_datetime,
    setupConfig.value.PassengerGoalDeadlineDays
  );
});
</script>
