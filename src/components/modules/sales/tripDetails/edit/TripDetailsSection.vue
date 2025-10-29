<template>
  <div class="row col-md-12">
    <div class="col-sm-12 col-md-12 col-lg-12 col-xl-4 col-xxl-3 text-start">
      <BaseButton
        v-if="editingMode"
        class="sb-btn-primary-alt sb-btn-md my-2"
        @click="editItinerary"
      >
        <span class="me-2">{{ t("sales.details.edit_itinerary") }}</span>
        <span><img src="/img/icons/edit.svg" /></span>
      </BaseButton>

      <TripLastChangedInfo
        class="mt-2"
        v-if="showItineraryUpdateHistory"
        :dateString="itineraryUpdateHistoryDateString"
        :status="
          typeof salesHistory !== 'undefined' &&
          salesHistory.update_history.trip_location_time
            ? t('common.not_published')
            : t('common.published')
        "
        :published-by="publishedBy"
      />

      <TripInfoDetails :trip-info="departureInfo" class="my-4" />
      <TripInfoDetails
        v-if="returnInfo.route_points.length"
        :trip-info="returnInfo"
        :is-return-trip="true"
      />
    </div>
    <div
      class="border p-0 rounded col-sm-12 col-md-12 col-xl-8 col-lg-12 col-xxl-9 d-flex flex-column align-items-start"
    >
      <div
        class="border rounded p-3 d-flex flex-column align-items-start col-xl-10 col-xxl-7 col-lg-12 col-md-12 col-sm-12"
      >
        <div class="d-flex justify-content-start align-items-center flex-wrap">
          <BaseButton
            v-if="editingMode"
            class="sb-btn-primary-alt sb-btn-md my-3 me-2"
            @click="editPublishedInfo"
          >
            <span class="me-2">Edit published info</span>
            <span><img src="/img/icons/edit.svg" /></span>
          </BaseButton>
          <TripLastChangedInfo
            class="mt-2"
            v-if="updateHistoryDateStringForGeneralInfo && editingMode"
            :dateString="updateHistoryDateStringForGeneralInfo"
            :status="
              typeof salesHistory !== 'undefined' &&
              salesHistory.update_history.trip_general_info
                ? t('common.not_published')
                : t('common.published')
            "
            :published-by="publishedBy"
          />
        </div>
        <TripDetails :tripInfo="tripGeneralInfo" />
      </div>
      <div class="d-flex flex-row w-100">
        <hr class="w-100" />
      </div>
      <!-- Edit prices -->
      <div class="d-flex flex-column p-3">
        <BaseButton
          v-if="!editingPriceMode && editingMode"
          class="sb-btn-primary-alt sb-btn-md my-3 me-2"
          @click="editPrice"
        >
          <span class="me-2">{{ t("sales.details.edit_prices") }}</span>
          <span><img src="/img/icons/edit.svg" /></span>
        </BaseButton>

        <BaseSaveChanges
          v-if="editingPriceMode"
          @saveChanges="changesAction"
          class="col-sm-12 col-md-12 my-3"
        />
        <TripLastChangedInfo
          class="mt-2"
          v-if="
            !!updateHistoryDateStringForPricing &&
            editingMode &&
            !editingPriceMode
          "
          :dateString="updateHistoryDateStringForPricing"
          :status="
            typeof salesHistory !== 'undefined' &&
            salesHistory.update_history.trip_pricing
              ? t('common.not_published')
              : t('common.published')
          "
          :published-by="publishedBy"
        />

        <div
          class="d-flex flex-wrap"
          :class="
            tripInfo.club_share_per_extra_ticket > 0 &&
            tripInfo.earlybird_ticket_price > 0
              ? 'justify-content-between'
              : 'justify-content-start'
          "
        >
          <TicketPrice
            v-for="(value, index) in ticketType"
            :key="index"
            card-class="me-1"
            class="mb-1"
            :title="value.title"
            :ticket-type="value.type"
            :amount="value.amount"
            currency="Kr"
            :info="value.info"
            :discount-scheme="discountScheme"
            :edit-mode="
              editingPriceMode && (index > 0 ? totalSoldTickets === 0 : true)
            "
            :save-changes="saveChanges"
            @on-save="saveTicket"
          />

          <TicketPrice
            class="mb-1"
            v-if="tripInfo.club_share_per_extra_ticket > 0"
            :title="t('sharebus.ticket.bonus_per_ticket')"
            :ticket-type="TICKET_TYPE.BONUS_PER_TICKET"
            :amount="tripInfo.club_share_per_extra_ticket"
            currency="Kr"
            :info="
              t('sharebus.ticket.after_sold_ticket_amount', {
                passenger_goal: tripInfo.passenger_goal,
              })
            "
          />
        </div>
      </div>
      <!-- Edit prices end -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, PropType, watch } from "vue";
