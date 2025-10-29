<template>
  <div v-if="cartItems && cartItems.length > 0" class="bg-white rounded">
    <!-- Cart Header -->
    <div class="cart-header d-flex align-items-center gap-2 pb-3">
      <i class="fi fi-cart3 fs-24 fw-600 text-dark"></i>
      <h4 class="fs-24 fw-600 text-dark mb-0">
        {{ $t("sharebus.booking_cart.your_cart") }}
      </h4>
    </div>

    <!-- Cart Content -->
    <div class="cart-content">
      <!-- Routes and tickets -->
      <div
        v-for="(route, routeIndex) in displayRoutes"
        :key="`route-${routeIndex}`"
        class="route-section"
      >
        <!-- Route header (From -> To) -->
        <div class="d-flex align-items-center gap-3 mb-2">
          <span class="fs-18">{{ splitAndGetFirstElement(route.from) }}</span>
          <div class="d-flex align-items-center">{{ showArrow }}</div>
          <span class="fs-18">{{ splitAndGetFirstElement(route.to) }}</span>
        </div>
        <!-- Tickets for this route -->
        <div
          v-for="(ticket, ticketIndex) in route.tickets"
          :key="`ticket-${routeIndex}-${ticketIndex}`"
          class="ticket-row d-flex align-items-center justify-content-between py-1"
        >
          <div
            class="d-flex align-items-center justify-content-between gap-1 py-1"
          >
            <small>
              <i class="fi fi-x-lg fs-14 primary"></i>
            </small>
            <span class="ms-2">{{ ticket.quantity }}</span>
            <span>{{ ticket.category }}</span>
          </div>
          <div class="fs-18">{{ ticket.total }} kr</div>
          <!-- <button
            class="btn btn-link p-0 text-decoration-none"
            @click="$emit('ticket-removed', ticket.categoryName)"
          >
            <i class="fi fi-trash-can fs-16 text-danger"></i>
          </button> -->
        </div>

        <!-- Route separator (except for last route) -->
        <hr
          v-if="routeIndex < displayRoutes.length - 1"
          class="route-separator my-3"
        />
      </div>

      <!-- Total separator -->
      <hr class="total-separator my-3" />

      <!-- Total -->
      <div
        class="total-row d-flex align-items-center justify-content-between pb-4"
      >
        <span class="fs-20 fw-bold">{{ $t("sharebus.checkout.total") }}</span>
        <span class="fs-20 fw-bold">{{ totalAmount }} kr</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { splitAndGetFirstElement } from "@/utils";
import { computed } from "vue";
import { useCartStore } from "@/store";
import { roundPriceWithDecimals } from "@/store/cart/cart.utils";

interface TicketItem {
  categoryName: string;
  quantity: number;
  price: number;
}

// Interface for display purposes (to maintain original UI)
interface DisplayTicket {
  category: string;
  quantity: number;
  total: number;
  categoryName: string; // Keep for emit
}

interface DisplayRoute {
  from: string;
  to: string;
  tickets: DisplayTicket[];
}

interface Props {
  cartItems?: TicketItem[];
  selectedPickupPoint?: { point?: string } | null;
  destinationPoint?: { point?: string } | null;
  isRoundTrip?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  cartItems: () => [],
  selectedPickupPoint: null,
  destinationPoint: null,
});

// Transform simple ticket data into route-based display format
const displayRoutes = computed<DisplayRoute[]>(() => {
  // Create a single route from pickup point to destination
  const fromPoint = props.selectedPickupPoint?.point || "";
  const toPoint = props.destinationPoint?.point || "";

  const displayTickets: DisplayTicket[] = props.cartItems.map((ticket) => ({
    category: ticket.categoryName,
    quantity: ticket.quantity,
    total: roundPriceWithDecimals(ticket.price * ticket.quantity),
    categoryName: ticket.categoryName, // For emit purposes
  }));

  return [
    {
      from: fromPoint,
      to: toPoint,
      tickets: displayTickets,
    },
  ];
});
// show right arrow based on round trip or one way
const showArrow = computed(() => {
  return props.isRoundTrip ? "⟷" : "→";
});

const cartStore = useCartStore();

// Calculate total amount across all tickets
const totalAmount = computed(() => {
  return cartStore.getTotalPrice();
});
</script>

<style lang="scss" scoped>
.shopping-cart-container {
  .cart-content {
    .route-section {
      margin-bottom: 12px;
    }
  }
}
</style>
