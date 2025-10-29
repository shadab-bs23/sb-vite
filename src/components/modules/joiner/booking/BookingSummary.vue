<template>
  <div class="rounded border joiner-booking-summary ship-gray text-start">
    <slot name="title"></slot>
    <ul>
      <li v-for="ticketGroup in groupedTickets" :key="ticketGroup.categoryName">
        <div class="d-flex justify-content-between align-items-center">
          <span class="fw-normal fs-18">
            {{ ticketGroup.totalQuantity }} x
            <span class="fw-semibold fs-18">{{
              ticketGroup.categoryName
            }}</span>
            <!-- <span> - {{ selectedPickupPointName }}</span> -->
          </span>
          <span class="fw-bold fs-18">{{ ticketGroup.totalPrice }} kr</span>
        </div>
        <div class="mt-1">
          <small class="ms-3">
            {{ selectedPickupPointName }}
            <span class="mx-2">⟷</span>
            {{ finalDestination }}
          </small>
        </div>
      </li>
    </ul>
    <span><hr /></span>
    <ToogleTripInfoWrapper
      :is-horizontal="false"
      :is-share-lead-originated="notGuestShow"
    />

    <hr class="total-payment-line" v-if="total" />
    <ul v-if="total" class="py-0">
      <li class="d-flex justify-content-between align-items-center">
        <span class="ship-gray">
          <strong>
            {{ t("sharebus.price_summary.total_payment") }}</strong
          ></span
        >
        <span class="ship-gray"
          ><small>Kr</small> &nbsp;
          <span class="fw-600 fs-2">{{ total }},-</span></span
        >
      </li>
    </ul>
    <slot name="other_info"></slot>
  </div>
</template>
<script lang="ts" setup>
import { computed, PropType } from "vue";
import { PublicTrip } from "@/store/trip/joiner/types";
import ToogleTripInfoWrapper from "@/components/modules/trip/ToogleTripInfoWrapper.vue";
import { useI18n } from "vue-i18n";
import { splitAndGetFirstElement } from "@/utils";
import { Trip } from "@/store/trip/privateTrip/types";
import { TicketItem } from "@/store/cart/types";
import { useCartStore } from "@/store";

const { t } = useI18n();
const cartStore = useCartStore();

const props = defineProps({
  currentTrip: {
    type: Object as PropType<PublicTrip | Trip>,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  tickets: {
    type: Array as PropType<TicketItem[]>,
    required: true,
  },
  notGuestShow: {
    type: Boolean,
    default: false,
  },
});

const currentTripOnewayRoutePoints = computed(() => {
  try {
    return JSON.parse(props.currentTrip.route_points)?.oneway || [];
  } catch (error) {
    console.error("Error parsing route points:", error);
    return [];
  }
});

const selectedPickupPoint = computed(() => {
  const selectedViaPointId = cartStore.$state.selectedViaPointId;
  if (!selectedViaPointId || !currentTripOnewayRoutePoints.value.length) {
    return null;
  }

  return currentTripOnewayRoutePoints.value.find(
    (point: { id: number; point: string }) => point.id === selectedViaPointId
  );
});

const selectedPickupPointName = computed(() => {
  return splitAndGetFirstElement(
    selectedPickupPoint.value?.point || "Oslo",
    ","
  );
});

const finalDestination = computed(() => {
  const routePoints = currentTripOnewayRoutePoints.value;
  if (!routePoints || routePoints.length === 0) {
    return props.currentTrip?.outbound_to || "Lillehammer";
  }

  const lastPoint = routePoints[routePoints.length - 1];
  return splitAndGetFirstElement(lastPoint?.point || "Lillehammer", ",");
});

const validTickets = computed(() => {
  return props.tickets.filter((ticket) => ticket.quantity > 0);
});

const groupedTickets = computed(() => {
  const grouped: {
    [key: string]: {
      categoryName: string;
      totalQuantity: number;
      totalPrice: number;
    };
  } = {};

  validTickets.value.forEach((ticket) => {
    if (!grouped[ticket.categoryName]) {
      grouped[ticket.categoryName] = {
        categoryName: ticket.categoryName,
        totalQuantity: 0,
        totalPrice: 0,
      };
    }
    grouped[ticket.categoryName].totalQuantity += ticket.quantity;
    grouped[ticket.categoryName].totalPrice += ticket.price * ticket.quantity;
  });

  return Object.values(grouped);
});
</script>
