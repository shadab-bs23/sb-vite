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

const route = useRoute();
const trip = TripController.getCurrentTrip;
const shareleadTripStore = TripController.getShareleadTripStore();
const joinerTripStore = TripController.getJoinerStore();
const showConfirmation = ref(false);

onMounted(() => {
  shareleadTripStore.getTrip(route.params.tag as string);
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
