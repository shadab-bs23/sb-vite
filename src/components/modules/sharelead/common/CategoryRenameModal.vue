<template>
  <BaseModal
    id="categoryRenameModal"
    v-model="isVisible"
    modifier-class="fade"
    dialog-class="modal-dialog-centered"
    footer-class="border-top-0 py-3"
  >
    <template v-slot:header>
      <h5 class="mb-0">{{ $t("common.ticket_type") }}</h5>
    </template>
    <template v-slot:closeButton>
      <div @click="handleCancel">
        <BaseButton button-class="btn-close"></BaseButton>
      </div>
    </template>
    <template v-slot:content>
      <div class="mb-3">
        <label for="categoryNameInput" class="form-label">{{
          $t("common.name")
        }}</label>
        <BaseInput
          inputId="categoryNameInput"
          v-model="categoryName"
          :placeholder="t('common.category_name_placeholder')"
          modifierClass="w-100"
          :class="{ 'is-invalid': hasValidationError }"
          @keyup.enter="handleApply"
          @input="validateCategoryName"
        />
        <div v-if="hasValidationError" class="invalid-feedback d-block">
          {{ validationError }}
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <div class="d-flex justify-content-end w-100">
        <BaseButton
          button-class="btn btn-outline-secondary me-2"
          @click="handleCancel"
        >
          {{ t("button.cancel") }}
        </BaseButton>
        <BaseButton
          button-class="btn btn-success text-white"
          @click="handleApply"
          :disabled="!categoryName.trim() || hasValidationError"
        >
          {{ t("button.apply") }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import BaseModal from "@busgroup/vue3-base-modal";
import BaseButton from "@busgroup/vue3-base-button";
import BaseInput from "@busgroup/vue3-base-input";
import { useI18n } from "vue-i18n";

interface Props {
  modelValue: boolean;
  currentCategoryName?: string;
  currentCategoryKey?: string;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (
    e: "categoryRenamed",
    data: { key: string; oldName: string; newName: string }
  ): void;
  (e: "cancel"): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  currentCategoryName: "",
  currentCategoryKey: "",
});

const emit = defineEmits<Emits>();
const { t } = useI18n();

// Internal state
const isVisible = ref(props.modelValue);
const categoryName = ref(props.currentCategoryName);
const validationError = ref<string>("");
const hasValidationError = ref(false);

// Validation function
const validateCategoryName = () => {
  const name = categoryName.value.trim();

  if (!name) {
    validationError.value = t("form.validation.category_name_required");
    hasValidationError.value = true;
    return false;
  }

  if (name.length > 120) {
    validationError.value = t("form.validation.category_name_max_length");
    hasValidationError.value = true;
    return false;
  }

  // Check for invalid characters - allow letters, numbers, spaces, and basic punctuation (., -, _)
  // Disallow special characters like %, &, #, @, etc.
  if (!/^[a-zA-Z0-9\s._-]+$/.test(name)) {
    validationError.value = t(
      "form.validation.category_name_invalid_characters"
    );
    hasValidationError.value = true;
    return false;
  }

  // Clear validation errors if valid
  validationError.value = "";
  hasValidationError.value = false;
  return true;
};

// Watch for prop changes
watch(
  () => props.modelValue,
  (newValue) => {
    isVisible.value = newValue;
    if (newValue) {
      // Reset the category name when modal opens
      categoryName.value = props.currentCategoryName;
      // Reset validation state
      validationError.value = "";
      hasValidationError.value = false;
    }
  }
);

watch(
  () => props.currentCategoryName,
  (newName) => {
    categoryName.value = newName;
    // Reset validation when category name changes
    validationError.value = "";
    hasValidationError.value = false;
  }
);

// Watch for internal visibility changes and emit to parent
watch(isVisible, (newValue) => {
  emit("update:modelValue", newValue);
});

// Handle apply (save changes)
const handleApply = () => {
  const trimmedName = categoryName.value.trim();

  // Validate before proceeding
  if (!validateCategoryName()) {
    return;
  }

  if (trimmedName && trimmedName !== props.currentCategoryName) {
    emit("categoryRenamed", {
      key: props.currentCategoryKey || "",
      oldName: props.currentCategoryName,
      newName: trimmedName,
    });
  }

  isVisible.value = false;
};

// Handle cancel
const handleCancel = () => {
  categoryName.value = props.currentCategoryName; // Reset to original value
  // Reset validation state
  validationError.value = "";
  hasValidationError.value = false;
  emit("cancel");
  isVisible.value = false;
};
</script>

<style scoped>
/* Add any specific styling if needed */
</style>
