<template>
  <div class="category-header-content">
    <span>{{ category.name || category.label }}</span>
    <button
      v-if="editMode"
      type="button"
      class="btn btn-sm btn-outline-secondary p-0 ms-1"
      style="width: 24px; height: 24px"
      @click="$emit('rename', categoryKey)"
      :title="$t('pickup.rename_category')"
    >
      <i class="fi fi-pencil"></i>
    </button>
  </div>
  <div v-if="editMode && !isFirstCategory" class="form-check mt-1">
    <input
      class="form-check-input"
      type="checkbox"
      :checked="category.enabled"
      @change="
        $emit(
          'toggle',
          categoryKey,
          ($event.target as HTMLInputElement).checked
        )
      "
      :id="`category-${categoryKey}`"
    />
    <label class="form-check-label" :for="`category-${categoryKey}`">
      {{ $t("pickup.active") }}
    </label>
  </div>
</template>

<script setup lang="ts">
interface Category {
  name?: string;
  label?: string;
  enabled?: boolean;
}

defineProps<{
  category: Category;
  categoryKey: string;
  editMode: boolean;
  isFirstCategory: boolean;
}>();

defineEmits<{
  rename: [categoryKey: string];
  toggle: [categoryKey: string, enabled: boolean];
}>();
</script>

<style scoped>
.category-header-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-check {
  margin-bottom: 0;
  padding-left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.form-check-label {
  margin-bottom: 0;
  margin-left: 0;
}

.form-check-input {
  margin-right: 0;
  margin-left: 0;
  margin-top: 0;
}
</style>
