<template>
  <div class="trip-info-container text-start overflow-hidden">
    <div class="row">
      <div class="col-12 col-xxl-7">
        <h3 class="mb-4 display-6 font-bold">{{ t("setup.trip_info") }}</h3>
        <TripInfoForm
          ref="tripInfoFormRef"
          :trip-id="''"
          :form-value="tripInfoData"
          :is-editing-mode="false"
          @has-error="hasError = true"
          @no-error="hasError = false"
          @trip-info-updated="updateTripInfo"
          @change-value="updateTripInfo"
          @show-preview="showPreview = true"
        />
      </div>
      <div class="col-12 col-xxl-4 offset-xxl-1 offset-0">
        <p class="fw-600 ship-gray">{{ t("setup.ad_preview") }}</p>
        <div
          v-if="!showPreview"
          class="d-flex justify-content-center align-items-center createPreviewSection extended-light-green-bg rounded"
        >
          <button
            class="btn sb-btn-secondary sb-btn-md rounded-pill"
            :disabled="hasError"
            @click="showTripInfoPreview"
          >
            {{ t("setup.create_preview") }}
          </button>
        </div>
        <PreviewContainer v-else />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSharebusStore } from "@/store";
import { TripInfoData } from "@/store/sharebus/types";
import { ref, watch, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import ShareBusSetUpController from "./Controllers/ShareBusSetUpController";
import PreviewContainer from "./TripInfo/PreviewContainer.vue";
import TripInfoForm from "./TripInfo/TripInfoForm.vue";
import TripController from "../controllers/TripController";

/**
 * Component Props
 */
interface TripInfoStepProps {
  prevStep: () => void;
  nextStep: () => void;
}

const props = defineProps<TripInfoStepProps>();
const emit = defineEmits<{
  (e: "validation-change", event: { step: number; isValid: boolean }): void;
}>();

// Composables & Stores
const { t } = useI18n();
const sharebusStore = useSharebusStore();

// Component State
const hasError = ref(false);
const showPreview = ref(false);

// Form reference
interface TripInfoFormInstance {
  validateForm: (showError?: boolean) => boolean;
  isValid: boolean;
}
const tripInfoFormRef = ref<TripInfoFormInstance | null>(null);

// Computed Properties
const tripInfoData = computed<TripInfoData>(
  () => sharebusStore.getTripInfoData
);

// Methods
const validateBeforeNextStep = (showErrors = false): boolean => {
  let isValid = false;

  if (tripInfoFormRef.value?.validateForm) {
    isValid = tripInfoFormRef.value.validateForm(showErrors);
  } else {
    isValid = !hasError.value;
  }

  // Always emit validation change to update parent state
  emit("validation-change", { step: 3, isValid });
  return isValid;
};

const updateTripInfo = (data: TripInfoData | Record<string, unknown>): void => {
  // Cast to TripInfoData if it has the expected shape
  if (
    typeof data === "object" &&
    data !== null &&
    "name" in data &&
    "category" in data
  ) {
    sharebusStore.setTripInfoData(data as TripInfoData);

    // Re-validate after store update
    setTimeout(validateBeforeNextStep, 0);
  }
};

const showTripInfoPreview = (): void => {
  if (!hasError.value) {
    showPreview.value = true;
  }
};
const tripControllerStore = TripController.getShareleadTripStore();

// Lifecycle Hooks & Watchers
onMounted(() => {
  // Show preview if we already have photo data
  if (sharebusStore.getTripInfoData?.image_url) {
    showPreview.value = true;
  }

  const tripId = sharebusStore.setup.createdTripId;
  if (tripId) {
    // Use the store action directly - Pinia will handle the context
    (tripControllerStore as any).getTrip(tripId);
  }
  // Initial validation after component is mounted
  setTimeout(validateBeforeNextStep, 100);
});

// Watch for error state changes
watch(
  () => hasError.value,
  () => validateBeforeNextStep()
);

// Watch for submit button click from parent controller
watch(
  () => ShareBusSetUpController.getSubmitState("three"),
  (value) => {
    if (value) {
      ShareBusSetUpController.setSubmitState("three", false);

      // When called from controller (submit button), show errors
      const valid = validateBeforeNextStep(true);
      if (valid) {
        props.nextStep();
      }
    }
  }
);

// Expose Methods
defineExpose({
  validateBeforeNextStep,
  validateForm: validateBeforeNextStep,
});
</script>

<style lang="scss" scoped>
.trip-info-container {
  padding: 20px;
}
.createPreviewSection {
  min-height: 240px;
}

.route-summary {
  background-color: #f8f9fa;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
</style>
