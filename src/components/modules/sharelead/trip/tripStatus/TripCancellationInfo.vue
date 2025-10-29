<template>
  <div v-if="tripStatus === TRIP_STATUS.UNCONFIRMED && cancellable">
    <div
      v-if="!toggle.show.value"
      class="d-flex justify-content-between mb-2"
      @click="toggle.toggleShow"
    >
      <span class="ship-gray fw-bold">
        {{ t("sharebus.trip_page.cancellation_policy") }}
      </span>
      <span class="bg-white ms-2 px-2 rounded-pill border border-1 border-light"
        ><img src="/img/trip-info/down-arrow.svg"
      /></span>
    </div>
    <div
      v-if="toggle.show.value"
      class="d-flex justify-content-between mb-2"
      @click="toggle.toggleShow"
    >
      <span class="fw-bold ship-gray">
        {{ t("sharebus.trip_page.cancellation_policy") }}
      </span>
      <span
        class="extended-green-bg ms-2 px-2 rounded-pill border border-1 border-light"
        ><img src="/img/trip-info/up-arrow.svg"
      /></span>
    </div>
    <div class="" v-if="toggle.show.value">
      <p>
        {{ t("sharebus.trip_page.bus_can_be_cancelled_until") }}
      </p>
      <BaseButton
        :button-text="t('sharebus.my_buses.cancel_sharebus')"
        @click="cancelShareBus"
        button-class="rounded-pill sb-btn-danger sb-btn-lg col-sm-12 col-md-4"
      />
    </div>
    <hr class="mt-4" />
  </div>
  <CancelationNotPossibleVue v-else :booking-reference="bookingReference" />
</template>

<script setup lang="ts">
import { useToggle } from "@/composables/useToggle";
import { useI18n } from "vue-i18n";
import { TRIP_STATUS } from "./tripStatusEnum";
import BaseButton from "@busgroup/vue3-base-button";
import CancelationNotPossibleVue from "@/components/modules/trip/CancelationNotPossible.vue";
import {
  dismissToast,
  toastWithActionable,
} from "@/services/toast/toast.service";
import { useSharebusStore } from "@/store";
import { routePush } from "@/utils";
import DecisionDialog from "@/components/common/dialog/DecisionDialog.vue";

const props = defineProps({
  tripStatus: {
    type: String,
    required: true,
  },
  tripId: {
    type: String,
    required: true,
  },
  bookingReference: {
    type: String,
    required: true,
  },
  cancellable: {
    type: Boolean,
    default: true,
  },
});
const { t } = useI18n();
const toggle = useToggle();
const shareBusStore = useSharebusStore();

const tripCancelAction = () => {
  shareBusStore
    .cancelSharebus(props.tripId)
    .then(() => {
      dismissToast("component-toast");
      routePush("share-lead-buses");
    })
    .catch((error) => {
      dismissToast("component-toast");
      console.log(error);
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
