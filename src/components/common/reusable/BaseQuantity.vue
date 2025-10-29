<template>
  <div class="d-flex flex-column">
    <div class="d-flex align-items-center">
      <BaseButton
        button-text="&#8211;"
        :button-class="`quantity-minus sb-btn-lg sb-btn-secondary rounded-pill  fw-bold me-2 d-flex align-items-center justify-content-center ${
          blockDecrease && 'pe-none'
        }`"
        @click="() => updateQuantity(-1)"
      />
      <BaseInput
        v-model="computedVModel"
        type="number"
        input-group-class="quantity-text"
        :modifier-class="`text-center ${errorClass}`"
        :min="minQuantity"
        :max="maxQuantity"
        @keyup="(e) => handleKeyUpPG(e)"
      />
      <BaseButton
        button-text="&#43;"
        :button-class="`quantity-plus sb-btn-lg sb-btn-primary-alt rounded-pill   fw-bold ms-2 d-flex align-items-center justify-content-center ${
          blockIncrease && 'pe-none'
        }`"
        @click="() => updateQuantity(1)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from "@busgroup/vue3-base-button";
import BaseInput from "@busgroup/vue3-base-input";
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
  },
  minQuantity: {
    type: Number,
    required: true,
  },
  maxQuantity: {
    type: Number,
    required: true,
  },
  blockIncrease: {
    type: Boolean,
    required: false,
    default: false,
  },

  blockDecrease: {
    type: Boolean,
    required: false,
    default: false,
  },
  errorClass: {
    type: String,
    required: false,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);

const computedVModel = computed({
  get: () => {
    return props.modelValue;
  },
  set: (value) => {
    /**
     * Triggers when the computed property value changes.
     *
     * @param {string | number | Array} value current value
     * @returns {string | number | Array} should return the updated value.
     */
    emit("update:modelValue", value);
  },
});

const updateQuantity = (change: number) => {
  const isChangeApplicable =
    (change > 0 && props.modelValue < props.maxQuantity) ||
    (change < 0 && props.modelValue > props.minQuantity);

  isChangeApplicable && emit("update:modelValue", props.modelValue + change);
};

const handleKeyUpPG = (e: Event) => {
  const eventData = (e.target as HTMLInputElement).value;
  const eventDataNum = Number.parseInt(eventData);

  if (eventDataNum < 0) {
    emit("update:modelValue", 0);
  }

  if (eventData.toString().includes(".")) {
    emit("update:modelValue", Number.parseInt(eventData.split(".")[0]));
  }
};
</script>

<style lang="scss" scoped>
.quantity-plus,
.quantity-minus {
  // height: 25px;
  width: 46px;
}
.quantity-text {
  width: 80px;
}
</style>
