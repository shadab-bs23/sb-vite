<template>
  <ul>
    <li>
      <div class="d-flex justify-content-between">
        <div class="d-flex flex-column align-items-start">
          <div class="d-flex">
            <span class="fw-bold ship-gray">{{
              t("sharebus.price_info.ticket_price")
            }}</span>
            <span class="ms-1">
              <img src="/img/trip-info/info-icon.svg" />
            </span>
          </div>
          <p
            class="ship_gray text-start"
            v-if="tripInfo.trip_type == TRIP_TYPE.ROUND"
          >
            {{ t("sharebus.price_info.roundtrip") }}
          </p>
        </div>
        <div class="d-flex">
          <span class="fw-bold ship-gray"
            >{{ tripInfo.regular_ticket_price }} &nbsp;</span
          >
          <span class="ship_gray">Kr</span>
        </div>
      </div>
    </li>
  </ul>
  <span v-if="tripInfo.earlybird_ticket_price > 0"> <hr /></span>
  <ul v-if="tripInfo.earlybird_ticket_price > 0">
    <li>
      <div class="d-flex justify-content-between">
        <div class="d-flex flex-column align-items-start">
          <div class="d-flex">
            <span class="fw-bold ship-gray">
              {{ t("sharebus.price_info.early_bird_price") }}</span
            >
            <span class="ms-1">
              <img src="/img/trip-info/info-icon.svg" />
            </span>
          </div>
          <p class="ship_gray text-start">
            {{ t("sharebus.price_info.ten_first_passenger_sentence") }}
          </p>
        </div>
        <div class="d-flex">
          <span class="fw-bold ship-gray text-start"
            >{{ tripInfo.earlybird_ticket_price }} &nbsp;</span
          >
          <span class="ship_gray text-start">Kr</span>
        </div>
      </div>
    </li>
  </ul>
</template>
<script lang="ts" setup>
import { useTripStore } from "@/store";
import { useI18n } from "vue-i18n";
import { computed, PropType } from "vue";
import { TRIP_TYPE } from "./tripStatus/tripStatusEnum";
import { Trip } from "@/store/trip/privateTrip/types";
defineProps({
  tripInfo: {
    type: Object as PropType<Trip>,
    required: true,
  },
});
const { t } = useI18n();
const shareLeadTripStore = useTripStore();
const tripInfo = computed(() => shareLeadTripStore.currentTrip);
</script>
