<template>
  <div class="h-auto">
    <TabsWrapper
      :tab-index="tabIndex"
      title=""
      wrapperClass="createPreviewSectionTabsWrapper"
    >
      <TabComponent :title="t('common.trip_ad')">
        <TripPreviewCard
          :title="tripData.name"
          :image-url="tripData.image_url"
          :departure-info="getDepartureInfo(trip as Trip)"
          :return-info="getReturnInfo(trip as Trip)"
          :price="0"
        />
      </TabComponent>
      <TabComponent :title="t('common.trip_booking_page')">
        <TripInfo
          :trip-data="tripData"
          :route-data="routeData"
          :trip-id="trip?.id || ''"
        />
      </TabComponent>
    </TabsWrapper>
  </div>
</template>

<script setup lang="ts">
import TabComponent from "@/components/common/tabs/tabComponent.vue";
import TabsWrapper from "@/components/common/tabs/tabsWrapper.vue";
import { ref, provide, computed } from "vue";
import { useI18n } from "vue-i18n";
import TripInfo from "./TripInfo.vue";
import TripPreviewCard from "./TripPreviewCard.vue";
import { useSharebusStore, useTripStore } from "@/store";
import { Trip } from "../../../../../store/trip/privateTrip/types";
import { useTripRouteInfo } from "@/composables/useTripRouteInfo";

const tabIndex = ref(1);

const handleTabChange = (id) => {
  tabIndex.value = id;
};

const { t } = useI18n();
const sharebus = useSharebusStore();
const tripStore = useTripStore();
const trip = computed(() => tripStore.getCurrentTrip);

// Use shared trip route info composable
const { getDepartureInfo, getReturnInfo } = useTripRouteInfo();

const tripData = computed(() => sharebus.getTripInfoData);

const routeData = computed(() => {
  const routeStepData = sharebus.getRouteStepData;
  return routeStepData?.route_points || { oneway: [], return: [] };
});

provide("handleTabChange", handleTabChange);
</script>

<style>
.createPreviewSectionTabsWrapper {
  width: 18rem;
}
</style>
