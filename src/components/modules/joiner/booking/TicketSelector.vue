<template>
  <div class="ticket-selector text-start">
    <!-- Ticket Selection Section -->
    <div class="py-2">
      <h4 class="fw-600 fs-22 text-dark mb-3">
        {{ $t("sharebus.ticket_selector.select_travelers") }}
      </h4>
      <small class="text-muted">
        {{ $t("sharebus.ticket_selector.price_varies_by_embark") }}
      </small>
      <br />
      <small class="text-muted" v-if="eligibleDiscountPercent > 0">
        {{ $t("sharebus.ticket_selector.early_bird_surprise") }}
        <span class="badge bg-success text-white small px-2 py-1 rounded">
          {{ eligibleDiscountPercent }}%
        </span>
        {{ $t("sharebus.ticket_selector.discount_if_book_today") }}
      </small>

      <!-- Loop through ticket categories -->
      <div
        v-for="category in ticketCategories"
        :key="category.key"
        class="d-flex align-items-center justify-content-between py-2 gap-5"
      >
        <div class="d-flex align-items-start flex-column gap-2 mt-3">
          <h4 class="fw-600 fs-18 text-dark m-0">{{ category.label }}</h4>

          <div
            v-if="showAvailableSeats"
            class="d-flex align-items-center gap-2"
          >
            <span class="badge bg-success text-white small px-2 py-1 rounded">
              {{ availableSeats }} {{ $t("sharebus.ticket_selector.left") }}
            </span>
          </div>
        </div>

        <div class="d-flex align-items-center gap-4">
          <!-- Exact trip price -->
          <span
            v-if="eligibleDiscountPercent > 0"
            class="fw-600 text-decoration-line-through fs-5 text-dark"
          >
            {{ formatPrice(category.price) }} kr
          </span>

          <!-- Discounted price -->
          <span class="fw-600 fs-18 text-dark">
            {{
              formatPrice(
                category.price * (1 - (eligibleDiscountPercent || 0) / 100)
              )
            }}
            kr
          </span>

          <div
            class="quantity-controls d-flex align-items-center justify-content-between gap-2"
          >
            <button
              class="btn btn-outline-secondary rounded-circle quantity-btn minus-btn"
              :disabled="ticketQuantities[category.key] <= 0"
              @click="decreaseQuantity(category.key)"
            ></button>

            <input
              v-model="ticketQuantities[category.key]"
              class="form-control text-center fw-600 quantity-input"
              min="0"
              :max="props.availableSeats"
              type="number"
              @input="validateQuantity(category.key, $event)"
              @blur="handleBlur(category.key, $event)"
            />

            <button
              class="btn btn-success rounded-circle quantity-btn plus-btn"
              :disabled="getTotalTickets() >= availableSeats"
              @click="increaseQuantity(category.key, availableSeats)"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TicketDiscount } from "@/store/sharebus/types";
import { getEligibleDiscount } from "@/utils/discountCalculator";
import { ref, computed, watch } from "vue";
import { TViaPoints as ViaPointType } from "@/components/ViaPointsPackage/types/types";
import { useCartRestoration } from "@/composables/useCartRestoration";
import { roundPriceWithDecimals } from "@/store/cart/cart.utils";

interface CategoryPrice {
  name: string;
  price: number;
}

interface ViaPoint {
  id: number;
  category_prices?: CategoryPrice[];
}

interface TicketPricing {
  via_points?: ViaPoint[];
}

interface TicketCategory {
  key: string;
  label: string;
  description?: string;
  price: number;
}

interface Props {
  selectedPickupPoint?: ViaPointType | null;
  destinationPoint?: ViaPointType | null;
  ticketPricing?: TicketPricing;
  ticketDiscounts?: TicketDiscount[];
  availableSeats?: number;
  departureDate?: string | null;
  showAvailableSeats: boolean;
}

type TicketQuantities = Record<string, number>;

const props = withDefaults(defineProps<Props>(), {
  availableSeats: 45,
});

const emit = defineEmits<{
  "cart-updated": [
    cartData: {
      tickets: Array<{
        categoryName: string;
        quantity: number;
        price: number;
      }>;
      eligibleDiscountPercent: number;
    }
  ];
}>();

const { useTicketRestoration } = useCartRestoration({
  debugPrefix: "TicketSelector",
  onRestore: (restoredData) => {
    if (restoredData.type === "ticket-quantities") {
      // Emit the restored ticket data
      emitTicketsSelected();
    }
  },
});

const eligibleDiscountPercent = computed(() => {
  if (!props.ticketDiscounts || !props.departureDate) {
    return 0;
  }
  return getEligibleDiscount(
    props.ticketDiscounts || [],
    props.departureDate || ""
  );
});

const emitTicketsSelected = () => {
  emitCartData();
};

