import { EtagService } from "@/core/EtagService";
import {
  handleErrorResponse,
  handleSuccessResponse,
} from "@/core/http/axios/handleResponse";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
/*
 * creating a axios instance
 */
export const useAxios = axios.create({
  baseURL: import.meta.env.VITE_APP_ROOT_API,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

/**
 * Interceptor handler for Axios requests,
 *
 *
 * @param   {AxiosRequestConfig} config - request config
 * @returns {AxiosRequestConfig}        - request config
 */
const onRequest = (config: AxiosRequestConfig): AxiosRequestConfig => {
  /*
   * setting etag header
   */
  EtagService.setEtagHeader(config);
  return config;
};

/**
 * Handles any http request error
 *
 * @param   {AxiosError} error    - axios error
 * @returns {Promise<AxiosError>} - returns a promise of axios error
 */
const onRequestError = (error: AxiosError): Promise<AxiosError> => {
  return Promise.reject(error);
};

/**
 * Interceptor handler for successfully Axios responses
 *
 * @param   {AxiosResponse} response  - incoming axios response
 * @returns {AxiosResponse}           - axios response (pass thru)
 */
const onResponse = (response: AxiosResponse): AxiosResponse => {
  /*
   * handling success response
   */
  handleSuccessResponse(response);
  /*
   * storing etag header
   */
  EtagService.storeEtag(response);
  return response;
};

/**
 * Interceptor handler for failed Axios responses,
 * as defined by `validateStatus` in axios config
 * (see [documentation](https://axios-http.com/docs/handling_errors))
 *
 * @param   {AxiosError} error    - axios error
 * @returns {Promise<AxiosError>} - returns a promise of type axios error
 */
const onResponseError = (error: AxiosError): Promise<AxiosError> => {
  /*
   * handling error response
   */
  handleErrorResponse(error);
  return Promise.reject(error);
};

/**
 * Axios request interceptor, delegating logic to dedicated handlers
 */
useAxios.interceptors.request.use(onRequest, onRequestError);

/**
 * Axios response interceptor, delegating logic to dedicated handlers
 */
useAxios.interceptors.response.use(onResponse, onResponseError);
