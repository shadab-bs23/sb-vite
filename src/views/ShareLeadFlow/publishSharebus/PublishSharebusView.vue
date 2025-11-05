<template>
  <div class="text-start col-sm-12 col-md-8 offset-md-2">
    <BaseBreadcrumbs
      modifier-class="divider p-0"
      crumb-class="crumb fw-bold"
      label-class="crumb-label"
      crumb-link-class="crumb-link ship-gray"
    />
    <h2 class="my-3 fw-600 ship-gray">
      {{ t("sharebus.publish.publish_sharebus") }}
    </h2>
    <p class="ship-gray">
      {{ t("sharebus.publish.publish_info") }}
    </p>
    <h4 class="fw-bold">
      {{ t("common.signage") }}: {{ tripInfo.booking_reference }}
    </h4>

    <PublishSharebusForm :trip-id="tripId" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import PublishSharebusForm from "@/components/modules/sharelead/publishSharebus/publishForm/PublishSharebusForm.vue";
import { useRoute } from "vue-router";
import { useTripStore } from "@/store";
import type { StoreContext } from "@/store/trip/privateTrip/types";

const { t } = useI18n();
const shareLeadTripStore = useTripStore() as unknown as StoreContext;
const route = useRoute();
const tripInfo = computed(() => shareLeadTripStore.getCurrentTrip);
const tripId = computed(() => route.params.tag as string);

onMounted(() => {
  shareLeadTripStore.getTrip(route.params.tag as string);
});
</script>
