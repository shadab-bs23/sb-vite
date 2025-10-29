import { State } from "./types";
/*
 * define state here
 */
export default (): State => ({
  tripId: "",
  selectedViaPointId: null,
  tickets: [],
  totalPayablePrice: 0,
  eligibleDiscountPercent: 0,
  formattedTickets: [],
});
