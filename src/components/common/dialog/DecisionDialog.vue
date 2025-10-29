<template>
  <div class="container d-flex justify-content-between align-items-center">
    <span class="fw-bold">{{ message }}</span>
    <BaseButton
      button-class=" ms-3  green-jewel-bg gray-white fw-bold"
      :button-text="buttonTextComputed"
      @click="action"
    />
  </div>
</template>

<script lang="ts" setup>
import { clearToast } from "@/services/toast/toast.service";
import BaseButton from "@busgroup/vue3-base-button";
import { computed } from "vue";

const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  buttonText: {
    type: String,
    required: true,
  },
  callback: {
    type: Function,
    default: () => ({}),
  },
});

const buttonTextComputed = computed(() => {
  return props.buttonText;
});

const action = () => {
  props.callback();
  clearToast();
};
</script>
