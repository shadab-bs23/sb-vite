import { ref } from "vue";

export default class BookingController {
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
}
