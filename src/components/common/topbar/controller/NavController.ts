import { ref } from "vue";

export default class NavController {
  private static _isMenuActive = ref(false);
  private static _isSidebarActive = ref(false);

  static setMenuActive(active: boolean) {
    this._isMenuActive.value = active;
  }

  static getMenuActive() {
    return this._isMenuActive.value;
  }

  static setSidebarActive(active: boolean) {
    this._isSidebarActive.value = active;
  }

  static getSidebarActive() {
    return this._isSidebarActive.value;
  }
}
