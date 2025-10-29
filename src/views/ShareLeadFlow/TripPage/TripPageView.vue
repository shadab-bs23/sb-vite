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
            <div
              class="col-sm-12 col-md-12 col-xl-6 col-lg-12 col-xxl-9 d-flex flex-column align-items-start mb-4"
            >
              <div
                class="border rounded p-3 d-flex flex-column align-items-start col-xl-10 col-xxl-7 col-lg-12 col-md-12 col-sm-12"
              >
                <TripDetails :tripInfo="tripInfo" />
              </div>

              <div
                class="d-flex flex-wrap custom-card-wrap mt-3 col-xl-10 col-xxl-7 col-lg-12 col-md-12 col-sm-12"
                :class="
                  tripInfo.club_share_per_extra_ticket > 0 &&
                  tripInfo.earlybird_ticket_price > 0
                    ? 'justify-content-between'
                    : 'justify-content-start'
                "
              >
                <TicketPrice
                  class="custom-card rounded mb-1"
                  :title="t('sharebus.ticket.price')"
                  :amount="tripInfo.regular_ticket_price"
                  currency="Kr"
                  :info="
                    tripInfo.trip_type === TRIP_TYPE.ROUND
                      ? t('sharebus.ticket.roundtrip')
                      : ''
                  "
                />
                <TicketPrice
                  class="custom-card rounded mb-1"
                  v-if="tripInfo.earlybird_ticket_price > 0"
                  :title="t('sharebus.price_info.early_bird_price')"
                  :amount="tripInfo.earlybird_ticket_price"
                  currency="Kr"
                />
                <TicketPrice
                  class="custom-card rounded mb-1"
                  v-if="tripInfo.club_share_per_extra_ticket > 0"
                  :title="t('sharebus.ticket.bonus_per_ticket')"
                  :amount="tripInfo.club_share_per_extra_ticket"
                  currency="Kr"
                  :info="
                    t('sharebus.ticket.after_sold_ticket_amount', {
                      passenger_goal: tripInfo.passenger_goal,
                    })
                  "
                />
              </div>
            </div>
            <div class="col-sm-12 col-md-12 col-lg-12 col-xl-6 col-xxl-3">
              <TripInfoDetails :trip-info="departureInfo" class="mb-4" />
              <TripInfoDetails
                :trip-info="returnInfo"
                v-if="returnInfo.departureDateTime"
                :is-return-trip="returnInfo.route_points.length"
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
import TicketPrice from "@/components/modules/sharelead/setupSharebus/ticketPrice/TicketPrice.vue";
import TripInfoDetails from "@/components/modules/sharelead/setupSharebus/TripInfo/TripInfoDetails.vue";
import TripController from "@/components/modules/sharelead/controllers/TripController";
import TripStatus from "@/components/modules/sharelead/trip/tripStatus/TripStatus.vue";
import {
  TRIP_STATUS,
  TRIP_TYPE,
} from "@/components/modules/sharelead/trip/tripStatus/tripStatusEnum";
import { useRoute } from "vue-router";
import { useTripStore } from "@/store";
import TripVehicleConfirmationStatus from "@/components/modules/sharelead/trip/tripStatus/TripVehicleConfirmationStatus.vue";
import DownloadTicket from "@/components/modules/joiner/booking/DownloadTicket.vue";
import { showToast } from "@/services/toast/toast.service";
import { useRedirect } from "@/services/auth/redirect.service";
import { countryType } from "@/core/plugin/countryPlugin";
import UriController from "@/components/controller/UriController";
const country = inject<ComputedRef<countryType>>("country");

const { t } = useI18n();
const route = useRoute();
const shareleadTripStore = useTripStore();

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
const tabindexFromUri = UriController.getQuery().tabindex;
const tabIndex = ref(tabindexFromUri ? tabindexFromUri : 0);

const handleTabChange = (id: number) => {
  tabIndex.value = id;
  tabIndex.value = id;
};

provide("handleTabChange", handleTabChange);
</script>
