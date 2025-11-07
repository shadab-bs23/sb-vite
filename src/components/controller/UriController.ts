/* eslint-disable no-prototype-builtins */
import router from "@/router";
import { URIState } from "./types";
import { computed, ref, watchEffect } from "vue";
import { useConfigStore } from "@/store";
import TripFilterController from "@/components/modules/trip/controller/TripFilterController";
import { deepEqual } from "@/utils";

/**
 * Helper class, to isolate functionality concerning uri query management.
 *
 *
 * We are using [vue router](https://router.vuejs.org/) - specifically [replace](https://router.vuejs.org/api/#replace) and [router-currentroute](https://router.vuejs.org/api/#router-currentroute)
 *
 * We also considered using [query-string](https://www.npmjs.com/package/query-string). Benifits that we will get from it is that, this package takes care of type checking of the properties.
 */
export default class UriController {
  private static _is_in_mode_prod = import.meta.env.NODE_ENV === "production";

  private static _validQueryParams = [
    "country",
    "tabindex",
    "search",
    "operator",
  ];
  private static _country = ref<string>("");
  private static _operator = ref<string>("");

  /*
   * default URI
   */
  static defaultURI = { country: "NO" };
  /*
   * country map is defined here later it will come from BE
   */
  static countryMap = computed(() => {
    return useConfigStore().$state.setupSharebus.country_iso_codes;
  });

  /**
   * `onInitialLoad` method is called only once and on page reload.
   *
   * Flow -
   * 1. getting uri query parameters
   * 2. getting the default parameters
   * 3. combining both and prioritize uri query
   * 4. validating the parameters
   * After the validation updating the query
   *
   */
  static onInitialLoad(): void {
    const call = () => {
      let uriQuery = this.getQuery();
      if (!Object.keys(uriQuery).length) {
        uriQuery = this.defaultURI;
      }
      const validatedQuery: URIState = this._validateQueryData(uriQuery);
      this._updateState(validatedQuery);
    };

    let lastCountryMap: Record<string, unknown> = {};
    watchEffect(() => {
      const currentCountryMap = this.countryMap.value as Record<
        string,
        unknown
      >;
      if (
        Object.keys(currentCountryMap).length &&
        !deepEqual(currentCountryMap, lastCountryMap)
      ) {
        lastCountryMap = JSON.parse(JSON.stringify(currentCountryMap));
        return call();
      }
    });
  }

  /**
   * Getter for route query.
   *
   * @returns {URIState} - Returns validated route query object
   */
  static getQuery(): URIState {
    let queryValue = {};
    try {
      queryValue = router.currentRoute.value.query;
    } catch (error) {
      if (!this._is_in_mode_prod) console.log("error");
    }
    return this._validateQueryStructure(queryValue);
  }

  /**
   * Setter for route query. Takes a object of query parameters and validates route query object and updates the URI.
   *
   * @param   {URIState}   query_obj  - query_obj is an object containing all properties that goes to the Uri.
   */
  static setQuery(query_obj: URIState): void {
    try {
      // Compose the final query object as it will appear in the URL
      const finalQuery = {
        ...router.currentRoute.value.query,
        ...this._validateQueryStructure(query_obj),
      };
      router.replace({
        ...router.currentRoute,
        query: finalQuery,
      });
      // Sync TripFilterController with the final query object
      this._syncTripFilterWithQuery(finalQuery);
    } catch (error) {
      if (!this._is_in_mode_prod) console.log("setQuery error: ", error);
    }
  }

  /**
   * Private helper to validate query parameters using {@link validQueryParams}
   *
   *
   * @param   {URIState}    query_value      - query_value is an object containing all properties that should be validated for the Uri.
   *
   * @returns {URIState}                     - Validated Object for uri query
   */
  private static _validateQueryStructure(query_value: URIState): URIState {
    const filteredQueryValue = {};
    this._validQueryParams.forEach((ele) => {
      if (query_value.hasOwnProperty(ele)) {
        filteredQueryValue[ele] = query_value[ele];
      }
    });
    return filteredQueryValue;
  }

