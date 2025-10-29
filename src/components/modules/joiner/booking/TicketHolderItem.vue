<template>
  <div class="w-100">
    <!-- Ticket Info Header -->
    <div class="d-flex justify-content-between align-items-start w-100">
      <div class="d-flex flex-column align-items-start gap-2">
        <div class="d-flex align-items-center w-100 gap-2">
          <div class="d-flex align-items-center gap-2">
            <span class="fw-bold fs-18 text-dark">{{ ticket.count }}</span>
            <span class="fw-bold fs-18 text-dark">{{
              ticket.categoryName
            }}</span>
          </div>
          <!-- Close icon -->
          <IconSvg name="close" color="#138340" />
        </div>
        <div class="d-flex align-items-center gap-2">
          {{ ticket.route }}
        </div>
      </div>
      <div class="fw-bold fs-5 text-dark text-end">{{ ticket.price }} Kr</div>
    </div>

    <!-- Ticket Holder Button -->
    <div class="d-flex w-100 py-2 align-items-center gap-2">
      <button
        class="d-flex justify-content-center align-items-center px-3 py-1 rounded-pill gap-2 itinerary-toggle"
        @click="toggleExpanded"
      >
        <span class="fw-bold text-success">{{
          t("sharebus.checkout.ticket_holder")
        }}</span>
        <i class="fi fi-chevron-up" :class="{ 'rotate-180': !isExpanded }"></i>
      </button>
    </div>

    <!-- Input Form (Expanded) with vee-validate -->
    <Form
      v-if="isExpanded"
      as="div"
      class="row g-3 mb-3"
      :validation-schema="validationSchema"
    >
      <div class="col-12 col-md-4">
        <div class="form-field-wrapper">
          <BaseInput
            :label="t('sharebus.checkout.name')"
            :placeholder="t('sharebus.checkout.ticket_holder_name')"
            v-model="values.name"
            input-group-class="ticket-input"
            :feedback="showNameError ? nameErrMsg : ''"
            :modifier-class="showNameError && nameErrMsg ? 'is-invalid' : ''"
            required
            @update:model-value="(val) => updateField('name', val)"
            @blur="handleFieldBlur('name')"
          />
        </div>
      </div>

      <div class="col-12 col-md-4">
        <div class="form-field-wrapper">
          <BaseInput
            :label="t('sharebus.checkout.email')"
            :placeholder="t('sharebus.checkout.email')"
            v-model="values.email"
            type="email"
            input-group-class="ticket-input"
            :feedback="showEmailError ? emailErrMsg : ''"
            :modifier-class="showEmailError && emailErrMsg ? 'is-invalid' : ''"
            required
            @update:model-value="(val) => updateField('email', val)"
            @blur="handleFieldBlur('email')"
          />
        </div>
      </div>

      <div class="col-12 col-md-4">
        <div class="form-field-wrapper tel-input-wrapper">
          <label class="form-label">{{ t("sharebus.checkout.phone") }}</label>
          <BasePhoneInput
            v-model="values.phone"
            @validate="phoneInputChange"
            :errorMessage="showPhoneError ? phoneErrMsg : ''"
            :modifier-class="showPhoneError ? 'is-invalid' : ''"
            placeholder="+47"
            @update:model-value="(val) => updateField('phone', val)"
            @blur="handleFieldBlur('phone')"
          />
        </div>
      </div>
    </Form>

    <!-- Copy to All Tickets Checkbox -->
    <div v-if="isExpanded" class="d-flex align-items-center w-100 mb-3">
      <div class="form-check">
        <input
          type="checkbox"
          class="form-check-input custom-checkbox"
          :id="`copy-all-${index}`"
          :checked="ticket.copyToAll"
          :disabled="disabledCopy && !ticket.copyToAll"
          @change="
            updateField(
              'copyToAll',
              ($event.target as HTMLInputElement).checked
            )
          "
        />
        <label class="form-check-label" :for="`copy-all-${index}`">
          {{ t("sharebus.checkout.copy_to_all_tickets") }}
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import BaseInput from "@busgroup/vue3-base-input";
import { Form, useForm, useField } from "vee-validate";
// Use defineAsyncComponent to handle components without default export
import { defineAsyncComponent } from "vue";
const BasePhoneInput = defineAsyncComponent(
  () => import("@/components/common/reusable/BasePhoneInput.vue")
);
import * as yup from "yup";
// Not using phoneNumberRule anymore, using direct yup validation
import { TicketHolderProps } from "./types/checkout.types";
type Props = TicketHolderProps;

