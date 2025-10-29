<template>
  <div
    class="d-flex align-items-center flex-wrap info-Turquoise-bg mt-2 rounded w-fit-content px-2 fs-6 fw-600"
  >
    <i :class="icon" class="fs-3 me-2"></i>
    <p class="mb-0">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps({
  icon: {
    type: String,
    default: "fi fi-info-circle-fill",
  },
  message: {
    type: String,
    required: true,
  },
});
</script>
