<template>
  <div class="col-md-6 col-sm-12 summary-breakdown mx-auto">
    <h2 class="text-start fw-bold mt-2 mb-3">
      {{ t("sharebus.booking.thank_you_booking") }}!
    </h2>
    <BookingSummary
      v-if="ticketsCalculation"
      :current-trip="tripInfo"
      :total="ticketsCalculation.total"
      :tickets="ticketsCalculation.tickets"
      :not-guest-show="true"
    >
      <template v-slot:title>
        <ul>
          <li class="d-flex justify-content-between">
            <span> {{ t("sharebus.booking.booking_number") }}</span>
            <span class="fw-bold">{{ tripInfo.booking_reference }}</span>
          </li>
        </ul>
        <hr />
      </template>
      <template v-slot:other_info>
        <ul>
          <li class="text-center">
            <BaseButton
              button-class="px-3 py-2 col-md-4 col-sm-12 sb-btn-primary-alt sb-btn-lg fw-bold rounded-pill mx-100"
              @click="
                routePushTagQuery('Joiner-trip-page', tripInfo.id, {
                  tabindex: 2,
                })
              "
            >
              <span>{{ t("sharebus.booking.view_tickets") }}</span>
              <span class="ms-2"
                ><img src="/img/trip-info/right-arrow-black.svg"
              /></span>
            </BaseButton>
          </li>
        </ul>
        <hr />
        <ul>
          <li class="rounded" v-if="remainingPassGoal > 0">
            <div class="info-yellow-bg p-3 mb-0">
              <span><img src="/img/trip-info/info-icon-green.svg" /></span>
              <span class="ms-2">{{
                t("sharebus.booking.waiting_for_passengers")
              }}</span>
            </div>
            <div class="light-gray-bg p-3">
              <p>
                {{ t("sharebus.booking.when_the_passenger_goal_reached") }}
              </p>
            </div>
          </li>
          <li class="rounded" v-else>
            <div class="extended-light-green-bg p-3 text-start">
              <span> <img src="/img/trip-info/check-sign.svg" /></span>
              <span class="fw-bold ms-2">
                {{ t("sharebus.booking.confirmed_bus") }}
              </span>
            </div>
          </li>

          <li class="text-center">
            <BaseButton
              button-class="px-3 py-2 col-md-4 col-sm-12 sb-btn-primary-alt sb-btn-lg fw-bold rounded-pill mx-100"
              @click="routePushTag('Joiner-trip-page', tripInfo.id)"
            >
              <span>{{ t("sharebus.booking.view_bus_status") }}</span>
              <span class="ms-2"
                ><img src="/img/trip-info/right-arrow-black.svg"
              /></span>
            </BaseButton>
          </li>
        </ul>
      </template>
    </BookingSummary>
    <div class="mt-3">
      <BookingLInk :trip-id="tripInfo.id" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import BookingSummary from "@/components/modules/joiner/booking/BookingSummary.vue";
import BookingLInk from "@/components/modules/trip/BookingLink.vue";
import { useCartStore } from "@/store";
import { Trip } from "@/store/trip/privateTrip/types";
import { routePushTag, routePushTagQuery } from "@/utils";
import BaseButton from "@busgroup/vue3-base-button";

import { computed, onBeforeUnmount, PropType } from "vue";
import { useI18n } from "vue-i18n";

const cartStore = useCartStore();
const props = defineProps({
  tripInfo: {
    type: Object as PropType<Trip>,
    required: true,
  },
});
const remainingPassGoal = computed(() => {
  const currentTrip = props.tripInfo;
  const totalSoldTickets =
    currentTrip.total_earlybird_tickets +
    currentTrip.total_regular_tickets -
    (currentTrip.available_earlybird_tickets +
      currentTrip.available_regular_tickets);

  if (totalSoldTickets >= currentTrip.passenger_goal) {
    return 0;
  }
  return currentTrip.passenger_goal - totalSoldTickets;
});

const { t } = useI18n();

const ticketsCalculation = computed(() => {
  const tickets = cartStore.getJoinerTickets(props.tripInfo);

  const early =
    tickets.earlyBirdTickets.count >= 1 ? tickets.earlyBirdTickets.price : 0;
  const regular =
    tickets.regularTickets.count >= 1 ? tickets.regularTickets.price : 0;

  return {
    tickets,
    total: early + regular,
  };
});

onBeforeUnmount(() => {
  cartStore.removeJoinerTickets(props.tripInfo.id);
});

/*
 * --- keeping it for future use , will remove it later
 */
// const ticketsCalculation = computed(() => {
//   let early = 0;
//   let regular = 0;
//   let formatedObj = props.tripInfo.ticket.reduce(function (r, e) {
//     var key = e.type;

//     if (!r[key]) r[key] = e;
//     else {
//       r[key].ticket_price += e.ticket_price;
//     }
//     if (r[key].type == TICKET_TYPE.EARLY_BIRD) {
//       ++early;
//       r[key].count = early;
//     }
//     if (r[key].type == TICKET_TYPE.REGULAR) {
//       ++regular;
//       r[key].count = regular;
//     }
//     return r;
//   }, {});
//   return {
//     tickets: {
//       earlyBirdTickets: {
//         count: formatedObj[TICKET_TYPE.EARLY_BIRD]?.count || 0,
//         price: formatedObj[TICKET_TYPE.EARLY_BIRD]?.ticket_price || 0,
//       },
//       regularTickets: {
//         count: formatedObj[TICKET_TYPE.REGULAR]?.count || 0,
//         price: formatedObj[TICKET_TYPE.REGULAR]?.ticket_price || 0,
//       },
//     },
//     total:
//       formatedObj[TICKET_TYPE.REGULAR]?.ticket_price +
//         formatedObj[TICKET_TYPE.EARLY_BIRD]?.ticket_price || 0,
//   };
// });
</script>