const props = defineProps<Props>();
const emit = defineEmits<{
  update: [index: number, field: string, value: unknown];
  validation: [index: number, valid: boolean];
}>();

import { watch, computed } from "vue";
// Import IconSvg using defineAsyncComponent for script setup components with no default export
const IconSvg = defineAsyncComponent(() => import("./shared/IconSvg.vue"));
const { t } = useI18n();

// UI state
const isExpanded = ref(true); // Start expanded to match Figma design

// Phone validation state
const isPhoneValid = ref<boolean>(!!props.ticket.phone); // Initialize as valid if phone exists

/**
 * Define validation schema using yup as a computed property
 * This ensures it stays reactive to locale changes and phone validation state
 */
const validationSchema = computed(() =>
  yup.object({
    name: yup.string().required(
      t("form.validation.field_required", {
        field_name: t("sharebus.checkout.name"),
      })
    ),
    email: yup
      .string()
      .required(
        t("form.validation.field_required", {
          field_name: t("sharebus.checkout.email"),
        })
      )
      .email(t("form.validation.email_format")),
    phone: yup
      .string()
      .required(
        t("form.validation.phone_required", {
          field_name: t("sharebus.checkout.phone"),
        })
      )
      .test(
        "valid-phone",
        t("form.validation.phone_format"),
        () => isPhoneValid.value
      ),
  })
);

/**
 * Initialize form with values from ticket
 * Not using validateOnMount to avoid showing errors on initial load
 * Uses validateMode: silent to ensure consistent behavior
 */
const {
  meta,
  values,
  validate: validateForm,
  setFieldValue,
} = useForm({
  // Cast to any to match the pattern used in NonSocialSignUp.vue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validationSchema: validationSchema as Record<string, any>,
  initialValues: {
    name: props.ticket.name || "",
    email: props.ticket.email || "",
    phone: props.ticket.phone || "",
  },
  validateOnMount: false, // Don't validate on mount to avoid initial errors
});

// Field-level validation with meta data to check touched/dirty status
const { errorMessage: nameErrMsg, meta: nameMeta } = useField("name");
const { errorMessage: emailErrMsg, meta: emailMeta } = useField("email");
const { errorMessage: phoneErrMsg } = useField("phone");

// Track if a field has ever been touched/interacted with
const nameInteracted = ref(false);
const emailInteracted = ref(false);
const phoneInteracted = ref(false);

// Computed properties to show errors once field has been interacted with
// But ONLY if the field is invalid - immediately hide when valid
const showNameError = computed(() => {
  // Once user has interacted with field, show error if invalid
  if (nameInteracted.value && !nameMeta.valid && nameErrMsg.value) {
    return true;
  }
  return false;
});

const showEmailError = computed(() => {
  if (emailInteracted.value && !emailMeta.valid && emailErrMsg.value) {
    return true;
  }
  return false;
});

const showPhoneError = computed(() => {
  // Only show errors after interaction with the field
  if (!phoneInteracted.value) {
    return false;
  }

  // For empty values, show required error if there is an error message
  if (!values.phone) {
    return !!phoneErrMsg.value;
  }

  // For non-empty values, show error if phone isn't valid
  // This matches the approach in NonSocialSignUp.vue
  return !isPhoneValid.value;
});

/**
 * Phone number validation handler - simplified based on NonSocialSignUp pattern
 * Only updates validation state and triggers form validation if needed
 */
const phoneInputChange = (valid: boolean) => {
  // Update phone validation state
  isPhoneValid.value = valid;

  // If phone field has been interacted with, update error display
  if (phoneInteracted.value) {
    // Force validation to update UI
    validateForm();
  } else {
    // Silent validation to update internal state without showing errors
    validateForm({ mode: "silent" });
  }
};

/**
 * Handle field blur events - mark fields as interacted with
 * Simplified based on NonSocialSignUp.vue approach
 */
const handleFieldBlur = (field: string) => {
  // Mark the specific field as interacted with
  if (field === "name") {
    nameInteracted.value = true;
  } else if (field === "email") {
    emailInteracted.value = true;
  } else if (field === "phone") {
    // For phone field, mark as interacted
    phoneInteracted.value = true;
  }

  // Validate all fields on blur for consistent behavior
  validateForm();
};

