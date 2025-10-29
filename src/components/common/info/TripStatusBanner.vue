<template>
  <div
    :class="`p-3 rounded-3 d-flex flex-column flex-md-row gap-1 gap-md-4 align-items-stretch ${getBgColorByStatus}`"
  >
    <!-- Illustration Section -->
    <div
      class="d-flex justify-content-center flex-shrink-0"
      style="min-width: 150px"
    >
      <div class="position-relative" style="width: 150px; height: 136px">
        <img
          class="position-absolute h-100"
          :src="illustrationImage"
          alt="Background shape"
          width="150"
          style="top: 10px; left: 0"
        />
      </div>
    </div>

    <!-- Content Sections -->
    <div class="flex-fill d-flex flex-column flex-md-row gap-1 gap-md-4 w-100">
      <!-- Status Section -->
      <BannerInfoSection v-bind="statusSection" />

      <!-- Passengers/Bookings Section -->
      <BannerInfoSection v-bind="passengersSection" />

      <!-- Third Section (Capacity/Deadline) -->
      <BannerInfoSection v-bind="thirdSection" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { TRIP_STATUS } from "@/components/modules/sharelead/trip/tripStatus/tripStatusEnum";
import BannerInfoSection from "./BannerInfoSection.vue";
import { useCompanyTimeFormat } from "@/composables/useCompanyTimeFormat";

const props = defineProps<{
  statusBannerData: {
    status: string;
    passengerGoal: number;
    maxPax: number;
    soldTickets: number;
    deadline: string;
  };
}>();

const { t } = useI18n();
const formatInCompanyTimezone = useCompanyTimeFormat();

// Core computed properties
const isConfirmed = computed(
  () => props.statusBannerData.status === TRIP_STATUS.CONFIRMED
);

// Configuration objects for each section
const statusSection = computed(() => ({
  icon: "/img/status-banner/hourglass.svg",
  label: t("status.label"),
  value: getStatusText(),
  isConfirmed: isConfirmed.value,
  showCheckIcon: true, // First section shows check icon when confirmed
}));

const passengersSection = computed(() => ({
  icon: "/img/status-banner/passenger.svg",
  label: isConfirmed.value
    ? t("sharebus.bookings")
    : t("sharebus.passenger_goal"),
  value: getPassengersValue(),
  subValue: getPassengersSubValue(),
  isConfirmed: isConfirmed.value,
  showCheckIcon: false, // Second section shows people icon when confirmed
}));

const thirdSection = computed(() => ({
  icon: isConfirmed.value
    ? "/img/status-banner/bus.svg"
    : "/img/status-banner/deadline.svg",
  label: isConfirmed.value
    ? t("sharebus.bus_capacity")
    : t("sharebus.trip_page.deadline"),
  value: getThirdSectionValue(),
  subValue: getThirdSectionSubValue(),
  isConfirmed: isConfirmed.value,
  showCheckIcon: false, // Third section shows people icon when confirmed
}));

// Helper functions to reduce duplication
function getStatusText(): string {
  const statusMap: Record<string, string> = {
    [TRIP_STATUS.CONFIRMED]: t("status.confirmed"),
    [TRIP_STATUS.UNCONFIRMED]: t("status.unconfirmed"),
    [TRIP_STATUS.CANCELED_BY_SALES]: t("status.canceled"),
  };
  return (
    statusMap[props.statusBannerData.status] || t("sharebus.status_unknown")
  );
}

function getPassengersValue(): string {
  if (isConfirmed.value) {
    return props.statusBannerData.soldTickets.toString();
  }
  return `${props.statusBannerData.soldTickets} of ${props.statusBannerData.passengerGoal}`;
}

function getPassengersSubValue(): string {
  if (isConfirmed.value) return "";
  return `${t("sharebus.trip_page.max_capacity")}: ${
    props.statusBannerData.maxPax
  }`;
}

function getThirdSectionValue(): string {
  if (isConfirmed.value) {
    return props.statusBannerData.maxPax.toString();
  }

  const deadline = props.statusBannerData.deadline;
  return deadline ? formatInCompanyTimezone(deadline, "dd.MM.yyyy") : "";
}

function getThirdSectionSubValue(): string {
  if (isConfirmed.value) return "";

  const deadline = props.statusBannerData.deadline;
  return deadline ? `at ${formatInCompanyTimezone(deadline, "HH:mm")}` : "";
}

// Style configurations using lookup objects
const getBgColorByStatus = computed(() => {
  const colorMap: Record<string, string> = {
    [TRIP_STATUS.CONFIRMED]: "extended-light-green-bg",
    [TRIP_STATUS.UNCONFIRMED]: "warning-c6-bg",
    [TRIP_STATUS.CANCELED_BY_SALES]: "warning-c7-bg",
  };
  return colorMap[props.statusBannerData.status] || "warning-c6-bg";
});

const illustrationImage = computed(() => {
  const imageMap: Record<string, string> = {
    [TRIP_STATUS.CONFIRMED]: "/img/confirmed-bus.svg",
    [TRIP_STATUS.UNCONFIRMED]: "/img/status-banner/waiting_illustration.svg",
  };
  return (
    imageMap[props.statusBannerData.status] ||
    "/img/status-banner/unconfirmed.svg"
  );
});
</script>
