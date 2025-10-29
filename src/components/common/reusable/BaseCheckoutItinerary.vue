<template>
  <div class="checkout-itinerary">
    <div class="d-flex align-items-center mb-3">
      <i :class="iconPath" :alt="iconAltText" class="me-2 text-success"></i>
      <h5 class="mb-0 fw-bold">
        {{ header }}:
        {{
          formatDateTime(tripCheckoutInfo.departureDateTime, "EEEE, dd.MM.yyyy")
        }}
      </h5>
    </div>
    <div class="journey-timeline">
      <!-- Start point -->
      <div class="d-flex mb-3">
        <div class="time-column text-center fw-semibold text-dark">
          {{ formatDateTime(tripCheckoutInfo.departureDateTime, "HH:mm") }}
        </div>
        <div class="connection-column">
          <div class="connection-point start-point"></div>
          <div class="connection-line"></div>
        </div>
        <div class="location-column flex-fill">
          <div class="fw-bold text-dark lh-base">
            {{ getLocationHeader(tripCheckoutInfo.origin) }}
          </div>
          <div class="text-muted lh-base">
            {{ getLocationDetail(tripCheckoutInfo.origin) }}
          </div>
        </div>
      </div>
      <!-- More Stops for return-trip -->
      <div
        v-if="isReturnTrip && tripCheckoutInfo.route_points.length > 3"
        class="d-flex mb-3"
      >
        <div class="time-column"></div>
        <div class="connection-column">
          <div class="connection-line-dashed"></div>
        </div>
        <div class="location-column flex-fill">
          <div class="text-muted">
            {{ tripCheckoutInfo.route_points.length - 3 }}
            {{
              tripCheckoutInfo.route_points.length - 3 === 1
                ? t("sharebus.checkout.more_stop")
                : t("sharebus.checkout.more_stops")
            }}
          </div>
        </div>
      </div>
      <!-- Via Point -->
      <div v-if="tripCheckoutInfo.route_points.length > 2" class="d-flex mb-3">
        <div class="time-column text-center fw-semibold text-dark">
          {{
            formatDateTime(
              tripCheckoutInfo.route_points[1].planned_departure_time,
              "HH:mm"
            )
          }}
        </div>
        <div class="connection-column">
          <div class="connection-point via-point"></div>
          <div class="connection-line"></div>
        </div>
        <div class="location-column flex-fill">
          <div class="fw-bold text-dark lh-base">
            {{ getLocationHeader(tripCheckoutInfo.route_points[1].point) }}
          </div>
          <div class="text-muted lh-base">
            {{ getLocationDetail(tripCheckoutInfo.route_points[1].point) }}
          </div>
        </div>
      </div>
      <!-- More Stops for departure-trip -->
      <div
        v-if="!isReturnTrip && tripCheckoutInfo.route_points.length > 3"
        class="d-flex mb-3"
      >
        <div class="time-column"></div>
        <div class="connection-column">
          <div class="connection-line-dashed"></div>
        </div>
        <div class="location-column flex-fill">
          <div class="text-muted">
            {{ tripCheckoutInfo.route_points.length - 3 }}
            {{
              tripCheckoutInfo.route_points.length - 3 === 1
                ? t("sharebus.checkout.more_stop")
                : t("sharebus.checkout.more_stops")
            }}
          </div>
        </div>
      </div>
      <!-- End Point -->
      <div class="d-flex">
        <div class="time-column text-center fw-semibold text-dark">
          {{ formatDateTime(tripCheckoutInfo.arrivalDateTime, "HH:mm") }}
        </div>
        <div class="connection-column">
          <div class="connection-point end-point"></div>
        </div>
        <div class="location-column flex-fill">
          <div class="fw-bold text-dark lh-base">
            {{ getLocationHeader(tripCheckoutInfo.destination) }}
          </div>
          <div class="text-muted lh-base">
            {{ getLocationDetail(tripCheckoutInfo.destination) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { useI18n } from "vue-i18n";
import { TripCheckoutInfo } from "@/store/trip/privateTrip/types";
import { useCompanyTimeFormat } from "@/composables/useCompanyTimeFormat";

defineProps({
  header: {
    type: String,
    required: true,
  },
  iconPath: {
    type: String,
    required: true,
  },
  iconAltText: {
    type: String,
    required: true,
  },
  tripCheckoutInfo: {
    type: Object as PropType<TripCheckoutInfo>,
    required: true,
  },
  isReturnTrip: {
    type: Boolean,
    default: false,
  },
});

const { t } = useI18n();
const formatInCompanyTimezone = useCompanyTimeFormat();

const formatDateTime = (
  dateString: string,
  format: "EEEE, dd.MM.yyyy" | "HH:mm"
) => (dateString ? formatInCompanyTimezone(dateString, format) : "");

const getLocationHeader = (location: string): string => {
  // Return the first word before a comma, or the whole string if no comma
  return location.split(",")[0].trim();
};

const getLocationDetail = (location: string) => {
  // Extract additional location details if available
  const parts = location.split(",");
  return parts.length > 1 ? parts.slice(1).join(",").trim() : "";
};
</script>

<style lang="scss" scoped>
// Custom icon styling (specific size requirement)
.checkout-itinerary i {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
}

// Journey timeline custom layout (no direct Bootstrap equivalent)
.journey-timeline {
  .time-column {
    width: 67px;
    font-size: 18px;
  }

  .connection-column {
    width: 44px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    margin: 0 12px;
  }

  // Custom connection points and lines (journey-specific styling)
  .connection-point {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #138340;
    border: 1px solid #138340;
    z-index: 2;
    position: relative;
  }

  .connection-line {
    width: 2px;
    height: 40px;
    background: #138340;
    position: absolute;
    top: 7px;
    left: 50%;
    transform: translateX(-50%);
  }

  .connection-line-dashed {
    width: 2px;
    height: 30px;
    background: repeating-linear-gradient(
      to bottom,
      #138340 0px,
      #138340 4px,
      transparent 4px,
      transparent 8px
    );
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
  }

  // Custom responsive font sizing
  .fw-bold,
  .text-muted {
    font-size: 18px;
  }

  // Journey-specific layout rules
  .d-flex:last-child .connection-line {
    display: none;
  }

  .d-flex:first-child .connection-line {
    top: 7px;
    height: 33px;
  }
}

// Mobile responsive adjustments
@media (max-width: 768px) {
  .journey-timeline {
    .time-column {
      width: 50px;
      font-size: 14px;
    }

    .fw-bold,
    .text-muted {
      font-size: 14px;
    }

    .connection-column {
      margin: 0 8px;
    }
  }
}
</style>
