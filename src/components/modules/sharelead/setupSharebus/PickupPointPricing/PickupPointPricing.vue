<template>
  <div class="pickup-price-table rounded overflow-auto">
    <table class="table mb-0">
      <thead>
        <tr>
          <th>
            {{ $t("pickup.pick_up_point") }}
            <i
              class="fi fi-info-circle ms-1"
              :title="$t('pickup.pickup_locations')"
            ></i>
          </th>
          <th>{{ $t("pickup.trip_departure") }}</th>
          <th
            v-for="category in categoriesList"
            :key="category.name"
            class="text-center"
          >
            <CategoryHeader
              :category="category"
              :category-key="category.key"
              edit-mode
              :is-first-category="category.key === getFirstCategoryName()"
              @rename="renameCategoryLabel"
              @toggle="toggleCategoryStatus"
            />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(pickup, index) in pickupPoints" :key="index">
          <td>{{ pickup.location || pickup.point }}</td>
          <td>
            {{
              formatDepartureTime(
                pickup.departureTime || pickup.planned_departure_time
              )
            }}
          </td>
          <PriceCell
            v-for="category in categoriesList"
            :key="category.key"
            :category="category"
            :value="getPriceFromMap(pickup.priceMap, category.key)"
            :display-value="getPriceFromMap(pickup.priceMap, category.key)"
            edit-mode
            :is-invalid="isInvalidField(pickup, category.key as 'categoryOne' | 'categoryTwo' | 'categoryThree')"
            :error-message="getFieldErrorMessage(pickup, category.key)"
            @input="handlePriceChange(pickup, category.key, $event)"
            @blur="handleFieldBlur(pickup, category.key)"
          />
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Category Rename Modal -->
  <CategoryRenameModal
    v-model="renameCategoryModal"
    :currentCategoryName="categoryLabels[currentCategory]"
    :currentCategoryKey="currentCategory"
    @categoryRenamed="handleCategoryRenamed"
    @cancel="handleCategoryRenameCancel"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useSharebusStore } from "@/store";
import { TViaPoints } from "@/components/ViaPointsPackage/types/types";
import { TicketPricing } from "@/store/sharebus/types";
import { usePriceUtilities } from "@/composables/usePriceUtilities";
import CategoryHeader from "../../common/CategoryHeader.vue";
import PriceCell from "../../common/PriceCell.vue";
import CategoryRenameModal from "../../common/CategoryRenameModal.vue";

// Define interfaces
interface Price {
  categoryOne: string;
  categoryTwo: string;
  categoryThree: string;
}

// Extended price interface that includes active status
interface ExtendedPrice {
  value: string;
  active: boolean;
}

// Final data structure that can be exported with active status
interface PriceWithActiveStatus {
  categoryOne: string; // CategoryOne is always active
  categoryTwo: ExtendedPrice;
  categoryThree: ExtendedPrice;
}

// Data structure for a pickup point
interface PickupPoint {
  location?: string;
  point?: string;
  departureTime?: Date | string;
  planned_departure_time?: Date | string;
  prices: Price;
  priceMap: Record<string, number>;
  id: number; // Use id directly instead of pointId
  index: number;
}

// Use composables
const { getPriceFromMap, formatDepartureTime } = usePriceUtilities();

// Track validation state
const touchedFields = ref<Set<string>>(new Set());
const fieldValidationErrors = ref<Record<string, string>>({});
const isFormSubmitted = ref(false);

// Interface for the data exposed to parent component
interface PickupPriceDataHandler {
  priceData: PickupPoint[];
  priceDataWithActiveStatus: Array<{
    location: string;
    departureTime: Date | string;
    pointId: number; // Keep as pointId for external interface compatibility
    prices: PriceWithActiveStatus;
  }>;
  categoryActiveStatus: {
    categoryOne: boolean;
    categoryTwo: boolean;
    categoryThree: boolean;
  };
  categoryLabels: {
    categoryOne: string;
    categoryTwo: string;
    categoryThree: string;
  };
  isValid: boolean;
}

