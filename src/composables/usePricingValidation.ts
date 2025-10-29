import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

export interface ValidationConfig {
  isRequired?: boolean;
  allowEmpty?: boolean;
  minValue?: number;
  maxValue?: number;
  allowDecimals?: boolean;
}

export interface DataItem {
  index: number;
  prices?: Record<string, string>;
  priceMap?: Record<string, number>;
}

export interface Category {
  key?: string;
  name?: string;
  enabled?: boolean;
  [key: string]: unknown;
}

export function usePricingValidation() {
  const { t } = useI18n();
  const touchedFields = ref<Set<string>>(new Set());
  const fieldValidationErrors = ref<Record<string, string>>({});

  // Helper function to validate a single field
  const validateFieldValue = (
    value: string,
    config: ValidationConfig = {}
  ): string | null => {
    const {
      isRequired = true,
      allowEmpty = false,
      minValue = 1,
      maxValue = 9999,
      allowDecimals = true,
    } = config;

    try {
      if (!isRequired && (!value || value.trim() === "")) {
        return null; // Optional field can be empty
      }

      if (isRequired && (!value || value.trim() === "")) {
        return t("form.validation.this_field_required");
      }

      if (allowEmpty && (!value || value.trim() === "")) {
        return null;
      }

      const trimmedValue = value.trim();

      // Check if the entire string is a valid number (not just a partial parse)
      // This prevents cases like "13sdfdsf" from being accepted as "13"
      // Allow decimals like "13", "13.", "13.0", "13.50"
      if (!/^\d+(\.\d*)?$/.test(trimmedValue)) {
        return t("form.validation.enter_valid_number");
      }

      const numValue = parseFloat(trimmedValue);
      if (isNaN(numValue)) {
        return t("form.validation.enter_valid_number");
      }

      if (numValue < minValue) {
        return t("form.validation.price_range", {
          min: minValue,
          max: maxValue,
        });
      }

      if (numValue > maxValue) {
        return t("form.validation.price_range", {
          min: minValue,
          max: maxValue,
        });
      }

      // Check for decimal places if not allowed
      if (!allowDecimals && numValue !== Math.floor(numValue)) {
        return t("form.validation.enter_whole_number");
      }

      return null;
    } catch (error) {
      return t("form.validation.enter_valid_number");
    }
  };

  // Generate field key for validation tracking
  const getFieldKey = (itemIndex: number, categoryName: string): string => {
    return `${itemIndex}-${categoryName}`;
  };

  // Check if a field is invalid and should show error
  const isInvalidField = (dataItem: DataItem, categoryKey: string): boolean => {
    const fieldKey = getFieldKey(dataItem.index, categoryKey);
    return (
      touchedFields.value.has(fieldKey) &&
      fieldValidationErrors.value[fieldKey] !== undefined
    );
  };

  // Get error message for a field
  const getFieldErrorMessage = (
    dataItem: DataItem,
    categoryKey: string
  ): string => {
    const fieldKey = getFieldKey(dataItem.index, categoryKey);
    return fieldValidationErrors.value[fieldKey] || "";
  };

  // Handle field blur for validation
  const handleFieldBlur = (
    dataItem: DataItem,
    categoryKey: string,
    validationConfig: ValidationConfig = {}
  ) => {
    const fieldKey = getFieldKey(dataItem.index, categoryKey);

    // Get value from either prices object or priceMap
    const value =
      dataItem.prices?.[categoryKey] ||
      String(dataItem.priceMap?.[categoryKey] || "");

    // Mark field as touched
    touchedFields.value.add(fieldKey);

    const errorMessage = validateFieldValue(value, validationConfig);

    if (errorMessage) {
      fieldValidationErrors.value[fieldKey] = errorMessage;
    } else {
      delete fieldValidationErrors.value[fieldKey];
    }
  };

  // Validate all fields
  const validateAllFields = (
    dataItems: DataItem[],
    categories: Category[],
    getValidationConfig: (
      categoryKey: string,
      category: Category
    ) => ValidationConfig
  ): boolean => {
    fieldValidationErrors.value = {};

    dataItems.forEach((item) => {
      categories.forEach((category) => {
        const categoryKey = category.key || category.name || "";
        const value =
          item.prices?.[categoryKey] ||
          String(item.priceMap?.[categoryKey] || "");
        const fieldKey = getFieldKey(item.index, categoryKey);

        const validationConfig = getValidationConfig(categoryKey, category);
        const errorMessage = validateFieldValue(value, validationConfig);

        if (errorMessage) {
          fieldValidationErrors.value[fieldKey] = errorMessage;
        }
      });
    });

    return isFormValid.value;
  };

  // Check if form is valid
  const isFormValid = computed(() => {
    return Object.keys(fieldValidationErrors.value).length === 0;
  });

  // Clear validation errors for a specific field
  const clearFieldError = (dataItem: DataItem, categoryKey: string) => {
    const fieldKey = getFieldKey(dataItem.index, categoryKey);
    delete fieldValidationErrors.value[fieldKey];
  };

  // Reset all validation state
  const resetValidation = () => {
    touchedFields.value.clear();
    fieldValidationErrors.value = {};
  };

  return {
    touchedFields,
    fieldValidationErrors,
    validateFieldValue,
    getFieldKey,
    isInvalidField,
    getFieldErrorMessage,
    handleFieldBlur,
    validateAllFields,
    isFormValid,
    clearFieldError,
    resetValidation,
  };
}
