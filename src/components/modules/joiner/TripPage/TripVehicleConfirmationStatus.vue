<template>
  <div class="row col-sm-12 col-md-12">
    <div class="col-md-6 col-sm-12">
      <div
        :class="`p-3 rounded ${
          remainingPassGoal ? 'bg-custom-yellow' : 'extended-light-green-bg'
        } mt-2`"
      >
        <div class="d-flex align-items-center">
          <span
            ><img
              class="p-1"
              v-show="remainingPassGoal"
              src="/img/warning.svg"
            />
            <i
              v-show="!remainingPassGoal"
              class="fi fi-check-circle-fill green-jewel"
            ></i>
          </span>
          <span class="ms-2 ship-gray">
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
      <p class="text-start mt-2">
        <span class="fs-1 fw-600">{{ totalSoldTickets }}</span>
        {{ t("common.of") }}
        {{ t("sharebus.joiner.trip_status.minimum") }}
        <span class="fs-1 fw-600">{{ tripInfo.passenger_goal }}</span>
        {{ t("sharebus.joiner.trip_status.ticket_booked") }}
      </p>
      <div class="list-breakdown pt-5" v-if="remainingPassGoal > 0">
        <ul>
          <li class="d-flex justify-content-between">
            <p class="text-start fw-bold">
              {{ t("sharebus.joiner.trip_status.when_enough_passenger") }}
            </p>
            <a @click="qnAState.join = !qnAState.join">
              <span
                v-if="!qnAState.join"
                class="bg-white rounded-circle border border-1 border-light"
                ><img class="p-1" src="/img/trip-info/down-arrow.svg"
              /></span>
              <span
                v-if="qnAState.join"
                class="extended-green-bg rounded-circle border border-1 border-light"
                ><img class="p-1" src="/img/trip-info/up-arrow.svg"
              /></span>
            </a>
          </li>
          <li v-if="qnAState.join">
            <p class="text-start">
              {{ t("sharebus.joiner.trip_status.when_enough_passenger_info") }}
            </p>
          </li>
          <hr />
        </ul>
        <ul>
          <li class="d-flex justify-content-between">
            <p class="text-start fw-bold">
              {{ t("sharebus.joiner.trip_status.not_enough_passengers_join") }}
            </p>
            <a @click="qnAState.not_join = !qnAState.not_join">
              <span
                v-if="!qnAState.not_join"
                class="bg-white rounded-circle border border-1 border-light"
                ><img class="p-1" src="/img/trip-info/down-arrow.svg"
              /></span>
              <span
                v-if="qnAState.not_join"
                class="extended-green-bg rounded-circle border border-1 border-light"
                ><img class="p-1" src="/img/trip-info/up-arrow.svg"
              /></span>
            </a>
          </li>
          <li v-if="qnAState.not_join">
            <p class="text-start">
              {{
                t(
                  "sharebus.joiner.trip_status.not_enough_passengers_join_info",
                  { deadline: deadline }
                )
              }}
            </p>
          </li>
          <hr />
        </ul>
        <ul>
          <li class="d-flex justify-content-between">
            <p class="text-start fw-bold">
              {{ t("sharebus.joiner.trip_status.cancellation_policy") }}
            </p>
            <a @click="qnAState.cancel_policy = !qnAState.cancel_policy">
              <span
                v-if="!qnAState.cancel_policy"
                class="bg-white rounded-circle border border-1 border-light"
                ><img class="p-1" src="/img/trip-info/down-arrow.svg"
              /></span>
              <span
                v-if="qnAState.cancel_policy"
                class="extended-green-bg rounded-circle border border-1 border-light"
                ><img class="p-1" src="/img/trip-info/up-arrow.svg"
              /></span>
            </a>
          </li>
          <li v-if="qnAState.cancel_policy" class="text-start">
            <p>
              {{
                t("sharebus.joiner.trip_status.cancellation_policy_info", {
                  passenger_goal: tripInfo.passenger_goal,
                })
              }}
              <span class="fw-bold">
                {{ t("sharebus.joiner.trip_status.or_if_not") }}
              </span>
            </p>
            <p class="mt-2">
              {{ deadline }}
              {{ t("sharebus.joiner.trip_status.at_the_latest") }}
            </p>
            <BaseButton
              v-if="isJoinerTicketsExist"
              button-class="sb-btn-lg sb-btn-danger rounded-pill fw-bold"
              :button-text="t('sharebus.joiner.trip_status.cancel_tickets')"
              @click="routePush('cancel-booking')"
            />
          </li>
        </ul>
      </div>
      <div v-else>
        <CencelNoLongerPossible
          :booking-reference="tripInfo.booking_reference"
        />
      </div>
    </div>
    <div class="col-md-6 col-sm-12">
      <BookingLink :trip-id="tripInfo.id" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { Trip } from "@/store/trip/privateTrip/types";
import BookingLink from "../../trip/BookingLink.vue";
import BaseButton from "@busgroup/vue3-base-button";
import CencelNoLongerPossible from "@/components/modules/trip/CancelationNotPossible.vue";
import { removeZforISOString, routePush, subtractDaysFromDate } from "@/utils";
import { computed, PropType, reactive } from "vue";
import { useI18n } from "vue-i18n";
import { locales } from "@/locales";
import { useConfigStore } from "@/store";
const { locale, t } = useI18n();

const props = defineProps({
  tripInfo: {
    type: Object as PropType<Trip>,
    required: true,
  },
});

const configStore = useConfigStore();

const deadline = computed(() => {
  const deadlineDay =
    configStore.getSharebusSetupConfig.PassengerGoalDeadlineDays;
  const removedZ = removeZforISOString(props.tripInfo.outbound_from_datetime);
  return subtractDaysFromDate(
    removedZ,
    deadlineDay,
    false,
    currentLocale.value
  );
});

const currentLocale = computed(() => locales[locale.value]);

const totalSoldTickets = computed(() => {
  const { max_pax, available_earlybird_tickets, available_regular_tickets } =
    props.tripInfo;

  return max_pax - (available_earlybird_tickets + available_regular_tickets);
});
const isJoinerTicketsExist = computed(() => {
  return (props.tripInfo.ticket?.length ?? 0) > 0;
});
const remainingPassGoal = computed(() => {
  if (totalSoldTickets.value >= props.tripInfo.passenger_goal) {
    return 0;
  }
  return props.tripInfo.passenger_goal - totalSoldTickets.value;
});
const qnAState = reactive({
  join: false,
  not_join: false,
  cancel_policy: false,
});
</script>
<style lang="scss">
.list-breakdown ul {
  li {
    max-width: 100%;
    list-style-type: none;
  }
  padding: 0.7rem 0.7rem 0rem 0.7rem;
}
</style>
