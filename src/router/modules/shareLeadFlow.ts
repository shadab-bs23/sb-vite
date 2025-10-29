import { RouteRecordRaw } from "vue-router";
import {
  isAuthenticated,
  isSharelead,
  isShareleadOrPartnerSharelead,
} from "../guard/RouteGuard";

const shareLeadFlowRoutes: Array<RouteRecordRaw> = [
  {
    path: "/payment/:tag/:id?",
    name: "payment",
    beforeEnter: [isAuthenticated],
    component: () =>
      import(
        /* webpackChunkName: "error" */ "../../views/ShareLeadFlow/payment/Index.vue"
      ),
    meta: {
      breadcrumb: {
        label: "payment",
      },
    },
  },
  {
    path: "/setup-sharebus",
    name: "setup-sharebus",
    beforeEnter: [isAuthenticated, isShareleadOrPartnerSharelead],
    component: () =>
      import("../../views/ShareLeadFlow/setupSharebus/SetupSharebusView.vue"),
    meta: {
      breadcrumb: {
        label: "Setup Sharebus",
      },
    },
  },
  {
    path: "/publish-sharebus/:tag",
    name: "publish-sharebus",
    beforeEnter: [isAuthenticated, isShareleadOrPartnerSharelead],
    component: () =>
      import(
        "../../views/ShareLeadFlow/publishSharebus/PublishSharebusView.vue"
      ),
    meta: {
      breadcrumb: {
        label: "Publish Sharebus",
        parent: [
          {
            url: "/my-buses",
            label: "My Sharebuses",
          },
        ],
      },
    },
  },
  {
    path: "/my-buses",
    name: "share-lead-buses",
    beforeEnter: [isAuthenticated, isSharelead],
    component: () =>
      import("../../views/ShareLeadFlow/MyBuses/MyBusesView.vue"),
    meta: {
      breadcrumb: {
        label: "My Buses",
      },
    },
  },
  {
    path: "/sharebus-confirmation/:tag",
    name: "sharbus-confirmation",
    component: () =>
      import("../../views/ShareLeadFlow/confirmation/ShareBusCreation.vue"),
  },
  {
    path: "/trip-page/:tag",
    name: "trip-page",
    beforeEnter: [isAuthenticated, isShareleadOrPartnerSharelead],
    component: () =>
      import("../../views/ShareLeadFlow/TripPage/TripPageView.vue"),
    meta: {
      breadcrumb: {
        label: "Trip Page",
        parent: [
          {
            url: "/my-buses",
            label: "My Sharebuses",
          },
        ],
      },
    },
  },

  {
    path: "trip/public/:tag",
    name: "trip-map",
    component: () =>
      import(
        /* webpackChunkName: "error" */ "../../views/ShareLeadFlow/TripPage/TripMapView.vue"
      ),
  },
];
export default shareLeadFlowRoutes;
