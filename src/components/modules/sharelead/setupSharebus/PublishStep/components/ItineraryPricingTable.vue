<template>
  <div class="itinerary-pricing-table">
    <div class="row mb-3">
      <div class="col-6">
        <BaseActionHeader
          :header="t('common.itinerary')"
          :icon-path="'fi fi-geo-alt-fill text-success'"
          :show-edit-button="props.showEditButtons"
          :button-label="t('button.edit')"
          :button-icon="'/img/icons/edit.svg'"
          :button-alt-text="t('button.edit')"
          :button-on-click="handleItineraryEdit"
          :next-route="props.nextItineraryRoute"
          :route-params="props.itineraryRouteParams"
        />
      </div>
      <div class="col-6">
        <BaseActionHeader
          :header="t('setup.ticket_prices')"
          :is-img="true"
          :icon-path="'/img/icons/ticket-icon.svg'"
          :show-edit-button="props.showEditButtons"
          :button-label="t('button.edit')"
          :button-icon="'/img/icons/edit.svg'"
          :button-alt-text="t('button.edit')"
          :button-on-click="handleTicketPricesEdit"
          :next-route="props.nextTicketPricesRoute"
          :route-params="props.ticketPricesRouteParams"
        />
      </div>
    </div>

    <!-- Combined Itinerary and Pricing Table -->
    <div class="combined-table">
      <table class="table">
        <thead>
          <!-- Single Header Row -->
          <tr>
            <th class="time-header text-start">
              <div class="mb-1">
                {{ t("sharebus.departure") }}: {{ formatDate(departureDate) }}
              </div>
              <div v-if="bookingReference" class="booking-reference">
                <img src="/img/trip-info/signage.svg" />
                <p class="mt-2">
                  <span class="fw-bold">{{ bookingReference }}</span>
                  <span class="ms-1 fw-normal">{{
                    t("sharebus.trip_page.bus_signage")
                  }}</span>
                </p>
              </div>
            </th>
            <th
              v-for="category in categoriesList"
              :key="category.name"
              class="text-center price-header align-items-end pt-5"
            >
              <CategoryHeader
                :category="category"
                :category-key="category.name"
                :edit-mode="editMode"
                :is-first-category="category.name === getFirstCategoryName()"
                @rename="renameCategoryLabel"
                @toggle="toggleCategoryStatus"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- Route Points with Pricing Data -->
          <tr
            v-for="pointData in pricingTableData"
            :key="`point-${pointData.index}`"
          >
            <td class="time-cell text-start">
              <div class="d-flex align-items-start gap-3">
                <TimelineComponent
                  :point="pointData"
                  :show-connector-line="!pointData.isLastPoint"
                />
              </div>
            </td>
            <!-- Don't show price cells for destination point (last point) -->
            <template v-if="!pointData.isLastPoint">
              <PriceCell
                v-for="category in categoriesList"
                :key="category.name"
                :category="category"
                :value="getPriceFromMap(pointData.priceMap, category.name)"
                :display-value="
                  formatPriceDisplay(pointData.priceMap, category.name)
                "
                :edit-mode="editMode"
                :is-invalid="isInvalidField(pointData, category.name)"
                :error-message="getFieldErrorMessage(pointData, category.name)"
                @input="handlePriceChange(pointData, category.name, $event)"
                @blur="handleFieldBlur(pointData, category.name)"
              />
            </template>
            <!-- Show empty cells for destination point to maintain table structure -->
            <template v-else>
              <td
                v-for="category in categoriesList"
                :key="`empty-${category.name}`"
                class="price-cell"
              >
                <span class="text-muted"></span>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Category Rename Modal -->
  <CategoryRenameModal
    v-model="renameCategoryModal"
    :currentCategoryName="newCategoryName"
    :currentCategoryKey="currentCategoryName"
    @categoryRenamed="handleCategoryRenamed"
    @cancel="handleCategoryRenameCancel"
  />
</template>

