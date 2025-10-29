import { ref, computed } from "vue";

export interface CategoryConfig {
  name: string;
  key: string;
  label: string;
  enabled: boolean;
  alwaysActive?: boolean;
}

export function useCategoryManagement(initialCategories: CategoryConfig[]) {
  const categories = ref<CategoryConfig[]>(initialCategories);
  const renameCategoryModal = ref(false);
  const currentCategory = ref("");

  // Categories list computed property
  const categoriesList = computed(() => {
    return categories.value.map((category) => ({
      ...category,
      active: category.enabled,
    }));
  });

  // Get the first category name (usually always active)
  const getFirstCategoryName = () => {
    return categories.value[0]?.key || "";
  };

  // Toggle category status
  const toggleCategoryStatus = (
    categoryKey: string,
    isEnabled: boolean,
    onUpdate?: (categoryKey: string, enabled: boolean) => void
  ) => {
    const category = categories.value.find((cat) => cat.key === categoryKey);
    if (category && !category.alwaysActive) {
      category.enabled = isEnabled;
      if (onUpdate) {
        onUpdate(categoryKey, isEnabled);
      }
    }
  };

  // Start category rename process
  const startCategoryRename = (categoryKey: string) => {
    currentCategory.value = categoryKey;
    renameCategoryModal.value = true;
  };

  // Handle category rename
  const handleCategoryRenamed = (
    data: { key: string; oldName: string; newName: string },
    onUpdate?: (key: string, oldName: string, newName: string) => void
  ) => {
    if (data.newName.trim()) {
      const category = categories.value.find((cat) => cat.key === data.key);
      if (category) {
        const oldName = category.name;
        category.name = data.newName.trim();
        category.label = data.newName.trim();

        if (onUpdate) {
          onUpdate(data.key, oldName, data.newName.trim());
        }
      }
    }
    renameCategoryModal.value = false;
  };

  // Cancel category rename
  const cancelCategoryRename = () => {
    renameCategoryModal.value = false;
    currentCategory.value = "";
  };

  // Update category labels
  const updateCategoryLabels = (newLabels: Record<string, string>) => {
    categories.value.forEach((category) => {
      if (newLabels[category.key]) {
        category.name = newLabels[category.key];
        category.label = newLabels[category.key];
      }
    });
  };

  // Get category by key
  const getCategoryByKey = (key: string): CategoryConfig | undefined => {
    return categories.value.find((cat) => cat.key === key);
  };

  // Check if category is enabled
  const isCategoryEnabled = (key: string): boolean => {
    const category = getCategoryByKey(key);
    return category ? category.enabled : false;
  };

  // Get enabled categories only
  const enabledCategories = computed(() => {
    return categories.value.filter((cat) => cat.enabled);
  });

  return {
    categories,
    categoriesList,
    renameCategoryModal,
    currentCategory,
    enabledCategories,
    getFirstCategoryName,
    toggleCategoryStatus,
    startCategoryRename,
    handleCategoryRenamed,
    cancelCategoryRename,
    updateCategoryLabels,
    getCategoryByKey,
    isCategoryEnabled,
  };
}
