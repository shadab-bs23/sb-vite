<template>
  <form @submit.prevent="handleFormSubmission" enctype="multipart/form-data">
    <div class="my-2">
      <p class="fw-600 ship-gray">{{ t("setup.hero_image") }}</p>
      <!-- upload div -->
      <FileDropZone
        :initial-file="initialFile"
        @onSelectFile="handleFileSelection"
        @onRemoveFile="() => handleFileSelection(null)"
      />
      <p
        class="text-start ship-gray py-3 ps-2 mt-1 fw-600 auth-error fs-6 rounded mw-100"
        v-if="shouldShowFieldError('image_url', photoErrMsg)"
      >
        {{ photoErrMsg }}
      </p>
    </div>
    <p>
      {{ t("setup.trip_info_description") }}
    </p>
    <div class="col-sm-12 col-md-6 my-4">
      <h4
        :class="`fw-600 ${
          shouldShowFieldError('name', tripNameErrMsg)
            ? 'text-danger'
            : 'ship-gray'
        }`"
      >
        {{ t("sharebus.publish.trip_name") }}*
      </h4>
      <p class="ship-gray">{{ t("sharebus.publish.trip_name_desc") }}</p>
      <pre>
        {{ tripInfoForm.values }}
      </pre>
      <BaseInput
        v-model="tripName"
        id="name"
        :modifier-class="`rounded ${
          shouldShowFieldError('name', tripNameErrMsg) ? 'is-invalid' : ''
        }`"
        @blur="markFieldAsTouched('name')"
        @input="resetSubmitState"
      />
      <p
        class="text-start ship-gray py-3 ps-2 fw-600 auth-error fs-6 mw-100 rounded"
        v-if="shouldShowFieldError('name', tripNameErrMsg)"
      >
        {{ tripNameErrMsg }}
      </p>
    </div>
    <div class="my-3">
      <h4
        :class="`fw-600 ${
          shouldShowFieldError('category', tripCategoryErrMsg)
            ? 'text-danger'
            : 'ship-gray'
        }`"
      >
        {{ t("common.category") }}*
      </h4>
      <TripCategory
        :selected-category="tripCategory"
        @on-select-trip-category="handleTripCategorySelection"
      />
      <p
        class="text-start ship-gray py-3 ps-2 fw-600 auth-error fs-6 rounded"
        v-if="shouldShowFieldError('category', tripCategoryErrMsg)"
      >
        {{ tripCategoryErrMsg }}
      </p>
    </div>

    <div class="col-sm-12 col-md-12 mb-4">
      <h4 class="fw-600 ship-gray">
        {{ t("sharebus.publish.optional_info") }}
      </h4>
      <div class="my-2 col-sm-12 col-md-5 ship-gray my-3">
        <p>{{ t("sharebus.publish.who_organizes") }}</p>
        <BaseInput
          v-model="organizer"
          id="trip_organizer"
          modifier-class="rounded"
          @blur="markFieldAsTouched('trip_organizer')"
          @input="resetSubmitState"
        />
        <p
          class="text-start ship-gray py-3 ps-2 fw-600 auth-error fs-6 rounded mt-2"
          v-if="shouldShowFieldError('trip_organizer', organizerErrMsg)"
        >
          {{ organizerErrMsg }}
        </p>
      </div>
      <div class="my-2 col-sm-12 col-md-8 ship-gray">
        <p
          :class="`${
            shouldShowFieldError('info_to_travellers', travelerInfoErrMsg)
              ? 'text-danger'
              : 'ship-gray'
          }`"
        >
          {{ t("sharebus.publish.info_to_travellers") }}
        </p>
        <div class="col-12">
          <textarea
            id="infoToTravelers"
            :class="`border-light w-100 rounded ${
              shouldShowFieldError('info_to_travellers', travelerInfoErrMsg)
                ? 'border-error'
                : 'ship-gray'
            }`"
            v-model="travelerInfo"
            @blur="markFieldAsTouched('info_to_travellers')"
            @input="resetSubmitState"
          ></textarea>
          <p
            class="text-start ship-gray py-3 ps-2 fw-600 auth-error fs-6 rounded"
            v-if="
              shouldShowFieldError('info_to_travellers', travelerInfoErrMsg)
            "
          >
            {{ travelerInfoErrMsg }}
          </p>
        </div>
      </div>
      <div class="my-2 col-sm-12 col-md-8 ship-gray">
        <p>{{ t("sharebus.publish.link_to_event") }}</p>
        <BaseInput
          v-model="eventLink"
          id="eventLink"
          modifier-class="rounded"
          @blur="markFieldAsTouched('website_url')"
          @input="resetSubmitState"
        />
        <p
          class="text-start ship-gray py-3 ps-2 fw-600 auth-error fs-6 rounded"
          v-if="shouldShowFieldError('website_url', eventLinkErrMsg)"
        >
          {{ eventLinkErrMsg }}
        </p>
      </div>
    </div>
    <div class="w-100 text-end mt-2 ship-gray">
      <!-- Remove the general error message since we now show specific field errors -->
      <!-- Slot for buttons from parent -->
    </div>
  </form>
</template>

<script setup lang="ts">
import { ROLE } from "@/components/common/enums/enums";
import FileDropZone from "@/components/modules/sharelead/publishSharebus/fileUpload/FileDropZone.vue";
import { showToast } from "@/services/toast/toast.service";
import { useSharebusStore, useUserStore } from "@/store";
import { TripInfoData } from "@/store/sharebus/types";
import { generatePhotoUrlBasedOnEnv, isValidURL } from "@/utils";
import BaseInput from "@busgroup/vue3-base-input";
import { useField, useForm } from "vee-validate";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import * as yup from "yup";
import TripCategory from "../../publishSharebus/tripCategory/TripCategory.vue";

// Store access
const userStore = useUserStore();
const sharebusStore = useSharebusStore();

// Component props
interface TripInfoFormProps {
  tripId: string;
  formValue: Record<string, unknown>;
  isEditingMode: boolean;
}

const props = defineProps<TripInfoFormProps>();

// Emits
const emit = defineEmits<{
  (e: "changeValue", value: Record<string, unknown>): void;
  (e: "hasError"): void;
  (e: "noError"): void;
  (e: "trip-info-updated", data: TripInfoData): void;
  (e: "show-preview"): void;
}>();

// i18n & state
const { t } = useI18n();
const submitBtnClicked = ref(false);

// Track which fields have been touched/interacted with
const touchedFields = ref<Set<string>>(new Set());

// Helper function to check if a field should show its error
const shouldShowFieldError = (
  fieldName: string,
  errorMessage: string | undefined
): boolean => {
  // Special case for image field - show errors immediately after upload
  if (fieldName === "image_url") {
    return !!errorMessage && touchedFields.value.has("image_url");
  }

  // For other fields, only show errors if submit button was clicked OR field has been touched
  if (submitBtnClicked.value || touchedFields.value.has(fieldName)) {
    return !!errorMessage;
  }

  // Otherwise, don't show errors
  return false;
};

// Helper function to mark a field as touched
const markFieldAsTouched = (fieldName: string) => {
  touchedFields.value.add(fieldName);
};

// Helper function to reset submit state when user starts typing
// Only reset if form becomes valid to avoid blinking effect
const resetSubmitState = () => {
  // Don't reset submitBtnClicked immediately - keep showing errors until form is valid
  // This prevents the blinking effect where errors disappear on typing
};

// User info
const userDetails = computed(() => userStore);

/**
 * Form validation schema
 */
const tripInfoFormSchema = computed(() =>
  yup.object({
    name: yup
      .string()
      .required(t("sharebus.publish.trip_name_missing"))
      .max(100, t("form.validation.max_length", { max: 100 })),
    category: yup
      .string()
      .required(t("sharebus.publish.trip_category_missing")),
    trip_organizer: yup.string().required(),
    info_to_travellers: yup
      .string()
      .max(300, t("form.validation.max_length", { max: 300 })),
    website_url: yup
      .string()
      .test("link", t("form.validation.invalid_link"), (value) =>
        value ? isValidURL(value) : true
      ),
    image_url: yup
      .mixed()
      .test("fileType", "", (file) => checkFileType(file))
      .test(
        "fileSize",
        `${t("form.image.large_size")} ${t("form.image.valid_size", {
          count: 5,
        })}`,
        (file) => checkFileSize(file)
      )
      .test(
        "photoDimension",
        `${t("form.image.can_not_upload")} ${t("form.image.valid_dimensions")}`,
        async (file): Promise<boolean> => {
          if (!file) {
            return true;
          }

          try {
            const imgDimension = await getPhotoDimensions(file);
            return imgDimension.width >= 500 && imgDimension.height >= 500;
          } catch (e) {
            return false;
          }
        }
      ),
  })
);

// Initial form values
const initialValue: TripInfoData = {
  name: "",
  category: "",
  trip_organizer: userStore.getUserInfo?.attributes?.name || "",
  info_to_travellers: "",
  website_url: "",
  image_url: "",
};

// Form setup
const tripInfoForm = useForm({
  validationSchema: tripInfoFormSchema,
  initialValues: initialValue,
});

// Field validation
const { value: tripName, errorMessage: tripNameErrMsg } =
  useField<string>("name");
const { value: tripCategory, errorMessage: tripCategoryErrMsg } =
  useField<string>("category");
const { value: travelerInfo, errorMessage: travelerInfoErrMsg } =
  useField<string>("info_to_travellers");
const { value: eventLink, errorMessage: eventLinkErrMsg } =
  useField<string>("website_url");
const { value: organizer, errorMessage: organizerErrMsg } =
  useField<string>("trip_organizer");
const { errorMessage: photoErrMsg, setErrors: setPhotoErr } =
  useField<File | null>("image_url");

// Manually check if the required fields are valid
const validateRequiredFields = (showErrors = false): boolean => {
  // Force vee-validate to validate all fields
  tripInfoForm.validate();

  // Only set submitBtnClicked to true when explicitly requested (from submit button)
  if (showErrors) {
    submitBtnClicked.value = true;
  }

  const hasValidTripName = !!tripInfoForm.values.name && !tripNameErrMsg.value;

  const hasValidTripCategory =
    !!tripInfoForm.values.category && !tripCategoryErrMsg.value;

  const hasValidPhoto = !photoErrMsg.value;

  const hasValidEventLink = !eventLinkErrMsg.value;

  const hasValidAdditionalNotes = !travelerInfoErrMsg.value;

  const hasValidOrganizer = !organizerErrMsg.value;

  return (
    hasValidTripName &&
    hasValidTripCategory &&
    hasValidPhoto &&
    hasValidEventLink &&
    hasValidAdditionalNotes &&
    hasValidOrganizer
  );
};

/**
 * File validation methods
 */
const checkFileSize = (file: File | null): boolean => {
  return file ? file.size < 5000000 : true;
};

const checkFileType = (file: File | null): boolean => {
  if (file) {
    if (file.type === "image/jpeg" || file.type === "image/png") {
      return true;
    } else {
      setPhotoErr(
        `${t("form.image.format_unsupported")} ${t("form.image.valid_formats")}`
      );
      return false;
    }
  }
  return true;
};

const getPhotoDimensions = (
  image: File
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    try {
      const fileReader = new FileReader();

      fileReader.onload = () => {
        const img = new Image();

        img.onload = () => {
          const dimensions = { width: img.width, height: img.height };
          resolve(dimensions);
        };

        img.onerror = () => {
          reject(new Error("Failed to load image"));
        };

        img.src = fileReader.result as string;
      };

      fileReader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      fileReader.readAsDataURL(image);
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * Event handlers
 */
const handleTripCategorySelection = (selectedTripCategory: string) => {
  tripInfoForm.setFieldValue("category", selectedTripCategory);
  markFieldAsTouched("category");
  resetSubmitState();
  // Sync to store immediately
  updateTripInfoInStore();
};

// Helper function to sync form data to store in real-time
const syncFormToStore = () => {
  // Get current trip info from store to preserve image_url data (File object)
  const currentTripInfo = sharebusStore.getTripInfoData || {
    image_url: "",
  };

  // Update store with current form values
  // For image_url: use form value if it's been explicitly set (File or empty string for removal)
  // Otherwise preserve store value (for text field updates that shouldn't affect image)
  const formImageValue = tripInfoForm.values.image_url;
  const isFileObject =
    formImageValue &&
    typeof formImageValue === "object" &&
    "name" in formImageValue;

  sharebusStore.setTripInfoData({
    name: tripInfoForm.values.name,
    category: tripInfoForm.values.category,
    trip_organizer: tripInfoForm.values.trip_organizer,
    info_to_travellers: tripInfoForm.values.info_to_travellers,
    website_url: tripInfoForm.values.website_url,
    image_url: isFileObject
      ? formImageValue
      : formImageValue === ""
      ? "" // Explicit removal
      : currentTripInfo.image_url || "",
  });
};

const handleFileSelection = (file: File | null = null) => {
  // Update form field - set to empty string if file is null (removal case)
  tripInfoForm.setFieldValue(
    "image_url",
    file ? (file as unknown as string) : ""
  );

  // Mark image_url field as touched when user interacts with file upload
  markFieldAsTouched("image_url");

  // Reset submit state when user interacts with file upload
  resetSubmitState();

  // Explicitly validate the image_url field to trigger validation errors
  // Use setTimeout to ensure the field value is set before validation
  setTimeout(() => {
    tripInfoForm
      .validateField("image_url")
      .then(() => {
        // Validation completed
      })
      .catch(() => {
        // Handle validation error silently
      });
  }, 200); // Increased timeout to ensure form field is set

  // Get current form values to preserve all input field values
  const currentFormValues = tripInfoForm.values;

  // Update store with file or clear it if null (file removal)
  // When file is null, explicitly set image_url to empty string to clear it from store
  sharebusStore.setTripInfoData({
    name: currentFormValues.name,
    category: currentFormValues.category,
    trip_organizer: currentFormValues.trip_organizer,
    info_to_travellers: currentFormValues.info_to_travellers,
    website_url: currentFormValues.website_url,
    image_url: file || "", // Set to empty string when file is removed
  });
};

/**
 * Form submission handlers
 */
const updateTripInfoInStore = () => {
  // Create trip info data object, preserving image_url  from store
  const tripInfoData: TripInfoData = {
    ...tripInfoForm.values,
  };

  // Emit event to parent to update store
  emit("trip-info-updated", tripInfoData);
};

const handleFormSubmission = () => {
  // Set submitBtnClicked to show errors immediately when form is submitted
  submitBtnClicked.value = true;

  // Check validation WITH showing errors
  const isFormValid = validateRequiredFields(true);

  if (!isFormValid) {
    emit("hasError");
    return;
  }

  // Check user role
  const currentRole = userDetails.value.currentRole;
  const isAuthorized =
    (currentRole === ROLE.SHARELEAD ||
      currentRole === ROLE.PARTNER_SHARELEAD ||
      currentRole === ROLE.FERDIA_SALES) &&
    userDetails.value.isAuthenticated;

  if (!isAuthorized) {
    showToast("info", t("home.joiner_warning"), 3000, "top-left");
    return;
  }

  // Form is valid and user is authorized, update store
  emit("noError");
  updateTripInfoInStore();
};

/**
 * Watchers
 */
// Watch for changes in props.formValue
watch(
  () => props.formValue,
  (value) => {
    if (Object.keys(value).length) {
      // Clone the object to avoid mutation
      const formData = { ...value };

      // Don't reset image_url field - preserve any file that was selected
      // The image_url field should only be managed by handleFileSelection
      delete formData.image_url;

      // Ensure trip_organizer is prefilled if empty
      if (!formData.trip_organizer) {
        formData.trip_organizer = userStore.getUserInfo?.attributes?.name || "";
      }

      // Use setFieldValue for individual fields to avoid overriding image_url
      const allowedFields = [
        "name",
        "category",
        "trip_organizer",
        "info_to_travellers",
        "website_url",
      ] as const;

      allowedFields.forEach((key) => {
        if (formData[key] !== undefined && formData[key] !== null) {
          // Only update if the value is actually different to prevent unnecessary updates
          if (tripInfoForm.values[key] !== formData[key]) {
            tripInfoForm.setFieldValue(key, formData[key] as string);
          }
        }
      });
    }
  },
  { immediate: true, deep: true }
);

// Watch form validity to reset submit state when form becomes valid
const isFormValid = computed(() => validateRequiredFields(false));

watch(
  () => isFormValid.value,
  (newIsValid) => {
    if (newIsValid && submitBtnClicked.value) {
      // Form is now valid, reset submit state to hide errors
      submitBtnClicked.value = false;
    }
  }
);

// Watch form values for real-time sync to store (debounced for performance)
let syncTimeout: ReturnType<typeof setTimeout> | null = null;
watch(
  () => tripInfoForm.values,
  () => {
    // Debounce the sync to avoid too many store updates
    if (syncTimeout) {
      clearTimeout(syncTimeout);
    }
    syncTimeout = setTimeout(() => {
      syncFormToStore();
    }, 100);
  },
  { deep: true }
);

const initialFile = computed(() => {
  const imgUrl = props.formValue.image_url || tripInfoForm.values.image_url;
  console.log(typeof imgUrl);
  if (imgUrl && imgUrl instanceof File) {
    return imgUrl;
  } else if (imgUrl && typeof imgUrl === "string") {
    return generatePhotoUrlBasedOnEnv(imgUrl as string);
  } else {
    return null;
  }
});

/**
 * Expose Methods and State
 */
defineExpose({
  validateForm: validateRequiredFields,
  validateRequiredFields,
  isValid: isFormValid,
  values: tripInfoForm.values,
});
</script>