<script setup lang="ts">
import { computed, ref, nextTick, onMounted, triggerRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { TViaPoints } from "@/components/ViaPointsPackage/types/types";
import type { TicketPricing } from "@/store/sharebus/types";
import { usePricingValidation } from "@/composables/usePricingValidation";
import { usePriceUtilities } from "@/composables/usePriceUtilities";
import CategoryHeader from "../../../common/CategoryHeader.vue";
import PriceCell from "../../../common/PriceCell.vue";
import CategoryRenameModal from "../../../common/CategoryRenameModal.vue";
import BaseActionHeader from "@/components/common/reusable/BaseActionHeader.vue";
import TimelineComponent from "@/components/common/TimelineComponent.vue";
import { useCompanyTimeFormat } from "@/composables/useCompanyTimeFormat";

// Define emits
const emit = defineEmits<{
  validationStatusChanged: [isValid: boolean];
  dataRequest: [type: string];
  pricingUpdated: [data: TicketPricing];
}>();

// Define interface for point data
interface PointData {
  priceMap: Record<string, number>;
  index: number;
  isLastPoint: boolean;
  [key: string]: unknown;
}

// Define interface for changed pricing data
interface ChangedPricingPoint {
  id: number;
  category_prices: Array<{
    name: string;
    price: number;
  }>;
}

const props = defineProps({
  routePoints: {
    type: Object as () => TViaPoints[],
    required: true,
  },
  ticketPricing: {
    type: Object as () => TicketPricing,
    required: true,
  },
  departureDate: {
    type: [Date, String],
    required: true,
  },
  showEditButtons: {
    type: Boolean,
    default: false,
  },
  editMode: {
    type: Boolean,
    default: false,
  },
  onEditItinerary: {
    type: Function,
    default: null,
  },
  onEditTicketPrices: {
    type: Function,
    default: null,
  },
  //for the header
  nextItineraryRoute: {
    type: String,
    required: true,
  },
  nextTicketPricesRoute: {
    type: String,
    required: true,
  },
  itineraryRouteParams: {
    type: Object,
    default: () => ({}),
  },
  ticketPricesRouteParams: {
    type: Object,
    default: () => ({}),
  },
  bookingReference: {
    type: String,
    default: "",
  },
});

const { t } = useI18n();
const formatInCompanyTimezone = useCompanyTimeFormat();

// Create a local reactive copy of ticket pricing for proper state management
const localTicketPricing = ref<TicketPricing>({
  categories: [],
  via_points: [],
});

// Helper function to ensure all categories have entries in all via_points
const ensureAllCategoriesInViaPoints = (ticketPricing: TicketPricing) => {
  const categories = ticketPricing.categories || [];
  const viaPoints = ticketPricing.via_points || [];

  viaPoints.forEach((viaPoint) => {
    if (!viaPoint.category_prices) {
      viaPoint.category_prices = [];
    }

    // Ensure each category has an entry
    categories.forEach((category) => {
      const existingCategoryPrice = viaPoint.category_prices?.find(
        (cp) => cp.name === category.name
      );

      if (!existingCategoryPrice && viaPoint.category_prices) {
        viaPoint.category_prices.push({
          name: category.name,
          price: 0,
        });
      }
    });
  });

  return ticketPricing;
};

// Initialize local data from props
onMounted(() => {
  // 1. Initialize local data from props
  if (props.ticketPricing) {
    // Deep copy the pricing data to ensure reactivity
    const copiedData = {
      categories: [...(props.ticketPricing.categories || [])],
      via_points: (props.ticketPricing.via_points || []).map((vp) => ({
        ...vp,
        category_prices: vp.category_prices ? [...vp.category_prices] : [],
      })),
    };

    // Ensure all categories have entries in all via_points
    localTicketPricing.value = ensureAllCategoriesInViaPoints(copiedData);
  }

  // 2. Run initial validation and emit status
  nextTick(() => {
    validateFields();
    emit("validationStatusChanged", isFormValid.value);
  });
});

watch(
  () => props.ticketPricing,
  (newPricing) => {
    if (newPricing) {
      const copiedData = {
        categories: [...(newPricing.categories || [])],
        via_points: (newPricing.via_points || []).map((vp) => ({
          ...vp,
          category_prices: vp.category_prices ? [...vp.category_prices] : [],
        })),
      };

      // Ensure all categories have entries in all via_points
      localTicketPricing.value = ensureAllCategoriesInViaPoints(copiedData);
    }
  },
  { deep: true }
);

// Use validation composable
const { fieldValidationErrors, validateFieldValue, isFormValid } =
  usePricingValidation();

// Use price utilities composable
const { getPriceFromMap: utilityGetPriceFromMap } = usePriceUtilities();

// Handle edit button clicks - emit events only
const handleItineraryEdit = () => {
  if (props.onEditItinerary) {
    props.onEditItinerary();
  }
};

const handleTicketPricesEdit = () => {
  if (props.onEditTicketPrices) {
    props.onEditTicketPrices();
  }
};

// Handle price change in edit mode
const handlePriceChange = (pointData, categoryName, event) => {
  const newPrice = event.target.value;
  const numericPrice = parseFloat(newPrice) || 0;

  // Update the price map with the numeric value
  pointData.priceMap[categoryName] = numericPrice;

  // Also update the underlying via_points data structure immediately
  const viaPoints = localTicketPricing.value?.via_points || [];
  const viaPoint = viaPoints.find((vp) => vp.id === pointData.id);
  if (viaPoint && viaPoint.category_prices) {
    let categoryPrice = viaPoint.category_prices.find(
      (cp) => cp.name === categoryName
    );

    // If category price entry doesn't exist, create it
    if (!categoryPrice) {
      categoryPrice = {
        name: categoryName,
        price: numericPrice,
      };
      viaPoint.category_prices.push(categoryPrice);
    } else {
      // Update existing entry
      categoryPrice.price = numericPrice;
    }
  }

  // Clear validation error when user starts typing
  const fieldKey = getFieldKey(pointData.index, categoryName);
  if (fieldValidationErrors.value[fieldKey]) {
    delete fieldValidationErrors.value[fieldKey];
  }

  // Re-validate this specific field
  const categories = localTicketPricing.value?.categories || [];
  const category = categories.find((cat) => cat.name === categoryName);

  if (category && !pointData.isLastPoint) {
    const isFirstCategory = categories.indexOf(category) === 0;
    const isRequired = isFirstCategory || category.enabled;

    const errorMessage = validateFieldValue(newPrice, {
      isRequired: isRequired,
    });

    if (errorMessage) {
      fieldValidationErrors.value[fieldKey] = errorMessage;
    }
  }

  // Emit validation status change to parent
  emit("validationStatusChanged", isFormValid.value);

  // Emit pricing update to parent
  emit("pricingUpdated", getUpdatedPricingData());
};

// Handle field blur - adapted for PriceCell component
const handleFieldBlur = (pointData: PointData, categoryName: string) => {
  // Skip validation for destination point (last point)
  if (pointData.isLastPoint) {
    return;
  }

  const value = String(pointData.priceMap[categoryName] || "");
  const categories = localTicketPricing.value?.categories || [];
  const category = categories.find((cat) => cat.name === categoryName);
  const fieldKey = getFieldKey(pointData.index, categoryName);

  if (!category) return;

  // First category is always required for non-destination points
  const isFirstCategory = categories.indexOf(category) === 0;
  // Other categories are required only if enabled
  const isRequired = isFirstCategory || category.enabled;

  const errorMessage = validateFieldValue(value, {
    isRequired: isRequired,
  });

  if (errorMessage) {
    fieldValidationErrors.value[fieldKey] = errorMessage;
  } else {
    delete fieldValidationErrors.value[fieldKey];
  }

  // Emit validation status change to parent
  emit("validationStatusChanged", isFormValid.value);
};

// Generate field key for validation tracking
const getFieldKey = (pointIndex: number, categoryName: string): string => {
  return `${pointIndex}-${categoryName}`;
};

// Method to check if a field is invalid and should show error
const isInvalidField = (pointData: PointData, categoryName: string) => {
  const fieldKey = getFieldKey(pointData.index, categoryName);
  return fieldValidationErrors.value[fieldKey] !== undefined;
};

// Get error message for a field
const getFieldErrorMessage = (
  pointData: PointData,
  categoryName: string
): string => {
  const fieldKey = getFieldKey(pointData.index, categoryName);
  return fieldValidationErrors.value[fieldKey] || "";
};

// Method to validate all fields and show validation errors - using composable
const validateFields = () => {
  fieldValidationErrors.value = {};

  // Validate all fields for non-destination points only
  pricingTableData.value.forEach((pointData) => {
    // Skip validation for destination point (last point)
    if (pointData.isLastPoint) {
      return;
    }

    const categories = localTicketPricing.value?.categories || [];
    categories.forEach((category) => {
      const value = String(pointData.priceMap[category.name] || "");
      const fieldKey = getFieldKey(pointData.index, category.name);

      // First category is always required for non-destination points
      const isFirstCategory = categories.indexOf(category) === 0;
      // Other categories are required only if enabled
      const isRequired = isFirstCategory || category.enabled;

      const errorMessage = validateFieldValue(value, {
        isRequired: isRequired,
      });

      if (errorMessage) {
        fieldValidationErrors.value[fieldKey] = errorMessage;
      }
    });
  });

  return isFormValid.value;
};

// Method to get updated pricing data for parent component
const getUpdatedPricingData = () => {
  const categories = localTicketPricing.value?.categories || [];
  const viaPoints = localTicketPricing.value?.via_points || [];

  // Get only active/enabled categories (first category is always enabled)
  const activeCategoryNames = categories
    .filter((category, index) => index === 0 || category.enabled)
    .map((category) => category.name);

  // Filter via_points to only include category_prices for active categories
  const filteredViaPoints = viaPoints.map((viaPoint) => ({
    ...viaPoint,
    category_prices: (viaPoint.category_prices || []).filter((cp) =>
      activeCategoryNames.includes(cp.name)
    ),
  }));

  // Return the current local pricing data with only active category prices
  return {
    ...props.ticketPricing,
    categories: [...categories],
    via_points: filteredViaPoints,
  };
};

// Method to get only the changed pricing data (useful for API calls)
const getChangedPricingData = (): ChangedPricingPoint[] => {
  const originalViaPoints = props.ticketPricing?.via_points || [];
  const updatedData = getUpdatedPricingData();
  const changes: ChangedPricingPoint[] = [];

  updatedData.via_points.forEach((updatedViaPoint, index) => {
    const originalViaPoint = originalViaPoints[index];
    if (originalViaPoint) {
      const pointChanges: ChangedPricingPoint = {
        id: updatedViaPoint.id,
        category_prices: [],
      };

      let hasChanges = false;

      updatedViaPoint.category_prices?.forEach((updatedCategoryPrice) => {
        const originalCategoryPrice = originalViaPoint.category_prices?.find(
          (cp) => cp.name === updatedCategoryPrice.name
        );

        if (
          !originalCategoryPrice ||
          originalCategoryPrice.price !== updatedCategoryPrice.price
        ) {
          pointChanges.category_prices.push(updatedCategoryPrice);
          hasChanges = true;
        }
      });

      if (hasChanges) {
        changes.push(pointChanges);
      }
    }
  });

  return changes;
};

// Modal state for category renaming
const renameCategoryModal = ref(false);
const newCategoryName = ref("");
const currentCategoryName = ref("");

// Handle category rename
const renameCategoryLabel = (categoryName: string) => {
  currentCategoryName.value = categoryName;
  newCategoryName.value = categoryName;
  renameCategoryModal.value = true;
};

// Handle category rename from modal
const handleCategoryRenamed = (data: {
  key: string;
  oldName: string;
  newName: string;
}) => {
  if (data.newName.trim()) {
    const categories = localTicketPricing.value?.categories || [];
    const viaPoints = localTicketPricing.value?.via_points || [];

    // Find and update the category name
    const category = categories.find((cat) => cat.name === data.oldName);
    if (category) {
      category.name = data.newName.trim();

      // Update all via_points to use the new category name
      viaPoints.forEach((viaPoint) => {
        if (viaPoint.category_prices) {
          viaPoint.category_prices.forEach((cp) => {
            if (cp.name === data.oldName) {
              cp.name = data.newName.trim();
            }
          });
        }
      });

      // Update field validation errors to use new category name
      const updatedValidationErrors: Record<string, string> = {};
      Object.keys(fieldValidationErrors.value).forEach((fieldKey) => {
        if (fieldKey.includes(`-${data.oldName}`)) {
          // Replace old category name with new one in the field key
          const newFieldKey = fieldKey.replace(
            `-${data.oldName}`,
            `-${data.newName.trim()}`
          );
          updatedValidationErrors[newFieldKey] =
            fieldValidationErrors.value[fieldKey];
        } else {
          updatedValidationErrors[fieldKey] =
            fieldValidationErrors.value[fieldKey];
        }
      });
      fieldValidationErrors.value = updatedValidationErrors;

      // Force reactivity update
      triggerRef(localTicketPricing);

      // Re-validate and emit updates
      nextTick(() => {
        validateFields();
        emit("validationStatusChanged", isFormValid.value);
        emit("pricingUpdated", getUpdatedPricingData());
      });
    }
  }
};

// Handle cancel from modal
const handleCategoryRenameCancel = () => {
  // Modal will handle its own state, no additional logic needed
};

// Toggle category status
const toggleCategoryStatus = (categoryName: string, isEnabled: boolean) => {
  const categories = localTicketPricing.value?.categories || [];
  const category = categories.find((cat) => cat.name === categoryName);
  if (category) {
    category.enabled = isEnabled;

    // If category is being enabled, ensure all via_points have entries for this category
    if (isEnabled) {
      const viaPoints = localTicketPricing.value?.via_points || [];
      viaPoints.forEach((viaPoint) => {
        if (viaPoint.category_prices) {
          // Check if this category already exists in the category_prices
          const existingCategoryPrice = viaPoint.category_prices.find(
            (cp) => cp.name === categoryName
          );

          // If it doesn't exist, add it with a default price of 0
          if (!existingCategoryPrice) {
            viaPoint.category_prices.push({
              name: categoryName,
              price: 0,
            });
          }
        }
      });

      // Force reactivity update to ensure the UI reflects the new category entries
      triggerRef(localTicketPricing);
    }

    // Re-validate fields when category status changes
    nextTick(() => {
      validateFields();
      // Emit validation status change to parent
      emit("validationStatusChanged", isFormValid.value);
      // Emit pricing update to parent when category status changes
      emit("pricingUpdated", getUpdatedPricingData());
    });
  }
};

// Get first category name (first category is always enabled)
const getFirstCategoryName = () => {
  const categories = localTicketPricing.value?.categories || [];
  return categories.length > 0 ? categories[0].name : "";
};

// Get enabled categories from pricing data
const categoriesList = computed(() => {
  const categories = localTicketPricing.value?.categories || [];

  // In edit mode, show all categories (enabled and disabled)
  if (props.editMode) {
    return categories;
  }

  // In view mode, show only enabled categories
  return categories.filter((category) => category.enabled);
});

// Get combined pricing and route data - optimized approach
const pricingTableData = computed(() => {
  const points = props.routePoints;
  const viaPoints = localTicketPricing.value?.via_points || [];

  if (!points.length) return [];

  // Map route points with their pricing data
  return points.map((point, index) => {
    const pointId = point.id;
    const viaPoint = viaPoints.find((vp) => vp.id == pointId);

    // Create price map for easy access
    const priceMap: Record<string, number> = {};
    if (viaPoint?.category_prices) {
      viaPoint.category_prices.forEach((cp) => {
        priceMap[cp.name] = cp.price;
      });
    }

    return {
      ...point,
      index,
      priceMap,
      isLastPoint: index === points.length - 1,
    };
  });
});

// Format date for display
const formatDate = (date) => {
  if (!date) return "";
  return formatInCompanyTimezone(date, "EEEE, MMMM d, yyyy");
};

// Get price from precomputed price map - using composable utility
const getPriceFromMap = (
  priceMap: Record<string, number>,
  categoryName: string
) => {
  return utilityGetPriceFromMap(priceMap, categoryName);
};

// Format price for display in view mode
const lastPrices = ref<{ [key: string]: number }>({});

const formatPriceDisplay = (
  priceMap: Record<string, number>,
  categoryName: string
) => {
  const price = priceMap[categoryName] ?? lastPrices.value[categoryName];
  lastPrices.value[categoryName] = price;

  return `${price} kr`;
};

// Expose component methods for parent components
defineExpose({
  validateFields,
  isFormValid,
  getUpdatedPricingData,
  getChangedPricingData,
});
</script>

<style lang="scss" scoped>
.itinerary-pricing-table {
  margin-bottom: 2rem;
}

.section-header {
  padding: 0.5rem 0;
}

.combined-table {
  margin-top: 1rem;

  .table {
    border-collapse: collapse;
    width: 100%;

    th,
    td {
      padding: 1.2rem 0.5rem;
      vertical-align: top;
    }

    tbody tr {
      border-bottom: 1px solid #edf2f7;

      td {
        position: relative;
      }
    }

    tbody tr:last-child {
      border-bottom: none;

      td {
        border-bottom: none;
      }
    }

    thead {
      th {
        border-bottom: 2px solid #edf2f7;
        font-weight: 600;
      }

      .departure-header {
        background-color: transparent;
        font-weight: 700;
        text-align: left;
      }

      .ticket-categories-header {
        background-color: #f8f9fa;
      }

      .category-headers th {
        border-top: none;
        font-weight: 600;
      }
    }

    tbody {
      .return-header {
        background-color: rgba(0, 123, 255, 0.05);
        border-bottom: none;

        td {
          padding-bottom: 0.5rem;
        }
      }
    }
  }
}

.time-cell {
  width: 35%;
  min-width: 200px;

  .d-flex {
    align-items: flex-start;
  }
}

.price-cell {
  max-width: 20%;
  text-align: center;
  font-weight: 600;
  position: relative;
  vertical-align: middle;
}

.location-name {
  font-size: 1rem;
  line-height: 1.2;
  margin-bottom: 0.25rem;
}

.location-detail {
  font-size: 0.9rem;
}

.discounts-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
}

.discount-item {
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
}

@media (max-width: 768px) {
  .combined-table {
    overflow-x: auto;

    .table {
      min-width: 600px;
    }
  }

  .location-name {
    font-size: 0.9rem;
  }

  .location-detail {
    font-size: 0.8rem;
  }

  .price-cell {
    font-size: 0.9rem;
  }
}

.booking-reference {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
