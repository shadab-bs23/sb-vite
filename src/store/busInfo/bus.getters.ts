import { BusPriceInfo } from "types/bus/bus.type";
import { State } from "./types";

export default {
  /**
   * getting bus info
   * @returns {BusPriceInfo}
   */
  getBusInfoData(state: State): BusPriceInfo {
    return state.busData;
  },
};
