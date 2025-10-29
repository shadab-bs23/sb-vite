/* eslint-disable no-prototype-builtins */
import router from "@/router";
import { URIState } from "./types";
import { computed, ref, watchEffect } from "vue";
import { useConfigStore } from "@/store";

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

  private static _validQueryParams = ["country", "tabindex"];
  private static _country = ref<string>("");
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

    watchEffect(() => {
      if (Object.keys(this.countryMap.value).length) {
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
      router.replace({
        ...router.currentRoute,
        query: {
          ...router.currentRoute.value.query,
          ...this._validateQueryStructure(query_obj),
        },
      });
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
   *validating the country here if the received query params match with country map then returning it otherwise returning default
   * @param {URIState} value - value that need to validate
   * @returns {string} - returning validated country
   */
  static getValidatedCountry(value: URIState): string {
    if (this.countryMap.value[value.country as string]) {
      return value.country as string;
    } else {
      return this.defaultURI.country;
    }
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
    };
    validatedQuery.country = this.getValidatedCountry(query);
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
   * update the state
   *
   * @param {string} query - query is for updating
   * @param {boolean} doUpdateURI -is need to set
   */
  private static _updateState(query: URIState): void {
    if (query.country) this._setCountry(query.country);
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
}
