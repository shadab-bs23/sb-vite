<template>
  <div>
    <TripTimer :deadline="passengerGoalDeadlineLast.toString()" />
    <div
      class="d-flex mt-2 deadline-edit"
      v-if="editingPassengerGoalDeadlineMode"
    >
      <Calendar
        v-model="passengerGoalDeadlineVModel"
        date-format="dd.mm.yy"
        component-class="w-25"
        :min-date="minimumDays"
        :showTime="true"
        :showSeconds="true"
      />
    </div>

    <div class="d-flex align-items-center flex-wrap">
      <BaseButton
        v-if="!editingPassengerGoalDeadlineMode && editingMode"
        class="sb-btn-primary-alt sb-btn-md my-3 me-2"
        @click="editPassengerGoalDeadline"
      >
        <span class="me-2">{{
          t("sales.status.edit_passenger_goal_deadline")
        }}</span>
        <span><img src="/img/icons/edit.svg" /></span>
      </BaseButton>
      <TripLastChangedInfo
        class="mt-2"
        v-if="showUpdateHistory"
        :dateString="updateHistoryDateString"
        :status="
          typeof salesHistory !== 'undefined' &&
          salesHistory.update_history.trip_deadline_passenger_goal
            ? t('common.not_published')
            : t('common.published')
        "
        :published-by="publishedBy"
      />
    </div>
    <BaseSaveChanges
      v-if="editingPassengerGoalDeadlineMode"
      @saveChanges="changesAction"
      class="col-md-10 col-lg-10 col-xl -6 col-sm-12 my-3 col-xxl-4"
    />
  </div>
</template>
<script lang="ts" setup>
import { useSalesStore, useUserStore } from "@/store";
import BaseButton from "@busgroup/vue3-base-button";
import { computed, PropType, ref, watch } from "vue";
import TripLastChangedInfo from "@/components/modules/sales/TripLastChangedInfo.vue";
import { useI18n } from "vue-i18n";
import Calendar from "primevue/calendar";
import TripTimer from "@/components/modules/sharelead/trip/tripStatus/TripTimer.vue";
import { UpdateHistory } from "@/store/salesConsole/types";
import { removeZforISOString } from "@/utils";

const salesStore = useSalesStore();
const props = defineProps({
  deadlinePassengerGoal: {
    type: String,
    required: true,
  },
  tripId: {
    type: String,
    required: true,
  },
  tripDepartureDate: {
    type: String,
    required: true,
  },
  updateHistory: {
    type: [Object, null] as PropType<UpdateHistory | null>,
    required: true,
  },
});
const { t } = useI18n();
const editingPassengerGoalDeadlineMode = ref(false);
const editPassengerGoalDeadline = () => {
  editingPassengerGoalDeadlineMode.value = true;
};
const editingMode = computed(() => salesStore.$state.editing_mode);

watch(
  () => editingMode.value,
  (newValue) => {
    if (!newValue) {
      editingPassengerGoalDeadlineMode.value = false;
    }
  }
);
const salesHistory = computed(
  () => salesStore.getSalesConsoleTrip()[props.tripId]
);

const publishedBy = computed(() => {
  if (typeof salesHistory.value === "undefined") {
    if (typeof props.updateHistory?.updated_by_ferdia_sales === "string") {
      return "";
    } else {
      return props.updateHistory?.updated_by_ferdia_sales.name;
    }
  }
  return useUserStore().data.attributes.name;
});

const showUpdateHistory = computed(() => {
  if (!editingPassengerGoalDeadlineMode.value && editingMode.value) {
    if (
      (salesHistory.value &&
        salesHistory.value.update_history.trip_deadline_passenger_goal) ||
      (props.updateHistory && props.updateHistory.trip_deadline_passenger_goal)
    ) {
      return true;
    }
  }
  return false;
});
const minimumDays = computed(() => {
  return new Date();
});

const updateHistoryDateString = computed(() => {
  if (
    typeof salesHistory.value !== "undefined" &&
    salesHistory.value.update_history.trip_deadline_passenger_goal
  ) {
    return salesHistory.value.update_history.trip_deadline_passenger_goal;
  } else if (
    props.updateHistory &&
    props.updateHistory.trip_deadline_passenger_goal
  ) {
    return props.updateHistory.trip_deadline_passenger_goal;
  }
  return "";
});

const passengerGoalDeadlineLast = computed({
  get: () => {
    const history = salesStore.getSalesConsoleTrip()[props.tripId];
    return history &&
      typeof history.trip_deadline_passenger_goal?.deadline_passenger_goal !==
        "undefined"
      ? new Date(
          removeZforISOString(
            history.trip_deadline_passenger_goal?.deadline_passenger_goal
          )
        )
      : new Date(props.deadlinePassengerGoal);
  },
  set: (value) => {
    const setObj = {
      [props.tripId]: {
        trip_deadline_passenger_goal: {
          deadline_passenger_goal: value,
        },
        update_history: {
          trip_deadline_passenger_goal: new Date(),
        },
      },
    };
    salesStore.setSalesConsoleTripChangeRequest(setObj);
  },
});

const passengerGoalDeadlineVModel = ref(
  new Date(passengerGoalDeadlineLast.value)
);

watch(
  () => passengerGoalDeadlineLast.value,
  (newValue) => {
    passengerGoalDeadlineVModel.value = newValue;
  }
);
const changesAction = (value: boolean) => {
  if (value) {
    passengerGoalDeadlineLast.value = passengerGoalDeadlineVModel.value;
  }
  editingPassengerGoalDeadlineMode.value = false;
};
</script>
