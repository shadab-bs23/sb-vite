<template>
  <div class="price-summary-wrapper" :class="customClass">
    <ul
      v-if="
        priceSummary.chosenDiscount === DISCOUNT_SCHEME.EARLY_BIRD &&
        priceSummary.deductibleAmount as number > 0
      "
    >
      <li class="d-flex justify-content-between">
        <span class="ship-gray">
          {{ t("sharebus.price_summary.early_bird_discount_fee") }}
        </span>
        <span class="ship-gray">{{ priceSummary.deductibleAmount }},-</span>
      </li>
    </ul>
    <ul
      v-else-if="priceSummary.chosenDiscount === DISCOUNT_SCHEME.CUT_PRICE && priceSummary.deductibleAmount as number > 0"
    >
      <li class="d-flex justify-content-between">
        <span class="ship-gray">
          {{ t("sharebus.price_summary.cut_price_deductible") }}
        </span>
        <span class="ship-gray">{{ priceSummary.deductibleAmount }},-</span>
      </li>
      <li
        class="d-flex justify-content-between"
        v-if="priceSummary.tickets as number >= TICKET_NUMBER.MIN"
      >
        <span class="ship-gray">
          {{ t("sharebus.price_summary.cut_price_tickets") }}
          {{ priceSummary.tickets }} x {{ priceSummary.ticketPrice }}
        </span>
        <span class="ship-gray">{{ priceSummary.totalTicketPrice }},-</span>
      </li>
    </ul>

    <ul
      v-else-if="
        priceSummary.chosenDiscount === DISCOUNT_SCHEME.NONE && priceSummary.tickets as number >= TICKET_NUMBER.MIN
      "
    >
      <li class="d-flex justify-content-between">
        <span class="ship-gray">
          {{ t("sharebus.price_summary.regular_ticket") }}
          {{ priceSummary.tickets }} x {{ priceSummary.ticketPrice }}
        </span>
        <span class="ship-gray">{{ priceSummary.totalTicketPrice }},-</span>
      </li>
    </ul>

    <slot name="details"></slot>

    <hr
      class="total-payment-line"
      v-if="priceSummary.grandTotalPrice as number > 0"
    />
    <ul
      v-if="priceSummary.chosenDiscount && priceSummary.grandTotalPrice as number > 0"
    >
      <slot name="grandTotal">
        <li class="d-flex justify-content-between">
          <span class="ship-gray">
            <strong>
              {{ t("sharebus.price_summary.total_payment") }}</strong
            ></span
          >
          <span class="ship-gray"
            ><small>Kr</small> &nbsp;
            <span class="fw-bold"
              >{{ priceSummary.grandTotalPrice }},-</span
            ></span
          >
        </li>
      </slot>
    </ul>
  </div>
</template>
<script lang="ts" setup>
import { DISCOUNT_SCHEME } from "../enums/SetUpShareBusEnum";
import { useI18n } from "vue-i18n";
import ShareBusSetUpController from "../Controllers/ShareBusSetUpController";
defineProps({
  customClass: {
    type: String,
    required: false,
    default: "p4",
  },
  priceSummary: {
    type: Object,
    required: true,
  },
  vatPercent: {
    type: Number,
    required: true,
  },
});
const { t } = useI18n();
const TICKET_NUMBER = ShareBusSetUpController.getTicketNumberLimit;
</script>
<style lang="scss">
.price-summary-wrapper ul {
  padding-left: 0;
  li {
    max-width: 100%;
    list-style-type: none;
  }
}
.payment-summary ul {
  padding: 0.7rem 0.7rem 0rem 0.7rem;
}
</style>
