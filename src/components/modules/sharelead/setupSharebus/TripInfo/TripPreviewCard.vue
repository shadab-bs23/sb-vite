<template>
  <div class="card rounded-3" style="max-width: 580px">
    <div class="card-body p-3">
      <div class="d-flex align-items-center gap-1 mb-3">
        <img
          src="/img/trip-info/bus-icon.svg"
          alt="Bus"
          class="me-1"
          style="width: 20px; height: 20px"
        />
        <h3 class="mb-0 fw-semibold fs-22 text-dark">{{ title }}</h3>
      </div>
      <div class="row g-3 align-items-start">
        <!-- Left Section - Image -->
        <div class="col-auto">
          <div
            class="rounded-2 overflow-hidden bg-light"
            style="width: 80px; height: 60px"
          >
            <img
              :src="genPhotoUrl || '/img/dummy.jpg'"
              alt="Trip image"
              class="w-100 h-100 object-fit-cover"
              @error="handleImageError"
            />
          </div>
        </div>

        <!-- Center Section - Trip Details -->
        <div class="col">
          <!-- Departure Information -->
          <div class="d-flex">
            <div class="mb-3">
              <div class="d-flex align-items-center gap-2 mb-1">
                <i class="fi fi-arrow-right text-success fs-6"></i>
                <span class="fw-medium text-dark small">
                  {{ departureDayName }}, {{ departureDate }}
                </span>
              </div>
              <div class="ms-4">
                <div class="fw-semibold text-dark small lh-sm">
                  {{ departureTimeRange }}
                </div>
                <div class="text-muted small lh-sm">
                  {{ departureLocation }}
                </div>
              </div>
            </div>

            <!-- Return Information (if exists) -->
            <div v-if="hasReturn">
              <div class="d-flex align-items-center gap-2 mb-1">
                <i class="fi fi-arrow-left text-danger fs-6"></i>
                <span class="fw-medium text-dark small"
                  >{{ returnDayName }}, {{ returnDate }}</span
                >
              </div>
              <div class="ms-4">
                <div class="fw-semibold text-dark small lh-sm">
                  {{ returnTimeRange }}
                </div>
                <div class="text-muted small lh-sm">{{ returnLocation }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Section - Price and Booking -->
        <div class="col-auto d-flex flex-column gap-2" style="min-width: 140px">
          <div
            class="bg-light bg-opacity-50 rounded-2 p-3 text-center w-100"
            style="background-color: #f0f9f4 !important"
          >
            <div class="text-muted small mb-1">
              {{ t("sharebus.publish.tickets_from") }}
            </div>
            <div class="fw-semibold text-dark">{{ formatPrice(price) }}</div>
          </div>
          <button
            class="btn btn-success rounded-pill fw-semibold small d-flex align-items-center justify-content-center gap-2 w-100"
          >
            <span>{{ t("sharebus.publish.view_and_book") }}</span>
            <i class="fi fi-arrow-right" style="font-size: 12px"></i>
          </button>
        </div>
      </div>

      <!-- Mobile responsive layout -->
      <div class="d-block d-sm-none mt-3">
        <div class="row g-2">
          <div class="col">
            <div
              class="bg-light bg-opacity-50 rounded-2 p-3 text-center"
              style="background-color: #f0f9f4 !important"
            >
              <div class="text-muted small mb-1">
                {{ t("sharebus.publish.tickets_from") }}
              </div>
              <div class="fw-semibold text-dark">{{ formatPrice(price) }}</div>
            </div>
          </div>
          <div class="col">
            <button
              class="btn btn-success rounded-pill fw-semibold small d-flex align-items-center justify-content-center gap-2 w-100"
            >
              <span>{{ t("sharebus.publish.view_and_book") }}</span>
              <i class="fi fi-arrow-right" style="font-size: 12px"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { format } from "date-fns";
import { da, nb, sv, enUS } from "date-fns/locale";
import { TripRouteInfo } from "@/composables/useTripRouteInfo";
import { generatePhotoUrlBasedOnEnv } from "@/utils";

interface Props {
  title: string;
  imageUrl?: string;
  departureInfo: TripRouteInfo;
  returnInfo?: TripRouteInfo | null;
  price: number;
  isEditingMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  imageUrl: "",
  returnInfo: null,
});

