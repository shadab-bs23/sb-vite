<template>
  <component :is="targetComponent" :tripInfo="tripInfo"></component>
</template>
<script setup lang="ts">
import { computed, watch, ref } from "vue";
import { useRoute } from "vue-router";
import BookConfirmation from "@/components/modules/payment/BookConfirmation.vue";
import TicketConfirmation from "@/components/modules/payment/BookTicketConfirmation.vue";
import PayAndBook from "@/components/modules/payment/PayAndBook.vue";
import verifying from "@/components/modules/payment/PaymentVerifying.vue";
import { useTripStore } from "@/store";

const targetComponentName = ref("" as string | string[]);
const routeParams = computed(() => route.params.tag);
const route = useRoute();
const shareleadTripStore = useTripStore();

watch(
  () => routeParams.value,
  (value) => {
    if (value) {
      targetComponentName.value = value;
    }
  },
  { immediate: true }
);

const componentList = {
  confirmation: BookConfirmation,
  "confirm-and-book": PayAndBook,
  "book-ticket-confirmation": TicketConfirmation,
  verifying: verifying,
};
const targetComponent = computed(() => {
  return componentList[targetComponentName.value as string];
});
const tripInfo = computed(() => {
  return shareleadTripStore.getCurrentTrip;
});
/*
 * trip id is computing here, it will not available all time
 */
const tripID = computed(() => route.params.id);
/*
 * watching if trip id exist, if then calling get trip
 */
watch(
  () => tripID.value,
  (value) => {
    if (value) {
      shareleadTripStore.getTrip(value as string);
    }
  },
  {
    immediate: true,
  }
);
</script>
