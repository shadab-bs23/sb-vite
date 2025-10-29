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
            label: "Sales Trip Page",
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
  {
    path: "/sales-edit-ticket-prices/:tag",
    name: "sales-edit-ticket-prices",
    beforeEnter: [isAuthenticated, isSalesOrPartnerSharelead],
    component: () =>
      import("../../views/salesFlow/SalesPage/EditTicketPrices.vue"),
    meta: {
      breadcrumb: {
        label: "Edit Ticket Prices",
        parent: [
          {
            url: "/sales-console-buses",
            label: "Sales Trip Page",
          },
        ],
      },
    },
  },
  {
    path: "/sales-edit-discount/:tag",
    name: "sales-edit-discount",
    beforeEnter: [isAuthenticated, isSalesOrPartnerSharelead],
    component: () =>
      import(
        "../../components/modules/sales/tripDetails/edit/TripDiscountDetailSection.vue"
      ),
    meta: {
      breadcrumb: {
        label: "Edit Discount",
        parent: [
          {
            url: "/sales-console-buses",
            label: "Sales Trip Page",
          },
        ],
      },
    },
  },
];
export default salesRoutes;
