import { useConfigStore } from "@/store";
import { computed, ref } from "vue";

export default class ShareBusSetUpController {
  private static _submitState = ref({
    one: false,
    two: false,
    three: false,
  });

  private static _fetchPrice = ref(false);

  static setSubmitState(stepName: string, state = true): void {
    this._submitState.value[stepName] = state;
  }

  static getSubmitState(stepName: string): boolean {
    return this._submitState.value[stepName];
  }

  static setFetchPrice(value): void {
    this._fetchPrice.value = value;
  }

  static getFetchPrice(): boolean {
    return this._fetchPrice.value;
  }

  static getPassengerGoalLimit = computed(() => ({
    MIN: 1,
    MAX: 999,
    DEFAULT: useConfigStore().getSharebusSetupConfig.DefaultPassengerGoal,
  }));

  static getTicketNumberLimit = computed(() => ({
    MIN: 1,
    MAX: useConfigStore().getSharebusSetupConfig.BusCapacity,
  }));

  static getBusCapacityLimit = computed(() => ({
    MIN: 1,
    MAX: 999,
  }));
}