/**
 * Watch for ticket updates from parent to keep form in sync
 * Updates values and validation state as needed
 * ALWAYS use silent validation when data is updated from parent
 */
watch(
  () => props.ticket,
  (newTicket) => {
    // Check if values have changed before updating
    if (values.name !== (newTicket.name || "")) {
      setFieldValue("name", newTicket.name || "");
    }

    if (values.email !== (newTicket.email || "")) {
      setFieldValue("email", newTicket.email || "");
    }

    if (values.phone !== (newTicket.phone || "")) {
      setFieldValue("phone", newTicket.phone || "");
      isPhoneValid.value = !!newTicket.phone;
    }

    // Always use silent validation for parent updates
    // to prevent showing errors unexpectedly
    validateForm({ mode: "silent" });
  },
  { deep: true }
);

/**
 * Create computed property for form validation state
 * Similar to isFormCanSubmit in NonSocialSignUp
 */
const isFormValid = computed(() => {
  return meta.value.valid;
});

/**
 * Watch form validity and emit to parent
 */
watch(
  isFormValid,
  (valid) => {
    emit("validation", props.index, valid);
  },
  { immediate: true }
);

/**
 * Update a field value in the ticket and emit to parent
 * Provides immediate feedback when input becomes valid
 */
const updateField = (
  field: "name" | "email" | "phone" | "copyToAll",
  value: unknown
) => {
  // Handle copy to all checkbox separately
  if (field === "copyToAll") {
    emit("update", props.index, field, value);
    return;
  }

  // Set the field value
  setFieldValue(field, String(value ?? ""));

  // Update field-specific interaction state if there's a value
  if (field === "name" && value) {
    nameInteracted.value = true;
  } else if (field === "email" && value) {
    emailInteracted.value = true;
  } else if (field === "phone" && value) {
    phoneInteracted.value = true;
  }

  // Validate with appropriate mode based on interaction state
  // For phone, only validate UI if interacted with
  if (field === "phone") {
    if (phoneInteracted.value) {
      validateForm();
    } else {
      validateForm({ mode: "silent" });
    }
  } else if (
    (field === "name" && nameInteracted.value) ||
    (field === "email" && emailInteracted.value)
  ) {
    // For other fields, validate if they've been interacted with
    validateForm();
  } else {
    // Otherwise do silent validation
    validateForm({ mode: "silent" });
  }

  // Emit the update to parent
  emit("update", props.index, field, value);
};

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

/**
 * Reset the form fields and validation state
 * This ensures consistent state when needed
 */
const resetForm = () => {
  // Reset field values
  setFieldValue("name", props.ticket.name || "");
  setFieldValue("email", props.ticket.email || "");
  setFieldValue("phone", props.ticket.phone || "");

  // Update phone validation state
  isPhoneValid.value = !!props.ticket.phone;

  // Reset interaction flags to hide all errors
  nameInteracted.value = false;
  emailInteracted.value = false;
  phoneInteracted.value = false;

  // Silent validation to update internal state
  validateForm({ mode: "silent" });
};

// Export the component with validation methods
defineExpose({
  validate: validateForm,
  isValid: () => meta.value.valid,
  reset: resetForm,
});
</script>

<style lang="scss" scoped>
// Custom hover effect for itinerary toggle
.itinerary-toggle {
  background-color: #e5fbee;
  border: none;

  &:hover {
    background-color: #d1f5e0;
  }
}

// Custom rotation for chevron icon
.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.2s;
}

// Global label positioning override for ticket input groups
:deep(.ticket-input.input-group) {
  flex-direction: column;
  align-items: flex-start;
  .form-label {
    order: 1;
  }

  .form-control {
    order: 2;
    width: 100%;
  }

  // Make sure feedback appears after input
  .valid-feedback,
  .invalid-feedback {
    order: 3;
  }
}

// Form field wrapper styling
.form-field-wrapper {
  position: relative;
  width: 100%;
}

// Telephone input specific styling
.tel-input-wrapper {
  display: flex;
  flex-direction: column;

  label {
    text-align: left;
    order: 1;
  }
}

:deep(.vue-tel-input) {
  order: 2;
  width: 100%;
}
:deep(.vti__input) {
  height: 38px;
}
:deep(.invalid-feedback) {
  order: 3;
  text-align: left;
}
</style>
