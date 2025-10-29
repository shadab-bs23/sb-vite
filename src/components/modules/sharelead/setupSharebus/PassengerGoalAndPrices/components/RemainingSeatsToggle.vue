<template>
  <div class="mb-4">
    <div class="mb-3 text-start">
      {{ t("setup.show_remaining_seats") }}
    </div>
    <div>
      <div class="btn-group toggle-button-group" role="group">
        <button
          type="button"
          class="btn responsive-btn"
          :class="{
            'btn-success': modelValue,
            'btn-outline-secondary': !modelValue,
          }"
          @click="updateValue(true)"
        >
          {{ t("setup.yes") }}
        </button>
        <button
          type="button"
          class="btn responsive-btn"
          :class="{
            'btn-outline-secondary': modelValue,
            'btn-secondary': !modelValue,
          }"
          @click="updateValue(false)"
        >
          {{ t("setup.no") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const { t } = useI18n();

const updateValue = (value: boolean) => {
  emit("update:modelValue", value);
};
</script>

<style lang="scss" scoped>
.toggle-button-group .btn {
  transition: all 0.2s ease;
}

@media (max-width: 576px) {
  .toggle-button-group .btn {
    padding: 0.375rem 0.5rem;
    font-size: 0.875rem;
  }

  .responsive-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }
}
</style>
