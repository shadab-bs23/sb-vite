<template>
  <div class="w-90 mx-auto">
    <BaseBreadcrumbs
      modifier-class="divider p-0"
      crumb-class="crumb fw-bold"
      :current-crumb-label="tripInfo.name"
      label-class="crumb-label"
      crumb-link-class="crumb-link ship-gray"
    />
    <h3 class="text-start ms-2 mb-4">
      <span class="me-2"><img src="/img/my-busses/bus-logo.svg" /></span
      >{{ tripInfo.name }}
    </h3>
    <div v-if="tripInfo.id">
      <TabsWrapper
        :tab-index="tabIndex"
        wrapper-class="col-sm-10 col-md-5 col-xl-4"
      >
        <TabComponent :title="t('common.status')">
          <TripVehicleConfirmationStatus
            v-if="
              tripInfo.trip_status === TRIP_STATUS.UNCONFIRMED ||
              tripInfo.trip_status === TRIP_STATUS.CONFIRMED
            "
            :trip-info="tripInfo"
          />

          <div
            class="text-center"
            v-if="
              tripInfo.trip_status !== TRIP_STATUS.UNCONFIRMED &&
              tripInfo.trip_status !== TRIP_STATUS.CONFIRMED
            "
          >
            <TripStatus
              :trip-status="tripStatus"
              :departure-info="departureInfo"
              :return-info="returnInfo"
            />
          </div>
        </TabComponent>
        <TabComponent :title="t('common.details')">
          <div class="row col-md-12">
            <div class="col-sm-12 col-md-12 col-lg-12">
              <TripDetails :tripInfo="tripInfo" />
            </div>
            <div class="col-sm-12 col-md-12 col-lg-12 col-xl-4 col-xxl-3">
              <TripInfoDetails :trip-info="departureInfo" class="my-4" />
              <TripInfoDetails
                :trip-info="returnInfo"
                v-if="returnInfo.departureDateTime"
              />
            </div>
          </div>
        </TabComponent>
        <TabComponent :title="t('sharebus.ticket.tickets')">
          <DownloadTicket :trip-info="tripInfo" />
        </TabComponent>
      </TabsWrapper>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ComputedRef, computed, inject, onMounted, provide, ref } from "vue";
import TabsWrapper from "@/components/common/tabs/tabsWrapper.vue";
import TabComponent from "../../../components/common/tabs/tabComponent.vue";
import TripDetails from "@/components/modules/sharelead/trip/tripDetails/TripDetails.vue";
import { useI18n } from "vue-i18n";
import TripInfoDetails from "@/components/modules/sharelead/setupSharebus/TripInfo/TripInfoDetails.vue";
import TripController from "@/components/modules/sharelead/controllers/TripController";
import DownloadTicket from "@/components/modules/joiner/booking/DownloadTicket.vue";
import TripVehicleConfirmationStatus from "@/components/modules/joiner/TripPage/TripVehicleConfirmationStatus.vue";
import { TRIP_STATUS } from "@/components/modules/sharelead/trip/tripStatus/tripStatusEnum";
import { useRoute } from "vue-router";
import { useTripStore } from "@/store";
import TripStatus from "@/components/modules/sharelead/trip/tripStatus/TripStatus.vue";
import { countryType } from "@/core/plugin/countryPlugin";
import { showToast } from "@/services/toast/toast.service";
import { useRedirect } from "@/services/auth/redirect.service";
const country = inject<ComputedRef<countryType>>("country");

const { t } = useI18n();
const route = useRoute();
const shareleadTripStore = useTripStore();

const tabIndex = ref(route.query.tabindex ? Number(route.query.tabindex) : 0);

const departureInfo = TripController.getTripDeparture();
const returnInfo = TripController.getTripReturn();

const tripInfo = computed(() => shareleadTripStore.getCurrentTrip);
const tripStatus = computed(
  () => shareleadTripStore.getCurrentTrip.trip_status
);

onMounted(() => {
  shareleadTripStore.getTrip(route.params.tag as string).then((trip) => {
    if (trip.getTrip.country !== country?.value.countryISO) {
      showToast("error", t("sales.permission_denied"));
      useRedirect().redirect();
    }
  });
});

const handleTabChange = (id) => {
  tabIndex.value = id;
};

provide("handleTabChange", handleTabChange);
</script>
