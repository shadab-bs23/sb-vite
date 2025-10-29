<template>
  <div>
    <p>
      <span class="fs-1 fw-600">{{ totalSoldTickets }}</span>
      {{ t("common.of") }}
      <span class="fs-1 fw-600">{{ maxPax }}</span>
      {{ t("sharebus.trip_page.possible_tickets_sold") }}
    </p>
    <div
      :class="`p-2 rounded ${
        remainingPassGoal ? 'bg-custom-yellow' : 'extended-light-green-bg'
      } mt-2`"
      class="mb-3"
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
    <div class="d-flex mb-1">
      <span class="mw-100"> <img src="/img/trip-info/target.svg" /></span>
      <span class="mw-100 ms-2" v-if="!editingPassengerGoalMode">
        {{ passengerGoalLast }}
      </span>
      <BaseInput
        v-else
        @keyup="checkGoal"
        @keydown="keyCheck"
        type="number"
        input-group-class="input-group-sm w-25 ms-2"
        v-model="passengerGoalVModel"
        :modifier-class="`${invalidPassGoalErr ? 'is-invalid' : ''}`"
        :feedback="invalidPassGoalErr && invalidPassGoalErr"
        feedback-class="text-nowrap"
      />
    </div>

    <div class="d-flex align-items-center flex-wrap">
      <BaseButton
        v-if="!editingPassengerGoalMode && editingMode"
        class="sb-btn-primary-alt sb-btn-md my-3 me-2"
        :is-disabled="!remainingPassGoal"
        @click="editPassengerGoal"
      >
        <span class="me-2">{{ t("sales.status.edit_passenger_goal") }}</span>
        <span><img src="/img/icons/edit.svg" /></span>
      </BaseButton>
      <TripLastChangedInfo
        class="mt-2"
        v-if="showUpdateHistory"
        :dateString="updateHistoryDateString"
        :status="
          typeof salesHistory !== 'undefined' &&
          salesHistory.update_history.trip_goal
            ? t('common.not_published')
            : t('common.published')
        "
        :published-by="publishedBy"
      />
    </div>
    <BaseSaveChanges
      v-if="editingPassengerGoalMode"
      @saveChanges="changesAction"
      class="col-md-10 col-lg-10 col-xl -6 col-sm-12 my-3 col-xxl-4"
    />
  </div>
</template>
<script lang="ts" setup>
import { useSalesStore, useUserStore } from "@/store";
import BaseButton from "@busgroup/vue3-base-button";
import BaseInput from "@busgroup/vue3-base-input";
import { computed, PropType, ref, watch } from "vue";
import TripLastChangedInfo from "@/components/modules/sales/TripLastChangedInfo.vue";
import { UpdateHistory } from "@/store/salesConsole/types";
import { useI18n } from "vue-i18n";
const salesStore = useSalesStore();
const props = defineProps({
  totalSoldTickets: {
    type: Number,
    required: true,
  },
  maxPax: {
    type: Number,
    required: true,
  },
  passengerGoal: {
    type: Number,
    required: true,
  },
  tripId: {
    type: String,
    required: true,
  },
  updateHistory: {
    type: [Object, null] as PropType<UpdateHistory | null>,
    required: true,
  },
});

const editingMode = computed(() => salesStore.$state.editing_mode);

const { t } = useI18n();
const invalidPassGoalErr = ref("");
const editingPassengerGoalMode = ref(false);
const editPassengerGoal = () => {
  editingPassengerGoalMode.value = true;
};
const salesHistory = computed(
  () => salesStore.getSalesConsoleTrip()[props.tripId]
);

const publishedBy = computed(() => {
  if (typeof salesHistory.value === "undefined") {
    if (typeof props.updateHistory.updated_by_ferdia_sales === "string") {
      return "";
    } else {
      return props.updateHistory.updated_by_ferdia_sales.name;
    }
  }
  return useUserStore().data.attributes.name;
});

const showUpdateHistory = computed(() => {
  if (!editingPassengerGoalMode.value && editingMode.value) {
    if (salesHistory.value && salesHistory.value.update_history.trip_goal)
      return true;
    else if (props.updateHistory && props.updateHistory.trip_goal) return true;
  }
  return false;
});

const updateHistoryDateString = computed(() => {
  if (
    typeof salesHistory.value !== "undefined" &&
    salesHistory.value.update_history.trip_goal
  ) {
    return salesHistory.value.update_history.trip_goal;
  } else if (props.updateHistory && props.updateHistory.trip_goal) {
    return props.updateHistory.trip_goal;
  }
  return "";
});

const passengerGoalLast = computed({
  get: () => {
    const history = salesStore.getSalesConsoleTrip()[props.tripId];
    return history && typeof history.trip_goal?.passenger_goal !== "undefined"
      ? history.trip_goal?.passenger_goal
      : props.passengerGoal;
  },
  set: (value) => {
    const setObj = {
      [props.tripId]: {
        trip_goal: {
          passenger_goal: value && value >= 0 ? value : 0,
        },
        update_history: {
          trip_goal: new Date(),
        },
      },
    };
    salesStore.setSalesConsoleTripChangeRequest(setObj);
  },
});
const passengerGoalVModel = ref(passengerGoalLast.value);
const remainingPassGoal = computed(() => {
  if (props.totalSoldTickets >= props.passengerGoal) {
    return 0;
  }
  return props.passengerGoal - props.totalSoldTickets;
});

watch(
  () => editingMode.value,
  (newValue) => {
    if (!newValue) {
      editingPassengerGoalMode.value = false;
    }
  }
);
const changesAction = (value: boolean) => {
  checkGoal();
  if (value) {
    if (invalidPassGoalErr.value.length) return;
    passengerGoalLast.value = passengerGoalVModel.value;
  } else {
    passengerGoalVModel.value = passengerGoalLast.value;
  }
  editingPassengerGoalMode.value = false;
};
const keyCheck = (e) => {
  if (e.key == ".") e.preventDefault();
};
const checkGoal = () => {
  if (
    props.totalSoldTickets > 0 &&
    passengerGoalVModel.value < props.totalSoldTickets
  ) {
    invalidPassGoalErr.value = t("sales.pass_goal_cant_less_sold_tickets", {
      count: props.totalSoldTickets,
    });
  } else if (passengerGoalVModel.value < 0) {
    invalidPassGoalErr.value = t("sales.pass_goal_cant_less_zero");
  } else if (passengerGoalVModel.value > props.maxPax) {
    invalidPassGoalErr.value = t("sales.pass_goal_cant_great_max_pax", {
      count: props.maxPax,
    });
  } else invalidPassGoalErr.value = "";
};
</script>
