<template>
  <div class="row">
    <div class="col-md-8">
      <div class="text-start info-yellow-2-bg p-3">
        <MaxPax
          class="mb-3"
          :max-pax="tripInfo.max_pax"
          :passenger-goal="tripInfo.passenger_goal"
          :total-sold-tickets="totalSoldTickets"
          :trip-id="tripInfo.id"
          :update-history="tripInfo.update_history"
        />
        <PassengerGoal
          class="mb-3"
          :max-pax="tripInfo.max_pax"
          :passenger-goal="tripInfo.passenger_goal"
          :total-sold-tickets="totalSoldTickets"
          :trip-id="tripInfo.id"
          :update-history="tripInfo.update_history"
        />

        <PassengerGoalDeadline
          class="mb-3"
          :deadline-passenger-goal="
            removeZforISOString(tripInfo.deadline_passenger_goal)
          "
          :trip-departure-date="tripInfo.outbound_from_datetime"
          :trip-id="tripInfo.id"
          :update-history="tripInfo.update_history"
        />
      </div>
      <div
        class="text-start mt-2"
        v-if="tripInfo.trip_status === TRIP_STATUS.UNCONFIRMED && editingMode"
      >
        <BaseButton
          :button-text="t('sharebus.my_busses.cancel_sharebus')"
          @click="cancelShareBus"
          button-class="rounded-pill sb-btn-danger sb-btn-md "
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType, computed } from "vue";
import { Trip } from "@/store/trip/privateTrip/types";
import { useI18n } from "vue-i18n";
import { removeZforISOString, routePush } from "@/utils";
import MaxPax from "./MaxPax.vue";
import PassengerGoal from "./PassengerGoal.vue";
import {
  dismissToast,
  toastWithActionable,
} from "@/services/toast/toast.service";
import PassengerGoalDeadline from "./PassengerGoalDeadline.vue";
import BaseButton from "@busgroup/vue3-base-button";
import { TRIP_STATUS } from "@/components/modules/sharelead/trip/tripStatus/tripStatusEnum";
import { useSalesStore, useSharebusStore } from "@/store";
import DecisionDialog from "@/components/common/dialog/DecisionDialog.vue";

const props = defineProps({
  tripInfo: {
    type: Object as PropType<Trip>,
    required: true,
  },
});
const salesStore = useSalesStore();
const shareBusStore = useSharebusStore();
const editingMode = computed(() => salesStore.$state.editing_mode);

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