// Props for configuration
const props = defineProps({
  // Initial category labels - if provided, will use these
  initialCategoryLabels: {
    type: Object,
    default: () => ({
      categoryOne: "Adult",
      categoryTwo: "Child",
      categoryThree: "Senior",
    }),
  },
  // Initial category active status - if provided, will use these
  initialCategoryActiveStatus: {
    type: Object,
    default: () => ({
      categoryOne: true,
      categoryTwo: true,
      categoryThree: true,
    }),
  },
});

// State
const secondCategoryActive = ref(true);
const thirdCategoryActive = ref(true);
const currentCategory = ref<"categoryOne" | "categoryTwo" | "categoryThree">(
  "categoryOne"
);
const pickupPoints = ref<PickupPoint[]>([]);

// Category naming state
const categoryLabels = ref({
  categoryOne: props.initialCategoryLabels.categoryOne,
  categoryTwo: props.initialCategoryLabels.categoryTwo,
  categoryThree: props.initialCategoryLabels.categoryThree,
});

// Active status for each category
const categoryActiveStatus = ref({
  categoryOne: true, // CategoryOne is always active
  categoryTwo: props.initialCategoryActiveStatus.categoryTwo,
  categoryThree: props.initialCategoryActiveStatus.categoryThree,
});

// Using modal directly instead of inline form
const renameCategoryModal = ref(false);

// Store - always use store integration
const sharebusStore = useSharebusStore();
const { t } = useI18n();

