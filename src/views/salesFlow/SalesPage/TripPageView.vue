<template>
  <div class="w-90 mx-auto">
    <BaseBreadcrumbs
      modifier-class="divider p-0"
      crumb-class="crumb fw-bold"
      :current-crumb-label="tripInfo.name + ' ' + tripInfo.booking_reference"
      label-class="crumb-label"
      crumb-link-class="crumb-link ship-gray"
    />
    <h3 class="text-start ms-2 mb-2">
      <span class="me-2"><img src="/img/my-busses/bus-logo.svg" /></span
      >{{ tripInfo.name }}
    </h3>

    <div v-if="tripInfo.id">
      <div class="text-start mb-3">
        <div>
          <BaseButton
            v-if="!editingMode && isEditable"
            @click="confirmationModal.toggleShow()"
            button-class="sb-btn-primary sb-btn-lg px-4 mb-2"
            :button-text="`${
              tripInfo.is_published
                ? `${t('button.unpublish')} ${t('common.and')}`
                : ''
            } ${t('button.edit')}`"
          />
          <BaseButton
            @click="confirmTripDialogAction"
            button-class="sb-btn-primary sb-btn-lg px-4 ms-2 mb-2"
            :button-text="t('sales.confirm_trip')"
            :is-disabled="!isConfirmable"
          />
          <BaseButton
            v-if="
              user.currentRole === ROLE.PARTNER_SHARELEAD &&
              totalSoldTickets > 0
            "
            @click="exportPoc"
            button-class="sb-btn-primary sb-btn-lg px-4 ms-2 mb-2"
          >
            <img src="/img/download.svg" class="me-2" alt="" />
            {{ t("sharebus.trip_page.export_poc") }}
          </BaseButton>
        </div>
        <div v-if="editingMode && isEditable" class="editing-mode p-3 mt-2">
          <span class="fw-bold"
            ><i class="fi fi-info-circle blue-malibu fw-bold ms-2"></i> &nbsp;
            {{ t("sales.editing_mode") }}</span
          >
        </div>
        <div v-if="!isEditable" class="editing-mode p-3 mt-2">
          <span class="fw-bold"
            ><i class="fi fi-info-circle blue-malibu fw-bold ms-2"></i> &nbsp;
            {{ t("sales.not_editable") }}</span
          >
        </div>
      </div>
      <div class="row">
        <TabsWrapper
          :tab-index="tabIndex"
          wrapper-class="col-sm-12 col-md-4"
          tab-btn-class="col-12"
        >
          <TabComponent :title="t('common.status')">
            <div class="row">
              <TripStatusSection
                v-if="
                  tripInfo.trip_status === TRIP_STATUS.UNCONFIRMED ||
                  tripInfo.trip_status === TRIP_STATUS.CONFIRMED
                "
                :trip-info="tripInfo"
                :sold-tickets="totalSoldTickets"
              />
            </div>

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
                :total-sold-tickets="totalSoldTickets"
                :max-pax="tripInfo.max_pax"
              />
            </div>
          </TabComponent>
          <TabComponent :title="t('common.details')">
            <TripDetailsSection
              :trip-info="tripInfo"
              :update-history="tripInfo.update_history"
            />
          </TabComponent>
        </TabsWrapper>
      </div>
    </div>
  </div>
  <div
    v-if="editingMode"
    class="changesListPanel gray-white-bg col-sm-12 position-fixed bottom-0 end-0 col-md-3 col-xl-5 col-xxl-3 p-4 shadow d-flex flex-column justify-content-center align-content-center rounded"
  >
    <div v-if="!loading">
      <div class="d-flex justify-content-between">
        <p class="mb-2 text-start fw-bold">
          {{
            t("sales.trip_changes_count", {
              count: Object.keys(changesList).length,
            })
          }}
        </p>
        <i class="fi fi-chevron-down" @click="toggled.toggleShow"></i>
      </div>
      <div v-if="!toggled.show.value">
        <ul>
          <li
            class="text-start"
            v-for="(value, key) in Object.keys(changesList)"
            :key="key"
          >
            {{ textMapChangesList[value] }}
          </li>
        </ul>
        <div class="mt-5 d-flex flex-column align-items-center">
          <BaseButton
            button-class="sb-btn-primary fw-bold sb-btn-md mb-3 "
            @click="publishChanges"
          >
            {{
              Object.keys(changesList).length == 0
                ? t("sales.re_publish_the_trip")
                : t("sales.publish_changes")
            }}</BaseButton
          >
          <BaseButton
            v-if="Object.keys(changesList).length != 0"
            button-class="sb-btn-secondary sb-btn-md fw-bold"
            @click="revertChangesModal"
          >
            {{ t("sales.revert_changes") }}</BaseButton
          >
        </div>
      </div>
    </div>
    <div v-else class="my-5">
      <img src="/img/icons/loading.svg" alt="publish" />
      <p>{{ t("sales.publishing_changes") }}</p>
    </div>
  </div>

  <BaseModal
    id="tripUnpublishModal"
    v-model="confirmationModal.show.value"
    dialog-class="modal-dialog-centered"
    content-class="py-4"
    footer-class="border-top-0 d-flex flex-column"
  >
    <template v-slot:content>
      <p class="px-5">
        {{ t("sales.changes_warning") }}
      </p>
    </template>
    <template v-slot:footer>
      <BaseButton
        button-class="sb-btn-lg sb-btn-primary rounded-pill px-5"
        :button-text="t('button.ok')"
        @click="unpublishEdit"
      />
      <BaseButton
        :button-text="t('button.cancel')"
        button-class="sb-btn-lg sb-btn-secondary border-1 medium-gray-border fw-bold rounded-pill d-flex align-items-center"
        @click="confirmationModal.toggleShowByValue(false)"
      >
        <span class="pt-1"
          ><i class="fi fi-chevron-left fs-5 icon-text-stroke green-jewel"></i
        ></span>
        <span class="ms-2">{{ t("button.cancel") }}</span>
      </BaseButton>
    </template>
  </BaseModal>
  <BaseModal
    id="tripPreviewModal"
    v-model="modalShow"
    header-class="border-bottom-0 pb-0"
    modifier-class="fade"
    dialog-class="modal-lg"
    footer-class="border-top-0 pb-4"
  >
    <template v-slot:content>
      <div
        class="my-2 mx-3 d-flex justify-content-center align-content-center flex-column align-items-center"
      >
        <h4 class="fw-bold">{{ t("sales.are_you_sure") }}</h4>
        <p>{{ t("sales.if_you_leave_the_page") }}</p>
        <div class="d-flex flex-column mt-4">
          <BaseButton
            button-class="sb-btn-secondary sb-btn-lg fw-bold"
            @click="revertChangesModal"
          >
            <span class="fw-bold ms-2"
              ><i class="fi fi-chevron-left green-jewel"></i></span
            ><span>{{ t("sales.go_back") }}</span>
          </BaseButton>
          <BaseButton
            button-class="sb-btn-primary sb-btn-lg mt-2 fw-bold"
            @click="revertChanges()"
            >{{ t("sales.revert") }}
          </BaseButton>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ComputedRef, computed, inject, onMounted, provide, ref } from "vue";
import TabsWrapper from "@/components/common/tabs/tabsWrapper.vue";
import TabComponent from "../../../components/common/tabs/tabComponent.vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import {
  useConfigStore,
  useLoaderStore,
  useSalesStore,
  useTripStore,
  useUserStore,
} from "@/store";
import BaseButton from "@busgroup/vue3-base-button";
import TripStatusSection from "@/components/modules/sales/tripStatus/edit/TripStatusSection.vue";
import TripDetailsSection from "@/components/modules/sales/tripDetails/edit/TripDetailsSection.vue";
import BaseModal from "@busgroup/vue3-base-modal";
import { TRIP_STATUS } from "@/components/modules/sharelead/trip/tripStatus/tripStatusEnum";
import { useToggle } from "@/composables/useToggle";
import { renameFile, s3FileUpload } from "@/composables/useS3Bucket";
import {
  Passenger,
  SalesEditGroup,
  TripEditor,
} from "@/store/salesConsole/types";
import {
  isoFormatDateTime,
  routePush,
  setRouteQuery,
  getUniqueIntId,
  deleteTypeNameKeyRecursively,
} from "@/utils";
import TripController from "@/components/modules/sharelead/controllers/TripController";
import TripStatus from "@/components/modules/sharelead/trip/tripStatus/TripStatus.vue";
import ConfirmTripDialog from "./ConfirmTripDialog.vue";
import { showToast, toastWithActionable } from "@/services/toast/toast.service";
import { countryType } from "@/core/plugin/countryPlugin";
import { useRedirect } from "@/services/auth/redirect.service";
import { ROLE } from "@/components/common/enums/enums";
import { SHAREBUS_CONFIG } from "@/services/graphql/enums/sharebus-config";
import { handleUnauthorizedError } from "@/core/http/graphql/handleResponse";

const { t } = useI18n();
const route = useRoute();
const user = useUserStore();
const tripStore = useTripStore();
const salesStore = useSalesStore();
const config = useConfigStore();
const confirmationModal = useToggle();
const toggled = useToggle();
const country = inject<ComputedRef<countryType>>("country");

const tabIndex = ref(route.query.tabindex ? Number(route.query.tabindex) : 0);
const loading = ref(false);
const departureInfo = TripController.getTripDeparture();
const returnInfo = TripController.getTripReturn();

const tripStatus = computed(() => tripStore.getCurrentTrip.trip_status);
const tripInfo = computed(() => tripStore.getCurrentTrip);
const editingMode = computed(() => salesStore.$state.editing_mode);
/**
 * Determines whether the trip information is editable based on the current trip status.
 * Trip information is considered editable if the trip status is not 'ONGOING'.
 *
 * @function
 * @name isEditable
 * @returns {boolean} Returns true if the trip information is editable, false otherwise.
 */
const isEditable = computed(() => {
  return (
    tripInfo.value.trip_status === TRIP_STATUS.UNCONFIRMED ||
    tripInfo.value.trip_status === TRIP_STATUS.CONFIRMED ||
    tripInfo.value.trip_status === TRIP_STATUS.WAITING_TO_START
  );
});

const totalSoldTickets = computed(() => {
  const { max_pax, available_earlybird_tickets, available_regular_tickets } =
    tripInfo.value;

  return max_pax - (available_earlybird_tickets + available_regular_tickets);
});

const isConfirmable = computed(() => {
  return (
    (tripInfo.value.trip_status === TRIP_STATUS.UNCONFIRMED ||
      tripInfo.value.trip_status === TRIP_STATUS.NEW) &&
    tripInfo.value.is_published === true
  );
});

const configuration = computed(() => config.getSharebusSetupConfig);

const changesList = computed(() => {
  const list = salesStore.getSalesConsoleTrip()[tripInfo.value.id];
  if (list) {
    return Object.fromEntries(
      Object.entries(list).filter(([key, value]) => {
        if (
          key == SalesEditGroup.TRIP_GOAL_DEADLINE &&
          Object.keys(value).length != 0
        ) {
          const temp = value["deadline_passenger_goal"];
          value["deadline_passenger_goal"] = isoFormatDateTime(temp.toString());
        }
        return (
          Object.keys(value).length != 0 &&
          key !== SalesEditGroup.UPDATE_HISTORY
        );
      })
    );
  } else {
    return {};
  }
});

const handleTabChange = (id) => {
  setRouteQuery({ tabindex: id });
  tabIndex.value = id;
};

const fetchAndSetEditor = (salesPerson: string | TripEditor) => {
  const salesPersonId =
    typeof salesPerson === "string" ? salesPerson : salesPerson?.id;

  if (salesPersonId) {
    useUserStore()
      .fetchUserById(salesPersonId)
      .then((res) => {
        const editor = JSON.parse(res.data.getUserInfo);
        if (editor) {
          tripStore.setEditor({ id: salesPersonId, name: editor.name });
        }
      })
      .catch((err) => console.log(err));
  }
};

const unpublishEdit = () => {
  if (tripInfo.value.is_published) {
    salesStore.unpublishTrip({ id: tripInfo.value.id }).then((res) => {
      if (res.status === 200) {
        salesStore.$state.editing_mode = true;

        if (tripInfo.value.update_history !== null) {
          fetchAndSetEditor(
            tripInfo.value.update_history.updated_by_ferdia_sales
          );
        }
      }
    });
  } else {
    salesStore.$state.editing_mode = true;
  }
  confirmationModal.toggleShowByValue(false);
};
const modalShow = ref(false);

const confirmTrip = () => {
  salesStore.confirmTrip({ trip_id: tripInfo.value.id }).then((res) => {
    if (res.status === 200) {
      tripStore.getTrip(route.params.tag as string);
    }
  });
};

const exportPoc = () => {
  const loader = useLoaderStore();
  loader.changeLoadingStatus({ isLoading: true });
  salesStore.getPassengersAction(tripInfo.value.id).then((data) => {
    const passengers = data.getPassengersList;
    downloadCSV(passengers, tripInfo.value.name);
    loader.changeLoadingStatus({ isLoading: false });
  });
};

/**
 * Capitalizes the header and separates camel case words with spaces.
 *
 * @param {string} header - The header string to transform.
 * @returns {string} - The transformed header string.
 */
function capitalizeAndSpace(header: string): string {
  return header
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space before uppercase letters
    .replace(/\b\w/g, (str) => str.toUpperCase()); // Capitalize each word
}

/**
 * Converts a JSON array of objects to a CSV string.
 *
 * @param {Passenger[]} jsonArray - The JSON array to convert.
 * @returns {string} - The resulting CSV string.
 * @example
 * const passengers = [
 *     { name: "John Cena", phoneNumber: "+12345678" },
 *     { name: "Bhija Biral", phoneNumber: "+12345678" }
 * ];
 * const csvString = jsonToCsv(passengers);
 * console.log(csvString);
 */
function jsonToCsv(jsonArray: Passenger[]): string {
  if (jsonArray.length === 0) return "";

  const headers = Object.keys(jsonArray[0]).filter(
    (item) => item !== "__typename"
  );
  const capitalizedHeaders = headers.map((header) =>
    capitalizeAndSpace(header)
  );
  const csvRows = jsonArray.map((obj) =>
    headers
      .map((header) => {
        const value = obj[header];
        return `"${value != null ? value : ""}"`; // Wrap values in double quotes
      })
      .join(",")
  );

  // Adding the headers row
  csvRows.unshift(capitalizedHeaders.join(","));

  return csvRows.join("\r\n");
}

/**
 * Generates and downloads a CSV file from an array of passenger objects.
 *
 * This function takes an array of passenger objects and a file name as input,
 * converts the data into a CSV format, and triggers a download of the generated CSV file.
 * Each key in the passenger objects is treated as a column header in the CSV file.
 *
 * @param {Passenger[]} passengers - The array of passenger objects to be converted to CSV.
 * @param {string} fileName - The desired name for the downloaded CSV file (without extension).
 *
 * @example
 * const passengers = [
 *   { name: 'John Doe', age: 30, flight: 'AB123' },
 *   { name: 'Jane Smith', age: 25, flight: 'CD456' }
 * ];
 * downloadCSV(passengers, 'passenger_list');
 * // This will trigger a download of a file named 'passenger_list_Exported_POC.csv'
 * // with the following content:
 * // name,age,flight
 * // John Doe    30  AB123
 * // Jane Smith  25  CD456
 */
const downloadCSV = (passengers: Passenger[], fileName: string) => {
  if (!passengers.length) return;

  const csvString = jsonToCsv(passengers);
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    // feature detection
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}_exported_POC.csv`;
    link.style.visibility = "hidden";
    link.click();
  }
};

