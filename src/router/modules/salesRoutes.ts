import { RouteRecordRaw } from "vue-router";
import {
  isAuthenticated,
  isSalesOrPartnerSharelead,
} from "../guard/RouteGuard";

const salesRoutes: Array<RouteRecordRaw> = [
  {
    path: "/sales-console-buses",
    name: "sales-buses",
    beforeEnter: [isAuthenticated, isSalesOrPartnerSharelead],
    component: () =>
      import("../../views/salesFlow/salesBuses/SalesBusesView.vue"),
  },
  {
    path: "/sales-trip-page/:tag",
    name: "trip-sales-page",
    beforeEnter: [isAuthenticated, isSalesOrPartnerSharelead],
    component: () => import("../../views/salesFlow/SalesPage/TripPageView.vue"),
    meta: {
      breadcrumb: {
        label: "Trip Page",
        parent: [
          {
            url: "/sales-console-buses",
            label: "sales Trip Page",
          },
        ],
      },
    },
  },
  {
    path: "/sales-trip-edit-published/:id",
    name: "trip-sales-dit-published",
    beforeEnter: [isAuthenticated, isSalesOrPartnerSharelead],
    component: () =>
      import("../../views/salesFlow/SalesPage/EditPublishedInfo.vue"),
  },
  {
    path: "/sales-edit-itinerary/:tag",
    name: "sales-edit-itinerary",
    beforeEnter: [isAuthenticated, isSalesOrPartnerSharelead],
    component: () =>
      import("../../views/salesFlow/SalesPage/EditTripItinerary.vue"),
    // meta: {
    //   breadcrumb: {
    //     label: "Trip Page",
    //     parent: [
    //       {
    //         url: "/sales-console-buses",
    //         label: "sales Trip Page",
    //       },
    //     ],
    //   },
    // },
  },
];
export default salesRoutes;
