import { SetupSharebusConfig, State } from "./types";

export default {
  getSharebusSetupConfig(state: State): SetupSharebusConfig {
    return state.setupSharebus;
  },
};
