<template>
  <div class="row">
    <div class="col-md-7">
      <div class="text-start">
        <p>
          <span class="fs-1 fw-600">{{ totalSoldTickets }}</span>
          {{ t("common.of") }}
          <span class="fs-1 fw-600">{{ tripInfo.max_pax }}</span>
          {{ t("sharebus.trip_page.possible_tickets_sold") }}
        </p>
        <div
          :class="`p-2 rounded ${
            remainingPassGoal ? 'bg-custom-yellow' : 'extended-light-green-bg'
          } mt-2`"
        >
          <div class="d-flex">
            <span
              ><img v-show="remainingPassGoal" src="/img/warning.svg" />
              <i
                v-show="!remainingPassGoal"
                class="fi fi-check-circle-fill green-jewel"
              ></i>
            </span>
            <span class="ms-3 ship-gray">
              <span class="fw-600">{{
                remainingPassGoal
                  ? t("status.unconfirmed")
                  : t("status.passenger_goal_reached")
              }}</span
              >.
              {{
                remainingPassGoal
                  ? t("sharebus.trip_page.waiting_for_passengers", {
                      count: remainingPassGoal,
                    })
                  : t("sharebus.bus_will_go_as_plan")
              }}
            </span>
          </div>
        </div>
        <div
          :class="`ps-4 py-4 ${
            remainingPassGoal
              ? 'info-yellow-2-bg'
              : 'extended-light-green-bg-rgba'
          } mb-3`"
        >
          <p class="ship-gray fw-600">
            {{ t("sharebus.passenger_goal") }}
            <img src="/img/trip-info/target.svg" />
            {{ tripInfo.passenger_goal }}
          </p>
          <TripTimer v-show="remainingPassGoal" :deadline="deadline" />
        </div>
        <TripCancellationInfo
          :tripStatus="tripInfo.trip_status"
          :cancellable="!!remainingPassGoal"
          :trip-id="tripInfo.id"
        />
      </div>
    </div>
    <div class="col-md-5 col-sm-12">
      <BookingLInk :trip-id="tripInfo.id" />
    </div>
  </div>
</template>

<script setup lang="ts">
import TripTimer from "./TripTimer.vue";
import BookingLInk from "@/components/modules/trip/BookingLink.vue";
import TripCancellationInfo from "./TripCancellationInfo.vue";
import { computed, PropType } from "vue";
import { Trip } from "@/store/trip/privateTrip/types";
import { useI18n } from "vue-i18n";
import { removeZforISOString, subtractDaysFromDate } from "@/utils";
import { useConfigStore } from "@/store";

const props = defineProps({
  tripInfo: {
    type: Object as PropType<Trip>,
    required: true,
  },
});

const configStore = useConfigStore();

const deadline = computed(() => {
  if (props.tripInfo.deadline_passenger_goal) {
    return props.tripInfo.deadline_passenger_goal;
  }
  const deadlineDay =
    configStore.getSharebusSetupConfig.PassengerGoalDeadlineDays;
  const removedZ = removeZforISOString(props.tripInfo.outbound_from_datetime);
  return subtractDaysFromDate(removedZ, deadlineDay, true);
});

const { t } = useI18n();

const totalSoldTickets = computed(() => {
  const { max_pax, available_earlybird_tickets, available_regular_tickets } =
    props.tripInfo;

  return max_pax - (available_earlybird_tickets + available_regular_tickets);
});

const remainingPassGoal = computed(() => {
  if (totalSoldTickets.value >= props.tripInfo.passenger_goal) {
    return 0;
  }
  return props.tripInfo.passenger_goal - totalSoldTickets.value;
});
</script>
