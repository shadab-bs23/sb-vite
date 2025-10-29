<template>
  <div>
    <ShareleadTripUpdated
      :trip="trip"
      :role="ROLE.SHARELEAD"
      :should-hover-active="!isSalesEditing"
      @user-action="userActionCalling"
    >
      <template v-slot:actionButtons>
        <BaseButton
          v-if="!salesUpdateUnpublished"
          class="sb-btn-md"
          :button-class="
            shareLeadActionText != 'view'
              ? 'sb-btn-primary fw-bold'
              : 'sb-tertiary rounded-pill px-2 ms-2 d-flex p-1'
          "
          @click="shareLeadAction"
        >
          <template v-slot:default>
            <img
              v-if="shareLeadActionText == 'view'"
              src="/img/trip-info/right-arrow.svg"
              class="right-arrow"
            />
            <span v-else>
              {{ shareLeadActionText }}
            </span>
          </template>
        </BaseButton>

        <BaseButton
          v-if="!salesUpdateUnpublished && trip.trip_status == TRIP_STATUS.NEW"
          button-class="sb-btn-danger sb-btn-md fw-bold  ms-1"
          @click="cancelShareBus"
          :button-text="t('sharebus.my_buses.cancel_sharebus')"
        />
      </template>
    </ShareleadTripUpdated>
  </div>
</template>
<script lang="ts" setup>
import { ROLE } from "@/components/common/enums/enums";
import {
  SHARE_LEAD_PAYMENT_STATUS,
  TRIP_STATUS,
} from "@/components/modules/sharelead/trip/tripStatus/tripStatusEnum";
import ShareleadTripUpdated from "@/components/modules/trip/SingleUserTripUpdated.vue";
import { Trip } from "@/store/trip/privateTrip/types";
import { routePushMultipleTag, routePushTag } from "@/utils";
import { ComputedRef, PropType, computed, inject } from "vue";
import { useI18n } from "vue-i18n";
import {
  dismissToast,
  toastWithActionable,
} from "@/services/toast/toast.service";
import BaseButton from "@busgroup/vue3-base-button";
import { useSharebusStore, useTripStore } from "@/store";
import DecisionDialog from "@/components/common/dialog/DecisionDialog.vue";
import { countryType } from "@/core/plugin/countryPlugin";

const props = defineProps({
  trip: {
    type: Object as PropType<Trip>,
    required: true,
  },
});
const { t } = useI18n();
const shareBusStore = useSharebusStore();
const tripStore = useTripStore();
const country = inject<ComputedRef<countryType>>("country");

const salesUpdateUnpublished = computed(() => {
  if (
    !props.trip.is_published &&
    props.trip.is_unpublished_by_sales &&
    props.trip.trip_status === TRIP_STATUS.UNCONFIRMED
  ) {
    return t("sharebus.not_published_by_sales");
  }
  return "";
});

const shareLeadActionText = computed(() =>
  props.trip.sharelead_payment_status === SHARE_LEAD_PAYMENT_STATUS.REQUIRED &&
  !isCancelledOrTerminated.value
    ? t("sharebus.my_buses.make_payment")
    : isCancelledOrTerminated.value
    ? "view"
    : !props.trip.is_published &&
      (props.trip.trip_status === TRIP_STATUS.NEW ||
        props.trip.trip_status === TRIP_STATUS.UNCONFIRMED)
    ? t("sharebus.my_buses.publish_sharebus")
    : "view"
);

const isCancelledOrTerminated = computed(
  () =>
    props.trip.trip_status === TRIP_STATUS.CANCELED_BY_ORGANIZER ||
    props.trip.trip_status === TRIP_STATUS.CANCELED_BY_FERDIA ||
    props.trip.trip_status === TRIP_STATUS.CANCELED_BY_SALES ||
    props.trip.trip_status === TRIP_STATUS.EXPIRED ||
    props.trip.trip_status === TRIP_STATUS.TERMINATED
);

const shareLeadAction = () => {
  if (
    props.trip.sharelead_payment_status ===
      SHARE_LEAD_PAYMENT_STATUS.REQUIRED &&
    !isCancelledOrTerminated.value
  ) {
    routePushMultipleTag("payment", {
      tag: "confirm-and-book",
      id: props.trip.id,
    });
  } else if (isCancelledOrTerminated.value) {
    routePushTag("trip-page", props.trip.id);
  } else {
    !props.trip.is_published
      ? routePushTag("publish-sharebus", props.trip.id)
      : routePushTag("trip-page", props.trip.id);
  }
};

const tripCancelAction = () => {
  shareBusStore
    .cancelSharebus(props.trip.id)
    .then(() => {
      dismissToast("component-toast");
      tripStore.getTripListShareLead({
        event_status: { between: ["OPEN", "UNPUBLISHED"] },
        country: country?.value.countryISO as string,
      });
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
      callback: () => tripCancelAction(),
    },
  };
  toastWithActionable(content);
};

const isSalesEditing = computed(
  () =>
    !props.trip.is_published &&
    props.trip.is_unpublished_by_sales &&
    props.trip.trip_status === TRIP_STATUS.UNCONFIRMED
);

const userActionCalling = (tripID) => {
  if (
    !props.trip.is_published &&
    props.trip.trip_status === TRIP_STATUS.UNCONFIRMED
  ) {
    return;
  }
  routePushTag("trip-page", tripID);
};
</script>
