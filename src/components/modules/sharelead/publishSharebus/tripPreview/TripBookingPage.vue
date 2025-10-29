<template>
  <div>
    <p>
      {{ t("sharebus.booking.trip_booking_preview_description") }}
    </p>
    <BaseCard
      card-class="px-2 border-0 shadow-lg col-md-10 col-sm-10 mx-auto py-2"
    >
      <template v-slot:content>
        <h3 class="text-start ms-2 mb-4">
          <span class="me-2"><img src="/img/my-busses/bus-logo.svg" /></span
          >{{ tripData.tripName }}
        </h3>
        <p v-if="tripData.organizer">
          {{ t("sharebus.publish.organized_by") }}
          <span class="fw-bold">{{ tripData.organizer }}</span>
        </p>
        <p>{{ tripData.infoToTravelers }}</p>
        <a
          v-if="tripData.eventLink"
          :href="tripData.eventLink"
          class="sb-tertiary"
          target="_blank"
        >
          {{ t("sharebus.publish.link_to_event")
          }}<i class="fi fi-box-arrow-up-right green-jewel ms-2"> </i>
        </a>

        <div class="row col-12 mt-3">
          <div class="col-sm-12 col-md-12">
            <TripInfoDetails :trip-info="departureInfo" />
          </div>
          <div class="col-12">
            <TripInfoDetails
              v-if="returnInfo.departureDateTime"
              :trip-info="returnInfo"
              :is-return-trip="true"
            />
          </div>
        </div>
      </template>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import BaseCard from "@busgroup/vue3-base-card";
import TripInfoDetails from "../../setupSharebus/TripInfo/TripInfoDetails.vue";
import { PropType } from "vue";
import { PublishFormType } from "../publishForm/types";

defineProps({
  tripData: {
    type: Object as PropType<PublishFormType>,
    required: true,
  },
  departureInfo: {
    type: Object,
    required: true,
  },
  returnInfo: {
    type: Object,
    required: false,
    default: null,
  },
});
const { t } = useI18n();
</script>
