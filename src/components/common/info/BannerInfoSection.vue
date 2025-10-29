<template>
  <div
    class="flex-fill d-flex flex-column justify-content-center align-items-start mb-2 mb-md-0"
  >
    <div class="d-flex align-items-center gap-2 mb-2 mt-3">
      <img
        v-if="!isConfirmed"
        :src="icon"
        :alt="label + ' icon'"
        width="24"
        height="24"
      />
      <span v-else-if="showCheckIcon">
        <i class="fi fi-check2"></i>
      </span>
      <span v-else>
        <i class="fi fi-people"></i>
      </span>
      <span>{{ label }}</span>
    </div>
    <div class="fw-bold fs-22">{{ value }}</div>
    <div v-if="subValue">{{ subValue }}</div>
    <span v-else class="opacity-0">{{ value }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string;
  label: string;
  value: string;
  subValue?: string;
  isConfirmed: boolean;
  showCheckIcon?: boolean;
}>();
</script>
