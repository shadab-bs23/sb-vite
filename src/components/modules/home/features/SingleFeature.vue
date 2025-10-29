<template>
  <div class="d-flex">
    <p
      class="mx-4 fw-bold text-success d-flex flex-column align-items-center"
      :class="`${border ? 'serial-no' : ''}`"
    >
      {{ serialNo }}
    </p>
    <slot name="text"></slot>
  </div>
</template>

<script setup lang="ts">
defineProps({
  serialNo: { type: Number, required: true },
  border: { type: Boolean, required: false, default: true },
});
</script>

<style lang="scss" scoped>
.serial-no::after {
  content: "";
  width: 2px;
  height: 30px;
  margin-top: 5px;
  background: #f4f5f4;
}
</style>
