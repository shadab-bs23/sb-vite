<template>
  <div class="container-fluid mb-4">
    <template v-for="(ticket, idx) in allTickets" :key="ticket.id">
      <TicketHolderItem
        :ticket="ticket"
        :index="idx"
        :disabledCopy="hasActiveCopyInCategory(ticket.categoryName, idx)"
        @update="updateTicketHolder"
        @validation="updateValidationStatus"
      />
      <div
        v-if="
          idx < allTickets.length - 1 &&
          ticket.categoryName !== allTickets[idx + 1].categoryName
        "
        class="border-bottom my-3"
      ></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, withDefaults, defineAsyncComponent } from "vue";
import { TicketItem, TicketHolder } from "./types/checkout.types";

// Import component using async component to avoid issues with script setup exports
const TicketHolderItem = defineAsyncComponent(
  () => import("./TicketHolderItem.vue")
);

const props = withDefaults(
  defineProps<{
    tickets: TicketItem[];
    routeText: string;
  }>(),
  {
    tickets: () => [],
  }
);

const emit = defineEmits<{
  (e: "update:tickets", value: TicketHolder[]): void;
  (e: "allFieldsFilled", value: boolean): void;
}>();

const ticketHolders = computed(() => {
  const holders: TicketHolder[] = [];
  props.tickets.forEach((ticket) => {
    for (let i = 0; i < ticket.quantity; i++) {
      holders.push({
        id: `${ticket.categoryName}-${i + 1}`,
        categoryName: ticket.categoryName,
        count: 1,
        price: ticket.price,
        route: props.routeText,
        name: "",
        email: "",
        phone: "",
        copyToAll: false,
      });
    }
  });
  return holders;
});

const allTickets = ref<TicketHolder[]>(ticketHolders.value);

// Watch for changes in tickets prop and update allTickets
watch(
  () => props.tickets,
  () => {
    console.log("OtherTicketBreakdown - tickets prop changed:", props.tickets);
    allTickets.value = ticketHolders.value;
    emit("update:tickets", allTickets.value);
  },
  { deep: true, immediate: true }
);

// Track validation status directly from child components
const validationStatus = ref<Record<number, boolean>>({});

// Update validation status for a specific ticket holder and directly emit
function updateValidationStatus(index: number, valid: boolean) {
  console.log(
    `OtherTicketBreakdown - updateValidationStatus: index=${index}, valid=${valid}`
  );
  // Update the validation status for this index
  validationStatus.value = { ...validationStatus.value, [index]: valid };
  console.log(
    "OtherTicketBreakdown - current validationStatus:",
    validationStatus.value
  );

  // Validate and emit result
  validateAllTickets();
}
const validateAllTickets = () => {
  const allValid = Object.values(validationStatus.value).every((v) => v);
  console.log(
    "OtherTicketBreakdown - validateAllTickets - allValid:",
    allValid
  );
  emit("allFieldsFilled", allValid);
};

function hasActiveCopyInCategory(category: string, idx: number) {
  const sameType = allTickets.value.filter((t) => t.categoryName === category);
  const thisId = allTickets.value[idx].id;
  // Disable if there's only one ticket in this category
  if (sameType.length <= 1) {
    return true;
  }

  return sameType.some((t) => t.id !== thisId && t.copyToAll);
}

function updateTicketHolder(
  index: number,
  field: string,
  value: unknown
) {
  const ticket = allTickets.value[index];
  if (!ticket) return;
  const ticketField = field as keyof TicketHolder;
  (ticket as TicketHolder)[ticketField] = value as never;
  if (field === "copyToAll" && value) {
    allTickets.value.forEach((t, i) => {
      if (i !== index && t.categoryName === ticket.categoryName) {
        t.name = ticket.name;
        t.email = ticket.email;
        t.phone = ticket.phone;
      }
    });
  }
  emit("update:tickets", allTickets.value);
  // Revalidate tickets after update
  // validateAllTickets();
}

// Export the component
defineExpose({});
</script>

<style scoped>
/* Using Bootstrap 5 utility classes in the template, minimal custom CSS needed */
.itinerary-toggle {
  cursor: pointer;
  background-color: #e5fbee;
  border: none;
}

.itinerary-toggle:hover {
  background-color: #d1f5e0;
}

.rotate-180 {
  transform: rotate(180deg);
}
</style>
