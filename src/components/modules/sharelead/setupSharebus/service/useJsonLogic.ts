import jsonLogic from "json-logic-js";
import { useConfigStore } from "@/store";
import { computed } from "vue";
import { renameNestedKeys } from "@/utils";

const useJsonLogic = () => {
  // Adding Math library to JSON_LOGIC operation
  jsonLogic.add_operation("Math", Math);

  const configStore = useConfigStore();

  const ticketPriceLogic = computed(() => {
    const priceLogic = renameNestedKeys(
      configStore.getSharebusSetupConfig.TicketPriceLogic.ticket_price_logic,
      "round",
      "Math.round"
    );

    return priceLogic;
  });
  const priceClubShareLogic = computed(() =>
    renameNestedKeys(
      configStore.getSharebusSetupConfig.TicketPriceLogic
        .club_share_per_extra_ticket_logic,
      "round",
      "Math.round"
    )
  );
  const priceSubsidizingLogic = computed(() =>
    renameNestedKeys(
      configStore.getSharebusSetupConfig.TicketPriceLogic
        .price_for_subsidizing_logic,
      "round",
      "Math.round"
    )
  );

  return {
    ticketPriceLogic,
    priceClubShareLogic,
    priceSubsidizingLogic,
  };
};

export default useJsonLogic;