import { Trip } from "@/store/trip/privateTrip/types";
import TripDetails from "@/components/modules/sharelead/trip/tripDetails/TripDetails.vue";
import TripInfoDetails from "@/components/modules/sharelead/setupSharebus/TripInfo/TripInfoDetails.vue";
import TicketPrice from "@/components/modules/sharelead/setupSharebus/ticketPrice/TicketPrice.vue";
import { TRIP_TYPE } from "@/components/modules/sharelead/trip/tripStatus/tripStatusEnum";
import TripController from "@/components/modules/sharelead/controllers/TripController";
import { useI18n } from "vue-i18n";
import { useSalesStore, useUserStore } from "@/store";
import BaseButton from "@busgroup/vue3-base-button";
import TripLastChangedInfo from "../../TripLastChangedInfo.vue";
import BaseSaveChanges from "@/components/common/reusable/BaseSaveChanges.vue";
import { UpdateHistory } from "@/store/salesConsole/types";
import { DECISION } from "@/components/common/enums/enums";
import {
  DISCOUNT_SCHEME,
  TICKET_TYPE,
} from "@/components/modules/sharelead/setupSharebus/enums/SetUpShareBusEnum";
import { routePushMultipleTag, routePush } from "@/utils";

const props = defineProps({
  tripInfo: {
    type: Object as PropType<Trip>,
    required: true,
  },
  updateHistory: {
    type: Object as PropType<UpdateHistory>,
    required: true,
  },
});

const { t } = useI18n();
const salesStore = useSalesStore();

const departureInfo = computed(() => {
  if (
    salesHistory.value &&
    salesHistory.value.update_history.trip_location_time
  ) {
    return {
      origin: salesHistory.value.trip_location_time.outbound_from,
      destination: salesHistory.value.trip_location_time.outbound_to,
      bookingReference: salesHistory.value.trip_location_time.bus_signage,
      departureDateTime:
        salesHistory.value.trip_location_time.outbound_from_datetime,
      arrivalDateTime:
        salesHistory.value.trip_location_time.outbound_to_datetime,
      route_points: salesHistory.value.trip_location_time.route_points.oneway,
    };
  }
  return TripController.getTripDeparture().value;
});

const returnInfo = computed(() => {
  if (
    salesHistory.value &&
    salesHistory.value.update_history.trip_location_time
  ) {
    return {
      origin: salesHistory.value.trip_location_time.return_from,
      destination: salesHistory.value.trip_location_time.return_to,
      bookingReference: salesHistory.value.trip_location_time.bus_signage,
      departureDateTime:
        salesHistory.value.trip_location_time.return_from_datetime,
      arrivalDateTime: salesHistory.value.trip_location_time.return_to_datetime,
      route_points: salesHistory.value.trip_location_time.route_points.return,
    };
  }
  return TripController.getTripReturn().value;
});
const discountScheme = computed(() => props.tripInfo.discount_scheme);
const ticketType = computed(() => {
  const ticketTypeItems = [
    {
      title: t("sharebus.ticket.price"),
      amount:
        salesHistory.value && salesHistory.value?.update_history.trip_pricing
          ? salesHistory.value.trip_pricing?.regular_ticket_price
          : props.tripInfo.regular_ticket_price,
      info:
        props.tripInfo.trip_type === TRIP_TYPE.ROUND
          ? t("sharebus.ticket.roundtrip")
          : "",
      type: TICKET_TYPE.REGULAR,
    },
  ];

  if (
    props.tripInfo.discount_scheme === DISCOUNT_SCHEME.EARLY_BIRD ||
    totalSoldTickets.value === 0
  ) {
    ticketTypeItems.push({
      title: t("sharebus.price_info.early_bird_price"),
      amount:
        salesHistory.value && salesHistory.value?.update_history.trip_pricing
          ? salesHistory.value.trip_pricing?.earlybird_ticket_price
          : props.tripInfo.earlybird_ticket_price,
      info:
        props.tripInfo.trip_type === TRIP_TYPE.ROUND
          ? t("sharebus.ticket.roundtrip")
          : "",
      type: TICKET_TYPE.EARLY_BIRD,
    });
  }
  return ticketTypeItems;
});

const editingPriceMode = ref(false);

const saveChanges = ref(DECISION.INTERMEDIATE);

const tripGeneralInfo = computed(() => {
  const salesTrip = salesStore.getSalesConsoleTrip()[props.tripInfo.id];
  if (salesTrip && Object.keys(salesTrip.trip_general_info).length) {
    return salesTrip.trip_general_info;
  }
  return props.tripInfo;
});

