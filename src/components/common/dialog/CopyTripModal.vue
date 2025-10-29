<template>
  <BaseModal
    id="tripPreviewModal"
    v-model="computedVModel"
    header-class="border-bottom-0 pb-0"
    modifier-class="fade"
    dialog-class="modal-md"
    footer-class="border-top-0 pb-4"
  >
    <template v-slot:header>
      <h3>{{ modalTitle }}</h3>
    </template>
    <template v-slot:closeButton>
      <div @click="computedVModel = !modelValue">
        <BaseButton button-class="sb-btn-secondary sb-btn-small rounded-circle">
          <i class="fi fi-x green-jewel"></i>
        </BaseButton>
      </div>
    </template>
    <template v-slot:content>
      <div class="d-flex flex-column align-items-start">
        <BaseInput
          inputId="firstName"
          v-model="tripName"
          label="Trip title"
          label-class="mt-3 text-start"
          modifier-class="text-start w-100 roundeddark-gray-border"
          input-group-class="d-flex flex-column"
        />

        <FormError
          error-class="auth-error p-3 rounded mt-1 text-danger fw-bold fs-6 w-100"
          :error="tripNameErrorMsg"
        />
      </div>
    </template>
    <template v-slot:footer>
      <BaseButton
        button-class="sb-btn-primary sb-btn-lg w-auto rounded-pill lh-1 px-4 fw-bold d-flex justify-content-center align-items-center"
        @click="handleDateFilterApply"
      >
        <template v-slot:default>
          <span>{{ t("button.apply") }}</span>
          <span class="fw-bold ms-2"
            ><i class="fi fi-arrow-right-short"></i
          ></span>
        </template>
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import BaseModal from "@busgroup/vue3-base-modal";
import BaseButton from "@busgroup/vue3-base-button";
import BaseInput from "@busgroup/vue3-base-input";
import { useI18n } from "vue-i18n";
import useSalesStore from "@/store/salesConsole/sales.store";
import FormError from "../error/FormError.vue";
import { GeneralError } from "././types/errors/errors.type";

const props = defineProps({
  modalTitle: {
    type: String,
    default: "My Form modal",
  },
  modelValue: { type: Boolean, default: false },
});

const salesStore = useSalesStore();

const tripName = ref("");

const tripNameErrorMsg = ref<GeneralError>({ message: "", type: "" });

const emit = defineEmits(["update:modelValue", "onSubmit"]);

const { t } = useI18n();

const computedVModel = computed({
  get: () => {
    return props.modelValue;
  },
  set: (value) => {
    /**
     * Triggers when the computed property value changes.
     *
     * @param {string | number | Array} value current value
     * @returns {string | number | Array} should return the updated value.
     */
    emit("update:modelValue", value);
  },
});

const handleDateFilterApply = () => {
  if (!tripName.value) {
    tripNameErrorMsg.value.message = t("viapoints.field_required");
    return;
  }
  tripNameErrorMsg.value.message = "";
  salesStore.$patch({
    copy_trip: {
      name: tripName.value,
    },
  });
  emit("onSubmit");
  computedVModel.value = false;
};

watch(
  () => salesStore.getCopyTripData,
  (newValue) => {
    tripName.value = newValue.name;
  }
);
</script>
