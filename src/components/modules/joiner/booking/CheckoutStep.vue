<template>
  <div class="p-3 p-md-4 mx-auto">
    <!-- Discard Changes Dialog -->
    <DiscardChangesDialog
      :show="showDiscardDialog"
      @confirm="confirmDiscardChanges"
      @cancel="cancelDiscardChanges"
      modal-id="discard-ticket-data"
    >
      <template v-slot:header>
        <h3>{{ t("sharebus.checkout.change_ticket_holder") }}</h3>
      </template>
      <template v-slot:content>
        <p>{{ t("sharebus.checkout.data_reset_warning") }}</p>
        <p>{{ t("sharebus.checkout.data_reset_details") }}</p>
      </template>
    </DiscardChangesDialog>

    <!-- Checkout header -->
    <h2 class="d-flex fw-bold mb-3 text-dark">
      {{ t("sharebus.checkout.checkout") }}
    </h2>

    <!-- Select ticket holder section -->
    <div class="mb-4">
      <h4 class="d-flex fw-bold mb-3 text-dark">
        {{ t("sharebus.checkout.select_ticket_holder") }}
      </h4>
      <div
        class="d-flex gap-3 flex-column flex-md-row"
        role="radiogroup"
        aria-label="Ticket holder"
      >
        <div class="d-flex align-items-center cursor-pointer gap-2">
          <BaseRadio
            :id="YOU_ID"
            :value="YOU"
            modifier-class="radio-button-size"
            :model-value="uiHolder"
            @update:model-value="handleTicketHolderChange"
          />
          <span class="small text-dark" @click="handleTicketHolderChange(YOU)">
            {{ t("sharebus.checkout.you") }}
          </span>
        </div>
        <div class="d-flex align-items-center cursor-pointer gap-2">
          <BaseRadio
            :id="OTHER_ID"
            :value="OTHER"
            modifier-class="radio-button-size"
            :model-value="uiHolder"
            @update:model-value="handleTicketHolderChange"
          />
          <span
            class="small text-dark"
            @click="handleTicketHolderChange(OTHER)"
          >
            {{ t("sharebus.checkout.other_ticket_holders") }}
          </span>
        </div>
      </div>
    </div>

    <!-- Trip details -->
    <h4 class="d-flex align-items-center fw-bold mt-4 mb-4 text-dark">
      {{ checkoutInfo.name }}
    </h4>
    <div class="card border rounded p-3 p-md-4 mb-4">
      <!-- Show OtherTicketBreakdown when "other" is selected -->
      <OtherTicketBreakdown
        v-if="isOtherSelected"
        :tickets="tickets"
        :routeText="routeText"
        @update:tickets="ticketHolders = $event"
        @allFieldsFilled="allFieldsFilled = $event"
      />

      <!-- Show SelfTicketBreakdown when "you" is selected -->
      <SelfTicketBreakdown v-else :tickets="tickets" :routeText="routeText" />

      <!-- Itinerary section using shared component -->
      <ItinerarySection
        :departureInfo="departureInfo"
        :returnInfo="returnInfo"
        :initiallyExpanded="showItinerary"
      />

      <!-- Total Section -->
      <div class="p-3 rounded">
        <div class="d-flex justify-content-between">
          <span class="h4 fw-bold">{{ t("sharebus.checkout.total") }}</span>
          <span class="h4 fw-bold">
            {{ cartStore.$state.totalPayablePrice }}
            Kr
          </span>
        </div>

        <!-- VAT Information -->
        <div class="d-flex justify-content-end align-items-center gap-2">
          <span class="small fw-600">
            {{ t("sharebus.checkout.vat_included") }} ({{ VAT_PERCENTAGE }}%)
          </span>
          <span class="small fw-600">{{ vatAmount.toFixed(2) }} MVA</span>
        </div>
      </div>
    </div>

    <!-- Validation message -->
    <div v-if="isOtherSelected && !allFieldsFilled" class="text-danger mt-3">
      {{ t("sharebus.checkout.validation_message") }}
    </div>

    <!-- Continue to Payment Button -->
    <BaseButton
      button-class="sb-btn-primary sb-btn-lg rounded-pill mx-auto px-5 py-3 d-flex align-items-center justify-content-center gap-2 fw-600 mt-3 w-30"
      @click="openPaymentModal"
      :is-disabled="isContinueDisabled"
    >
      <i class="pe-1 fi fi-credit-card fs-5"></i>
      {{ t("sharebus.checkout.continue_to_payment") }}
    </BaseButton>

    <!-- Payment Modal -->
    <BaseModal
      id="paymentModal"
      v-model="showPaymentModal"
      header-class="border-bottom-0 pb-0"
      modifier-class="fade payment-modal"
      dialog-class="modal-lg"
      footer-class="d-none"
    >
      <!-- <template v-slot:header>
        <h3>{{ t("sharebus.checkout.payment") }}</h3>
      </template> -->
      <template v-slot:closeButton>
        <div @click="showPaymentModal = false">
          <BaseButton
            button-class="sb-btn-secondary sb-btn-small rounded-circle"
          >
            <i class="fi fi-x green-jewel"></i>
          </BaseButton>
        </div>
      </template>
      <template v-slot:content>
        <JoinerPaymentPage
          :checkoutInfo="checkoutInfo"
          :prevStep="props.prevStep"
          :nextStep="
            () => {
              showPaymentModal = false;
              props.nextStep();
            }
          "
        />
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import BaseRadio from "@busgroup/vue3-base-radio";
import BaseButton from "@busgroup/vue3-base-button";
import BaseModal from "@busgroup/vue3-base-modal";
import TripController from "@/components/modules/sharelead/controllers/TripController";
import type {
  TicketItem,
  TicketHolder,
  CheckoutInfo,
} from "./types/checkout.types";
// Using types from the cart store
import { FormattedTicket } from "@/store/cart/types";
import { useCartStore, useUserStore } from "@/store";
const DiscardChangesDialog = defineAsyncComponent(
  () =>
    import(
      "@/components/modules/sharelead/setupSharebus/DiscardChangesDialog.vue"
    )
);
// Async components
const OtherTicketBreakdown = defineAsyncComponent(
  () => import("./OtherTicketBreakdown.vue")
);
const SelfTicketBreakdown = defineAsyncComponent(
  () => import("./SelfTicketBreakdown.vue")
);
const ItinerarySection = defineAsyncComponent(
  () => import("./shared/ItinerarySection.vue")
);
const JoinerPaymentPage = defineAsyncComponent(
  () => import("./JoinerPaymentPage.vue")
);