const prepareNewFlowPayload = (payload: Record<string, any>) => {
  return deleteTypeNameKeyRecursively(payload);
};

const publishChanges = async (isLeavePage = false) => {
  loading.value = true;
  const changes = changesList.value;

  // Handle S3 file upload if image_url is a File object
  if (
    changes.trip_general_info &&
    typeof changes.trip_general_info === "object" &&
    "image_url" in changes.trip_general_info &&
    (changes.trip_general_info as any).image_url instanceof File
  ) {
    try {
      const imageFile = (changes.trip_general_info as any).image_url as File;
      const ext = imageFile.name.split(".").pop();
      const renamedFile = renameFile(
        imageFile,
        `${getUniqueIntId()}--${tripInfo.value.id}.${ext}`
      );

      const uploadedUrl = await s3FileUpload(renamedFile, {
        uploadedBy: user.data.attributes.email,
        userId: user.data.id,
        tripId: tripInfo.value.id,
      });

      // Replace File object with uploaded URL
      (changes.trip_general_info as any).image_url = uploadedUrl;
    } catch (error) {
      console.error("Failed to upload image:", error);
      showToast("error", t("sales.upload_image_failed"));
      loading.value = false;
      return;
    }
  }

  if (changes.trip_location_time) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (changes.trip_location_time as any).route_points = JSON.stringify({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      oneway: (changes.trip_location_time as any).route_points.oneway.map(
        (item, index) => {
          return { ...item, sequence: index };
        }
      ),
      return: changes.trip_location_time.route_points.return.map(
        (item, index) => {
          return { ...item, sequence: index };
        }
      ),
    });
    delete changes.trip_location_time.bus_signage;
  }

  const newPayload = prepareNewFlowPayload(changes);
  console.log("Changes to be published:", {
    trip_id: tripInfo.value.id,
    ...newPayload,
    ...changes,
  });

  salesStore
    .updateTripAttribute({
      trip_id: tripInfo.value.id,
      ...changes,
      ...newPayload,
      trip_republish: {
        is_published: true,
      },
    })
    .then(() => {
      salesStore.$reset();
      if (isLeavePage) {
        routePush("sales-buses");
      }
      loading.value = false;
      tripStore.getTrip(tripInfo.value.id);

      showToast("success", t("sales.trip_changes_published"));
    })
    .catch((error) => {
      console.error("Failed to publish changes:", error);
      showToast("error", t("sales.publish_changes_failed"));
      loading.value = false;
    });
};
const revertChangesModal = () => {
  modalShow.value = !modalShow.value;
};
const revertChanges = () => {
  salesStore.$reset();
  revertChangesModal();
  publishChanges(true);
};