  /**
   * Helper to get TeqOrgInfo entry for a given operator if valid, otherwise undefined
   */
  private static _getTeqOrgInfoEntry(operator?: string) {
    if (!operator) return undefined;
    const configStore = useConfigStore();
    const teqOrgInfo = configStore.$state.setupSharebus.TeqOrgInfo || {};
    if (Object.prototype.hasOwnProperty.call(teqOrgInfo, operator)) {
      return teqOrgInfo[operator];
    }
    return undefined;
  }

  /**
   * Validates the country, prioritizing the operator's country if operator is valid
   */
  static getValidatedCountry(value: URIState): string {
    const teqOrg = this._getTeqOrgInfoEntry(value.operator);
    if (teqOrg) {
      return teqOrg.Country;
    }
    if (this.countryMap.value[value.country as string]) {
      return value.country as string;
    } else {
      return this.defaultURI.country;
    }
  }

  /**
   * Validates the operator, returns operator if valid, otherwise empty string
   */
  static getValidatedOperator(value: URIState): string {
    return this._getTeqOrgInfoEntry(value.operator)
      ? (value.operator as string)
      : "";
  }

  /**
   * data is validating here
   *
   * @param {URIState} query - the query need to validate
   * @returns {URIState} -returning validated query
   */
  private static _validateQueryData(query: URIState): URIState {
    const validatedQuery = {
      country: "",
      operator: "",
      search: "",
    };
    validatedQuery.country = this.getValidatedCountry(query);
    validatedQuery.operator = this.getValidatedOperator(query);
    validatedQuery.search = query.search || "";

    return validatedQuery;
  }

  /**
   *set country
   *
   * @param {string} value - value that want to set
   * @param {boolean} updateURI -should update the URI instantly
   */
  private static _setCountry(value: string, updateURI = false) {
    if (value !== this._country.value) this._country.value = value;
    if (updateURI) this._updateUri();
  }

  /**
   *set operator
   *
   * @param {string} value - value that want to set
   * @param {boolean} updateURI -should update the URI instantly
   */
  private static _setOperator(value: string, updateURI = false) {
    if (value !== this._operator.value) this._operator.value = value;
    if (updateURI) this._updateUri();
  }

  /**
   * update the state
   *
   * @param {string} query - query is for updating
   * @param {boolean} doUpdateURI -is need to set
   */
  private static _updateState(query: URIState): void {
    if (query.country) this._setCountry(query.country);
    if (query.operator) this._setOperator(query.operator);
    this._updateUri();
  }

  /**
   * here update state value is getting
   *
   * @returns {URISate} - returning here the final state query
   */
  private static _getStateQuery(): URIState {
    return {
      country: this._country.value,
      operator: this._operator.value,
    };
  }

  /**
   * Here the update is happening
   *
   * @param {URIState} query is the query that want to update
   */
  private static _updateUri(query: URIState = this._getStateQuery()): void {
    UriController.setQuery(query);
  }

  /**
   * Filters a query object to only include allowed trip filter keys and renames 'search' to 'query_string'
   */
  private static _getTripFilterObject(query: { [key: string]: unknown }) {
    const allowedFilterKeys = ["country", "operator", "query_string"];
    // Rename 'search' to 'query_string' if present
    const normalizedQuery = { ...query };
    if (normalizedQuery.search) {
      normalizedQuery.query_string = normalizedQuery.search;
      delete normalizedQuery.search;
    }
    return Object.fromEntries(
      Object.entries(normalizedQuery).filter(
        ([key, value]) =>
          allowedFilterKeys.includes(key) &&
          value !== undefined &&
          value !== null &&
          value !== ""
      )
    );
  }

  /**
   * Syncs the TripFilterController with the given query object
   */
  private static _syncTripFilterWithQuery(query: URIState) {
    const tripFilterObj = this._getTripFilterObject(
      query as Record<string, unknown>
    );
    TripFilterController.setTripFilterObject(tripFilterObj);
  }
}
