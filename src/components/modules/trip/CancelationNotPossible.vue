<template>
  <div class="text-start ship-gray mt-3">
    <h6 class="fw-600">{{ t("sharebus.trip_page.trip_cancel_impossible") }}</h6>
    <p>
      {{ t("sharebus.trip_page.ticket_cancel_impossible") }}
    </p>
    <p>{{ t("sharebus.trip_page.question_on_reservation") }}</p>
    <span
      ><a
        @click="redirectToContact(route.query.tag as string, bookingReference)"
        class="sb-tertiary fw-bold"
        >{{ t("common.get_in_touch") }}
        <i class="ms-2 fi fi-box-arrow-up-right green-jewel"></i>
      </a>
    </span>
  </div>
</template>
<script lang="ts" setup>
import { redirectToContact } from "@/utils";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

defineProps({
  bookingReference: {
    type: String,
    required: true,
  },
});

const { t } = useI18n();
const route = useRoute();
</script>
