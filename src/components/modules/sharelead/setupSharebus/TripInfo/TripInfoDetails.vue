<template>
  <span v-if="isOneLiner">
    <p class="ship-gray text-start mb-0 d-inline">
      <span
        v-if="isReturnTrip"
        class="light-gray-bg rounded-circle green-jewel fs-6 text-center mx-2 px-2 py-1 text-start"
      >
        <i class="fi fi-arrow-left-right text-stroke-1"></i>
      </span>
      <span>
        {{ placeShortName(tripInfo?.origin as string) }} -
        {{ placeShortName(tripInfo?.destination as string) }}
      </span>
      <span
        class="light-gray-bg rounded-circle trip-arrow text-center mx-2 px-2 py-1 text-start"
      >
        <img v-if="!isReturnTrip" src="/img/trip-info/right-arrow.svg" alt="" />
        <img v-if="isReturnTrip" src="/img/trip-info/left-arrow.svg" alt="" />
      </span>
      <span class="ship-gray text-start">
        {{ formatDateBasedOnOrientation(tripInfo.departureDateTime) }}
      </span>
    </p>
  </span>
  <div class="trip-info-details-wrapper mb-3" v-else-if="!isHorizontal">
    <div class="destination-info-wrapper d-flex flex-column">
      <div class="align-self-start">
        <slot name="badge"></slot>
      </div>
      <div class="d-flex align-items-start">
        <span class="light-gray-bg rounded-circle trip-arrow text-center">
          <img
            v-if="!isReturnTrip"
            src="/img/trip-info/right-arrow.svg"
            alt=""
          />
          <img v-if="isReturnTrip" src="/img/trip-info/left-arrow.svg" alt="" />
        </span>
        <p class="ship-gray ms-2" :class="!tripStatus && 'fw-bold'">
          {{ formatDateBasedOnOrientation(tripInfo.departureDateTime) }}
        </p>
      </div>
      <p
        class="text-start rounded p-2 mb-0 ms-4"
        v-if="tripInfo.bookingReference"
      >
        <img src="/img/trip-info/signage.svg" alt="Signage icon" class="me-2" />
        <strong>{{ tripInfo.bookingReference }}</strong>
        {{ t("sharebus.trip_page.bus_signage") }}
      </p>

      <div>
        <SingleItinerary
          v-for="(viaPoint, index) in tripInfo.route_points"
          :via-point="viaPoint"
          :key="viaPoint.id"
          :is-last="index === tripInfo.route_points.length - 1"
        />
      </div>
    </div>
  </div>

  <div v-else>
    <div class="d-flex mb-3">
      <span class="light-gray-bg rounded-circle trip-arrow text-center">
        <img v-if="!isReturnTrip" src="/img/trip-info/right-arrow.svg" alt="" />
        <img v-if="isReturnTrip" src="/img/trip-info/left-arrow.svg" alt="" />
      </span>
      <span class="ms-1 fw-bold ship-gray">
        {{ formatDateBasedOnOrientation(tripInfo.departureDateTime) }}
      </span>
    </div>
    <div class="ms-2 mb-3 d-flex flex-column align-items-start">
      <p class="ship-gray text-start mb-0">
        {{ getFormattedTime(tripInfo?.departureDateTime) }} -
        {{ getFormattedTime(tripInfo.arrivalDateTime) }}
      </p>
      <p class="ship-gray text-start fw-600">
        {{ splitAndGetFirstElement(tripInfo?.origin as string, ",") }} -
        {{ splitAndGetFirstElement(tripInfo?.destination as string, ",") }}
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue";
import {
  splitAndGetFirstElement,
  placeShortName,
  calculateDivDistance,
} from "@/utils";
import { DateTimeFormatOptions } from "@intlify/core-base";
import { locales } from "@/locales";
import { useI18n } from "vue-i18n";
import SingleItinerary from "./SingleItinerary.vue";
import { useCompanyTimeFormat } from "@/composables/useCompanyTimeFormat";
import { AllowedFormats } from "@/utils/companyTimeFormat";

const props = defineProps({
  tripInfo: {
    type: Object,
    required: true,
  },
  isHorizontal: {
    type: Boolean,
    required: false,
    default: false,
  },
  isOneLiner: {
    type: Boolean,
    required: false,
    default: false,
  },
  isReturnTrip: {
    type: Boolean,
    required: false,
    default: false,
  },
  tripStatus: {
    type: String,
    required: false,
    defautl: "",
  },
  isDisabled: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const { locale, t } = useI18n();
const currentLocale = ref(locales[locale.value]);
const formatInCompanyTz = useCompanyTimeFormat();

const formatDateBasedOnOrientation = (dateStr: string) => {
  const formatPattern: AllowedFormats =
    props.isHorizontal || props.isOneLiner
      ? "EEE, MMM d, yyyy"
      : "EEEE, MMMM d, yyyy";
  return formatInCompanyTz(dateStr, formatPattern, currentLocale.value);
};

const getFormattedTime = (dateStr: string) => {
  return formatInCompanyTz(dateStr, "HH:mm");
};

const departureSpanId = computed(() => {
  return props.isReturnTrip ? "departure-info1" : "departure-info";
});

const returnSpanId = computed(() => {
  return props.isReturnTrip ? "return-info1" : "return-info";
});

const checkHeight = ref(0);

const handleResize = () => {
  // Your code to handle the window resize event
  if (!props.isOneLiner && !props.isHorizontal) {
    setTimeout(() => {
      const div1 = document.getElementById(departureSpanId.value);
      const div2 = document.getElementById(returnSpanId.value);
      let distance;

      if (div1 && div2) {
        distance = calculateDivDistance(div1, div2);
        let styleElem = document.head.appendChild(
          document.createElement("style")
        );
        if (checkHeight.value != distance) {
          styleElem.innerHTML = `#${departureSpanId.value}:before {height: ${
            distance - 20
          }px !important;}`;
          checkHeight.value = distance;
        }
      }
    }, 100);
  }
};

window.addEventListener("resize", handleResize);

watchEffect(() => {
  if (!props.isOneLiner && !props.isHorizontal) {
    handleResize();
  }
});

watch(
  () => locale.value,
  (value) => (currentLocale.value = locales[value])
);
</script>
<style lang="scss">
.trip-map-icon {
  min-width: 32px;
  min-height: 32px;
  border: 1px solid #d5d6d5;
}

.departure-info::before {
  content: "";
  border-left: 2px dashed #d5d6d5;
  margin-top: 30px;
  position: absolute;
  float: left;
  margin-left: 5px;
  z-index: -1;
}
.time-font-size {
  font-size: 1.5rem;
}
</style>
