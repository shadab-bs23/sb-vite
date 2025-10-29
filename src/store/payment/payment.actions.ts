import {
  PaymentConfirmationPayload,
  StoreContext,
  TicketBookedPayload,
} from "./types";
import { useMutation } from "@vue/apollo-composable";
import {
  fetchJoinerPaymentIntent,
  fetchShareleadPaymentIntent,
  fetchVippsPaymentURLShareLead,
  joinerTicketBooked,
  vippsPaymentConfirmation,
} from "@/services/graphql/query";
import useLoaderStore from "../loader/loader.store";

export default {
  /**
   * fetching intent info stripe
   * not using now
   */
  async fetchShareleadPaymentIntentData(this: StoreContext, stripePayload) {
    const { mutate: sendData } = useMutation(fetchShareleadPaymentIntent);
    return sendData({
      input: stripePayload,
    }).then((result) => {
      this.$state.paymentIntent = result?.data.stripeShareleadPaymentInit;
      return result;
    });
  },

  /**
   * fetching intent info stripe
   * not using now
   */
  async fetchJoinerPaymentIntentData(this: StoreContext, stripePayload) {
    const { mutate: sendData } = useMutation(fetchJoinerPaymentIntent);
    return sendData({
      input: stripePayload,
    }).then((result) => {
      this.$state.paymentIntent =
        result?.data.stripeJoinerTicketBookingAndPayment;
      return result;
    });
  },
  /**
   * fetching vipps payment URI
   *
   * @param {string} trip_id -the trip id
   */
  async shareleadFetchPaymentRedirectURL(this: StoreContext, trip_id: string) {
    const loader = useLoaderStore();
    loader.changeLoadingStatus({ isLoading: true });
    const { mutate: sendData } = useMutation(fetchVippsPaymentURLShareLead);
    return sendData({
      input: { trip_id: trip_id },
    })
      .then((result) => {
        return result;
      })
      .catch((error) => {
        loader.changeLoadingStatus({ isLoading: false });
        throw new Error(error);
      });
  },
  /**
   * Confirm vipps payment
   *
   * @param {PaymentConfirmationPayload} payload -this payload will be needed for verification
   */
  async handleVippsPaymentConfirmation(
    this: StoreContext,
    payload: PaymentConfirmationPayload
  ) {
    const loader = useLoaderStore();
    loader.changeLoadingStatus({ isLoading: true });
    const { mutate: sendData } = useMutation(vippsPaymentConfirmation);
    return sendData({
      input: payload,
    }).then((result) => {
      return result;
    });
  },

  /**
   * fetching vipps payment URI
   *
   * @param {string} trip_id -the trip id
   */
  async joinerTicketBookedAndFetchRedirectInfo(
    this: StoreContext,
    payload: TicketBookedPayload
  ) {
    const loader = useLoaderStore();
    loader.changeLoadingStatus({ isLoading: true });
    const { mutate: sendData } = useMutation(joinerTicketBooked);
    return sendData({
      input: payload,
    })
      .then((result) => {
        return result;
      })
      .catch((error) => {
        loader.changeLoadingStatus({ isLoading: false });
        throw new Error(error);
      });
  },
};
