import jsonLogic from "json-logic-js";
import {
  jsonLogicResult,
  TypeLogicBase,
  TypeLogicEarlyBirdDiscount,
  TypeLogicCutPriceDiscount,
  TypeLogicNoDiscount,
  TypeLogicEarlyBirdTicket,
  TypeLogicCutPriceTicket,
  TypeLogicSubsidizingEarlyBird,
  TypeLogicSubsidizingCutPrice,
  TypeLogicClubShareBase,
  TypeLogicClubShareCutPrice,
} from "../types/JsonLogicType";
import useJsonLogic from "./useJsonLogic";
// Adding Math library to JSON_LOGIC operation
jsonLogic.add_operation("Math", Math);

const { ticketPriceLogic, priceClubShareLogic, priceSubsidizingLogic } =
  useJsonLogic();

/**
 * executing json logic for Early Bird Discount
 * see formula {@link https://ferdia.atlassian.net/wiki/spaces/TEQ/pages/334004304/Ticket+Price+JsonLogic}
 * @param {TypeLogicEarlyBirdDiscount} data - payload that will come which will calculate early bird pricing
 *
 * @returns {jsonLogicResult}
 */
export const getEarlyBirdDiscountInfo = (
  data: TypeLogicEarlyBirdDiscount
): jsonLogicResult => {
  const ticketPrice = getEarlyBirdTicketPrice(data);
  const deductibleAmount = getEarlyBirdSubsidizing(data);
  const bonus = getBaseClubSharePerTicket(data);
  return { ticketPrice, deductibleAmount, bonus };
};
/**
 * executing json logic for Early cut Price
 *
 * see formula {@link https://ferdia.atlassian.net/wiki/spaces/TEQ/pages/334004304/Ticket+Price+JsonLogic}
 * @param {TypeLogicCutPriceDiscount} data - payload that will come which will calculate cut price pricing
 * @returns {jsonLogicResult}
 */
export const getCutPriceDiscountInfo = (
  data: TypeLogicCutPriceDiscount
): jsonLogicResult => {
  const ticketPrice = getCutPriceTicketPrice(data);
  const deductibleAmount = cutPriceSubsidizing(data);
  const bonus = getCutPriceClubSharePerTicket(data);
  return { ticketPrice, deductibleAmount, bonus };
};
/**
 * executing json logic for No Discount
 *
 * see formula {@link https://ferdia.atlassian.net/wiki/spaces/TEQ/pages/334004304/Ticket+Price+JsonLogic}
 * @param {TypeLogicCutPriceDiscount} data - payload that will come which will calculate No Discount pricing
 * @returns {jsonLogicResult}
 */
export const getNoDiscountPriceInfo = (data: TypeLogicBase): number => {
  const ticketPrice = getNoneTicketPrice(data);
  return ticketPrice;
};
/*
 * below are ticket price calculation
 */

/**
 * executing json logic for No Discount tickets calculation
 *
 * @param {TypeLogicBase} data - payload that will come which will calculate ticket price
 * @returns {number}
 */
const getNoneTicketPrice = (data: TypeLogicBase): number => {
  const result = jsonLogic.apply(ticketPriceLogic.value, {
    ...data,
    discount_scheme: "NONE",
  });
  return result;
};
/**
 * executing json logic for Early Bird tickets calculation
 *
 * @param {TypeLogicEarlyBirdTicket} data - payload that will come which will calculate ticket price
 * @returns {number}
 */
const getEarlyBirdTicketPrice = (data: TypeLogicEarlyBirdTicket): number => {
  return jsonLogic.apply(ticketPriceLogic.value, data);
};
/**
 * executing json logic for cut price tickets calculation
 *
 * @param {getCutPriceTicketPrice} data - payload that will come which will calculate ticket price
 * @returns {number}
 */
const getCutPriceTicketPrice = (data: TypeLogicCutPriceTicket): number => {
  return jsonLogic.apply(ticketPriceLogic.value, data);
};

/**
 * executing json logic for early bird subsidizing
 *
 * @param {TypeLogicSubsidizingEarlyBird} data - payload
 * @returns {number}
 */
const getEarlyBirdSubsidizing = (
  data: TypeLogicSubsidizingEarlyBird
): number => {
  return jsonLogic.apply(priceSubsidizingLogic.value, data);
};
/**
 * executing json logic for cut price subsidizing
 *
 * @param {TypeLogicSubsidizingCutPrice} data - payload
 * @returns {number}
 */
const cutPriceSubsidizing = (data: TypeLogicSubsidizingCutPrice): number => {
  return jsonLogic.apply(priceSubsidizingLogic.value, data);
};
/**
 * executing json logic for club share base
 *
 * @param {TypeLogicClubShareBase} data - payload
 * @returns {number}
 */
const getBaseClubSharePerTicket = (data: TypeLogicClubShareBase): number => {
  return jsonLogic.apply(priceClubShareLogic.value, data);
};

/**
 * executing json logic for club share cut price
 *
 * @param {TypeLogicClubShareCutPrice} data - payload
 * @returns {number}
 */
const getCutPriceClubSharePerTicket = (
  data: TypeLogicClubShareCutPrice
): number => {
  return jsonLogic.apply(priceClubShareLogic.value, data);
};
