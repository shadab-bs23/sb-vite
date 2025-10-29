<template>
  <ul class="py-0 cursor-pointer">
    <li>
      <div v-if="!toggle.show.value" class="d-flex" @click="toggle.toggleShow">
        <span class="ship-gray fw-bold">
          {{ t("sharebus.booking.view_details") }}
        </span>
        <span class="ms-2"><img src="/img/trip-info/down-arrow.svg" /></span>
      </div>
      <div v-if="toggle.show.value" class="d-flex" @click="toggle.toggleShow">
        <span class="fw-bold ship-gray">
          {{ t("sharebus.booking.hide_details") }}
        </span>
        <span class="ms-2"><img src="/img/trip-info/up-arrow.svg" /></span>
      </div>
      <div class="row col-sm-12 col-md-12 mt-3" v-if="toggle.show.value">
        <div
          class="col-sm-12"
          :class="!isHorizontal ? 'col-md-12 mt-3' : 'col-md-6'"
        >
          <TripInfoDetails
            :trip-info="departureInfo"
            :is-horizontal="isHorizontal"
          />
        </div>
        <div
          class="col-sm-12"
          :class="!isHorizontal ? 'col-md-12 mt-3' : 'col-md-6'"
          v-if="returnInfo.arrivalDateTime"
        >
          <TripInfoDetails
            v-if="returnInfo.arrivalDateTime"
            :trip-info="returnInfo"
            :is-horizontal="isHorizontal"
            :is-return-trip="true"
          />
        </div>
      </div>
    </li>
  </ul>
  <slot name="ticketPriceInfo" v-if="toggle.show.value"></slot>
</template>
<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { useToggle } from "@/composables/useToggle";
import TripController from "../sharelead/controllers/TripController";
import TripInfoDetails from "../sharelead/setupSharebus/TripInfo/TripInfoDetails.vue";
const props = defineProps({
  isHorizontal: {
    type: Boolean,
    default: true,
  },
  isShareLeadOriginated: {
    type: Boolean,
    default: true,
  },
});
const { t } = useI18n();
const toggle = useToggle();
const departureInfo = TripController.getTripDeparture(
  props.isShareLeadOriginated
);
const returnInfo = TripController.getTripReturn(props.isShareLeadOriginated);
</script>
