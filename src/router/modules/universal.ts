import { RouteRecordRaw } from "vue-router";
import HomeView from "../../views/HomeView.vue";
import { isNotSale } from "@/router/guard/RouteGuard";

const universalRoutes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: HomeView,
    beforeEnter: [isNotSale],
    meta: {
      breadcrumb: {
        label: "Home",
        icon: "fi fi-house-door",
      },
    },
  },
  {
    path: "/about",
    name: "about",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../../views/AboutView.vue"),
    meta: {
      breadcrumb: {
        label: "about",
      },
    },
  },
  {
    path: "/error/:tag?/:id?",
    name: "error",
    component: () =>
      import(/* webpackChunkName: "error" */ "../../views/ErrorView.vue"),
  },
  {
    path: "/terms-and-conditions",
    name: "terms-and-conditions",
    component: () =>
      import(
        "../../components/common/termsAndConditions/TermsAndConditions.vue"
      ),
  },
  {
    path: "/:pathMatch(.*)*",
    component: () =>
      import(/* webpackChunkName: "error" */ "../../views/ErrorView.vue"),
  },
];
export default universalRoutes;
