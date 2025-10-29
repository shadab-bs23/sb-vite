import useConfigStore from "./config/config.store";
import useUserStore from "./user/user.store";
import useSignUpStore from "./signUp/signup.store";
import useLoaderStore from "./loader/loader.store";
import useSharebusStore from "./sharebus/sharebus.store";
import useTripStore from "./trip/privateTrip/trip.store";
import useJoinerTripStore from "./trip/joiner/joinerTrip.store";
import useOrganizationStore from "./organization/organization.store";
import useBusInfoStore from "./busInfo/bus.store";
import usePaymentInfoStore from "./payment/payment.store";
import useCartStore from "./cart/cart.store";
import useSalesStore from "./salesConsole/sales.store";
/*
 * here exporting store from single places
 */
export {
  useConfigStore,
  useUserStore,
  useLoaderStore,
  useSignUpStore,
  useSharebusStore,
  useOrganizationStore,
  useBusInfoStore,
  usePaymentInfoStore,
  useTripStore,
  useJoinerTripStore,
  useCartStore,
  useSalesStore,
};
