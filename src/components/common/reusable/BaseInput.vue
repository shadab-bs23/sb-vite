<template>
  <div :class="`input-group ${inputGroupClass}`">
    <label for="input" :class="`form-label ${labelClass}`">
      {{ label }}
      <small v-if="isRequired" class="text-danger"> *</small>
    </label>

    <span :class="prependClass" @click="handleClick()">
      <slot name="prepend"></slot>
    </span>

    <input
      :id="inputId"
      ref="inputRef"
      v-bind="$attrs"
      :value="modelValue"
      :placeholder="placeholder"
      :class="`form-control ${modifierClass}`"
      :required="isRequired"
      :disabled="isDisabled"
      @input="(e) => handleInputChange(e)"
    />

    <span :class="appendClass" @click="$emit('click')">
      <slot name="append"></slot>
    </span>
    <div class="valid-feedback" :class="feedbackClass">{{ feedback }}</div>
    <div class="invalid-feedback" :class="feedbackClass">{{ feedback }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineProps({
  /**
   * @property {string} labelClass - Takes custom class for label from the component which implements it as a props
   * @default ""
   */
  inputId: {
    type: String,
    default: "",
  },
  /**
   * @property {string} labelClass - Takes custom class for label from the component which implements it as a props
   * @default ""
   */
  labelClass: {
    type: String,
    default: "",
  },
  /**
   * @property {string} label - Takes label text from the component which implements it as a props
   * @default ""
   */
  label: {
    type: String,
    default: "",
  },
  /**
   * @property {string | number} modelValue - Takes value for input from the component which implements it as a props
   * @default ""
   */
  modelValue: {
    type: [String, Number],
    default: "",
  },
  /**
   * @property {string } placeholder - Takes placeholder text from the component which implements it as a props
   * @default ""
   */
  placeholder: {
    type: String,
    default: "",
  },
  /**
   * @property {string } modifierClass - Takes modifier class for input from the component which implements it as a props
   * @default ""
   */
  modifierClass: {
    type: String,
    default: "",
  },
  /**
   * @property {string } inputGroupClass - Takes modifier class for input from the component which implements it as a props
   * @default ""
   */
  inputGroupClass: {
    type: String,
    default: "",
  },
  /**
   * @property {string } feedback - Takes feedback text for input from the component which implements it as a props
   * @default ""
   */
  feedback: {
    type: String,
    default: "",
  },
  /**
   * @property {string } feedbackClass - Takes class for the feedback from the component which implements it as a props
   * @default ""
   */
  feedbackClass: {
    type: String,
    default: "",
  },
  /**
   * @property {boolean } isRequired - Takes for required property from the component which implements it as a props
   * @default false
   */
  isRequired: {
    type: Boolean,
    default: false,
  },
  /**
   * @property {boolean } isDisabled - Takes for disabled property from the component which implements it as a props
   * @default false
   */
  isDisabled: {
    type: Boolean,
    default: false,
  },
  /**
   * @property {string } prependClass - Takes class for the element prepended from the component which implements it as a props
   * @default ""
   */
  prependClass: {
    type: String,
    default: "",
  },
  /**
   * @property {string } appendClass - Takes class for the element appended from the component which implements it as a props
   * @default ""
   */
  appendClass: {
    type: String,
    default: "",
  },
});

/**
 * Events for base input.
 */
const emits = defineEmits(["update:modelValue", "click"]);

// For refering the input field in DOM
const inputRef = ref<HTMLInputElement>();

/**
 * This function triggers click event.
 */
const handleClick = () => {
  emits("click");
};

/**
 * This function triggers input change event
 *
 * @param {Event} e  - HTML input event
 */
const handleInputChange = (e: Event) => {
  const isNumber = inputRef.value?.getAttribute("type") === "number";
  let emitValue: string | number = (e.target as HTMLInputElement).value;
  emitValue = isNumber ? Number(emitValue) : emitValue;
  emits("update:modelValue", emitValue);
};
</script>
