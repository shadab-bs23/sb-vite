<template>
  <div>
    <div class="d-flex mb-1 align-items-center">
      <span class="mw-100"> <i class="fi fi-people-fill fs-2"></i></span>
      <span class="mw-100 ms-2" v-if="!editingMaxPaxMode">
        {{ maxPaxLast }}
      </span>
      <BaseInput
        v-else
        @keyup="checkGoal"
        @keydown="keyCheck"
        type="number"
        input-group-class="input-group-sm w-25 ms-2"
        v-model="maxPaxVModel"
        :modifier-class="`${invalidPaxErr ? 'is-invalid' : ''}`"
        :feedback="invalidPaxErr && invalidPaxErr"
        feedback-class="text-nowrap"
      />
    </div>

    <div class="d-flex align-items-center flex-wrap">
      <BaseButton
        v-if="!editingMaxPaxMode && editingMode"
        class="sb-btn-primary-alt sb-btn-md my-3 me-2"
        @click="editMaxpax"
      >
        <span class="me-2">{{ t("sales.status.edit_max_pax") }}</span>
        <span><img src="/img/icons/edit.svg" /></span>
      </BaseButton>
      <TripLastChangedInfo
        class="mt-2"
        v-if="showUpdateHistory"
        :trip-id="tripId"
        :change-key="SalesEditGroup.MAX_PAX"
        :update-history="updateHistory"
      />
    </div>
    <BaseSaveChanges
      v-if="editingMaxPaxMode"
      @saveChanges="changesAction"
      class="col-md-10 col-lg-10 col-xl -6 col-sm-12 my-3 col-xxl-4"
    />
  </div>
</template>
<script lang="ts" setup>
import { useConfigStore, useSalesStore, useUserStore } from "@/store";
import BaseButton from "@busgroup/vue3-base-button";
import BaseInput from "@busgroup/vue3-base-input";
import { computed, PropType, ref, watch } from "vue";
import TripLastChangedInfo from "@/components/modules/sales/TripLastChangedInfo.vue";
import { UpdateHistory, SalesEditGroup, SaleTripEditAttributes } from "@/store/salesConsole/types";
import { useI18n } from "vue-i18n";
import { SetupSharebusConfig } from "@/store/config/types";
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
    type: Object as PropType<UpdateHistory>,
    required: true,
  },
});

const editingMode = computed(() => salesStore.$state.editing_mode);

const { t } = useI18n();
const config = useConfigStore();

const invalidPaxErr = ref("");
const editingMaxPaxMode = ref(false);
const editMaxpax = () => {
  editingMaxPaxMode.value = true;
};

const setupConfig = computed<SetupSharebusConfig>(() => {
  return config.getSharebusSetupConfig;
});

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
  if (!editingMaxPaxMode.value && editingMode.value) {
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

const maxPaxLast = computed({
  get: () => {
    const history = salesStore.getSalesConsoleTrip()[props.tripId];
    return history && typeof history.max_pax !== "undefined"
      ? history.max_pax
      : props.maxPax;
  },
  set: (value) => {
    const setObj: Partial<SaleTripEditAttributes> & { trip_id: string } = {
      trip_id: props.tripId,
      max_pax: value && value >= 1 ? value : 1,
    };
    salesStore.setSalesConsoleTripChangeRequest(setObj);
  },
});
const maxPaxVModel = ref(maxPaxLast.value);

watch(
  () => editingMode.value,
  (newValue) => {
    if (!newValue) {
      editingMaxPaxMode.value = false;
    }
  }
);
const changesAction = (value: boolean) => {
  checkGoal();
  if (value) {
    if (invalidPaxErr.value.length) return;
    maxPaxLast.value = maxPaxVModel.value;
  } else {
    maxPaxVModel.value = maxPaxLast.value;
  }
  editingMaxPaxMode.value = false;
};
const keyCheck = (e) => {
  if (e.key == ".") e.preventDefault();
};
const checkGoal = () => {
  if (maxPaxVModel.value < setupConfig.value.BusCapacity) {
    invalidPaxErr.value = t("sales.max_pax_cant_less_bus_capacity", {
      count: setupConfig.value.BusCapacity,
    });
  } else if (maxPaxVModel.value < props.totalSoldTickets) {
    invalidPaxErr.value = t("sales.max_pax_cant_less_sold_tickets", {
      count: props.totalSoldTickets,
    });
  } else if (maxPaxVModel.value > 999) {
    invalidPaxErr.value = t("sales.max_pax_cant_great_999");
  } else invalidPaxErr.value = "";
};
</script>
