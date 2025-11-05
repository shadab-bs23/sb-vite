<template>
  <div class="row">
    <div class="col-sm-12 col-md-10 mx-auto">
      <BaseBreadcrumbs
        modifier-class="divider p-0"
        crumb-class="crumb fw-bold"
        label-class="crumb-label"
        crumb-link-class="crumb-link ship-gray"
      />
    </div>
    <CancelBooking
      v-if="!showConfirmation"
      class="col-sm-12 col-md-6 mx-auto"
      :trip-info="trip"
      @on-valid-email="handleTicketCancellation"
    />
    <CancelBookingConfirmation v-else class="col-sm-12 col-md-6 mx-auto" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import TripController from "@/components/modules/sharelead/controllers/TripController";
import { useRoute } from "vue-router";
import CancelBooking from "@/components/modules/joiner/booking/cancelBooking/CancelBooking.vue";
import CancelBookingConfirmation from "@/components/modules/joiner/booking/cancelBooking/CancelBookingConfirmation.vue";
import { useTripStore } from "@/store";
import type { StoreContext } from "@/store/trip/privateTrip/types";

const route = useRoute();
const trip = TripController.getCurrentTrip;
const tripStore = useTripStore() as unknown as StoreContext;
const joinerTripStore = TripController.getJoinerStore();
const showConfirmation = ref(false);

onMounted(() => {
  tripStore.getTrip(route.params.tag as string);
});

const handleTicketCancellation = () => {
  //api call
  joinerTripStore.cancelTickets(route.params.tag as string).then((result) => {
    if (result) {
      showConfirmation.value = true;
    }
  });
};
</script>