const { t, locale } = useI18n();

// Locale mapping for date-fns
const localeMap = {
  "da-DK": da,
  "no-NO": nb,
  "sv-SE": sv,
  "en-US": enUS,
};

const currentLocale = computed(() => localeMap[locale.value] || enUS);

const hasReturn = computed(() => !!props.returnInfo?.departureDateTime);

// Departure date formatting
const departureDayName = computed(() => {
  const date = new Date(props.departureInfo.departureDateTime || "");
  return format(date, "EEE", { locale: currentLocale.value });
});

const departureDate = computed(() => {
  const date = new Date(props.departureInfo.departureDateTime || "");
  return format(date, "MMM dd, yyyy", { locale: currentLocale.value });
});

const departureTime = computed(() => {
  if (!props.departureInfo?.departureDateTime) return "";
  const date = new Date(props.departureInfo.departureDateTime);
  return format(date, "HH:mm");
});

const departureTimeRange = computed(() => {
  if (!props.departureInfo?.departureDateTime) return "";
  const startTime = departureTime.value;
  // Assuming a 2-hour trip duration for display purposes
  const startDate = new Date(props.departureInfo.departureDateTime);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
  const endTime = format(endDate, "HH:mm");
  return `${startTime} - ${endTime}`;
});

const departureLocation = computed(() => {
  return `${props.departureInfo.origin} - ${props.departureInfo.destination}`;
});

// Return date formatting (if exists)
const returnDayName = computed(() => {
  if (!props.returnInfo?.departureDateTime) return "";
  const date = new Date(props.returnInfo.departureDateTime);
  return format(date, "EEE", { locale: currentLocale.value });
});

const returnDate = computed(() => {
  if (!props.returnInfo?.departureDateTime) return "";
  const date = new Date(props.returnInfo.departureDateTime);
  return format(date, "MMM dd, yyyy", { locale: currentLocale.value });
});

const returnTime = computed(() => {
  if (!props.returnInfo?.departureDateTime) return "";
  const date = new Date(props.returnInfo.departureDateTime);
  return format(date, "HH:mm");
});

const returnTimeRange = computed(() => {
  if (!props.returnInfo?.departureDateTime) return "";
  const startTime = returnTime.value;
  // Assuming a 2-hour trip duration for display purposes
  const startDate = new Date(props.returnInfo.departureDateTime);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
  const endTime = format(endDate, "HH:mm");
  return `${startTime} - ${endTime}`;
});

const returnLocation = computed(() => {
  if (!props.returnInfo) return "";
  return `${props.returnInfo.destination} - ${props.returnInfo.origin}`;
});

const formatPrice = (price: number): string => {
  if (!price) return "N/A";
  return `${price.toFixed(0)} Kr`;
};

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = "/img/dummy.jpg";
};

const genPhotoUrl = computed(() => {
  if (props.imageUrl) {
    return typeof props.imageUrl === "string"
      ? generatePhotoUrlBasedOnEnv(props.imageUrl)
      : URL.createObjectURL(new Blob([props.imageUrl], { type: "image/jpeg" }));
  }
  // Fallback to the trip image URL or a default image
  return "/img/dummy.jpg";
});
</script>

<style scoped>
/* Minimal custom styles - mostly using Bootstrap classes */
.object-fit-cover {
  object-fit: cover;
}

/* Custom disabled button styles */
.btn:disabled {
  background-color: #d1d5db !important;
  border-color: #d1d5db !important;
  cursor: not-allowed;
}

/* Mobile responsive behavior for better spacing */
@media (max-width: 576px) {
  .d-block.d-sm-none {
    margin-top: 1rem;
  }
}
</style>