const textMapChangesList = {
  [SalesEditGroup.MAX_PAX]: "Edited max pax",
  [SalesEditGroup.PASSENGER_GOAL]: "Edited passenger goal",
  [SalesEditGroup.TRIP_GOAL_DEADLINE]: "Edited passenger goal deadline",
  [SalesEditGroup.TRIP_TICKET_PRICING]: "Edited pricing",
  [SalesEditGroup.TRIP_LOCATION_TYPE]: "Edited trip itinerary",
  [SalesEditGroup.TRIP_GENERAL_INFO]: "Trip Published Info",
  [SalesEditGroup.TRIP_TICKET_DISCOUNTS]: "Edited ticket discounts",
  [SalesEditGroup.SHOW_TRIP_AVAILABLE_SEATS]:
    "Edited trip available seats show status",
};

const confirmTripDialogAction = () => {
  const content = {
    // Your component or JSX template
    component: ConfirmTripDialog,
    // Props are just regular props, but these won't be reactive
    props: {
      callback: confirmTrip,
    },
  };
  toastWithActionable(content);
};

onMounted(() => {
  config.fetchSetupSharebusConfig(SHAREBUS_CONFIG.SCHEDULED_CONFIG);
  config.fetchSetupSharebusConfig(SHAREBUS_CONFIG.SCHEDULED_CONFIG);
  tripStore.getTrip(route.params.tag as string).then((trip) => {
    const errors = trip.errors;
    if (errors) {
      handleUnauthorizedError(errors);
    }

    if (trip.getTrip.country !== country?.value.countryISO) {
      showToast("error", t("sales.permission_denied"));
      useRedirect().redirect();
    }

    if (trip.getTrip.update_history !== null) {
      fetchAndSetEditor(trip.getTrip.update_history.updated_by_ferdia_sales);
    }
  });
});

provide("handleTabChange", handleTabChange);
</script>

<style>
.editing-mode {
  background: #e5f8fa;
}
.changesListPanel {
  z-index: 999;
}
</style>
