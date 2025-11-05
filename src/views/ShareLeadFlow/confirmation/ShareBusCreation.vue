<template>
  <div
    class="d-flex flex-column offset-md-2 col-sm-12 col-md-5"
    v-if="tripInfo.id"
  >
    <div class="d-flex mb-2">
      <span class="rounded-circle trip-sign-rounded"
        ><img class="align-baseline" src="/img/trip-info/check-sign.svg"
      /></span>
      <span class="ms-2 ship-gray"
        ><h3 class="fw-bold ship-gray">
          {{ t("sharebus.booking.thank_you_creating") }} #{{
            tripInfo.booking_reference
          }}
        </h3></span
      >
    </div>
    <div class="ticket-price-info border rounded">
      <ul>
        <li>
          <div class="row col-sm-12 col-md-12 mt-3">
            <div class="col-sm-12 col-md-6">
              <TripInfoDetails
                :trip-info="departureInfo"
                :is-horizontal="true"
              />
            </div>
            <div class="col-sm-12 col-md-6" v-if="returnInfo.departureDateTime">
              <TripInfoDetails
                :trip-info="returnInfo"
                :is-horizontal="true"
                :is-return-trip="true"
              />
            </div>
          </div>
        </li>
      </ul>
      <hr />
      <PriceInfo :tripInfo="tripInfo" />
    </div>
    <div
      class="text-start d-flex flex-column justify-content-center align-items-start"
    >
      <div class="vertical-line d-inline-block ms-2"></div>
      <span class="fw-bold">
        <i class="fi fi-circle light-gray-2 me-2"> </i>
        {{ t("common.almost_done") }}
      </span>
    </div>
    <PublishSharebus />
  </div>
</template>
<script setup lang="ts">
import PriceInfo from "@/components/modules/sharelead/trip/PriceInfo.vue";
import PublishSharebus from "@/components/modules/payment/PublishSharebus.vue";
import { useI18n } from "vue-i18n";
import TripInfoDetails from "@/components/modules/sharelead/setupSharebus/TripInfo/TripInfoDetails.vue";
import TripController from "@/components/modules/sharelead/controllers/TripController";
import { computed, onMounted } from "vue";
import { useTripStore } from "@/store";
import { useRoute } from "vue-router";
import type { StoreContext } from "@/store/trip/privateTrip/types";
const { t } = useI18n();

const departureInfo = TripController.getTripDeparture();
const route = useRoute();
const returnInfo = TripController.getTripReturn();
const shareleadTripStore = useTripStore() as unknown as StoreContext;
onMounted(() => {
  shareleadTripStore.getTrip(route.params.tag as string);
});
const tripInfo = computed(() => shareleadTripStore.currentTrip);
</script>
<style lang="scss">
.ticket-price-info ul {
  li {
    max-width: 100%;
    list-style-type: none;
  }
  padding: 0.7rem 0.7rem 0rem 0.7rem;
}
</style>
