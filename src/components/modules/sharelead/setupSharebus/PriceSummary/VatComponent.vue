<template>
  <small>
    {{ t("sharebus.price_summary.include_vat_short") }}
    {{ vatPercent * 100 }} % ({{ (total * vatPercent).toFixed(2) }})
  </small>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
defineProps({
  total: {
    type: Number,
    required: true,
  },
  vatPercent: {
    type: Number,
    required: true,
  },
});
const { t } = useI18n();
</script>
