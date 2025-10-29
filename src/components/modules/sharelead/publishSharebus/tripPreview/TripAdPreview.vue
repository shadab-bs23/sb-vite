<template>
  <BaseCard card-class="mb-4 card-default">
    <template v-slot:content>
      <div class="row justify-content-between">
        <div class="row col-sm-12 col-md-8">
          <h4 class="ms-2 fw-bold fs-4 ship-gray text-start">
            <img src="/img/trip-info/bus-icon.svg" /> {{ tripData.tripName }}
          </h4>
          <div class="d-flex">
            <div>
              <img
                class="banner-picture rounded"
                src="/img/dummy.jpg"
                alt="trip photo"
                v-show="!tripData.photo.length"
              />
              <img
                class="banner-picture rounded"
                :src="tripData.photo"
                alt="trip
          photo"
                v-show="tripData.photo.length"
                :onError="(e) => { 
            (e.target as HTMLImageElement).onerror = null;
            (e.target as HTMLImageElement).src = '/img/dummy.jpg' }"
              />
            </div>
            <div class="d-flex flex-wrap flex-grow-1">
              <TripInfoDetails
                :trip-info="departureInfo"
                :class="`ps-3 col-sm-12 ${
                  returnInfo.departureDateTime ? 'col-md-6' : 'col-md-12'
                }`"
                :isHorizontal="true"
              />
              <TripInfoDetails
                v-if="returnInfo.departureDateTime"
                :trip-info="returnInfo"
                :is-return-trip="true"
                class="ps-3 col-sm-12 col-md-6"
                :isHorizontal="true"
              />
            </div>
          </div>
        </div>
        <div class="col-sm-12 col-md-4 col-xl-4">
          <div
            class="px-4 py-4 w-100 rounded extended-light-green-bg text-center"
          >
            <p class="ship-gray">{{ t("sharebus.publish.tickets_from") }}</p>
            <p class="fw-bold ship-gray">
              {{
                tripData.available_earlybird_tickets
                  ? tripData.earlybird_ticket_price
                  : tripData.regular_ticket_price
              }}
              Kr
            </p>
          </div>
          <BaseButton
            :button-class="`sb-btn-primary-alt sb-btn-lg w-100 rounded-pill text-center mt-2 ${
              disableViewAndBook &&
              (isEditingMode || name === 'publish-sharebus') &&
              'pe-none'
            }`"
            @click="redirectToBookingPage"
          >
            <template v-slot:default>
              <span class="fw-bold">{{
                t("sharebus.publish.view_and_book")
              }}</span>
              <span class="fw-bold ms-2"
                ><i class="fi fi-arrow-right-short"></i
              ></span>
            </template>
          </BaseButton>
        </div>
      </div>
    </template>
  </BaseCard>
</template>
<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import BaseButton from "@busgroup/vue3-base-button";
import TripInfoDetails from "../../setupSharebus/TripInfo/TripInfoDetails.vue";
import { routePushTag } from "@/utils";
import { useUserStore } from "@/store";
import { computed } from "vue";
import { showToast } from "@/services/toast/toast.service";
import { useRoute } from "vue-router";
import BaseCard from "@busgroup/vue3-base-card";
import { ROLE } from "@/components/common/enums/enums";

const props = defineProps({
  tripData: {
    type: Object,
    required: true,
  },
  departureInfo: {
    type: Object,
    required: true,
  },
  returnInfo: {
    type: Object,
    required: false,
    default: null,
  },
  isEditingMode: {
    type: Boolean,
    default: false,
  },
});
const { t } = useI18n();
const user = useUserStore();
const userDetails = computed(() => user);
const { name } = useRoute();
const disableViewAndBook = computed(
  () =>
    userDetails.value.currentRole !== ROLE.JOINER &&
    userDetails.value.isAuthenticated
);

const redirectToBookingPage = () => {
  if (props.tripData.id) {
    if (disableViewAndBook.value) {
      showToast("info", t("home.sharelead_warning"), 2000, "top-left");
      return;
    }
    routePushTag("book-ticket", props.tripData.id);
  }
};
</script>
