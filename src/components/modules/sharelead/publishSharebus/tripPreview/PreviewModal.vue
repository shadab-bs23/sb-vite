<template>
  <BaseModal
    id="tripPreviewModal"
    v-model="computedVModel"
    header-class="border-bottom-0 pb-0"
    modifier-class="fade"
    dialog-class="modal-xl"
    footer-class="border-top-0 pb-4"
  >
    <template v-slot:header> </template>
    <template v-slot:closeButton>
      <div
        class="d-flex col-md-12 align-items-center justify-content-end w-100"
        @click="() => toggleModal()"
      >
        <BaseButton button-class="sb-btn-secondary sb-btn-lg rounded-circle">
          <i class="fi fi-x green-jewel"></i>
        </BaseButton>
      </div>
    </template>
    <template v-slot:content>
      <h2 class="mx-2 mb-4 fw-bold">
        {{ t("sharebus.publish.trip_preview") }}
      </h2>
      <TabsWrapper
        :tab-index="tabIndex"
        wrapper-class="col-sm-12 col-md-7 col-lg-5 col-xl-3"
      >
        <TabComponent :title="t('sharebus.publish.trip_ad')">
          <div>
            <span class="ship-gray">{{
              t("sharebus.publish.trip_ad_title_part_one")
            }}</span>
            <span
              >&nbsp;
              <a
                class="text-decoration-underline"
                href="www.sharebus.no"
                target="_blank"
                >Sharebus.no</a
              >
              &nbsp;</span
            >
            <span class="ship-gray">{{
              t("sharebus.publish.trip_ad_title_part_two")
            }}</span>
          </div>
          <TripAdPreview
            :trip-data="{ ...publishData, ...currentTrip }"
            :departure-info="departureInfo"
            :return-info="returnInfo"
            :is-editing-mode="isEditingMode"
          />
        </TabComponent>
        <TabComponent :title="t('sharebus.publish.trip_booking_page')">
          <TripBookingPage
            :trip-data="publishData"
            :departure-info="departureInfo"
            :return-info="returnInfo"
          />
        </TabComponent>
      </TabsWrapper>
    </template>
    <template v-slot:footer>
      <BaseButton
        button-class="sb-btn-lg sb-btn-secondary d-flex align-items-center border-1 rounded-pill py-0 px-4"
        @click="() => toggleModal()"
      >
        <span class="text-center fw-bold">{{
          t("button.close_and_edit")
        }}</span>
        <i class="close green-jewel ms-2 mt-2"></i>
      </BaseButton>
      <BaseButton
        v-if="!isEditingMode"
        button-class="sb-btn-primary sb-btn-lg w-auto rounded-pill lh-1 px-4 fw-bold d-flex justify-content-center align-items-center"
        @click="$emit('publish')"
      >
        <template v-slot:default>
          <span>{{ t("sharebus.publish.publish") }}</span>
          <span class="fw-bold ms-2"
            ><i class="fi fi-arrow-right-short"></i
          ></span>
        </template>
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from "@busgroup/vue3-base-modal";
import BaseButton from "@busgroup/vue3-base-button";
import TabsWrapper from "@/components/common/tabs/tabsWrapper.vue";
import TabComponent from "@/components/common/tabs/tabComponent.vue";
import TripAdPreview from "../tripPreview/TripAdPreview.vue";
import TripBookingPage from "../tripPreview/TripBookingPage.vue";
import { computed, PropType, provide, ref } from "vue";
import { useI18n } from "vue-i18n";
import { PublishFormType } from "../publishForm/types";
import TripController from "../../controllers/TripController";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  toggleModal: {
    type: Function,
    required: true,
  },
  publishData: {
    type: Object as PropType<PublishFormType>,
    required: true,
  },
  isEditingMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "publish"]);

const { t } = useI18n();
const tabIndex = ref(0);

const handleTabChange = (id) => {
  tabIndex.value = id;
};

provide("handleTabChange", handleTabChange);

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

const currentTrip = TripController.getCurrentTrip;
const departureInfo = TripController.getTripDeparture();
const returnInfo = TripController.getTripReturn();
</script>