// Helper function to validate a single field
const validateFieldValue = (
  value: string,
  isRequired = true
): string | null => {
  try {
    if (!isRequired && (!value || value.trim() === "")) {
      return null; // Optional field can be empty
    }

    if (isRequired && (!value || value.trim() === "")) {
      return t("form.validation.this_field_required");
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

    if (numValue < 1) {
      return t("form.validation.price_range", { min: 1, max: 9999 });
    }

    if (numValue > 9999) {
      return t("form.validation.price_range", { min: 1, max: 9999 });
    }

    return null;
  } catch (error) {
    return t("form.validation.enter_valid_number");
  }
};

// Generate field key for validation tracking
const getFieldKey = (pointIndex: number, categoryName: string): string => {
  return `${pointIndex}-${categoryName}`;
};

// Handle field blur for validation
const handleFieldBlur = (pickup: PickupPoint, categoryName: string) => {
  const fieldKey = getFieldKey(pickup.index, categoryName);
  const value = pickup.prices[categoryName as keyof typeof pickup.prices] || "";

  // Mark field as touched
  touchedFields.value.add(fieldKey);

  // First category is always required
  const isRequired = categoryName === "categoryOne";
  // Other categories are required only if enabled
  const isEnabledRequired =
    (categoryName === "categoryTwo" &&
      categoryActiveStatus.value.categoryTwo) ||
    (categoryName === "categoryThree" &&
      categoryActiveStatus.value.categoryThree);

  const errorMessage = validateFieldValue(
    value,
    isRequired || isEnabledRequired
  );

  if (errorMessage) {
    fieldValidationErrors.value[fieldKey] = errorMessage;
  } else {
    delete fieldValidationErrors.value[fieldKey];
  }
};

// Method to check if a field is invalid and should show error
const isInvalidField = (
  point: PickupPoint,
  category: "categoryOne" | "categoryTwo" | "categoryThree"
) => {
  // Hide error if category is inactive
  if (
    (category === "categoryTwo" && !categoryActiveStatus.value.categoryTwo) ||
    (category === "categoryThree" && !categoryActiveStatus.value.categoryThree)
  ) {
    return false;
  }
  const fieldKey = getFieldKey(point.index, category);
  // Only show error if field has been touched (blurred) and has an error
  return (
    touchedFields.value.has(fieldKey) &&
    fieldValidationErrors.value[fieldKey] !== undefined
  );
};

// Get error message for a field
const getFieldErrorMessage = (
  pickup: PickupPoint,
  categoryName: string
): string => {
  const fieldKey = getFieldKey(pickup.index, categoryName);
  return fieldValidationErrors.value[fieldKey] || "";
};

// Method to validate all fields and show validation errors
const validateFields = async (showErrors = false) => {
  fieldValidationErrors.value = {};

  // Validate all fields
  pickupPoints.value.forEach((point) => {
    ["categoryOne", "categoryTwo", "categoryThree"].forEach((category) => {
      const value = point.prices[category as keyof typeof point.prices] || "";
      const fieldKey = getFieldKey(point.index, category);

      // Only mark field as touched to show validation errors when explicitly requested
      if (showErrors) {
        touchedFields.value.add(fieldKey);
      }

      // First category is always required
      const isRequired = category === "categoryOne";
      // Other categories are required only if enabled
      const isEnabledRequired =
        (category === "categoryTwo" &&
          categoryActiveStatus.value.categoryTwo) ||
        (category === "categoryThree" &&
          categoryActiveStatus.value.categoryThree);

      const errorMessage = validateFieldValue(
        value,
        isRequired || isEnabledRequired
      );

      if (errorMessage) {
        fieldValidationErrors.value[fieldKey] = errorMessage;
      }
    });
  });

  return isFormValid();
};

// Check if form is valid
const isFormValid = () => {
  return Object.keys(fieldValidationErrors.value).length === 0;
};

// Initialize data from store
onMounted(() => {
  // Reset form state on mount
  touchedFields.value.clear();
  fieldValidationErrors.value = {};
  isFormSubmitted.value = false;

  // Always use store data
  initializeFromStore();
});

// Initialize component from store data
const initializeFromStore = () => {
  // Get pickup points from Sharebus Store
  const points = getPickupPointsFromStore();
  if (points && points.length > 0) {
    pickupPoints.value = points;
  }

  // Initialize from store data if available - using ticket_pricing
  const existingTicketPricing =
    sharebusStore.getPassengerGoalAndPriceStepData.ticket_pricing;
  if (
    existingTicketPricing &&
    existingTicketPricing.via_points &&
    existingTicketPricing.via_points.length > 0
  ) {
    mergeExistingTicketPricingData(existingTicketPricing);
  }

  // Save initial price data to store
  savePickupPricesToStore();
};

// Get pickup points from Sharebus Store
const getPickupPointsFromStore = (): PickupPoint[] => {
  // Access the one-way trip points from the store
  const storeData = sharebusStore.getRouteStepData;
  const viaPoints = storeData.route_points?.oneway || [];

  if (!viaPoints || viaPoints.length === 0) {
    return [];
  }

  // Exclude the last point (destination) from pickup points - passengers cannot board at the final destination
  // This is different from itinerary display which shows all points including destination
  const pickupOnlyPoints = viaPoints.slice(0, -1);

  // Map TViaPoints to PickupPoint interface
  return pickupOnlyPoints.map((point: TViaPoints, index: number) => {
    return {
      location: point.point || "",
      departureTime: point.planned_departure_time || new Date(),
      id: point.id,
      priceMap: {},
      index,
      prices: { categoryOne: "", categoryTwo: "", categoryThree: "" },
    };
  });
};

// Merge existing ticket pricing data from store with current pickup points
const mergeExistingTicketPricingData = (ticketPricing: TicketPricing) => {
  // Update category active status from store
  if (ticketPricing.categories) {
    ticketPricing.categories.forEach((category) => {
      if (category.name === categoryLabels.value.categoryOne) {
        categoryActiveStatus.value.categoryOne = category.enabled;
      } else if (category.name === categoryLabels.value.categoryTwo) {
        categoryActiveStatus.value.categoryTwo = category.enabled;
        secondCategoryActive.value = category.enabled;
      } else if (category.name === categoryLabels.value.categoryThree) {
        categoryActiveStatus.value.categoryThree = category.enabled;
        thirdCategoryActive.value = category.enabled;
      }
    });
  }

  // Update pricing from via_points
  if (ticketPricing.via_points) {
    pickupPoints.value = pickupPoints.value.map((point) => {
      const viaPointData = ticketPricing.via_points.find(
        (vp) => vp.id === point.id
      );

      if (viaPointData && viaPointData.category_prices) {
        const categoryLabelsMap = categoryLabels.value;
        const prices = { ...point.prices };

        viaPointData.category_prices.forEach((categoryPrice) => {
          if (categoryPrice.name === categoryLabelsMap.categoryOne) {
            prices.categoryOne = String(categoryPrice.price || "");
          } else if (categoryPrice.name === categoryLabelsMap.categoryTwo) {
            prices.categoryTwo = String(categoryPrice.price || "");
          } else if (categoryPrice.name === categoryLabelsMap.categoryThree) {
            prices.categoryThree = String(categoryPrice.price || "");
          }
        });

        return { ...point, prices };
      }
      return point;
    });
  }
};

// Watch for changes in store data
watch(
  () => sharebusStore.getRouteStepData.route_points.oneway,
  (newPoints) => {
    if (!newPoints) return;

    if (newPoints.length > 0) {
      const mappedPoints = getPickupPointsFromStore();

      // Get existing store data if available - from ticket_pricing
      const existingTicketPricing =
        sharebusStore.getPassengerGoalAndPriceStepData.ticket_pricing;

      // Preserve existing price data when updating points
      const updatedPoints: PickupPoint[] = mappedPoints.map((newPoint) => {
        // First check current component data
        let existingPoint = pickupPoints.value.find(
          (p) =>
            p.id === newPoint.id ||
            (p.location || p.point) === (newPoint.location || newPoint.point)
        );

        // Then check store data if we don't have it in component state
        if (!existingPoint && existingTicketPricing?.via_points) {
          const viaPointData = existingTicketPricing.via_points.find(
            (vp) => vp.id === newPoint.id
          );

          if (viaPointData && viaPointData.category_prices) {
            const categoryLabelsMap = categoryLabels.value;
            const prices = {
              categoryOne: "",
              categoryTwo: "",
              categoryThree: "",
            };

            viaPointData.category_prices.forEach((categoryPrice) => {
              if (categoryPrice.name === categoryLabelsMap.categoryOne) {
                prices.categoryOne = String(categoryPrice.price || "");
              } else if (categoryPrice.name === categoryLabelsMap.categoryTwo) {
                prices.categoryTwo = String(categoryPrice.price || "");
              } else if (
                categoryPrice.name === categoryLabelsMap.categoryThree
              ) {
                prices.categoryThree = String(categoryPrice.price || "");
              }
            });

            return { ...newPoint, prices };
          }
        }

        // Use existingPoint if found, otherwise use default empty prices
        return {
          ...newPoint,
          prices: existingPoint
            ? existingPoint.prices
            : { categoryOne: "", categoryTwo: "", categoryThree: "" },
        };
      });

      // Exclude the last point (destination) from pickup points
      const pickupOnlyUpdatedPoints = updatedPoints.slice(0, -1);
      pickupPoints.value = pickupOnlyUpdatedPoints;

      // Save updated price data to store after pickup points are updated
      savePickupPricesToStore();
    }
  },
  { deep: true }
);

// Helper function to validate if a price is a valid number (0 or more)
const isValidPrice = (value: string): boolean => {
  if (!value || value.trim() === "") return false;

  const numValue = parseFloat(value.trim());
  return !isNaN(numValue) && numValue >= 0;
};

const renameCategoryLabel = (
  category: "categoryOne" | "categoryTwo" | "categoryThree"
) => {
  currentCategory.value = category;
  renameCategoryModal.value = true;
};

// Handle category rename from modal
const handleCategoryRenamed = (data: {
  key: string;
  oldName: string;
  newName: string;
}) => {
  if (data.newName.trim()) {
    // Save old and new name
    const oldName = data.oldName;
    const newName = data.newName.trim();
    const key = currentCategory.value;

    // Update the label
    categoryLabels.value[key] = newName;

    // Update any price data that references the old name in ticket pricing (store)
    const ticketPricing =
      sharebusStore.getPassengerGoalAndPriceStepData.ticket_pricing;
    if (ticketPricing && Array.isArray(ticketPricing.categories)) {
      ticketPricing.categories.forEach((cat) => {
        if (cat && typeof cat.name === "string" && cat.name === oldName) {
          cat.name = newName;
        }
      });
      // Update the store with new categories
      sharebusStore.updateTicketPricingCategories.call(
        sharebusStore,
        ticketPricing.categories
      );
    }

    // Update any via_points category_prices name
    if (ticketPricing && Array.isArray(ticketPricing.via_points)) {
      ticketPricing.via_points.forEach((vp) => {
        if (vp && Array.isArray(vp.category_prices)) {
          vp.category_prices.forEach((cp) => {
            if (cp && typeof cp.name === "string" && cp.name === oldName) {
              cp.name = newName;
            }
          });
        }
      });
      sharebusStore.updateViaPointsPricing.call(
        sharebusStore,
        ticketPricing.via_points
      );
    }

    // Save category labels to store
    sharebusStore.setPassengerGoalAndPriceStepDataSpecific.call(
      sharebusStore,
      "categoryLabels",
      categoryLabels.value
    );
  }
};

// Handle cancel from modal
const handleCategoryRenameCancel = () => {
  // Modal will handle its own state, no additional logic needed
};

// Watch for changes in active categories
watch(
  [secondCategoryActive, thirdCategoryActive],
  ([secondActive, thirdActive]) => {
    // Update the active status in our tracking object
    categoryActiveStatus.value.categoryTwo = secondActive;
    categoryActiveStatus.value.categoryThree = thirdActive;

    // Always save to store when active status changes
    savePickupPricesToStore();
  }
);

// Function to save pickup point prices to the store
const savePickupPricesToStore = () => {
  // Save category labels
  sharebusStore.setPassengerGoalAndPriceStepDataSpecific.call(
    sharebusStore,
    "categoryLabels",
    categoryLabels.value
  );

  // Update store with new API payload structure
  updateStoreWithApiPayload();
};

// Method to export price data with active status
const getPriceDataWithActiveStatus = () => {
  return pickupPoints.value.map((point) => {
    // Create pricing data with active status info
    const pricesWithStatus: PriceWithActiveStatus = {
      categoryOne: point.prices.categoryOne, // CategoryOne is always active
      categoryTwo: {
        value: point.prices.categoryTwo,
        active: categoryActiveStatus.value.categoryTwo,
      },
      categoryThree: {
        value: point.prices.categoryThree,
        active: categoryActiveStatus.value.categoryThree,
      },
    };

    return {
      location: point.location || point.point || "",
      departureTime:
        point.departureTime || point.planned_departure_time || new Date(),
      pointId: point.id,
      prices: pricesWithStatus,
    };
  });
};

// Method to provide the price data to parent components
const getPickupPriceData = (): PickupPriceDataHandler => {
  // Check if all required fields are filled and valid
  const isValid = pickupPoints.value.every((point) => {
    // Category One is always required and must be a valid number
    if (
      !point.prices.categoryOne ||
      point.prices.categoryOne.trim() === "" ||
      !isValidPrice(point.prices.categoryOne)
    ) {
      return false;
    }

    // Check Category Two if it's active - must be valid if filled
    if (categoryActiveStatus.value.categoryTwo) {
      if (
        !point.prices.categoryTwo ||
        point.prices.categoryTwo.trim() === "" ||
        !isValidPrice(point.prices.categoryTwo)
      ) {
        return false;
      }
    }

    // Check Category Three if it's active - must be valid if filled
    if (categoryActiveStatus.value.categoryThree) {
      if (
        !point.prices.categoryThree ||
        point.prices.categoryThree.trim() === "" ||
        !isValidPrice(point.prices.categoryThree)
      ) {
        return false;
      }
    }

    return true;
  });

  return {
    priceData: pickupPoints.value,
    priceDataWithActiveStatus: getPriceDataWithActiveStatus(),
    categoryActiveStatus: categoryActiveStatus.value,
    categoryLabels: categoryLabels.value,
    isValid: isValid,
  };
};

// Method to generate the API payload format for ticket pricing
const getTicketPricingPayload = () => {
  // Categories mapping with display labels
  const categories = [
    {
      name: categoryLabels.value.categoryOne || "Adult",
      enabled: categoryActiveStatus.value.categoryOne,
    },
    {
      name: categoryLabels.value.categoryTwo || "Child",
      enabled: categoryActiveStatus.value.categoryTwo,
    },
    {
      name: categoryLabels.value.categoryThree || "Senior",
      enabled: categoryActiveStatus.value.categoryThree,
    },
  ];

  // Via points with category prices
  const viaPoints = pickupPoints.value.map((point) => {
    const categoryPrices: { name: string; price: number }[] = [];

    // Add prices for each category
    const categoryOneLabel = categoryLabels.value.categoryOne || "Adult";
    const categoryTwoLabel = categoryLabels.value.categoryTwo || "Child";
    const categoryThreeLabel = categoryLabels.value.categoryThree || "Senior";

    if (categoryActiveStatus.value.categoryOne && point.prices.categoryOne) {
      categoryPrices.push({
        name: categoryOneLabel,
        price: parseFloat(point.prices.categoryOne) || 0,
      });
    }

    if (categoryActiveStatus.value.categoryTwo && point.prices.categoryTwo) {
      categoryPrices.push({
        name: categoryTwoLabel,
        price: parseFloat(point.prices.categoryTwo) || 0,
      });
    }

    if (
      categoryActiveStatus.value.categoryThree &&
      point.prices.categoryThree
    ) {
      categoryPrices.push({
        name: categoryThreeLabel,
        price: parseFloat(point.prices.categoryThree) || 0,
      });
    }

    return {
      id: point.id,
      category_prices: categoryPrices,
    };
  });

  return {
    categories,
    via_points: viaPoints,
  };
};

// Update store with new API payload structure
const updateStoreWithApiPayload = () => {
  const payload = getTicketPricingPayload();

  // Update the store with new API payload structure
  sharebusStore.updateTicketPricingCategories.call(
    sharebusStore,
    payload.categories
  );
  sharebusStore.updateViaPointsPricing.call(sharebusStore, payload.via_points);
};

// Computed property for dynamic categories list
const categoriesList = computed(() => {
  // Use existing category labels and active status
  return [
    {
      name: categoryLabels.value.categoryOne,
      label: categoryLabels.value.categoryOne,
      key: "categoryOne",
      active: true,
      enabled: true,
    },
    {
      name: categoryLabels.value.categoryTwo,
      label: categoryLabels.value.categoryTwo,
      key: "categoryTwo",
      active: categoryActiveStatus.value.categoryTwo,
      enabled: categoryActiveStatus.value.categoryTwo,
    },
    {
      name: categoryLabels.value.categoryThree,
      label: categoryLabels.value.categoryThree,
      key: "categoryThree",
      active: categoryActiveStatus.value.categoryThree,
      enabled: categoryActiveStatus.value.categoryThree,
    },
  ];
});

// Get the first category name (always active)
const getFirstCategoryName = () => {
  return categoriesList.value[0]?.key || "categoryOne";
};

// Toggle category status
const toggleCategoryStatus = (categoryName: string, isActive: boolean) => {
  // Update the category active status
  if (categoryName === "categoryTwo") {
    categoryActiveStatus.value.categoryTwo = isActive;
    secondCategoryActive.value = isActive;
  } else if (categoryName === "categoryThree") {
    categoryActiveStatus.value.categoryThree = isActive;
    thirdCategoryActive.value = isActive;
  }

  // Always save to store
  savePickupPricesToStore();
};

// Handle price change
const handlePriceChange = (
  pickup: PickupPoint,
  categoryName: string,
  event: Event
) => {
  const target = event.target as HTMLInputElement;
  const value = target.value;

  // Update the priceMap
  if (!pickup.priceMap) {
    pickup.priceMap = {};
  }
  pickup.priceMap[categoryName] = parseFloat(value) || 0;

  // Also update the old prices structure for backward compatibility
  if (categoryName === "categoryOne") {
    pickup.prices.categoryOne = value;
  } else if (categoryName === "categoryTwo") {
    pickup.prices.categoryTwo = value;
  } else if (categoryName === "categoryThree") {
    pickup.prices.categoryThree = value;
  }

  // Always save to store
  savePickupPricesToStore();
};

// Expose component methods and data for parent components
defineExpose({
  getPickupPriceData,
  validateFields,
  getTicketPricingPayload,
  updateStoreWithApiPayload,
});
</script>

<style scoped>
.category-header-content {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
}

.form-check {
  margin-bottom: 0;
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
}

.pickup-price-table th {
  vertical-align: middle;
  padding-top: 8px;
  padding-bottom: 8px;
}

.pickup-price-table thead {
  border-bottom: 1px solid #dee2e6 !important;
}

.price-cell {
  width: 220px;
  min-width: 220px;
}

.price-cell .form-control {
  width: 100% !important;
  min-width: 100px;
}

.price-cell .form-control:disabled {
  width: 100% !important;
  min-width: 100px;
  background-color: #f8f9fa;
  opacity: 0.65;
}
</style>
