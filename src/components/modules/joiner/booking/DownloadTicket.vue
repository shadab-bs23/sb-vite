<template>
  <div
    v-if="showDownloadError"
    class="alert alert-danger alert-dismissible mb-3 fw-bold"
    role="alert"
  >
    {{ t("error.oops") }}
    <button
      type="button"
      class="btn-close ms-2"
      aria-label="Close"
      @click="showDownloadError = false"
    ></button>
  </div>
  <div>
    <div class="row text-start ship-gray">
      <p class="fw-600 mb-3">{{ t("sharebus.ticket.download") }}</p>
      <div
        v-if="isCancelledOrTerminated"
        class="rounded light-gray-bg p-2 w-auto mb-3"
      >
        <span class="error-input-color fi fi-x-circle-fill"></span>
        <span class="ms-1 fw-bold">{{ t("sharebus.my_buses.cancelled") }}</span>
      </div>
      <div
        v-else-if="tripInfo.trip_status === TRIP_STATUS.FINISHED"
        class="rounded light-gray-bg p-2 w-auto mb-3"
      >
        <span class="light-gray-bg fi fi-check2"></span>
        <span class="ms-1 fw-bold">{{ t("status.finished") }}</span>
      </div>
      <div v-else-if="tripInfo.trip_status === TRIP_STATUS.CONFIRMED">
        <div v-for="(categories, pickupId) in groupedTickets" :key="pickupId">
          <div
            v-for="(tickets, category) in categories"
            :key="category"
            class="d-flex justify-content-between align-items-center py-3 border-bottom"
          >
            <div>
              <div class="fw-bold">{{ tickets.length }} {{ category }}</div>
              <div class="small">
                {{ getViaPointNameById(Number(pickupId)) }}
                &nbsp;↔&nbsp;
                {{ getLastPointName() }}
              </div>
            </div>
            <BaseButton
              button-class="download-ticket-btn"
              :disabled="
                loadingGroup === pickupId + '-' + category || loadingAll
              "
              @click="downloadTicketGroup(tickets, pickupId, category)"
            >
              <span v-if="loadingGroup === pickupId + '-' + category">
                <span
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                {{ t("sharebus.ticket.downloading") }}
              </span>
              <span v-else>
                <i class="fi fi-download me-2"></i>
                {{ t("sharebus.ticket.download") }}
              </span>
            </BaseButton>
          </div>
        </div>
        <div class="mt-4 d-flex justify-content-end">
          <BaseButton
            button-class="download-ticket-btn fw-bold"
            :disabled="loadingAll"
            @click="downloadAllTickets"
          >
            <span v-if="loadingAll">
              <span
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              {{ t("sharebus.ticket.downloading") }}
            </span>
            <span v-else>
              <i class="fi fi-download me-2"></i>
              {{
                t("sharebus.ticket.download_tickets", {
                  tickets: allTicketsCount,
                })
              }}
            </span>
          </BaseButton>
        </div>
      </div>
      <div
        v-if="tripInfo.trip_status === TRIP_STATUS.UNCONFIRMED"
        class="extended-light-green-bg rounded col-sm-12 col-md-5 col-xl-4 p-3"
      >
        {{ t("sharebus.ticket.you_can_download_tickets") }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import BaseButton from "@busgroup/vue3-base-button";
import { computed, PropType, ref } from "vue";
import { Trip } from "@/store/trip/privateTrip/types";
import { TRIP_STATUS } from "../../sharelead/trip/tripStatus/tripStatusEnum";
import JSZip from "jszip";
import type { RoutePoints } from "@/components/ViaPointsPackage/types/types";

const props = defineProps({
  tripInfo: {
    type: Object as PropType<Trip>,
    required: true,
  },
});

const { t } = useI18n();

// Group tickets by pickup point and category
const groupedTickets = computed(() => {
  const tickets = (props.tripInfo.ticket || []).filter((t) => !!t);
  const groups: Record<string, Record<string, Record<string, unknown>[]>> = {};
  for (const ticket of tickets) {
    const pickupId = ticket.trip_via_point_id;
    const category = ticket.category;
    if (!groups[pickupId]) groups[pickupId] = {};
    if (!groups[pickupId][category]) groups[pickupId][category] = [];
    groups[pickupId][category].push(ticket);
  }
  return groups;
});

// Parse route points as RoutePoints (with oneway/return arrays)

const parsedRoutePoints = computed(() => {
  try {
    return JSON.parse(props.tripInfo.route_points || "{}") as RoutePoints;
  } catch (error) {
    console.error("Failed to parse route points:", error);
    return { oneway: [], return: [] };
  }
});

// Utility: get viapoint name by id
function getViaPointNameById(id: number): string | undefined {
  const allPoints = [
    ...(parsedRoutePoints.value.oneway || []),
    ...(parsedRoutePoints.value.return || []),
  ];
  const found = allPoints.find((vp) => vp.id === id);
  return found?.point;
}

// Utility: get last point name (handles round trip logic)
function getLastPointName(): string | undefined {
  if (
    parsedRoutePoints.value.return &&
    parsedRoutePoints.value.return.length > 0
  ) {
    return parsedRoutePoints.value.return[
      parsedRoutePoints.value.return.length - 1
    ].point;
  }
  if (
    parsedRoutePoints.value.oneway &&
    parsedRoutePoints.value.oneway.length > 0
  ) {
    return parsedRoutePoints.value.oneway[
      parsedRoutePoints.value.oneway.length - 1
    ].point;
  }
  return undefined;
}

const allTicketsCount = computed(() => (props.tripInfo.ticket || []).length);

const isCancelledOrTerminated = computed(
  () =>
    props.tripInfo.trip_status === TRIP_STATUS.CANCELED_BY_ORGANIZER ||
    props.tripInfo.trip_status === TRIP_STATUS.CANCELED_BY_FERDIA ||
    props.tripInfo.trip_status === TRIP_STATUS.EXPIRED ||
    props.tripInfo.trip_status === TRIP_STATUS.TERMINATED
);

const showDownloadError = ref(false);
const loadingGroup = ref("");
const loadingAll = ref(false);

async function downloadTicketGroup(
  tickets: Record<string, unknown>[],
  pickupId?: string,
  category?: string
) {
  if (!tickets.length) return;
  showDownloadError.value = false;
  const groupKey = (pickupId || "") + "-" + (category || "");
  loadingGroup.value = groupKey;
  try {
    const pdfUrls = tickets
      .map((ticket) =>
        typeof ticket.download_url === "string"
          ? ticket.download_url
          : undefined
      )
      .filter(Boolean) as string[];
    const cat = category || tickets[0]?.category || "tickets";
    const tripName = props.tripInfo.name
      ? props.tripInfo.name.replace(/\s+/g, "_")
      : "trip";
    const zipName = `${tripName}_${cat}`;
    if (pdfUrls.length === 1) {
      window.open(pdfUrls[0], "_blank");
      return;
    }
    if (pdfUrls.length > 1) {
      await downloadZip(
        pdfUrls,
        zipName,
        tickets.map((t, i) => `${i + 1}-${cat}`)
      );
    }
  } catch (err) {
    showDownloadError.value = true;
  } finally {
    loadingGroup.value = "";
  }
}

async function downloadAllTickets() {
  const tickets = props.tripInfo.ticket || [];
  showDownloadError.value = false;
  loadingAll.value = true;
  try {
    const pdfUrls = tickets
      .map((ticket) => ticket.download_url)
      .filter(Boolean);
    const tripName = props.tripInfo.name
      ? props.tripInfo.name.replace(/\s+/g, "_")
      : "trip";
    const zipName = `${tripName}_all`;
    if (pdfUrls.length === 1) {
      window.open(pdfUrls[0], "_blank");
      return;
    }
    if (pdfUrls.length > 1) {
      await downloadZip(
        pdfUrls,
        zipName,
        tickets.map((t, i) => `${i + 1}-${t.category || "ticket"}`)
      );
    }
  } catch (err) {
    showDownloadError.value = true;
  } finally {
    loadingAll.value = false;
  }
}

const downloadZip = async (
  pdfUrls: string[],
  zipName: string,
  fileNames: string[]
) => {
  const zip = new JSZip();
  for (let i = 0; i < pdfUrls.length; i++) {
    try {
      const response = await fetch(pdfUrls[i]);
      if (!response.ok) throw new Error(`Failed to fetch ${pdfUrls[i]}`);
      const blob = await response.blob();
      zip.file(`${fileNames[i]}.pdf`, blob);
    } catch (err) {
      showDownloadError.value = true;
      console.error("Error fetching PDF:", err);
    }
  }
  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${zipName}.zip`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};
</script>

<style scoped>
.download-ticket-btn {
  display: flex;
  align-items: center;
  border: 1px solid #138340;
  color: #138340;
  background: #fff;
  border-radius: 25px;
  font-weight: 600;
  font-size: 15px;
  height: 32px;
  padding: 0 18px;
  transition: background 0.2s, color 0.2s, border 0.2s;
}
.download-ticket-btn:hover,
.download-ticket-btn:focus {
  background: #e5fbee;
  color: #138340;
  border: 1.5px solid #138340;
}
.download-ticket-btn img {
  height: 18px;
  width: 18px;
  margin-right: 8px;
  filter: invert(36%) sepia(97%) saturate(377%) hue-rotate(86deg)
    brightness(92%) contrast(92%);
}
</style>
