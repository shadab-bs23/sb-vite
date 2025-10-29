<template>
  <!-- Ticket breakdown -->
  <div class="mb-4">
    <div
      v-for="ticket in tickets"
      :key="ticket.categoryName"
      class="d-flex justify-content-between align-items-center px-2 py-2 border-bottom"
    >
      <div class="flex-fill">
        <div class="d-flex align-items-start flex-column gap-1">
          <span class="fw-bold text-dark">
            {{ ticket.quantity }}
            {{ ticket.categoryName }}
          </span>
          <span class="small">{{ routeText }}</span>
        </div>
      </div>
      <div class="fw-600 text-dark">
        {{ roundPriceWithDecimals(ticket.price * ticket.quantity) }} Kr
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, withDefaults } from "vue";
import { TicketItem } from "./types/checkout.types";
import { roundPriceWithDecimals } from "@/store/cart/cart.utils";

withDefaults(
  defineProps<{
    tickets: TicketItem[];
    routeText: string;
  }>(),
  {
    tickets: () => [],
  }
);

// Export the component
defineExpose({});
</script>

<style lang="scss" scoped>
// ...existing code...
</style>
