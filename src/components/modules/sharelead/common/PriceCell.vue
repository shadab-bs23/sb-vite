<template>
  <td
    class="price-cell text-center"
    :class="{ 'disabled-category': !category.enabled && !editMode }"
  >
    <template v-if="editMode">
      <div class="input-group-container">
        <input
          type="text"
          class="form-control form-control-sm"
          :value="value"
          :class="{ 'is-invalid': isInvalid }"
          @input="$emit('input', $event)"
          @blur="$emit('blur', $event)"
          :disabled="!category.enabled"
        />
        <span v-if="showCurrency" class="currency-label">kr</span>
      </div>
      <div v-if="isInvalid" class="invalid-feedback">
        {{ errorMessage }}
      </div>
    </template>
    <template v-else-if="category.enabled">
      {{ displayValue }}
    </template>
    <template v-else>
      <span class="text-muted">-</span>
    </template>
  </td>
</template>

<script setup lang="ts">
interface Category {
  enabled?: boolean;
}

defineProps<{
  category: Category;
  value: string;
  displayValue?: string;
  editMode: boolean;
  isInvalid: boolean;
  errorMessage: string;
  showCurrency?: boolean;
}>();

defineEmits<{
  input: [event: Event];
  blur: [event: Event];
}>();
</script>

<style scoped>
.price-cell {
  max-width: 220px;
  min-width: 80px;
  text-align: center;
  font-weight: 600;
  position: relative;
  vertical-align: middle;
}

.input-group-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.currency-label {
  font-weight: normal;
  margin-left: 0.25rem;
}

.form-control-sm {
  width: 100% !important;
  min-width: 100px;
  text-align: center;
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-control-sm:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-control-sm:disabled {
  background-color: #f8f9fa;
  opacity: 0.65;
}

.form-control-sm.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #dc3545;
}

.disabled-category {
  opacity: 0.5;
  background-color: #f8f9fa;
}
</style>
