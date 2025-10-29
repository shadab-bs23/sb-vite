<template>
  <div class="row">
    <h3>{{ t("sharebus.joiner.booking.book_tickets") }}</h3>
    <div
      class="col-sm-12 col-md-5 col-xl-4 px-4 py-3 booking-left-content text-break"
    >
      <p class="fw-bold fs-4 ship-gray mb-3">{{ currentTrip.name }}</p>

      <p class="mb-3">
        {{ t("sharebus.publish.organized_by") }}
        <span class="fw-bold"> {{ currentTrip.trip_organizer }}</span>
      </p>
      <div class="mb-2">
        <img
          class="banner-picture rounded"
          :src="generatePhotoUrlBasedOnEnv(currentTrip.image_url)"
          alt="Trip image"
          :onError="(e) => {
            (e.target as HTMLImageElement).onerror = null;
            (e.target as HTMLImageElement).src = '/img/dummy.jpg' }"
        />
      </div>
      <p v-if="currentTrip.info_to_travellers">
        {{ currentTrip.info_to_travellers }}
      </p>
      <a
        :href="currentTrip.website_url"
        class="text-decoration-underline"
        target="_blank"
      >
        {{ currentTrip.website_url }}
      </a>
      <div
        :class="`${
          showFullItinerary.show.value
            ? ''
            : 'd-flex justify-content-between flex-wrap'
        }`"
      >
        <TripInfoDetails
          :trip-info="departureInfo"
          :is-horizontal="!showFullItinerary.show.value"
          date-format="EEEE, dd.MM.yy"
        />

        <TripInfoDetails
          v-if="returnInfo.departureDateTime"
          :trip-info="returnInfo"
          :is-return-trip="true"
          :is-horizontal="!showFullItinerary.show.value"
          date-format="EEEE, dd.MM.yy"
        />
      </div>
      <BaseButton
        v-if="!showFullItinerary.show.value"
        button-class="text-center sb-btn-secondary cursor-pointer mt-3 btn-width-mq"
        @click="showFullItinerary.toggleShow"
      >
        {{ t("button.show_full_itinerary") }}
        <i
          class="fi fi-chevron-down green-jewel fs-5 text-stroke-2 p-1 ms-1 rounded"
        ></i>
      </BaseButton>
      <BaseButton
        v-else
        button-class="text-center sb-btn-secondary cursor-pointer mt-3"
        @click="showFullItinerary.toggleShow"
      >
        {{ t("button.hide_full_itinerary") }}
        <i class="fi fi-chevron-up p-1 ms-1 fs-5 text-stroke-2"></i>
      </BaseButton>
    </div>
    <div
      v-if="
        currentTrip.available_earlybird_tickets +
          currentTrip.available_regular_tickets >
        0
      "
      class="col-sm-12 col-md-7 col-xl-8"
    >
      <div
        :class="`d-flex tickets-container align-items-center mt-3 ${
          showTicketCountingError && 'error-input-color'
        }`"
      >
        <p class="me-2 mb-0">{{ t("sharebus.ticket.select_tickets") }}</p>
        <BaseQuantity
          v-model="tickets"
          :min-quantity="1"
          :max-quantity="currentTrip.max_pax"
          :block-decrease="blockTicketDecrease"
          :block-increase="blockTicketIncrease"
          :error-class="showTicketCountingError ? 'error-input-color' : ''"
        />
      </div>

      <div
        class="error-bg text-start rounded p-2 ship-gray fw-500 my-2"
        v-show="showTicketCountingError"
      >
        {{ showTicketCountingError }}
      </div>

      <TicketInfo
        v-if="
          currentTrip.discount_scheme === DISCOUNT_SCHEME.EARLY_BIRD &&
          totalSoldTickets < currentTrip.total_earlybird_tickets &&
          tickets > 0
        "
        :tickets-count="!showTicketCountingError ? tickets : 1"
        :trip-info="currentTrip"
        :is-early-bird="true"
        @set-early-bird-ticket="setJoinerEarlyBirdTickets"
      />

      <TicketInfo
        v-if="showRegularTicketInfo && tickets > 0"
        :tickets-count="!showTicketCountingError ? tickets : 1"
        :trip-info="currentTrip"
        :joiner-early-bird-tickets="joinerEarlyBirdTickets.count"
        @set-regular-ticket="setJoinerRegularTickets"
      />

      <span
        v-if="
          joinerEarlyBirdTickets.count > 0 && joinerRegularTickets.count > 0
        "
        class="d-flex justify-content-between align-items-center my-2 px-4"
        ><h5 class="mb-0">{{ t("common.total") }}</h5>
        <span>
          <h1 class="m-0 d-inline">
            {{ joinerEarlyBirdTickets.price + joinerRegularTickets.price }}
          </h1>
          kr
        </span>
      </span>
      <TripBookingStatus
        :tickets-count="tickets"
        :trip-info="currentTrip"
        :early-bird-completed="showRegularTicketInfo"
      />

      <TripMiscInfo :tickets-count="tickets" :trip-info="currentTrip" />

      <p
        class="error-input-color text-center mt-3 mx-auto"
        v-if="showGeneralError.show.value"
      >
        {{ t("sharebus.joiner.booking.change_ticket_count") }}
      </p>
      <div class="col-12 text-end">
        <BaseButton
          type="button"
          button-class="sb-btn-lg sb-btn-primary my-2 rounded-pill px-5 btn-width-mq"
          @click="handleNextStep"
        >
          <template v-slot:default>
            <span>{{ t("sharebus.joiner.booking.book_tickets") }}</span>
          </template>
        </BaseButton>
      </div>
    </div>
    <div v-else class="rounded mt-2 col-sm-12 col-md-7 col-xl-8">
      <div class="">
        <div
          class="d-flex d-flex justify-content-center align-items-center flex-column"
        >
          <div class="bg-custom-yellow p-2">
            <span>
              <img src="/img/my-busses/bus-logo.svg" />
            </span>
            <span class="ms-3 ship-gray fw-500">
              {{ t("sharebus.joiner.booking.fully_booked") }}
            </span>
          </div>
          <BaseButton class="mt-3 sb-btn-md" @click="routePush('home')">
            <div class="d-flex">
              <i class="fi fi-chevron-left text-stroke-2"></i>
              <span>{{ t("button.back") }}</span>
            </div>
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, ref, watch } from "vue";
import TripInfoDetails from "@/components/modules/sharelead/setupSharebus/TripInfo/TripInfoDetails.vue";
import BaseQuantity from "@/components/common/reusable/BaseQuantity.vue";
import BaseButton from "@busgroup/vue3-base-button";
import TicketInfo from "@/components/modules/joiner/booking/TicketInfo.vue";
import TripMiscInfo from "@/components/modules/joiner/booking/TripMiscInfo.vue";
import { useI18n } from "vue-i18n";
import { useToggle } from "@/composables/useToggle";
import { DISCOUNT_SCHEME } from "../../sharelead/setupSharebus/enums/SetUpShareBusEnum";
import { useCartStore, useUserStore } from "@/store";
import { ROLE } from "@/components/common/enums/enums";
import { showToast } from "@/services/toast/toast.service";
import { Trip } from "@/store/trip/privateTrip/types";
import { generatePhotoUrlBasedOnEnv, scrollToHeight } from "@/utils";
import TripBookingStatus from "../../sharelead/trip/tripStatus/TripBookingStatus.vue";
import { routePush } from "@/utils";

const props = defineProps({
  currentTrip: {
    type: Object as PropType<Trip>,
    required: true,
  },
  rightArrowClicked: {
    type: Boolean,
    default: false,
  },
  prevStep: {
    type: Function,
    required: true,
  },
  nextStep: {
    type: Function,
    required: true,
  },
});

const { t } = useI18n();
const user = useUserStore();
const cartStore = useCartStore();
const showFullItinerary = useToggle();

const userDetails = computed(() => user);
const blockTicketDecrease = computed(() => tickets.value === 1);
const totalSoldTickets = computed(() => {
  const { max_pax, available_earlybird_tickets, available_regular_tickets } =
    props.currentTrip;

  return max_pax - (available_earlybird_tickets + available_regular_tickets);
});

const blockTicketIncrease = computed(
  () =>
    totalSoldTickets.value +
      joinerEarlyBirdTickets.value.count +
      joinerRegularTickets.value.count ===
    props.currentTrip.max_pax
);

const departureInfo = computed(() => ({
  origin: props.currentTrip.outbound_from,
  destination: props.currentTrip.outbound_to,
  departureDateTime: props.currentTrip.outbound_from_datetime,
  arrivalDateTime: props.currentTrip.outbound_to_datetime,
  route_points: JSON.parse(props.currentTrip.route_points).oneway,
}));
const returnInfo = computed(() => ({
  origin: props.currentTrip.return_from,
  destination: props.currentTrip.return_to,
  departureDateTime: props.currentTrip.return_from_datetime,
  arrivalDateTime: props.currentTrip.return_to_datetime,
  route_points: JSON.parse(props.currentTrip.route_points).return,
}));

const showRegularTicketInfo = computed(
  () =>
    props.currentTrip.discount_scheme !== DISCOUNT_SCHEME.EARLY_BIRD ||
    props.currentTrip.available_earlybird_tickets < tickets.value
);
const tickets = ref(cartStore.getJoinerTotalTickets(props.currentTrip));
const ticketState = { count: 0, price: 0 };
const joinerEarlyBirdTickets = ref(ticketState);
const joinerRegularTickets = ref(ticketState);
const showGeneralError = useToggle();

const showTicketCountingError = computed(() => {
  const errorMsg =
    tickets.value === 0
      ? t("sharebus.ticket.invalid_ticket_cnt", {
          min: 1,
          max:
            props.currentTrip.available_earlybird_tickets +
            props.currentTrip.available_regular_tickets,
        })
      : tickets.value >
        props.currentTrip.available_earlybird_tickets +
          props.currentTrip.available_regular_tickets
      ? t("sharebus.ticket.only_tickets_remaining", {
          count:
            props.currentTrip.available_earlybird_tickets +
            props.currentTrip.available_regular_tickets,
        })
      : "";

  if (!errorMsg) {
    showGeneralError.toggleShowByValue(false);
  }

  return errorMsg;
});

onMounted(() => {
  if (
    (props.currentTrip.discount_scheme === DISCOUNT_SCHEME.EARLY_BIRD &&
      props.currentTrip.available_earlybird_tickets === 0 &&
      cartStore.getJoinerTickets(props.currentTrip).regularTickets.count ===
        1) ||
    (props.currentTrip.discount_scheme !== DISCOUNT_SCHEME.EARLY_BIRD &&
      cartStore.getJoinerTotalTickets(props.currentTrip) === 1)
  ) {
    const regularTickets = {
      tripId: props.currentTrip.id,
      earlyBirdTickets: {
        count: 0,
        price: 0,
      },
      regularTickets: {
        count: 1,
        price: props.currentTrip.regular_ticket_price,
      },
    };

    cartStore.setJoinerTicketsByTripId(regularTickets, props.currentTrip);

    joinerRegularTickets.value = cartStore.getJoinerTickets(
      props.currentTrip
    ).regularTickets;
  } else if (
    props.currentTrip.discount_scheme === DISCOUNT_SCHEME.EARLY_BIRD &&
    cartStore.getJoinerTickets(props.currentTrip).earlyBirdTickets?.count === 1
  ) {
    if (props.currentTrip.available_earlybird_tickets > 0) {
      const earlyBirdTickets = {
        tripId: props.currentTrip.id,
        earlyBirdTickets: {
          count: 1,
          price: props.currentTrip.earlybird_ticket_price,
        },
        regularTickets: {
          count: 0,
          price: 0,
        },
      };

      cartStore.setJoinerTicketsByTripId(earlyBirdTickets, props.currentTrip);

      joinerEarlyBirdTickets.value = cartStore.getJoinerTickets(
        props.currentTrip
      ).earlyBirdTickets;
    }
  } else {
    cartStore.setJoinerTicketsByTripId(
      cartStore.getJoinerTickets(props.currentTrip),
      props.currentTrip
    );
  }
  tickets.value = cartStore.getJoinerTotalTickets(props.currentTrip);
  scrollToHeight(-1);
});

watch(
  () => showRegularTicketInfo.value,
  (value) => {
    if (!value) {
      setJoinerRegularTickets(ticketState);
    }
  }
);

const setJoinerEarlyBirdTickets = (joinerEBTickets) => {
  joinerEarlyBirdTickets.value = joinerEBTickets;
};

const setJoinerRegularTickets = (joinerRegTickets) => {
  joinerRegularTickets.value = joinerRegTickets;
};

const handleNextStep = () => {
  if (showTicketCountingError.value) {
    showGeneralError.toggleShowByValue(true);
  } else {
    if (
      userDetails.value.currentRole !== ROLE.JOINER &&
      userDetails.value.isAuthenticated
    ) {
      showToast("info", t("home.sharelead_warning"), 3000, "top-left");
      return;
    }
    showGeneralError.toggleShowByValue(false);

    const totalTicketsForTrip = cartStore.getJoinerTotalTickets(
      props.currentTrip
    );
    const isSaveTickets = !cartStore.getJoinerTicketsExist();

    if (isSaveTickets) {
      cartStore.setJoinerTickets({
        tripId: props.currentTrip.id,
        earlyBirdTickets: joinerEarlyBirdTickets.value,
        regularTickets: joinerRegularTickets.value,
      });
    }

    const isUpdateTickets =
      !isSaveTickets && tickets.value !== totalTicketsForTrip;

    if (isUpdateTickets) {
      cartStore.setJoinerTickets(
        {
          tripId: props.currentTrip.id,
          earlyBirdTickets: joinerEarlyBirdTickets.value,
          regularTickets: joinerRegularTickets.value,
        },
        false
      );
    }

    props.nextStep();
  }
};

watch(
  () => props.rightArrowClicked,
  () => {
    handleNextStep();
  }
);
</script>
