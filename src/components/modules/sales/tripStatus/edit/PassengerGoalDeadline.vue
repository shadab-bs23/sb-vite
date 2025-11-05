<template>
  <div>
    <TripTimer :deadline="passengerGoalDeadlineLast.toString()" />
    <InfoBanner
      :message="
        t('sales.pass_goal_deadline_time', {
          passGoalLastTime: passGoalDeadlineTime,
        })
      "
    />
    <div
      class="d-flex mt-2 deadline-edit"
      v-if="editingPassengerGoalDeadlineMode"
    >
      <DatePickerAdapter
        v-model="passengerGoalDeadlineVModel"
        type="datetime"
        format="DD.MM.YYYY HH:mm"
        :placeholder="t('sales.status.edit_passenger_goal_deadline')"
        :editable="true"
        :arrow-control="true"
        :minimum-date="minDate"
        :maximum-date="maxDate"
        :clearable="false"
      />
    </div>

    <div class="d-flex align-items-center flex-wrap mb-2">
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
        v-if="updateHistory"
        class="mt-2"
        :trip-id="tripId"
        :change-key="SalesEditGroup.TRIP_GOAL_DEADLINE"
        :update-history="updateHistory"
      />
    </div>
    <BaseSaveChanges
      v-if="editingPassengerGoalDeadlineMode"
      @saveChanges="changesAction"
    />
  </div>
</template>
<script lang="ts" setup>
import { useConfigStore, useSalesStore } from "@/store";
import BaseButton from "@busgroup/vue3-base-button";
import { computed, onMounted, PropType, ref, watch } from "vue";
import TripLastChangedInfo from "@/components/modules/sales/TripLastChangedInfo.vue";
import { useI18n } from "vue-i18n";
import TripTimer from "@/components/modules/sharelead/trip/tripStatus/TripTimer.vue";
import {
  UpdateHistory,
  TripLocationTime,
  TripGoalDeadline,
  SalesEditGroup,
} from "@/store/salesConsole/types";
import { isBefore } from "date-fns";
import { showToast } from "@/services/toast/toast.service";
import { SHAREBUS_CONFIG } from "@/services/graphql/enums/sharebus-config";
import DatePickerAdapter from "@/components/common/DatePickerAdapter.vue";
import { useCompanyTimeFormat } from "@/composables/useCompanyTimeFormat";
import { convertDateToISOString } from "@/utils";
import { SetupSharebusConfig, ScheduledConfig } from "@/store/config/types";

const salesStore = useSalesStore();
const config = useConfigStore();

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
const configuration = computed(() => config.getSharebusSetupConfig);
const passGoalDeadlineTime = computed(() => {
  const configValue = configuration.value as SetupSharebusConfig & ScheduledConfig;
  return configValue.PassengerGoalDeadlineTimeOfDay ?? '';
});
const formattedCompanyTime = useCompanyTimeFormat();
onMounted(() => {
  config.fetchSetupSharebusConfig(SHAREBUS_CONFIG.SCHEDULED_CONFIG);
});

const editPassengerGoalDeadline = () => {
  if (typeof salesHistory.value !== "undefined") {
    editingPassengerGoalDeadlineMode.value = true;
    return;
  }
  if (isBefore(new Date(props.tripDepartureDate), new Date())) {
    showToast(
      "error",
      "Departure date is past. Please update it from: Details > Edit itinerary, to enable editing passenger goal deadline."
    );
    return;
  }
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
  () => salesStore.$state.salesEditTrip[props.tripId]
);

const minDate = computed(() => {
  return formattedCompanyTime(new Date(), "dd-MM-yyyy HH:mm");
});

const maxDate = computed(() => {
  const getPlannedDepartureDate = () => {
    const onewayPoints = (
      salesHistory.value?.trip_location_time as TripLocationTime
    )?.route_points?.oneway;
    const plannedTime = onewayPoints?.[0]?.planned_departure_time;
    if (typeof plannedTime === "string") {
      return plannedTime.split(" ")[0];
    }
    return plannedTime?.toISOString().split("T")[0] || "";
  };
  console.log("props.tripDepartureDate ", props.tripDepartureDate);
  const departureCompanyDateStr = formattedCompanyTime(
    props.tripDepartureDate,
    "dd-MM-yyyy"
  );
  const departureDate = getPlannedDepartureDate() || departureCompanyDateStr;
  const deadlineTime = passGoalDeadlineTime.value;
  const maxDeadline = `${departureDate} ${deadlineTime}`;
  return formattedCompanyTime(maxDeadline, "dd-MM-yyyy HH:mm");
});

const passengerGoalDeadlineLast = computed({
  get: () => {
    const history = salesStore.$state.salesEditTrip[props.tripId];
    return history &&
      typeof (history.trip_deadline_passenger_goal as TripGoalDeadline)
        ?.deadline_passenger_goal !== "undefined"
      ? (history.trip_deadline_passenger_goal as TripGoalDeadline)
          ?.deadline_passenger_goal
      : props.deadlinePassengerGoal;
  },
  set: (value) => {
    salesStore.setSalesConsoleTripChangeRequest({
      trip_deadline_passenger_goal: {
        deadline_passenger_goal: value,
      },
      trip_id: props.tripId,
    });
  },
});

const passengerGoalDeadlineVModel = ref(passengerGoalDeadlineLast.value);

// set current date if passengerGoalDeadlineVModel is empty by watch
watch(
  () => passengerGoalDeadlineVModel.value,
  (newValue) => {
    if (!newValue) {
      const IsoDateStr = convertDateToISOString(new Date());
      passengerGoalDeadlineVModel.value =
        IsoDateStr || new Date().toISOString();
    }
  }
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