type HolderType = "you" | "other";
const YOU: HolderType = "you";
const OTHER: HolderType = "other";
const YOU_ID = "you-ticket";
const OTHER_ID = "other-ticket";

// Single source of truth for VAT
const VAT_PERCENTAGE = 12;

// ===== Props =====
const props = defineProps<{
  checkoutInfo: CheckoutInfo;
  prevStep: () => void;
  nextStep: () => void;
}>();

// ===== i18n =====
const { t } = useI18n();

// ===== State =====
// NOTE: Replace mock cart store with real store when integrated
const cartStore = useCartStore();

// Committed selection and UI selection (used to keep radio state when dialog is open)
const committedHolder = ref<HolderType>(YOU);
const uiHolder = ref<HolderType>(YOU);
const pendingHolder = ref<HolderType | null>(null);
const showDiscardDialog = ref(false);

const showItinerary = ref(true);
const showPaymentModal = ref(false);
const tickets = ref<TicketItem[]>(cartStore.tickets);
const ticketHolders = ref<TicketHolder[]>([]);
const allFieldsFilled = ref(true);

// ===== Derived State =====
const isOtherSelected = computed(() => committedHolder.value === OTHER);
const isContinueDisabled = computed(
  () => isOtherSelected.value && !allFieldsFilled.value
);

const departureInfo = TripController.getTripDeparture(false);
const returnInfo = TripController.getTripReturn(false);

const routeText = computed(() => {
  // Get the selected via point from cart store
  const selectedViaPointId = cartStore.selectedViaPointId;

  // Get the selected pickup point name (from will be the selected via point)
  let from = "";
  if (selectedViaPointId && departureInfo.value.route_points) {
    const selectedPoint = departureInfo.value.route_points.find(
      (point: { id: number }) => point.id === selectedViaPointId
    );
    from = selectedPoint?.point?.split(",")[0] ?? "";
  }

  // To will be the destination (last point)
  const to = departureInfo.value.destination?.split(",")[0] ?? "";

  // Check if it's a round trip based on return info
  const isRoundTrip = returnInfo.value && returnInfo.value.origin;
  const arrow = isRoundTrip ? "⟷" : "→";

  return `${from} ${arrow} ${to}`;
});

