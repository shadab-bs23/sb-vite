<template>
  <div class="mb-3">
    <ul class="trip-type-list d-flex w-100 list-unstyled">
      <li
        class="mw-100 cursor-pointer w-fit-content me-4 mb-0"
        :class="chosenTripType === tripType.value && 'trip-type-border'"
        v-for="tripType in tripTypes"
        :key="tripType.value"
      >
        <div class="trip-type-label" @click="() => onChange(tripType)">
          <p class="text-start mb-0">
            {{ tripType.label }}
          </p>
        </div>
        <BaseRadio
          :id="tripType.label"
          :value="tripType.value"
          modifier-class="radio-button-size opacity-0"
          v-model="chosenTripType"
        />
      </li>
    </ul>
  </div>
</template>
<script lang="ts" setup>
import { ref, PropType } from "vue";
import BaseRadio from "@busgroup/vue3-base-radio";
import { TRIP_FILTER } from "../sharelead/trip/tripStatus/tripStatusEnum";
import { useRoute } from "vue-router";
import { useTripStore } from "@/store";

type TripFilter = {
  label: string;
  value: number;
};
const tripStore = useTripStore();

defineProps({
  tripTypes: {
    type: Array as PropType<TripFilter[]>,
    required: true,
  },
});
const route = useRoute();

const emit = defineEmits(["filterChange"]);

const chosenTripType = ref(TRIP_FILTER.ACTIVE);

const onChange = (tripType) => {
  if (
    route.name === "share-lead-buses" ||
    route.name === "joiner-trips" ||
    route.name === "sales-buses"
  ) {
    tripStore.$reset();
  }
  chosenTripType.value = tripType.value;
  emit("filterChange", tripType.value);
};
</script>

<style lang="scss">
.trip-filter-logo {
  background-color: #f8f9fa;
}

.trip-type-list {
  border-bottom: 1px solid lightgray;
  height: 35px;
}

.trip-type-border {
  border-bottom: 2px solid #0c1026;
}

.trip-type-list > li {
  color: #0c1026;
  &:hover {
    color: var(--ferdia-c1-green-jewel1);
    border-bottom: 2px solid var(--ferdia-c1-green-jewel1) !important;
  }

  &:active {
    background: var(--ferdia-c1-green-jewel1) !important;
    color: white !important;
    padding: 5px;
    border-radius: 4px;
  }
}
</style>
