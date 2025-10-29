import { AxiosRequestConfig, AxiosResponse } from "axios";
import { HttpMethod } from "./models/custom-response-code";

/**
 * This class handles all sorts of etag related tasks
 *
 * @class EtagService
 */
export class EtagService {
  /**
   * @property {Map<string, string>}  _etag_map - hashmap for storing the etags with url being keys for the hashmap
   */
  private static _etag_map = new Map<string, string>();

  /**
   * Sets the etag header to a url if there's an already existing etag in the _etag_map property otherwise creates a new entry in the map and sets the "If-None-Match" or "If-Match" to "*"
   *
   * @param {AxiosRequestConfig} config - receives axios request config object
   */
  static setEtagHeader(config: AxiosRequestConfig): void {
    const { method, url, headers } = config;
    switch (method) {
      case HttpMethod.get:
        if (headers && url) {
          if (this._etag_map.has(url)) {
            headers["If-None-Match"] = this._etag_map.get(url) as string;
          } else {
            this._etag_map.set(url, "*");
            headers["If-None-Match"] = "*";
          }
        }
        break;
      case HttpMethod.post:
      case HttpMethod.put:
      case HttpMethod.delete:
        if (headers && url) {
          if (this._etag_map.has(url)) {
            headers["If-Match"] = this._etag_map.get(url) as string;
          } else {
            this._etag_map.set(url, "*");
            headers["If-Match"] = "*";
          }
        }
        break;
      default:
        break;
    }
  }

  /**
   * Receives the new etag header from the axios response and stores it in the _etag_map
   *
   * @param {AxiosResponse} response - axios response
   */
  static storeEtag(response: AxiosResponse): void {
    const { headers } = response;
    if (response.config.url) {
      this._etag_map.set(response.config.url, headers.etag);
    }
  }
}
