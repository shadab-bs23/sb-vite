<template>
  <div class="text-start col-sm-12 col-md-8 offset-md-2">
    <PublishSharebusForm
      :trip-id="tripId"
      :form-value="publishedInfo"
      :is-editing-mode="isEditingMode"
      @change-value="saveChanges"
    />
  </div>
</template>
<script lang="ts" setup>
import PublishSharebusForm from "@/components/modules/sharelead/publishSharebus/publishForm/PublishSharebusForm.vue";
import { renameFile, s3FileUpload } from "@/composables/useS3Bucket";
import { useSalesStore, useTripStore, useUserStore } from "@/store";
import { TripGeneralInfo } from "@/store/salesConsole/types";
import { routePushTagQuery } from "@/utils";
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const user = useUserStore();

const tripStore = useTripStore();
const salesStore = useSalesStore();
const isEditingMode = computed(() => salesStore.$state.editing_mode);
onMounted(() => {
  tripStore.getTrip(tripId);
});

const tripId = route.params.id as string;
const trip = computed(() => tripStore.getCurrentTrip);

const saveChanges = (formValue) => {
  if (formValue.photo) {
    let renamedFile: File | null = null;
    //rename the file using trip id
    const ext = formValue.photo.name.split(".")[1];
    renamedFile = renameFile(formValue.photo, `${tripId}.${ext}`);
    s3FileUpload(renamedFile, {
      uploadedBy: user.data.attributes.email,
      userId: user.data.id,
      tripId: tripId,
    }).then((res) => {
      assignValueToStore(formValue, res);
    });
  } else {
    assignValueToStore(formValue, trip.value.image_url);
  }
};

const assignValueToStore = (formValue, photoUri) => {
  const value = {
    name: formValue.tripName as string,
    category: formValue.tripCategory as string,
    info_to_travellers: formValue.infoToTravelers as string,
    website_url: formValue.eventLink as string,
    image_url: photoUri,
    trip_organizer: formValue.organizer as string,
  };
  const setObj = {
    [tripId]: {
      trip_general_info: {
        ...value,
      },
      update_history: {
        trip_general_info: new Date(),
      },
    },
  };
  salesStore.setSalesConsoleTripChangeRequest(setObj);
  routePushTagQuery("trip-sales-page", tripId, { tabindex: 1 });
};

const publishedInfo = computed(() => {
  const salesTrip = salesStore.getSalesConsoleTrip()[tripId];
  let editingData = {} as TripGeneralInfo;
  if (salesTrip && Object.keys(salesTrip.trip_general_info).length) {
    editingData = { ...(salesTrip.trip_general_info as TripGeneralInfo) };
  } else {
    editingData = trip.value;
  }
  return {
    tripName: editingData?.name,
    tripCategory: editingData?.category,
    organizer: editingData?.trip_organizer,
    infoToTravelers: editingData?.info_to_travellers,
    eventLink: editingData?.website_url,
    photo: editingData?.image_url,
  };
});
</script>
