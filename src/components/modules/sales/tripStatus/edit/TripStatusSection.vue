<template>
  <div class="row">
    <div class="col-12 col-xl-6">
      <TripStatusBanner :status-banner-data="statusBannerData" />
    </div>
    <div class="col-12 col-xl-6">
      <div class="text-start info-yellow-2-bg p-3 mb-2">
        <PassengerGoalReach
          class="mb-2"
          :trip-info="tripInfo"
          :sold-tickets="soldTickets"
          :is-confirmed="tripInfo.trip_status === TRIP_STATUS.CONFIRMED"
        />
        <template v-if="tripInfo.trip_status === TRIP_STATUS.UNCONFIRMED">
          <PassengerGoalDeadline
            class="mb-3"
            :deadline-passenger-goal="tripInfo.deadline_passenger_goal"
            :trip-departure-date="plannedDepartureTime"
            :trip-id="tripInfo.id"
            :update-history="tripInfo.update_history"
          />
        </template>
      </div>

      <ReminderInfo :trip="tripInfo" :config="configuration" />
      <div
        class="text-start mt-2"
        v-if="tripInfo.trip_status === TRIP_STATUS.UNCONFIRMED && editingMode"
      >
        <BaseButton
          :button-text="t('sharebus.my_buses.cancel_sharebus')"
          @click="cancelShareBus"
          button-class="rounded-pill sb-btn-danger sb-btn-md "
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
// Safely parse planned departure time from route_points
const plannedDepartureTime = computed(() => {
  try {
    return JSON.parse(props.tripInfo.route_points).oneway[0]
      ?.planned_departure_time;
  } catch {
    return null;
  }
});
import { Trip } from "@/store/trip/privateTrip/types";
import { useI18n } from "vue-i18n";
import { routePush } from "@/utils";

// Only pass the required info as an object
const statusBannerData = computed(() => ({
  status: props.tripInfo.trip_status,
  passengerGoal: props.tripInfo.passenger_goal,
  maxPax: props.tripInfo.max_pax,
  soldTickets: totalSoldTickets.value,
  deadline: props.tripInfo.deadline_passenger_goal,
}));
import {
  dismissToast,
  toastWithActionable,
} from "@/services/toast/toast.service";
import PassengerGoalDeadline from "./PassengerGoalDeadline.vue";
import PassengerGoalReach from "./PassengerGoalReach.vue";
import BaseButton from "@busgroup/vue3-base-button";
import { TRIP_STATUS } from "@/components/modules/sharelead/trip/tripStatus/tripStatusEnum";
import { useSalesStore, useSharebusStore, useConfigStore } from "@/store";
import { SetupSharebusConfig, ScheduledConfig } from "@/store/config/types";
import DecisionDialog from "@/components/common/dialog/DecisionDialog.vue";
import ReminderInfo from "../../ReminderInfo.vue";
import TripStatusBanner from "@/components/common/info/TripStatusBanner.vue";

const props = defineProps({
  tripInfo: {
    type: Object as PropType<Trip>,
    required: true,
  },
  soldTickets: {
    type: Number,
    required: true,
  },
});
const salesStore = useSalesStore();
const shareBusStore = useSharebusStore();
const config = useConfigStore();
const editingMode = computed(() => salesStore.$state.editing_mode);
const configuration = computed(() => {
  const configValue = config.getSharebusSetupConfig as SetupSharebusConfig & ScheduledConfig;
  return configValue;
});

const { t } = useI18n();
const totalSoldTickets = computed(() => {
  const { max_pax, available_earlybird_tickets, available_regular_tickets } =
    props.tripInfo;

  return max_pax - (available_earlybird_tickets + available_regular_tickets);
});

const tripCancelAction = () => {
  const type = TRIP_STATUS.CANCELED_BY_SALES;

  shareBusStore
    .cancelSharebus(props.tripInfo.id, type)
    .then(() => {
      dismissToast("component-toast");
      routePush("sales-buses");
    })
    .catch(() => {
      dismissToast("component-toast");
    });
};

const cancelShareBus = () => {
  const content = {
    // Your component or JSX template
    component: DecisionDialog,
    // Props are just regular props, but these won't be reactive
    props: {
      message: t("sharebus.trip_page.do_cancel_trip"),
      buttonText: t("button.confirm"),
      callback: tripCancelAction,
    },
  };
  toastWithActionable(content);
};
</script>
