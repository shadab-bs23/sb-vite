<template>
  <div class="mb-4">
    <button
      class="d-flex justify-content-center align-items-center px-3 py-1 mb-2 rounded-pill text-success fw-bold itinerary-toggle"
      @click="toggleItinerary"
    >
      <span class="small">{{ t("sharebus.checkout.itinerary") }}</span>
      <i
        class="ms-2 fi fi-chevron-down"
        :class="{ 'rotate-180': showItinerary }"
        aria-hidden="true"
      ></i>
    </button>

    <div v-if="showItinerary" class="itinerary-content p-4 bg-light rounded">
      <div class="row">
        <!-- Departure Journey -->
        <div class="col-md-6">
          <BaseCheckoutItinerary
            :header="t('sharebus.checkout.departure')"
            :iconPath="'fi fi-arrow-right-circle'"
            :iconAltText="t('sharebus.checkout.departure')"
            :tripCheckoutInfo="departureInfo"
          />
        </div>

        <!-- Return Journey -->
        <div v-if="returnInfo.departureDateTime" class="col-md-6">
          <BaseCheckoutItinerary
            :header="t('sharebus.checkout.return')"
            :iconPath="'fi fi-arrow-left-circle'"
            :iconAltText="t('sharebus.checkout.return')"
            :tripCheckoutInfo="returnInfo"
            :isReturnTrip="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import BaseCheckoutItinerary from "@/components/common/reusable/BaseCheckoutItinerary.vue";

export default {
  name: "ItinerarySection",
  components: {
    BaseCheckoutItinerary,
  },
  props: {
    departureInfo: {
      type: Object,
      required: true,
    },
    returnInfo: {
      type: Object,
      required: true,
    },
    initiallyExpanded: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const { t } = useI18n();
    const showItinerary = ref(props.initiallyExpanded);

    const toggleItinerary = () => {
      showItinerary.value = !showItinerary.value;
    };

    return {
      t,
      showItinerary,
      toggleItinerary,
    };
  },
};
</script>

<style lang="scss" scoped>
// Custom hover effect for itinerary toggle
.itinerary-toggle {
  cursor: pointer;
  background-color: #e5fbee;
  border: none;

  &:hover {
    background-color: #d1f5e0;
  }
}

// Custom rotation for chevron icon
.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.2s;
}
</style>
