import { useConfigStore } from "@/store";
import { computed, ref } from "vue";

export default class ShareBusSetUpController {
  private static _submitState = ref({
    one: false,
    two: false,
    three: false,
  });

  static setSubmitState(stepName: string, state = true): void {
    this._submitState.value[stepName] = state;
  }

  static getSubmitState(stepName: string): boolean {
    return this._submitState.value[stepName];
  }

  static getPassengerGoalLimit = computed(() => ({
    MIN: useConfigStore().getSharebusSetupConfig.MinimumPassengerGoal,
    MAX: useConfigStore().getSharebusSetupConfig.BusCapacity,
    DEFAULT: useConfigStore().getSharebusSetupConfig.DefaultPassengerGoal,
  }));

  static getTicketNumberLimit = computed(() => ({
    MIN: 1,
    MAX: useConfigStore().getSharebusSetupConfig.BusCapacity,
  }));
}
