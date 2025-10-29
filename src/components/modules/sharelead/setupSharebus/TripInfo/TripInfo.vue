<template>
  <div class="text-start">
    <!-- Trip Image with Date Overlay -->
    <div class="position-relative d-inline-block text-start">
      <img
        :src="genPhotoUrl || '/img/dummy.jpg'"
        :alt="t('setup.trip_info_preview')"
        class="img-fluid booking-page-image rounded"
        @error="handleImageError"
      />
      <div
        class="position-absolute bottom-0 start-0 bg-white rounded shadow px-3 py-2 m-2 d-flex flex-column align-items-start text-start"
        style="font-size: 0.9rem"
      >
        <span class="text-muted">{{ formatMonths }}</span>
        <span class="fw-bold"
          >{{ tripDateAndTime.startDay }}. – {{ tripDateAndTime.endDay }}.</span
        >
      </div>
    </div>

    <!-- Trip Name -->
    <h3 class="my-4 text-start">{{ tripData.name }}</h3>

    <!-- Organizer Info -->
    <p class="text-start">
      {{ t("sharebus.publish.organized_by") }}
      <strong>{{ tripData.trip_organizer }}</strong>
    </p>

    <!-- Trip Type & Stops Badges -->
    <div class="m-auto d-flex flex-wrap my-3 text-start">
      <div
        class="border border-1 border-light rounded d-flex justify-content-center align-items-center px-2 py-1 fw-600"
      >
        <i
          :class="isRoundTrip ? 'fi fi-arrow-repeat' : 'fi fi-arrow-right'"
        ></i>
        <p class="mb-0 ms-2">{{ tripPoints.type }}</p>
      </div>
      <div
        class="border border-1 border-light rounded d-flex justify-content-center align-items-center ms-2 px-2 py-1 fw-600"
      >
        <i
          :class="isRoundTrip ? 'fi fi-arrow-left-right' : 'fi fi-arrow-right'"
        ></i>
        <p class="mb-0 ms-2">{{ tripPoints.count }} {{ t("setup.stops") }}</p>
      </div>
    </div>

    <!-- Trip Notes -->
    <p class="text-start">{{ tripData.info_to_travellers }}</p>

    <!-- Event Link -->
    <a
      :href="tripData.website_url || '#'"
      class="green-jewel text-decoration-underline d-block my-3 text-start"
    >
      {{ t("setup.link_to_event") }}
    </a>

    <!-- Edit Button -->
    <BaseActionButton
      v-if="tripData && props.editMode"
      :label="t('button.edit')"
      :icon-path="'/img/icons/edit.svg'"
      :alt-text="t('setup.edit_publish_trip')"
      :next-route="'trip-sales-dit-published'"
      :route-params="{ id: props.tripId }"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from "vue";
import { useI18n } from "vue-i18n";
import { RoutePoints } from "@/components/ViaPointsPackage/types/types";
import { TripInfoData } from "@/store/sharebus/types";
import { generatePhotoUrlBasedOnEnv } from "@/utils";

// Define props for tripData and routeData
const props = defineProps({
  tripData: {
    type: Object as () => TripInfoData,
    required: true,
  },
  tripId: {
    type: String,
    required: true,
  },
  routeData: {
    type: Object as () => RoutePoints,
    required: true,
  },
  editMode: {
    type: Boolean,
    default: false,
  },
});

// i18n setup
const { t } = useI18n();

// Handle image load errors by setting fallback image
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  if (target) {
    target.src = "/img/dummy.jpg";
  }
};

const genPhotoUrl = computed(() => {
  const imageUrl = props.tripData.image_url;

  // If image_url is explicitly empty string (file removed), show dummy
  if (imageUrl === "") {
    return "/img/dummy.jpg";
  }

  // If image_url exists and is not empty
  if (imageUrl) {
    // Handle string URLs (existing images from server)
    if (typeof imageUrl === "string") {
      return generatePhotoUrlBasedOnEnv(imageUrl);
    }
    // Handle File objects (newly uploaded images)
    // Check if it's a File-like object with required properties
    if (
      typeof imageUrl === "object" &&
      imageUrl !== null &&
      "name" in imageUrl &&
      "size" in imageUrl
    ) {
      return URL.createObjectURL(imageUrl as File);
    }
    // Handle other object types (fallback to Blob conversion)
    return URL.createObjectURL(new Blob([imageUrl], { type: "image/jpeg" }));
  }

  // Fallback to default image if no image_url provided
  return "/img/dummy.jpg";
});

// Determine if it's a round trip
const isRoundTrip = computed(() => props.routeData.return?.length > 0);

// Calculate trip points info
const tripPoints = computed(() => {
  const onewayCount = props.routeData.oneway?.length || 0;
  const returnCount = props.routeData.return?.length || 0;
  const count = onewayCount + returnCount;

  return {
    type: isRoundTrip.value
      ? t("viapoints.round_trip")
      : t("viapoints.one_way"),
    count,
  };
});

// Calculate trip dates
const tripDateAndTime = computed(() => {
  const startPoint = props.routeData.oneway?.[0];
  const endpoint = isRoundTrip.value
    ? props.routeData.return[props.routeData.return.length - 1]
    : props.routeData.oneway[props.routeData.oneway.length - 1];

  const startTime = new Date(startPoint?.planned_departure_time || new Date());
  const endTime = new Date(endpoint?.planned_arrival_time || new Date());

  return {
    startMonthName: startTime.toLocaleString("en-US", { month: "short" }),
    endMonthName: endTime.toLocaleString("en-US", { month: "short" }),
    startDay: startTime.getDate(),
    endDay: endTime.getDate(),
  };
});

// Format months display string
const formatMonths = computed(() => {
  const { startMonthName, endMonthName } = tripDateAndTime.value;

  // Format to match the original component behavior
  return (
    startMonthName +
    (startMonthName !== endMonthName ? ` - ${endMonthName}` : "")
  );
});
</script>
<style scoped>
.booking-page-image {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: cover;
}
</style>
