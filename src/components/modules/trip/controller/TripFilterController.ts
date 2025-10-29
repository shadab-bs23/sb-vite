import { TripFilterTypeController } from "@/store/trip/privateTrip/types";
import { ref } from "vue";

export default class TripFilterController {
  public static _isFilterActive = ref(false);
  private static _tripFilter = ref<TripFilterTypeController>({
    query_string: null,
    outbound_from_datetime_range: null,
  });
  private static _activeFilters = ref<string[]>([]);

  static setTripFilter(filterKey: string, filterData): void {
    this._tripFilter.value[filterKey] = filterData;
    this.setFilterActive(true);
    if (filterKey !== "page") this._activeFilters.value.push(filterKey);
  }

  static getTripFilter(): TripFilterTypeController {
    return this._tripFilter.value;
  }

  static removeFilterKey(key: string) {
    delete this._tripFilter.value[key];
    this._activeFilters.value = this._activeFilters.value.filter(
      (item) => item !== key
    );
    if (!this._activeFilters.value.length) this.setFilterActive(false);
  }

  static resetTripFilter() {
    this._tripFilter.value = {
      query_string: null,
      outbound_from_datetime_range: null,
    };
    this._activeFilters.value = [];
    this.setFilterActive(false);
  }

  static setFilterActive(active: boolean) {
    this._isFilterActive.value = active;
  }

  static getFilterActive() {
    return this._isFilterActive.value;
  }
}
