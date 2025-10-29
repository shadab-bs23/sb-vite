import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { useLoaderStore } from "@/store/index";
import universalRoutes from "./modules/universal";
import shareLeadFlowRoutes from "./modules/shareLeadFlow";

import { scrollToHeight } from "@/utils";
import {
  manageLoggedUserRedirection,
  isAuthenticated,
} from "./guard/RouteGuard";
import joinerFlowRoutes from "./modules/joinerFlowRoutes";
import salesRoutes from "./modules/salesRoutes";
import { dismissToast } from "@/services/toast/toast.service";
import {
  localStorageGetItem,
  removeUnusedStorage,
} from "@/core/localStorage/LocalStorage";
import UriController from "@/components/controller/UriController";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: () =>
      import(/* webpackChunkName: "Teq" */ "@/layout/sbLayout.vue"),
    children: [
      ...universalRoutes,
      ...shareLeadFlowRoutes,
      ...joinerFlowRoutes,
      ...salesRoutes,
      {
        path: "/auth/:tag",
        name: "auth",
        beforeEnter: [manageLoggedUserRedirection],
        component: () =>
          import(/* webpackChunkName: "error" */ "../views/auth/Index.vue"),
        meta: {
          breadcrumb: {
            label: "auth",
          },
        },
      },
      {
        path: "/user/:tag",
        name: "user",
        beforeEnter: [isAuthenticated],

        component: () =>
          import(/* webpackChunkName: "error" */ "../views/user/Index.vue"),
        meta: {
          breadcrumb: {
            label: "user",
          },
        },
      },
      {
        path: "/payment-confirmation/:tag",
        name: "payment-confirmation",
        beforeEnter: [isAuthenticated],
        component: () => import("../views/payment/PaymentConfirmation.vue"),
        meta: {
          breadcrumb: {
            label: "My trips",
          },
        },
      },
    ],
  },
  {
    path: "/authentication",
    component: () => import("../views/auth/AuthenticationView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: (to, from, savedPosition) => {
    if (to.hash) {
      return {
        el: to.hash,
        top: 20, //Will scroll to 10px above the element.
        behavior: "smooth",
      };
    } else if (savedPosition) {
      return savedPosition;
    }
  },
});

router.beforeEach((routeTo, routeFrom, next) => {
  if (!Object.prototype.hasOwnProperty.call(routeTo.query, "country")) {
    const localCountrySelected =
      localStorageGetItem("country_selected") ||
      UriController.defaultURI.country;
    next({
      ...routeTo,
      query: {
        // This line is used to retain other query if there is any
        ...routeTo.query,
        country: routeFrom.query.country || localCountrySelected,
      },
    });
  } else {
    next();
  }
  /**
   * Not showing the loader when a user stays in the same url
   */
  if (routeTo.path !== routeFrom.path) {
    const loader = useLoaderStore();
    loader.changeLoadingStatus({ isLoading: true });
    scrollToHeight(-1);
  }
});

router.afterEach((routeTo, routeFrom) => {
  /**
   * Not hiding the loader when a user stays in the same url
   */
  if (routeTo.path !== routeFrom.path) {
    removeUnusedStorage(routeTo.name as string);
    dismissToast("component-toast");
    const loader = useLoaderStore();
    loader.changeLoadingStatus({ isLoading: false });
  }
});
export default router;
