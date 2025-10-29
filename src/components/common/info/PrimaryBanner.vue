<template>
  <div
    class="d-flex align-items-center flex-wrap extended-light-green-bg my-2 rounded w-fit-content px-3 py-2 fs-6 fw-600"
  >
    <i :class="icon" class="fs-4 me-2 text-success"></i>
    <span v-if="header !== ''" class="mb-0 me-1 fw-bold">{{ header }}.</span>
    <span class="mb-0 fw-normal">{{ message }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps({
  icon: {
    type: String,
    default: "fi fi-check-circle-fill", // Changed to checkmark icon
  },
  header: {
    type: String,
    default: "",
  },
  message: {
    type: String,
    required: true,
  },
});
</script>
