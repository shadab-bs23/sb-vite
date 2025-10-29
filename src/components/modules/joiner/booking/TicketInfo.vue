<template>
  <div
    class="light-gray-bg p-3 my-2 rounded d-flex justify-content-between align-items-center"
  >
    <div class="d-flex flex-column">
      <h3 class="fs-19">
        {{ isEarlyBird ? joinerEarlyBirdTickets : joinerRegularTickets }}
        &#10005;
        <img
          v-if="isEarlyBird"
          src="/img/discount-icon/bird2.svg"
          alt="bird icon"
        />
        {{
          isEarlyBird
            ? t("sharebus.active_discount.early_bird")
            : t("sharebus.price_summary.regular_ticket")
        }}
      </h3>
      <BaseBadge badge-class="bg-white rounded fs-14 fw-normal w-fit-content">
        <template v-slot:label>
          {{
            isEarlyBird ? RemainingEarlyBirdTickets : RemainingRegularTickets
          }}
          {{ t("common.remaining") }}
        </template>
      </BaseBadge>
    </div>
    <div class="d-flex flex-column">
      <span
        ><h1 class="d-inline fs-36">
          {{ isEarlyBird ? totalEarlyBirdPrice : totalRegularTicketPrice }}
        </h1>
        kr
      </span>
      <p
        v-if="isEarlyBird"
        class="fs-14 align-self-end text-decoration-line-through"
      >
        {{ tripInfo.regular_ticket_price * joinerEarlyBirdTickets }} kr
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseBadge from "@/components/common/reusable/BaseBadge.vue";
import { Trip } from "@/store/trip/privateTrip/types";
import { computed, PropType, ref } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps({
  isEarlyBird: {
    type: Boolean,
    required: false,
    default: false,
  },
  ticketsCount: {
    type: Number,
    required: true,
  },
  tripInfo: {
    type: Object as PropType<Trip>,
    required: true,
  },
  joinerEarlyBirdTickets: {
    type: Number,
    required: false,
    default: 0,
  },
});

const emit = defineEmits(["setEarlyBirdTicket", "setRegularTicket"]);

const { t } = useI18n();
const joinerEarlyBirdTickets = ref(0);
const joinerRegularTickets = ref(0);

/**
 * Calculation for remaining earlybird tickets.
 *
 * Step-1: If total sold tickets is greater or equal early bird range then return 0 available.
 * Step-2: If step-1 is false then, check if the summation of selected ticket count and total sold tickets is greater
 *         than early bird range. If yes then update joiner's earlybird tickets by removing extra tickets and return 0 *         remaining tickets.
 * Step-3: If both step-1 and 2 is false then, update joiner's earlybird tickets same as ticket count and return       *         calculated remaining tickets.
 */
const RemainingEarlyBirdTickets = computed(() => {
  if (!props.tripInfo.available_earlybird_tickets) {
    return 0;
  }

  if (props.ticketsCount > props.tripInfo.available_earlybird_tickets) {
    updateJoinerEarlyBirdTickets(props.tripInfo.available_earlybird_tickets);
  } else updateJoinerEarlyBirdTickets(props.ticketsCount);

  return props.tripInfo.available_earlybird_tickets;
});

const RemainingRegularTickets = computed(() => {
  updateJoinerRegularTickets();
  return props.tripInfo.available_regular_tickets;
});

const totalEarlyBirdPrice = computed(() => {
  return props.tripInfo.earlybird_ticket_price * joinerEarlyBirdTickets.value;
});

const totalRegularTicketPrice = computed(() => {
  return props.tripInfo.regular_ticket_price * joinerRegularTickets.value;
});

const updateJoinerEarlyBirdTickets = (tickets: number) => {
  joinerEarlyBirdTickets.value = tickets;
  emit("setEarlyBirdTicket", {
    count: joinerEarlyBirdTickets.value,
    price: totalEarlyBirdPrice.value,
  });
};
const updateJoinerRegularTickets = () => {
  joinerRegularTickets.value =
    props.ticketsCount - props.joinerEarlyBirdTickets;

  emit("setRegularTicket", {
    count: joinerRegularTickets.value,
    price: totalRegularTicketPrice.value,
  });
};
</script>
