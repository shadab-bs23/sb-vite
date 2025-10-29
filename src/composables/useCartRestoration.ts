import { watchEffect, ref, Ref } from "vue";
import { useCartStore } from "@/store";

export interface UseCartRestorationOptions {
  debugPrefix?: string;
  onRestore?: (restoredData: any) => void;
}

/**
 * Composable for restoring state from persisted cart store
 * Provides common logic for cart data restoration with debugging
 */
export function useCartRestoration(options: UseCartRestorationOptions = {}) {
  const { debugPrefix = "CartRestoration", onRestore } = options;
  const cartStore = useCartStore();

  /**
   * Watch for pickup point restoration
   */
  function usePickupPointRestoration<T>(
    dataSource: Ref<T[]>,
    currentSelectedId: Ref<number | null>,
    idKey: keyof T = "id" as keyof T,
    additionalCondition: () => boolean = () => true
  ) {
    watchEffect(() => {
      if (
        cartStore.selectedViaPointId &&
        dataSource.value &&
        dataSource.value.length > 0 &&
        !currentSelectedId.value && // Don't override if already selected
        additionalCondition()
      ) {
        // Find the persisted point in current data
        const persistedItem = dataSource.value.find(
          (item) => (item as any)[idKey] === cartStore.selectedViaPointId
        );

        console.log(`${debugPrefix} - Restoring pickup point:`, {
          persistedViaPointId: cartStore.selectedViaPointId,
          foundItem: persistedItem,
          dataCount: dataSource.value.length,
        });

        if (persistedItem) {
          currentSelectedId.value = (persistedItem as any)[idKey];

          if (onRestore) {
            onRestore({
              type: "pickup-point",
              data: persistedItem,
              id: (persistedItem as any)[idKey],
            });
          }
        }
      }
    });
  }

  /**
   * Watch for ticket quantities restoration
   */
  function useTicketRestoration<T>(
    ticketCategories: Ref<T[]>,
    ticketQuantities: Ref<Record<string, number>>,
    selectedPickupPointId: Ref<number | null>,
    initializeQuantities: () => Record<string, number>,
    categoryLabelKey: keyof T = "label" as keyof T,
    categoryKeyKey: keyof T = "key" as keyof T
  ) {
    watchEffect(() => {
      if (
        ticketCategories.value.length > 0 &&
        cartStore.tickets &&
        cartStore.tickets.length > 0 &&
        selectedPickupPointId.value === cartStore.selectedViaPointId
      ) {
        console.log(`${debugPrefix} - Restoring ticket quantities:`, {
          persistedTickets: cartStore.tickets,
          currentCategories: ticketCategories.value,
          selectedPickupPointId: selectedPickupPointId.value,
          cartViaPointId: cartStore.selectedViaPointId,
        });

        // Initialize with zeros first
        const newQuantities = initializeQuantities();

        // Restore quantities from persisted cart data
        cartStore.tickets.forEach((persistedTicket) => {
          // Find matching category by label
          const matchingCategory = ticketCategories.value.find(
            (category) =>
              (category as any)[categoryLabelKey] ===
              persistedTicket.categoryName
          );

          if (matchingCategory) {
            const categoryKey = (matchingCategory as any)[categoryKeyKey];
            newQuantities[categoryKey] = persistedTicket.quantity;
          }
        });

        ticketQuantities.value = newQuantities;

        if (onRestore) {
          onRestore({
            type: "ticket-quantities",
            data: newQuantities,
            persistedTickets: cartStore.tickets,
          });
        }
      } else if (ticketCategories.value.length > 0) {
        // Initialize with empty quantities if no persisted data
        ticketQuantities.value = initializeQuantities();
      }
    });
  }

  return {
    cartStore,
    usePickupPointRestoration,
    useTicketRestoration,
  };
}