const emitCartData = () => {
  if (!props.selectedPickupPoint || ticketCategories.value.length === 0) {
    emit("cart-updated", { tickets: [], eligibleDiscountPercent: 0 });
    return;
  }

  // Create simplified ticket items only for categories with quantity > 0
  const cartTickets = ticketCategories.value
    .filter((category) => (ticketQuantities.value[category.key] || 0) > 0)
    .map((category) => {
      const quantity = ticketQuantities.value[category.key] || 0;
      const discountedPrice = roundPriceWithDecimals(
        category.price * (1 - eligibleDiscountPercent.value / 100)
      );
      return {
        categoryName: category.label,
        quantity,
        price: discountedPrice, // Price per ticket after discount
      };
    });

  const cartData = {
    tickets: cartTickets,
    eligibleDiscountPercent: eligibleDiscountPercent.value,
  };

  emit("cart-updated", cartData);
};
// Get ticket categories from trip pricing data
const ticketCategories = computed<TicketCategory[]>(() => {
  if (!props.selectedPickupPoint || !props.ticketPricing?.via_points) {
    return [];
  }

  const viaPoint = props.ticketPricing.via_points.find(
    (point) => point.id === props.selectedPickupPoint?.id
  );

  if (!viaPoint?.category_prices) {
    return [];
  }

  // Map category prices to ticket categories with proper labels and descriptions
  return viaPoint.category_prices.map((categoryPrice) => {
    const key = categoryPrice.name.toLowerCase();
    let label = categoryPrice.name;

    return {
      key,
      label,
      price: categoryPrice.price,
    };
  });
});

// Initialize reactive state based on categories
const initializeTicketQuantities = (): TicketQuantities => {
  const categories = ticketCategories.value;
  if (categories.length === 0) {
    return {};
  }

  return categories.reduce((acc, category) => {
    acc[category.key] = 0;
    return acc;
  }, {} as TicketQuantities);
};

const ticketQuantities = ref<TicketQuantities>({});

// Use composable for ticket restoration
useTicketRestoration(
  ticketCategories,
  ticketQuantities,
  computed(() => props.selectedPickupPoint?.id || null),
  initializeTicketQuantities
);

// Watch for changes in selected pickup point and reset quantities only if pickup point actually changes
watch(
  [() => props.selectedPickupPoint?.id, () => props.ticketPricing],
  ([newPickupPointId], [oldPickupPointId]) => {
    // Only reset if pickup point actually changed (not on initial load)
    if (
      oldPickupPointId !== undefined &&
      newPickupPointId !== oldPickupPointId
    ) {
      console.log("Pickup point changed, resetting quantities:", {
        oldPickupPointId,
        newPickupPointId,
      });
      ticketQuantities.value = initializeTicketQuantities();
      emitTicketsSelected();
    }
  },
  { immediate: false } // Don't run immediately to let watchEffect handle initial restoration
);

// Helper functions
const formatPrice = (price: number): number => {
  return roundPriceWithDecimals(price, 2);
};

const getTotalTickets = (): number => {
  return Object.values(ticketQuantities.value).reduce(
    (total, quantity) => total + quantity,
    0
  );
};

// Quantity management
const increaseQuantity = (categoryKey: string, leftTicket: number) => {
  if (getTotalTickets() < leftTicket) {
    ticketQuantities.value[categoryKey]++;
    emitTicketsSelected();
  }
};

const decreaseQuantity = (categoryKey: string) => {
  if (ticketQuantities.value[categoryKey] > 0) {
    ticketQuantities.value[categoryKey]--;
    emitTicketsSelected();
  }
};

const validateQuantity = (categoryKey: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  const rawValue = target.value;

  // Allow empty input temporarily during typing
  if (rawValue === "" || rawValue === null || rawValue === undefined) {
    // Don't update the reactive data, just let the user continue typing
    return;
  }

  const value = parseInt(rawValue, 10);

  // Handle invalid input (NaN)
  if (isNaN(value)) {
    // Reset to 0 for invalid input
    ticketQuantities.value[categoryKey] = 0;
    emitTicketsSelected();
    return;
  }

  // Calculate total tickets selected excluding the current category
  const totalOtherTickets = Object.entries(ticketQuantities.value)
    .filter(([key]) => key !== categoryKey)
    .reduce((sum, [, quantity]) => sum + (quantity || 0), 0);

  const maxAllowedForCategory = props.availableSeats - totalOtherTickets;

  let finalValue: number;
  if (value < 0) {
    finalValue = 0;
  } else if (value > maxAllowedForCategory) {
    finalValue = maxAllowedForCategory;
  } else {
    finalValue = value;
  }

  // Update reactive data
  ticketQuantities.value[categoryKey] = finalValue;

  emitTicketsSelected();
};

const handleBlur = (categoryKey: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  const rawValue = target.value;

  // If the input is empty on blur, set to 0
  if (rawValue === "" || rawValue === null || rawValue === undefined) {
    ticketQuantities.value[categoryKey] = 0;
    emitTicketsSelected();
  }
};
</script>

<style lang="scss" scoped>
.quantity-controls {
  height: 46px;
  max-width: 185px;
  // background: #000;
}

.quantity-btn {
  width: 46px;
  height: 46px;
  font-size: 18px;
  cursor: pointer;
  // position: absolute;
  z-index: 2;

  &.minus-btn {
    left: 0;
    color: #138340;
    &::after {
      content: "−";
      color: #138340;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed !important;
    }
    &:not(:disabled):hover {
      background-color: #f3fbf6;
    }
  }

  &.plus-btn {
    color: #fff;
    right: 0;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      background-color: #0c6d32;
    }
  }
}

.quantity-input {
  width: 100%;
  height: 46px;
  border: 1px solid #d5d6d5;
  border-radius: 6px;
  background-color: #fefffe;
  color: #000000;
  padding: 12px;
  border: none;
  outline: none;
  position: relative;
  font-size: 16px;
  border: 1px solid #d5d6d5;
  width: 55px;

  // Remove number input arrows
  appearance: textfield;
  -moz-appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:focus {
    outline: none;
    border-color: #138340;
  }
}
</style>
