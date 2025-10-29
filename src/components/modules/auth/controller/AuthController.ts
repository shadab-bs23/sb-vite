import { signUpProcess } from "./types/auth/user.type";
import { ref } from "vue";

export default class AuthController {
  /*
   * init signup process value
   */
  private static _signUpProcess = ref<signUpProcess>({
    isTermsAccepted: false,
  });

  /**
   *  setting signup process state data
   *
   * @param {string} field -the field would like to set
   * @param {string} value -the value would like to set
   */
  static setSignupProperty(
    field: string,
    value: string | boolean | object
  ): void {
    this._signUpProcess.value[field] = value;
  }

  /**
   *  getting signup process value with state
   * @returns {signUpProcess}
   */
  static getSignupProcessDetails(): signUpProcess {
    return this._signUpProcess.value;
  }
}
