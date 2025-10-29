<template>
  <div class="extended-green-bg mt-5 mb-3 d-flex p-3">
    <span class="me-2">
      <img src="/img/trip-info/check-sign-green.svg" />
    </span>
    <div class="text-start ms-2" v-if="bonusTickets === 0">
      <p class="fw-bold">
        {{ t("sharebus.bonus_info.bus_will_go", { tickets: tickets }) }}
      </p>
    </div>
    <div class="text-start ms-2" v-else>
      <p class="fw-bold">
        {{
          t("sharebus.bonus_info.bonus_will_be_available", { tickets: tickets })
        }}
      </p>
      <p class="fw-bold mt-4">
        {{
          t("sharebus.bonus_info.bonus_will_get", {
            bonus_tickets: bonusTickets,
          })
        }}
      </p>
      <p>{{ t("sharebus.bonus_info.share") }}</p>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineProps({
  tickets: {
    type: Number,
    required: true,
  },
  bonusTickets: {
    type: Number,
    required: true,
  },
});
</script>
