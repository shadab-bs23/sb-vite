<template>
  <div class="row">
    <div class="col-sm-12 col-md-11 col-lg-11 col-xl-11 col-xxl-10 mx-auto">
      <BaseCard
        :card-class="`card-default mb-4 ${
          shouldHoverActive &&
          (trip.trip_status === TRIP_STATUS.UNCONFIRMED ||
            trip.trip_status === TRIP_STATUS.CONFIRMED ||
            trip.trip_status === TRIP_STATUS.ONGOING ||
            isFinished ||
            isCancelledOrTerminated)
            ? 'card-hover'
            : ''
        }`"
        content-class="px-4 pt-3 pb-2"
        :footer-class="`text-start px-4 py-2 border-0 fw-600 ${footerBg}`"
        @click="userCardAction"
      >
        <template v-slot:content>
          <div class="row">
            <div class="col-md-5 col-lg-4 col-sm-7 col-xl-3 text-start">
              <span class="d-flex align-items-start">
                <span v-if="trip.name && trip.category">
                  <img
                    height="30"
                    width="30"
                    :src="`/img/icons/category/${
                      categoryIcon[trip.category]
                    }.svg`"
                    :alt="categoryIcon[trip.category]"
                  />
                </span>
                <span v-else>
                  <img src="/img/my-busses/bus_logo.svg" />
                </span>
                <div
                  v-if="role === ROLE.SHARELEAD"
                  class="d-flex flex-column fw-600"
                >
                  <span class="ms-2 text-start">
                    {{ trip.name || "#" + trip.booking_reference }}
                  </span>
                </div>
                <span v-else class="ms-2 text-start">
                  {{ trip.name || "#" + trip.booking_reference }}
                </span>
              </span>
            </div>
            <div class="row col-md-7 col-lg-8 col-sm-5 mx-auto px-0 col-xl-9">
              <div
                class="d-flex justify-content-end align-items-start button-responsive px-0"
              >
                <div class="for-desk">
                  <div class="d-flex flex-wrap">
                    <TripInfoDetails
                      :trip-info="departureInfo"
                      :is-one-liner="true"
                    />
                    <TripInfoDetails
                      v-if="
                        returnInfo.departureDateTime &&
                        trip.trip_type === TRIP_TYPE.ROUND
                      "
                      :trip-info="returnInfo"
                      :is-return-trip="true"
                      :is-one-liner="true"
                    />
                  </div>
                </div>
                <div class="d-flex justify-content-end align-items-start ms-3">
                  <slot
                    name="actionButtons"
                    :newTripNotPublished="newTripNotPublished"
                    :userButtonAction="userButtonAction"
                  >
                  </slot>
                </div>
              </div>
            </div>
            <div class="col-sm-12">
              <div class="for-mobile my-4 text-start">
                <TripInfoDetails
                  :trip-info="departureInfo"
                  :is-one-liner="true"
                />
                <TripInfoDetails
                  v-if="
                    returnInfo.departureDateTime &&
                    trip.trip_type === TRIP_TYPE.ROUND
                  "
                  :trip-info="returnInfo"
                  :is-return-trip="true"
                  :is-one-liner="true"
                />
              </div>
            </div>
          </div>
        </template>

        <template v-slot:footer>
          <div
            class="d-flex justify-content-between align-items-center flex-wrap"
          >
            <div class="">
              <div v-if="trip.canceled_tickets_transactions">
                <span
                  >{{
                    isRefunded
                      ? t("transaction_Status.refunded")
                      : t("transaction_Status.refunded_in_progress")
                  }}
                  | {{ trip.booking_reference }} | {{ totalCancelledTicket }}
                  {{ t("common.ticket") }}</span
                >
              </div>
              <div v-else>
                <img
                  v-if="newTripNotPublished"
                  src="/img/warning_red.svg"
                  class="me-2"
                />
                <img
                  v-if="salesUpdateUnpublished"
                  src="/img/trip-info/info-blue.svg"
                  class="me-2"
                />
                <img
                  v-else-if="tripNotPublished"
                  src="/img/warning.svg"
                  class="me-2"
                />
                <img
                  v-else-if="trip.trip_status === TRIP_STATUS.UNCONFIRMED"
                  src="/img/waiting.svg"
                  class="me-2"
                />
                <i
                  v-else-if="trip.trip_status === TRIP_STATUS.CONFIRMED"
                  class="fi fi-check-circle-fill green-jewel fs-3 me-2"
                ></i>
                <img
                  v-else-if="trip.trip_status === TRIP_STATUS.ONGOING"
                  src="/img/my-busses/ongoing_trip.svg"
                  class="me-2"
                />
                <i v-else-if="isFinished" class="fi fi-check2 fs-3 me-2"></i>
                <i
                  v-else-if="isCancelledOrTerminated"
                  class="error-icon fi fi-x-circle-fill fs-3 me-2"
                ></i>

                <span
                  v-if="newTripNotPublished"
                  v-text="t('status.new_trip')"
                ></span>
                <span
                  v-else-if="salesUpdateUnpublished"
                  v-text="t('sharebus.not_published_by_sales')"
                ></span>
                <span
                  v-else-if="tripNotPublished"
                  v-text="t('status.needs_republish')"
                ></span>

                <span
                  v-else-if="
                    trip.trip_status === TRIP_STATUS.CANCELED_BY_FERDIA ||
                    trip.trip_status === TRIP_STATUS.CANCELED_BY_ORGANIZER ||
                    trip.trip_status === TRIP_STATUS.CANCELED_BY_SALES
                  "
                  v-text="t('status.cancelled')"
                ></span>
                <span
                  v-else-if="trip.trip_status === TRIP_STATUS.EXPIRED"
                  v-text="t('status.expired')"
                ></span>
                <span
                  v-else-if="trip.trip_status === TRIP_STATUS.TERMINATED"
                  v-text="t('status.terminated')"
                ></span>
                <span
                  v-else-if="isFinished"
                  v-text="t('status.finished')"
                ></span>
                <span v-else-if="trip.trip_status === TRIP_STATUS.UNCONFIRMED">
                  Waiting for booking
                  <span class="orange-buttercup mx-2">|</span>
                  {{ totalSoldTickets }} of {{ trip.passenger_goal }} booked
                </span>
                <span
                  v-else-if="
                    trip.trip_status === TRIP_STATUS.CONFIRMED &&
                    !trip.is_published
                  "
                  v-text="t('status.confirmed_unpublished')"
                ></span>
                <span
                  v-else-if="trip.trip_status === TRIP_STATUS.CONFIRMED"
                  v-text="t('status.confirmed')"
                ></span>
                <span
                  v-else-if="trip.trip_status === TRIP_STATUS.ONGOING"
                  v-text="t('status.trip_ongoing')"
                ></span>
              </div>
            </div>
            <p
              class="mb-0 fw-normal"
              v-if="
                role === ROLE.FERDIA_SALES || role === ROLE.PARTNER_SHARELEAD
              "
            >
              <BaseBadge
                badge-class="warning-c7-bg rounded-pill fs-14 fw-normal w-fit-content ms-auto p-2"
              >
                <template v-slot:label>
                  <span class="fw-600 me-1"
                    ><i class="fi fi-stopwatch me-2"></i
                    >{{ t("sales.pass_goal_deadline") }}:</span
                  >
                  {{ formatDateUsingDateFns(trip.deadline_passenger_goal) }}
                </template>
              </BaseBadge>
            </p>
          </div>
        </template>
      </BaseCard>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import BaseCard from "@busgroup/vue3-base-card";
import { categoryIcon, formatDateUsingDateFns } from "@/utils";
import TripInfoDetails from "@/components/modules/sharelead/setupSharebus/TripInfo/TripInfoDetails.vue";
import { computed, PropType, ref } from "vue";
import { Trip } from "@/store/trip/privateTrip/types";

import {
  TRIP_STATUS,
  TRIP_TYPE,
} from "../sharelead/trip/tripStatus/tripStatusEnum";
import {
  ACTION,
  ROLE,
  TRANSACTION_STATUS,
} from "@/components/common/enums/enums";

const { t } = useI18n();
const props = defineProps({
  trip: {
    type: Object as PropType<Trip>,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  shouldHoverActive: {
    type: Boolean,
    default: true,
  },
  /**
   * @property {boolean} isActionable -  should this card have action or not
   */
  isActionable: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits(["userAction"]);

const footerBg = computed(() => {
  if (newTripNotPublished.value) {
    return "light-gray-bg";
  } else if (salesUpdateUnpublished.value) {
    return "secondary-c11-bg";
  } else if (tripNotPublished.value) {
    return "light-gray-bg";
  } else if (props.trip.trip_status === TRIP_STATUS.UNCONFIRMED) {
    return "warning-c6-bg";
  } else if (props.trip.trip_status === TRIP_STATUS.CONFIRMED) {
    return "extended-light-green-bg";
  } else if (props.trip.trip_status === TRIP_STATUS.ONGOING) {
    return "info-ongoing-bg";
  } else if (isFinished.value) {
    return "light-gray-bg";
  } else if (isCancelledOrTerminated.value) {
    return "light-gray-bg";
  }
  return "";
});

const cardClickActive = ref(true);

const isCancelledOrTerminated = computed(
  () =>
    props.trip.trip_status === TRIP_STATUS.CANCELED_BY_ORGANIZER ||
    props.trip.trip_status === TRIP_STATUS.CANCELED_BY_FERDIA ||
    props.trip.trip_status === TRIP_STATUS.CANCELED_BY_SALES ||
    props.trip.trip_status === TRIP_STATUS.EXPIRED ||
    props.trip.trip_status === TRIP_STATUS.TERMINATED
);

const isFinished = computed(
  () => props.trip.trip_status === TRIP_STATUS.FINISHED
);

const newTripNotPublished = computed(
  () => !props.trip.is_published && props.trip.trip_status === TRIP_STATUS.NEW
);

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

const tripNotPublished = computed(
  () =>
    !props.trip.is_published &&
    props.trip.trip_status === TRIP_STATUS.UNCONFIRMED
);

const userAction = (isBtnClick = true, buttonAction = "") => {
  if (!cardClickActive.value && !isBtnClick) return;

  if (isBtnClick) {
    cardClickActive.value = false;
    if (buttonAction === ACTION.DETAILS) {
      emit("userAction", { actionType: ACTION.DETAILS, tripID: props.trip.id });
    } else if (buttonAction === ACTION.COPY) {
      emit("userAction", {
        actionType: ACTION.COPY,
        tripID: props.trip.id,
        tripName: props.trip.name,
      });
    }
  } else {
    cardClickActive.value = true;
    emit("userAction", { actionType: ACTION.DETAILS, tripID: props.trip.id });
  }
};

const userCardAction = () => {
  if (
    (props.trip.trip_status === TRIP_STATUS.UNCONFIRMED ||
      props.trip.trip_status === TRIP_STATUS.CONFIRMED ||
      props.trip.trip_status === TRIP_STATUS.ONGOING ||
      isFinished.value ||
      isCancelledOrTerminated.value) &&
    props.isActionable
  ) {
    userAction(false);
  }
};

const userButtonAction = (buttonAction = "") => {
  cardClickActive.value = false;
  userAction(true, buttonAction);
};

const departureInfo = computed(() => {
  return {
    origin: props.trip.outbound_from,
    destination: props.trip.outbound_to,
    departureDateTime: props.trip.outbound_from_datetime,
    arrivalDateTime: props.trip.outbound_to_datetime,
  };
});
const returnInfo = computed(() => {
  return {
    origin: props.trip.return_from,
    destination: props.trip.return_to,
    departureDateTime: props.trip.return_from_datetime,
    arrivalDateTime: props.trip.return_to_datetime,
  };
});

const totalSoldTickets = computed(() => {
  const { max_pax, available_earlybird_tickets, available_regular_tickets } =
    props.trip;

  return max_pax - (available_earlybird_tickets + available_regular_tickets);
});
/**
 * checking is all ticket get refunded or not
 */
const isRefunded = props.trip.canceled_tickets_transactions?.every(
  (data) => data.status === TRANSACTION_STATUS.REFUNDED
);
/**
 * calculating total cancelled ticket
 */
const totalCancelledTicket = computed(
  () => props.trip.canceled_tickets?.length
);
</script>
<style lang="scss">
.border-cancel {
  border: 1px solid #0c1026;
}
.my-busses-sharelead-title {
  background: #fdedd3;
  width: 200px;
}
.error-icon {
  color: #d4001a;
}

.right-arrow {
  width: 18px;
}
</style>
