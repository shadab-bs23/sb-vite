<template>
  <div class="rounded extended-light-green-bg text-start p-2">
    <span class="ship-gray">{{
      t("sharebus.trip_page.visible_trip_details")
    }}</span>
  </div>
  <div class="d-flex lh-lg align-items-start text-start">
    <span><img src="/img/trip-info/bus-icon.svg" /></span>
    <span class="ms-2 fw-bold fs-4 ship-gray">{{ tripInfo.name }}</span>
  </div>
  <p class="text-start lh-lg ship-gray">
    {{ t("sharebus.publish.organized_by") }}
    <span class="fw-600">{{ tripInfo.trip_organizer }}</span>
  </p>
  <div class="d-flex flex-column align-items-start text-start">
    <span class="ship-gray text-start" v-if="tripInfo.info_to_travellers">
      {{ tripInfo.info_to_travellers }}
    </span>
    <span v-if="tripInfo.website_url" class="text-start"
      ><a
        :href="tripInfo.website_url"
        target="_blank"
        class="text-decoration-underline"
        >{{ tripInfo.website_url }}</a
      ></span
    >
  </div>
  <div class="mt-4 text-start" v-if="tripInfo.image_url">
    <img
      class="banner-picture rounded"
      :src="generatePhotoUrlBasedOnEnv(tripInfo.image_url)"
    />
  </div>
</template>
<script lang="ts" setup>
import { TripGeneralInfo } from "@/store/salesConsole/types";
import { generatePhotoUrlBasedOnEnv } from "@/utils";
import { PropType } from "vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

defineProps({
  tripInfo: {
    type: Object as PropType<TripGeneralInfo>,
    required: true,
  },
});
</script>
<style scoped></style>
