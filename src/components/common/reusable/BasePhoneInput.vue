<template>
  <VueTelInput
    @validate="validateNumber"
    @on-input="changeInput"
    v-model="value"
    mode="international"
    :inputOptions="{ placeholder: placeholder }"
    :showDialCodeInSelection="true"
    defaultCountry="NO"
    :onlyCountries="countryAccepted"
    :class="modifierClass"
  />

  <p class="invalid-feedback d-inline" v-if="errorMessage">
    {{ errorMessage }}
  </p>
</template>

<script setup lang="ts">
import { VueTelInput } from "vue-tel-input";
import "vue-tel-input/vue-tel-input.css";
import { ref, watch } from "vue";
import { countryAccepted } from "@/utils";
const props = defineProps({
  modelValue: {
    type: [String, Number],
  },
  placeholder: {
    type: String,
    default: "",
  },
  modifierClass: {
    type: String,
    default: "",
  },
  errorMessage: {
    type: String,
    default: "",
  },
});
const emits = defineEmits(["update:modelValue", "validate"]);
const count = ref<number>(0);
const value = ref(props.modelValue);

// Add watcher to update internal value when modelValue prop changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== value.value) {
      value.value = newValue;
      // Reset counter to prevent unnecessary emits
      count.value = 0;
    }
  }
);

const changeInput = (number) => {
  if (count.value > 0) emits("update:modelValue", number);
  count.value++;
};
const validateNumber = (valid) => {
  emits("validate", valid?.valid);
};

// Add reset method to explicitly reset the component
const reset = () => {
  value.value = props.modelValue;
  count.value = 0;
};

// Expose reset method to parent components
defineExpose({ reset });
</script>

<style>
.vti__dropdown-list {
  z-index: 9999 !important;
}
</style>
