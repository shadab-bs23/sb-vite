import { State } from "./types";
/*
 * define state here
 */
export default (): State => ({
  busData: {
    total: 0,
    order_type: "",
    bus_availability: "",
    vat_percent: 0,
  },
});
