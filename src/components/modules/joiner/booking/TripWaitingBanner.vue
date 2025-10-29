<template>
  <div
    class="trip-status-banner d-flex align-items-center justify-content-between px-4 py-3"
  >
    <p class="mb-0 status-text">
      This trip needs another 10 bookings within 8 days
    </p>
    <div class="illustration">
      <img
        src="/img/status-banner/waiting_illustration.svg"
        alt=""
        class="waiting-icon"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
export interface TripWaitingBannerProps {
  remainingBookings: number;
  remainingDays: number;
}

defineProps<TripWaitingBannerProps>();
</script>

<style scoped lang="scss">
.trip-status-banner {
  background-color: #fef8c8;
  border-radius: 4px 4px 0 0;
  min-height: 60px;
}

.status-text {
  font-family: "Inter", sans-serif;
  font-size: 18px;
  font-weight: 400;
  line-height: 27px;
  color: #0c1026;
}

.waiting-icon {
  width: 80px;
  height: 80px;
}
</style>
