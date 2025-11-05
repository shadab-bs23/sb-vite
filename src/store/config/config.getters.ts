import { SetupSharebusConfig, ScheduledConfig, State } from "./types";

export default {
  getSharebusSetupConfig(state: State): SetupSharebusConfig & ScheduledConfig {
    return state.setupSharebus;
  },
};
