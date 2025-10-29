<template>
  <div class="discount-manager">
    <h4 class="mb-4 fw-600">{{ $t("discount.discounts") }}</h4>

    <TimeBasedDiscount
      :discount-tiers="discountTiers"
      @update:discountTiers="handleDiscountTiersUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import TimeBasedDiscount from "./TimeBasedDiscount.vue";
import { useSharebusStore } from "@/store";
import { TicketDiscount } from "@/store/sharebus/types";
import { deepClone } from "@/utils";

// Setup
const emit = defineEmits(["update:ticketDiscounts"]);
const sharebusStore = useSharebusStore();

// Reactive state
const discountTiers = ref<TicketDiscount[]>([]);

// Get discount data from store
const storeTicketDiscounts = computed(
  () => sharebusStore.getPassengerGoalAndPriceStepData?.ticket_discounts || []
);

// Default configuration for new discounts
const defaultDiscounts: TicketDiscount[] = [];

// Initialize component with data from store or defaults
onMounted(() => {
  initializeFromStore();
});

// Initialize component from store data or with defaults
const initializeFromStore = () => {
  const existingDiscounts = storeTicketDiscounts.value;

  if (existingDiscounts && existingDiscounts.length > 0) {
    // Use stored discounts if available
    discountTiers.value = deepClone(existingDiscounts);
  } else {
    // Use default configuration
    discountTiers.value = deepClone(defaultDiscounts);
  }

  // Sync with store on initialization
  syncWithStore();
};

// Event handlers for child component updates
const handleDiscountTiersUpdate = (newTiers: TicketDiscount[]) => {
  discountTiers.value = deepClone(newTiers);
  syncWithStore();
};

// Update store values
const syncWithStore = () => {
  // Emit to parent component
  emit("update:ticketDiscounts", deepClone(discountTiers.value));

  // Update store
  sharebusStore.setPassengerGoalAndPriceStepDataSpecific(
    "ticket_discounts",
    deepClone(discountTiers.value)
  );

  // Also update through the dedicated action
  sharebusStore.updateTicketDiscounts(deepClone(discountTiers.value));

  // Update discount scheme if there are discounts
  if (discountTiers.value.length > 0) {
    sharebusStore.setPassengerGoalAndPriceStepDataSpecific(
      "discountScheme",
      "NONE"
    );
  }
};

// Generate the API payload format for discounts
const getDiscountPayload = () => {
  const discounts: Record<string, { value: number }> = {};

  if (discountTiers.value && discountTiers.value.length > 0) {
    discountTiers.value.forEach((tier) => {
      discounts[tier.days.toString()] = {
        value: tier.percent,
      };
    });
  }

  return discounts;
};

// Expose methods for parent component
defineExpose({
  getDiscountPayload,
  getTicketDiscountsPayload: () => deepClone(discountTiers.value),
});

// Watch for external changes to store data
watch(
  storeTicketDiscounts,
  (newDiscounts) => {
    // Check if discounts have changed
    const storeJSON = JSON.stringify(newDiscounts || []);
    const localJSON = JSON.stringify(discountTiers.value);

    if (storeJSON !== localJSON && Array.isArray(newDiscounts)) {
      discountTiers.value = deepClone(newDiscounts);
    }
  },
  { deep: true, immediate: true }
);
</script>
