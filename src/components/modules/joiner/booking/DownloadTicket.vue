<template>
  <div class="row text-start ship-gray mb-3" v-if="ticketsCalculationByType">
    <p class="fw-600">{{ t("sharebus.ticket.your_tickets") }}</p>
    <div class="col-sm-12 col-md-5 col-xl-4 p-3 light-gray-bg rounded">
      <div v-if="ticketsCalculationByType[TICKET_TYPE.EARLY_BIRD]">
        <span>
          {{ ticketsCalculationByType[TICKET_TYPE.EARLY_BIRD].count }}
          <i class="fi fi-x"></i>
        </span>
        {{
          `${t("sharebus.price_summary.early_bird_tickets")} (${
            ticketsCalculationByType[TICKET_TYPE.EARLY_BIRD].ticket_price
          },-)`
        }}
      </div>
      <div v-if="ticketsCalculationByType[TICKET_TYPE.REGULAR]">
        <span>
          {{ ticketsCalculationByType[TICKET_TYPE.REGULAR].count }}
          <i class="fi fi-x"></i>
        </span>
        {{
          `${t("sharebus.price_summary.regular_ticket")} (${
            ticketsCalculationByType[TICKET_TYPE.REGULAR].ticket_price
          },-)`
        }}
      </div>
      <div
        v-if="ticketsCalculationByType['total']"
        class="d-flex justify-content-between align-items-center mt-2"
      >
        <p class="mb-0">
          {{
            `${t("sharebus.ticket.price")} (${t(
              "sharebus.price_summary.include_vat_short"
            )})`
          }}
        </p>
        <h2 class="my-0">{{ ticketsCalculationByType["total"] }},-</h2>
      </div>
    </div>
  </div>
  <div class="row text-start ship-gray">
    <p v-if="tripInfo.trip_status === TRIP_STATUS.CONFIRMED" class="fw-600">
      {{ t("sharebus.ticket.download") }}
    </p>
    <div
      v-if="isCancelledOrTerminated"
      class="rounded light-gray-bg p-2 w-auto"
    >
      <span class="error-input-color fi fi-x-circle-fill"></span>
      <span class="ms-1 fw-bold">
        {{ t("sharebus.my_busses.cancelled") }}
      </span>
    </div>
    <div
      v-else-if="tripInfo.trip_status === TRIP_STATUS.FINISHED"
      class="rounded light-gray-bg p-2 w-auto"
    >
      <span class="light-gray-bg fi fi-check2"></span>
      <span class="ms-1 fw-bold">
        {{ t("status.finished") }}
      </span>
    </div>
    <BaseButton
      @click="downloadTickets()"
      v-else-if="tripInfo.trip_status === TRIP_STATUS.CONFIRMED"
      button-class="sb-btn-lg sb-btn-primary px-4 rounded-pill col-sm-12 col-md-5 col-xl-4"
    >
      <img src="/img/download.svg" class="me-2" alt="Download icon" />
      {{
        t("sharebus.ticket.download_tickets", {
          tickets: joinerTickets,
        })
      }}
    </BaseButton>
    <div
      v-if="tripInfo.trip_status === TRIP_STATUS.UNCONFIRMED"
      class="extended-light-green-bg rounded col-sm-12 col-md-5 col-xl-4 p-3"
    >
      {{ t("sharebus.ticket.you_can_download_tickets") }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import BaseButton from "@busgroup/vue3-base-button";
import { computed, PropType } from "vue";
import { Trip } from "@/store/trip/privateTrip/types";
import { useLoaderStore, useSharebusStore } from "@/store";
import { showToast } from "@/services/toast/toast.service";
import { TRIP_STATUS } from "../../sharelead/trip/tripStatus/tripStatusEnum";
import { TICKET_TYPE } from "@/components/modules/sharelead/setupSharebus/enums/SetUpShareBusEnum";

const props = defineProps({
  tripInfo: {
    type: Object as PropType<Trip>,
    required: true,
  },
});

const { t } = useI18n();
const sharebusStore = useSharebusStore();

// Type wise ticket separation and calculation
const ticketsCalculationByType = computed(() => {
  if (!props.tripInfo?.ticket?.length) return null;
  let typeSeperatedTickets = { total: 0 },
    tickets = [...props.tripInfo.ticket];
  for (const ticket of tickets) {
    typeSeperatedTickets.total += ticket.ticket_price;
    if (typeSeperatedTickets[ticket["type"]]) {
      typeSeperatedTickets[ticket["type"]].ticket_price = ticket.ticket_price;
      typeSeperatedTickets[ticket["type"]].count++;
    } else {
      typeSeperatedTickets[ticket["type"]] = {};
      typeSeperatedTickets[ticket["type"]].ticket_price = ticket.ticket_price;
      typeSeperatedTickets[ticket["type"]].count = 1;
    }
  }
  return typeSeperatedTickets;
});

const joinerTickets = computed(() => {
  return props.tripInfo.ticket.length;
});

const isCancelledOrTerminated = computed(
  () =>
    props.tripInfo.trip_status === TRIP_STATUS.CANCELED_BY_ORGANIZER ||
    props.tripInfo.trip_status === TRIP_STATUS.CANCELED_BY_FERDIA ||
    props.tripInfo.trip_status === TRIP_STATUS.EXPIRED ||
    props.tripInfo.trip_status === TRIP_STATUS.TERMINATED
);

const downloadTickets = () => {
  const loader = useLoaderStore();
  loader.changeLoadingStatus({ isLoading: true });
  sharebusStore.downLoadTickets(props.tripInfo.id).then((result) => {
    result?.onResult((queryResult) => {
      const link = queryResult.data.downloadTicket;
      if (link) {
        window.location.href = link;
      } else {
        showToast(
          "info",
          "Ticket is not available yet, please try again after sometimes"
        );
      }
      loader.changeLoadingStatus({ isLoading: false });
    });
  });
};
</script>
