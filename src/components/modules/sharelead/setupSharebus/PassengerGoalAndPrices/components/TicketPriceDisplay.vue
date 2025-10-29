<template>
  <div class="mt-4">
    <h4 class="fs-22 mb-3 fw-600 text-start">{{ t("setup.ticket_prices") }}</h4>
    <div class="row">
      <div
        class="ms-3 ticket-price-section col-12 col-md-6 col-lg-4 p-3 border rounded"
      >
        <div
          class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center"
        >
          <div class="text-start fw-600 mb-2 mb-sm-0">
            <span class="fs-18">{{ t("setup.suggested_ticket_price") }}</span>
            <i
              class="fi fi-info-circle ms-1"
              :title="t('setup.recommended_price_tooltip')"
            ></i>
          </div>
          <div class="text-sm-end">
            <strong class="fw-bold"
              >{{ ticketPrice }} {{ t("common.currency") }}</strong
            >
            <div class="small text-muted">
              {{ t("setup.full_route_roundtrip") }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

defineProps({
  ticketPrice: {
    type: Number,
    required: true,
  },
});

const { t } = useI18n();
</script>

<style lang="scss" scoped>
.ticket-price-section {
  background-color: white;
  transition: all 0.3s ease;
}

@media (max-width: 576px) {
  .ticket-price-section {
    padding: 0.75rem !important;
  }
}
</style>
