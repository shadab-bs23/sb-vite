import { StoreDefinition } from "pinia";
import { BusPriceInfo } from "types/bus/bus.type";

export interface State {
  busData: BusPriceInfo;
}

interface Getters {
  getBusInfoData: () => BusPriceInfo;
}
interface Actions {
  fetchBusInfoData: (queryPayload, unitTestCB?: () => void) => Promise<object>;
}
/*
 * store context define as summarize of store
 */
export type StoreContext = ReturnType<
  StoreDefinition<"busInfo", State, Getters, Actions>
>;
