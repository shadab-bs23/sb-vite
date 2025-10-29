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
    stepOne: {
      origin: "",
      destination: "",
      originLatLng: { lat: 0, lng: 0 },
      destinationLatLng: { lat: 0, lng: 0 },
      departureDate: null,
      departureTime: null,
      departureDateTime: null,
      departureArrivalDateTime: null,
      busAvailability: false,
      returnDate: null,
      returnTime: null,
      returnDateTime: null,
      returnArrivalDateTime: null,
      distance: { text: "", value: 0 },
      duration: { text: "", value: 0 },
      viaPoints: {
        oneway: [],
        return: [],
      },
    },
    stepTwo: {
      fromOrganization: DECISION_RESULT.INTERMEDIATE,
      clubOrTeam: "",
      organizationId: null,
    },
    stepThree: {
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
      shareLeadTicketDecision: DECISION_RESULT.INTERMEDIATE,
      shareLeadDiscountDecision: DECISION_RESULT.INTERMEDIATE,
    },
  },
});
