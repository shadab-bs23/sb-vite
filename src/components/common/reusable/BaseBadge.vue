<template>
  <span class="badge d-flex align-items-center" :class="badgeClass">
    <slot v-if="$slots.label" name="label"></slot>
    <span v-else :class="labelClass">{{ label }}</span>
    <span
      v-if="removable"
      class="ms-2"
      :class="` ${actionClass}  pointer-cursor `"
      @click="$emit('onRemove', actionData || label)"
    >
      <slot v-if="$slots.actionArea"></slot>
      <i v-else class="fi fi-x fs-5" />
    </span>
  </span>
</template>
<script setup lang="ts">
const props = defineProps({
  /**
   * @property {string} label -  label is to show beside badge if required
   */
  label: {
    type: String,
    default: "",
  },
  /**
   * @property {string} actionData -  action key is for set appropriate value on action based
   */
  actionData: {
    type: String,
    default: "",
  },

  /**
   * @property {string} badgeClass -  to pass desired classes for the badge
   */
  badgeClass: {
    type: String,
    default:
      "d-flex text-primary border border-primary rounded rounded-pill  px-3 fs-5 pb-0 text-center align-items-center bg-light",
  },

  /**
   * @property {string} labelTextColor -  to add classes to specifically to the label section of the badge
   */
  labelClass: {
    type: String,
    default: "",
  },

  /**
   * @property {string} actionClass -  to add classes to the action icon
   */
  actionClass: {
    type: String,
    default: "  ",
  },
  /**
   * @property {boolean} removable -  if true, the close/x icon will be showed otherwise not
   */
  removable: {
    type: Boolean,
    default: false,
  },
  // border border-primary
  // bg-primary text-white
});

const emits = defineEmits(["onRemove"]);
</script>