const vatAmount = computed(
  () => (cartStore.getTotalPrice() * VAT_PERCENTAGE) / (100 + VAT_PERCENTAGE)
);

// Function to open the payment modal
const openPaymentModal = () => {
  preparePaymentData();
  showPaymentModal.value = true;
};

// ===== Handlers =====
function handleTicketHolderChange(newValue: HolderType) {
  if (newValue === committedHolder.value) return; // no-op

  // If switching from OTHER -> YOU and there is filled data, confirm discard
  if (
    committedHolder.value === OTHER &&
    newValue === YOU &&
    ticketHolders.value.some(hasTicketData)
  ) {
    pendingHolder.value = newValue;
    showDiscardDialog.value = true;
    // Keep UI reflecting the committed state until confirmed
    uiHolder.value = committedHolder.value;
    return;
  }

  applyTicketHolderChange(newValue);
}

function confirmDiscardChanges() {
  if (pendingHolder.value) {
    applyTicketHolderChange(pendingHolder.value);
  }
  showDiscardDialog.value = false;
  pendingHolder.value = null;
}

function cancelDiscardChanges() {
  // Reset the UI selection to match the current committed selection
  uiHolder.value = committedHolder.value;
  showDiscardDialog.value = false;
  pendingHolder.value = null;
}

function applyTicketHolderChange(newValue: HolderType) {
  committedHolder.value = newValue;
  uiHolder.value = newValue;
  if (newValue === YOU) {
    allFieldsFilled.value = true; // self option bypasses per-passenger validation
  }
}

function hasTicketData(ticket: TicketHolder): boolean {
  return Boolean(ticket?.name || ticket?.email || ticket?.phone);
}

// Function to prepare ticket data for payment
function preparePaymentData() {
  if (isContinueDisabled.value) return;

  // Format ticket holders data according to the new API structure
  const viaPointId = cartStore.selectedViaPointId || 0;

  // Group tickets by category
  const ticketsByCategory = tickets.value.reduce((acc, ticket) => {
    if (!acc[ticket.categoryName]) {
      acc[ticket.categoryName] = {
        via_point_id: viaPointId,
        category: ticket.categoryName,
        quantity: ticket.quantity,
        ticket_holders: [],
      };
    } else {
      acc[ticket.categoryName].quantity += ticket.quantity;
    }
    return acc;
  }, {});

  // Add ticket holder information
  if (isOtherSelected.value) {
    // For 'other' selection, use the individual ticket holder data
    ticketHolders.value.forEach((holder) => {
      if (!ticketsByCategory[holder.categoryName]) return;

      // Add ticket holder to the appropriate category
      if (holder.name && holder.email) {
        ticketsByCategory[holder.categoryName].ticket_holders.push({
          name: holder.name,
          email: holder.email,
          phone: holder.phone || "",
        });
      }
    });
  } else {
    // For 'you' selection, use the logged in user's information
    const userStore = useUserStore();
    const userInfo = {
      name: userStore?.data?.attributes?.name || "",
      email: userStore?.data?.attributes?.email || "",
      phone: userStore?.data?.attributes?.phone_number || "",
    };

    Object.keys(ticketsByCategory).forEach((category) => {
      // For each ticket in the quantity, add the user's info
      for (let i = 0; i < ticketsByCategory[category].quantity; i++) {
        ticketsByCategory[category].ticket_holders.push({ ...userInfo });
      }
    });
  }

  // Convert to array format required by API
  const formattedTickets = Object.values(
    ticketsByCategory
  ) as FormattedTicket[];

  // Store formatted tickets in the Pinia store
  // This is persisted and available throughout the application
  cartStore.setFormattedTickets(formattedTickets);
}
</script>

<style lang="scss" scoped>
/* Bootstrap utility class fallback */
.cursor-pointer {
  cursor: pointer;
}

/* Radio button size adjustment */
.radio-button-size {
  width: 20px;
  height: 20px;
}

/* Custom hover effect for itinerary toggle */
.itinerary-toggle {
  background-color: #e5fbee;
  border: none;
}

/* Custom rotation for chevron icon */
.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.2s;
}

/* Payment modal styling */
:deep(.payment-modal) {
  .modal-content {
    border-radius: 1rem;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }

  .modal-header {
    border-bottom: 1px solid #f0f0f0;
    padding: 1.5rem;
  }

  .modal-body {
    padding: 1.5rem;
  }
}
</style>
