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
      <h3>{{ t("common.trip_filter") }}</h3>
    </template>
    <template v-slot:closeButton>
      <div @click="() => toggleModal()">
        <BaseButton button-class="sb-btn-secondary sb-btn-small rounded-circle">
          <i class="fi fi-x green-jewel"></i>
        </BaseButton>
      </div>
    </template>
    <template v-slot:content>
      <div class="d-flex flex-column align-items-start">
        <label for="dateRange" class="form-label fw-bold">{{
          t("common.date_range")
        }}</label>
        <BaseDatePicker
          v-model="searchDateRange"
          id="dateRange"
          :placeholder-text="t('sharebus.search_dates')"
          date-format="dd.mm.yy"
          :showButtonBar="true"
          component-class="h-lg rounded w-100"
          :input-class="`${searchDateRangeErrMsg ? 'border-error' : ''}`"
          selection-mode="range"
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
import BaseDatePicker from "@busgroup/vue3-base-datepicker";
import { useI18n } from "vue-i18n";
import { isoFormatDateTime } from "@/utils";
import TripFilterController from "../trip/controller/TripFilterController";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  toggleModal: {
    type: Function,
    required: true,
  },
});

const searchDateRange = ref();
const searchDateRangeIso = ref();
const searchDateRangeErrMsg = ref("");

const emit = defineEmits(["update:modelValue"]);

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
  if (!searchDateRange.value) return;
  else if (searchDateRange.value[1]) {
    const date1 = isoFormatDateTime(searchDateRange.value[0].toString());
    const date2 =
      isoFormatDateTime(searchDateRange.value[1].toString()).split("T")[0] +
      "T23:59:59Z";

    searchDateRangeIso.value = [date1, date2];

    TripFilterController.setTripFilter(
      "outbound_from_datetime_range",
      searchDateRangeIso.value
    );
    props.toggleModal();
  }
};

watch(
  () => TripFilterController.getTripFilter(),
  (tripFilter) => {
    if (!tripFilter.outbound_from_datetime_range) {
      searchDateRange.value = null;
    }
  }
);

watch(
  () => searchDateRange.value,
  (dateRange) => {
    if (!dateRange) {
      TripFilterController.setTripFilter("outbound_from_datetime_range", null);
      searchDateRangeIso.value = null;
      //if modal is open then close it.
      if (computedVModel.value) props.toggleModal();
    }
  }
);
</script>
