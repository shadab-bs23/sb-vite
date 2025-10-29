<template>
  <p class="text-start text-danger">{{ message }}</p>
</template>

<script setup lang="ts">
defineProps({
  message: {
    type: String,
    required: true,
  },
});
</script>
