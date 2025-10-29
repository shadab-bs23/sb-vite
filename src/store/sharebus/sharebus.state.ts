import {
  DECISION_RESULT,
  DISCOUNT_SCHEME,
} from "@/components/modules/sharelead/setupSharebus/enums/SetUpShareBusEnum";
import { State } from "./types";
/*
 * define state here
 */
export default (): State => ({
  setup: {
    redirectLink: "",
    currentStep: 1,
    completed: false,
    routeStep: {
      busAvailability: false,
      route_points: {
        oneway: [],
        return: [],
      },
    },
    organizationStep: {
      fromOrganization: DECISION_RESULT.INTERMEDIATE,
      clubOrTeam: "",
      organizationId: null,
    },
    passengerGoalAndPriceStep: {
      passengerGoal: 0,
      tickets: 0,
      discountScheme: DISCOUNT_SCHEME.NONE,
      discountPercentage: 0,
      ticketPrice: 0,
      earlyBirdTicketPrice: 0,
      deductibleAmount: 0,
      bonus: 0,
      totalTicketPrice: 0,
      grandTotalPrice: 0,
      show_available_seats: false,
      tripCreationTicketDecision: DECISION_RESULT.INTERMEDIATE,
      tripCreationDiscountDecision: DECISION_RESULT.INTERMEDIATE,
      // New API payload fields - simplified structure
      suggested_ticket_price: 0,
      ticket_pricing: {
        categories: [
          { name: "Adult", enabled: true },
          { name: "Child", enabled: true },
          { name: "Senior", enabled: false },
        ],
        via_points: [],
      },
      ticket_discounts: [],
      max_pax: 0,

      // Legacy fields - kept for backward compatibility
      categoryLabels: {
        categoryOne: "Adult",
        categoryTwo: "Child",
        categoryThree: "Senior",
      },
    },
    tripInfoStep: undefined,
    publishStep: undefined,
  },
});