const updateHistoryDateStringForPricing = computed(() => {
  if (
    typeof salesHistory.value !== "undefined" &&
    salesHistory.value.update_history.trip_pricing
  ) {
    return salesHistory.value.update_history.trip_pricing;
  } else if (props.updateHistory && props.updateHistory.trip_pricing) {
    return props.updateHistory.trip_pricing;
  }
  return "";
});
const updateHistoryDateStringForGeneralInfo = computed(() => {
  if (
    typeof salesHistory.value !== "undefined" &&
    salesHistory.value.update_history.trip_general_info
  ) {
    return salesHistory.value.update_history.trip_general_info;
  } else if (props.updateHistory && props.updateHistory.trip_general_info) {
    return props.updateHistory.trip_general_info;
  }
  return "";
});

const editItinerary = () => {
  routePush("sales-edit-itinerary");
};

const editPublishedInfo = () => {
  routePushMultipleTag("trip-sales-dit-published", { id: props.tripInfo.id });
};

const showItineraryUpdateHistory = computed(() => {
  if (editingMode.value) {
    if (
      salesHistory.value &&
      salesHistory.value.update_history.trip_location_time
    )
      return true;
    else if (props.updateHistory && props.updateHistory.trip_location_time)
      return true;
  }
  return false;
});

const itineraryUpdateHistoryDateString = computed(() => {
  if (
    typeof salesHistory.value !== "undefined" &&
    salesHistory.value.update_history.trip_location_time
  ) {
    return salesHistory.value.update_history.trip_location_time;
  } else if (props.updateHistory && props.updateHistory.trip_location_time) {
    return props.updateHistory.trip_location_time;
  }
  return "";
});

const editPrice = () => {
  editingPriceMode.value = true;
};

/**Edit prices */

const salesHistory = computed(
  () => salesStore.getSalesConsoleTrip()[props.tripInfo.id]
);
const editingMode = computed(() => salesStore.$state.editing_mode);

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

watch(
  () => editingMode.value,
  (newValue) => {
    if (!newValue) {
      editingPriceMode.value = false;
    }
  }
);
const ticketPriceLast = computed({
  get: () => {
    const editHistory = salesStore.getSalesConsoleTrip()[props.tripInfo.id];
    return editHistory &&
      typeof editHistory.trip_pricing?.earlybird_ticket_price !== "undefined" &&
      typeof editHistory.trip_pricing?.regular_ticket_price !== "undefined"
      ? editHistory.trip_pricing
      : {
          earlybird_ticket_price: props.tripInfo.earlybird_ticket_price,
          regular_ticket_price: props.tripInfo.regular_ticket_price,
        };
  },
  set: (value) => {
    const setObj = {
      [props.tripInfo.id]: {
        trip_pricing: {
          earlybird_ticket_price: value && value.earlybird_ticket_price,
          regular_ticket_price: value && value.regular_ticket_price,
        },
        update_history: {
          ...salesHistory.value?.update_history,
          trip_pricing: new Date(),
        },
      },
    };
    salesStore.setSalesConsoleTripChangeRequest(setObj);
  },
});

const totalSoldTickets = computed(() => {
  const { max_pax, available_earlybird_tickets, available_regular_tickets } =
    props.tripInfo;

  return max_pax - (available_earlybird_tickets + available_regular_tickets);
});

const ticketPriceVModel = ref(ticketPriceLast.value);
const earlyBirdTicketValidated = ref(false);
const regularTicketValidated = ref(false);
const changesAction = (value: boolean) => {
  if (value) {
    saveChanges.value = DECISION.YES;
  } else {
    saveChanges.value = DECISION.NO;
  }
};

const saveTicket = (ticketPrice) => {
  if (ticketPrice.amount >= 0) {
    if (ticketPrice.ticketType === TICKET_TYPE.REGULAR) {
      regularTicketValidated.value = ticketPrice.error.length == 0;
      ticketPriceVModel.value.regular_ticket_price = ticketPrice.amount;
    } else if (ticketPrice.ticketType === TICKET_TYPE.EARLY_BIRD) {
      earlyBirdTicketValidated.value = ticketPrice.error.length == 0;
      ticketPriceVModel.value.earlybird_ticket_price = ticketPrice.amount;
    }

    if (
      !regularTicketValidated.value ||
      (props.tripInfo.discount_scheme === DISCOUNT_SCHEME.EARLY_BIRD &&
        !earlyBirdTicketValidated.value)
    ) {
      saveChanges.value = DECISION.INTERMEDIATE;
      editingPriceMode.value = true;
      return;
    }
    editingPriceMode.value = false;
    ticketPriceLast.value = ticketPriceVModel.value;
    saveChanges.value = DECISION.INTERMEDIATE;
  } else {
    saveChanges.value = DECISION.INTERMEDIATE;
    editingPriceMode.value = true;
  }
};
</script>
