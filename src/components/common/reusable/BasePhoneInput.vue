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
import { ref } from "vue";
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
const changeInput = (number) => {
  if (count.value > 0) emits("update:modelValue", number);
  count.value++;
};
const validateNumber = (valid) => {
  emits("validate", valid?.valid);
};
</script>

<style>
.vti__dropdown-list {
  z-index: 9999 !important;
}
</style>
