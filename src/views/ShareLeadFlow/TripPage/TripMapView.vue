<template>
  <div class="position-relative">
    <iframe
      class="map-iframe"
      :src="embeddedLink"
      frameborder="0"
      ref="mapIframe"
    ></iframe>
  </div>
</template>

<script setup lang="ts">
import { useJoinerTripStore } from "@/store";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { PublicTrip } from "@/store/trip/joiner/types";

const route = useRoute();
const joinerTrip = useJoinerTripStore();

const embeddedLink = ref<string>("");

onMounted(() => {
  joinerTrip
    .getPublicTrip(route.params.tag as string)
    .then((trip: PublicTrip) => {
      embeddedLink.value = trip.embedded_link;
    });
});
</script>

<style lang="scss" scoped>
.map-iframe {
  height: 100vh;
  width: 98vw;
}
</style>
