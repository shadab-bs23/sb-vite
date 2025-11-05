<template>
  <div class="text-start col-sm-12 col-md-8 offset-md-2">
    <div>
      <h2 class="fw-bold" v-if="isEditingMode">
        {{ t("sales.details.edit_published_trip_info") }}
      </h2>
      <BaseSaveChanges
        v-if="isEditingMode"
        @saveChanges="changesAction"
        class="col-md-10 col-lg-10 col-xl -6 col-sm-12 my-3 col-xxl-4"
      />
      <hr class="border border-2" />
    </div>
    <!-- <PublishSharebusForm
      :trip-id="tripId"
      :form-value="publishedInfo"
      :is-editing-mode="isEditingMode"
      @change-value="saveChanges"
    /> -->
    <TripInfoForm
      ref="tripInfoFormRef"
      :trip-id="tripId"
      :form-value="publishedInfo"
      :is-editing-mode="true"
      @change-value="saveChanges"
    />
    <BaseButton
      button-class="sb-btn-primary sb-btn-lg px-4  rounded-pill d-flex align-items-center fw-bold ms-auto"
      type="button"
      @click="previewModal.toggleShow"
    >
      <template v-slot:default>
        <span>{{
          isEditingMode ? "Preview" : t("button.preview_and_publish")
        }}</span>
        <span class="fw-600 ms-2">
          <i class="fi fi-arrow-right-short"></i>
        </span>
      </template>
    </BaseButton>

    <!-- Trip preview modal -->
    <PreviewModal
      v-model="previewModal.show.value"
      :toggle-modal="() => previewModal.toggleShow()"
      :publish-data="previewData"
      :is-editing-mode="true"
    />
  </div>
</template>
<script lang="ts" setup>
import TripInfoForm from "@/components/modules/sharelead/setupSharebus/TripInfo/TripInfoForm.vue";
import { useToggle } from "@/composables/useToggle";
import { useSalesStore, useTripStore } from "@/store";
import { routePushTagQuery } from "@/utils";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import BaseButton from "@busgroup/vue3-base-button";
import PreviewModal from "@/components/modules/sharelead/publishSharebus/tripPreview/PreviewModal.vue";
import { TripInfoData } from "@/store/sharebus/types";
import { useI18n } from "vue-i18n";
import type { StoreContext } from "@/store/trip/privateTrip/types";

interface TripInfoFormInstance {
  validateForm: (showError?: boolean) => boolean;
  isValid: boolean;
  values: TripInfoData;
}

const route = useRoute();
const tripInfoFormRef = ref<TripInfoFormInstance | null>(null);
const { t } = useI18n();

const tripStore = useTripStore() as unknown as StoreContext;
const salesStore = useSalesStore();
const isEditingMode = computed(() => salesStore.$state.editing_mode);
onMounted(() => {
  tripStore.getTrip(tripId);
});
const previewModal = useToggle();

const tripId = route.params.id as string;
const trip = computed(() => tripStore.getCurrentTrip);
const publishedInfo = computed(() => {
  const salesTrip = salesStore.$state.salesEditTrip[tripId];
  const saleaTripGnInfo = salesTrip?.trip_general_info as TripInfoData;
  return {
    trip_organizer:
      saleaTripGnInfo?.trip_organizer || trip.value.trip_organizer,
    name: saleaTripGnInfo?.name || trip.value.name,
    website_url: saleaTripGnInfo?.website_url || trip.value.website_url,
    // Check if image_url exists in sales store to allow empty string (file removed)
    image_url:
      saleaTripGnInfo && "image_url" in saleaTripGnInfo
        ? saleaTripGnInfo.image_url
        : trip.value.image_url,
    category: saleaTripGnInfo?.category || trip.value.category,
    info_to_travellers:
      saleaTripGnInfo?.info_to_travellers || trip.value.info_to_travellers,
  };
});

const changesAction = (value) => {
  if (tripInfoFormRef.value) {
    tripInfoFormRef.value.validateForm(!!value);
  }
  if (!value) {
    routePushTagQuery("trip-sales-page", tripId, { tabindex: 1 });
    // publishSharebusForm.resetForm();
    // return;
  } else if (value && tripInfoFormRef.value?.isValid) {
    console.log(tripInfoFormRef.value?.values);
    saveChanges(tripInfoFormRef.value.values);
  }
};

const saveChanges = (formValue) => {
  const saleTripImg = (
    salesStore.$state.salesEditTrip[tripId]?.trip_general_info as TripInfoData
  )?.image_url;

  // Use form value for image (can be "", File, or string)
  // If form doesn't have image_url, check sales store, then original trip
  const imageUrl =
    "image_url" in formValue
      ? formValue.image_url
      : saleTripImg !== undefined
      ? saleTripImg
      : trip.value.image_url;

  assignValueToStore(formValue, imageUrl);
};

const assignValueToStore = (formValue, photoUri) => {
  const value = {
    name: formValue.name as string,
    category: formValue.category as string,
    info_to_travellers: formValue.info_to_travellers as string,
    website_url: formValue.website_url as string,
    image_url: photoUri,
    trip_organizer: formValue.trip_organizer as string,
  };
  salesStore.setSalesConsoleTripChangeRequest({
    trip_general_info: value,
    trip_id: tripId,
  });

  // Enable edit mode before navigating back to maintain editing state
  salesStore.$state.editing_mode = true;

  routePushTagQuery("trip-sales-page", tripId, { tabindex: 1 });
};

const previewData = computed(() => {
  const formValues = tripInfoFormRef.value?.values || publishedInfo.value;

  // Determine image_url: if form has been edited (tripInfoFormRef exists), use its value
  // even if it's empty string (file removed). Otherwise fall back to published/trip data
  const imageUrl = tripInfoFormRef.value?.values
    ? formValues.image_url // Use form value (can be "", File, or string)
    : publishedInfo.value.image_url || trip.value.image_url; // Fallback

  return {
    ...formValues,
    image_url: imageUrl,
  };
});
</script>
