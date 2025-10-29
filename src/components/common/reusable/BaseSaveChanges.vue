<template>
  <div class="d-flex flex-wrap">
    <BaseButton
      button-class="sb-btn-md sb-btn-secondary me-2"
      @click="action(false)"
      >Cancel</BaseButton
    >
    <BaseButton button-class="sb-btn-md sb-btn-primary" @click="action(true)"
      >Save Changes
    </BaseButton>
  </div>
</template>
<script lang="ts" setup>
import BaseButton from "@busgroup/vue3-base-button";
const emit = defineEmits(["saveChanges"]);

const action = (value: boolean) => {
  emit("saveChanges", value);
};
</script>
