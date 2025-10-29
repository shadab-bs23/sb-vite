<template>
  <div class="discount-tiers">
    <div
      v-for="(tier, index) in discountTiers"
      :key="index"
      class="discount-tier mb-2 p-3 border rounded"
    >
      <div
        class="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between"
      >
        <div class="mb-2 mb-sm-0">
          <strong>{{ `${tier.days} ${$t("discount.days")} ` }} </strong>
          <template v-if="index === 0 || !getPreviousTier(index)">
            {{ $t("discount.before_departure_or_less") }}
          </template>
          <template v-else>
            {{ ` ` }}
            {{ $t("discount.to") }}
            {{ getPreviousTier(index)?.days || 0 }}
            {{ $t("discount.days_before_departure") }}
          </template>
          <span class="ms-2 fw-bold">{{ tier.percent }}%</span>
        </div>
        <slot name="remove" :index="index"> </slot>
      </div>
    </div>
    <div v-if="!discountTiers.length" class="mt-3">
      <div class="alert alert-info">
        {{ t("discount.no_discounts") }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import type { TicketDiscount } from "@/store/sharebus/types";
import { t } from "@/locales";

const props = defineProps<{ discountTiers: TicketDiscount[] }>();
defineEmits(["remove"]);

function getPreviousTier(index: number): TicketDiscount | null {
  return index > 0 ? props.discountTiers[index - 1] : null;
}
</script>
