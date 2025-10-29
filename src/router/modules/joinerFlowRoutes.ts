import { RouteRecordRaw } from "vue-router";
import { isAuthenticated, isJoiner } from "../guard/RouteGuard";

const joinerFlowRoutes: Array<RouteRecordRaw> = [
  {
    path: "/book-ticket/:tag",
    name: "book-ticket",
    component: () =>
      import("../../views/joinerFlow/booking/TicketBookingView.vue"),
    meta: {
      breadcrumb: {
        label: "Book Tickets",
      },
    },
  },

  {
    path: "/joiner-trip-page/:tag",
    name: "Joiner-trip-page",
    beforeEnter: [isAuthenticated, isJoiner],
    component: () => import("../../views/joinerFlow/tripPage/TripPageView.vue"),
    meta: {
      breadcrumb: {
        label: "Trip Page",
        parent: [
          {
            url: "/my-trips",
            label: "My trips",
          },
        ],
      },
    },
  },

  {
    path: "/my-trips",
    name: "joiner-trips",
    beforeEnter: [isAuthenticated, isJoiner],
    component: () => import("../../views/joinerFlow/myTrips/MyTripsView.vue"),
    meta: {
      breadcrumb: {
        label: "My trips",
      },
    },
  },

  {
    path: "/cancel-booking/:tag",
    name: "cancel-booking",
    beforeEnter: [isAuthenticated, isJoiner],
    component: () =>
      import("../../views/joinerFlow/booking/CancelBookingView.vue"),
    meta: {
      breadcrumb: {
        label: "Cancel booking",
        parent: [
          {
            url: "",
            label: "Trip page",
          },
        ],
      },
    },
  },
];
export default joinerFlowRoutes;
