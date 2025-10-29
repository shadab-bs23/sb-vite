<template>
  <div class="container d-flex justify-content-between">
    <span class="fw-bold">Are you sure you want to confirm this trip?</span>
    <BaseButton
      button-class=" ms-3  green-jewel-bg gray-white fw-bold"
      button-text="Yes"
      @click="action"
    />
  </div>
</template>

<script lang="ts" setup>
import { clearToast } from "@/services/toast/toast.service";
import BaseButton from "@busgroup/vue3-base-button";

const props = defineProps({
  callback: {
    type: Function,
    default: () => ({}),
  },
});

const action = () => {
  props.callback();
  clearToast();
};
</script>
