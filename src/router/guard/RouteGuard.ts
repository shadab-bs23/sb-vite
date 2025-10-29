import { ROLE } from "@/components/common/enums/enums";
import { useUserStore } from "@/store";
import { computed, watchEffect } from "vue";
import { getRedirectLinkForLandingRole } from "@/utils";

const userStore = () => useUserStore();

export const auth = {
  isAuthenticated: computed(() => userStore().getAuthenticationInfo),
  loading: computed(() => userStore().$state.isLoading),
  isSales: computed(() => {
    return (
      userStore().$state.currentRole === ROLE.FERDIA_SALES &&
      userStore().getSalesPermission
    );
  }),
  isSharelead: computed(() => {
    return (
      userStore().$state.currentRole === ROLE.SHARELEAD &&
      userStore().getShareleadPermission
    );
  }),
  isPartnerSharelead: computed(() => {
    return (
      userStore().$state.currentRole === ROLE.PARTNER_SHARELEAD &&
      userStore().getPartnerShareleadPermission
    );
  }),
  isJoiner: computed(() => {
    return userStore().$state.currentRole === ROLE.JOINER;
  }),
};
/**
 *
 * check id user login
 *
 */
export const manageLoggedUserRedirection = (to, from, next) => {
  const { isAuthenticated, loading } = auth;

  const verify = () => {
    if (isAuthenticated.value) {
      if (to.query?.role) {
        userStore().setUserRoleAction(to.query.role);
        return next({ path: getRedirectLinkForLandingRole(to.query.role) });
      }
      return next({ name: "home" });
    } else {
      return next();
    }
  };

  if (!loading.value) {
    return verify();
  }

  // Watch for the loading property to change before we check isAuthenticated
  watchEffect(() => {
    if (loading.value === false) {
      return verify();
    }
  });
};
/**
 *
 * managing authentication
 */
export const isAuthenticated = (to, from, next) => {
  const { loading, isAuthenticated } = auth;

  const verify = () => {
    if (!isAuthenticated.value && to.path !== "/auth/signin") {
      return next({ path: "/auth/signin" });
    } else {
      return next();
    }
  };

  if (!loading.value) {
    return verify();
  }

  // Watch for the loading property to change before we check isAuthenticated
  watchEffect(() => {
    if (loading.value === false) {
      return verify();
    }
  });
};
/**
 *
 * checking sales permission
 */
export const isSales = (to, from, next) => {
  const { isSales, loading } = auth;

  const verify = () => {
    if (!isSales.value && to.path !== "/user/select-role") {
      return next({ path: "/user/select-role" });
    } else {
      return next();
    }
  };

  if (!loading.value) {
    return verify();
  }

  // Watch for the loading property to change before we check isAuthenticated
  watchEffect(() => {
    if (loading.value === false) {
      return verify();
    }
  });
};

/**
 *
 * checking sales permission
 */
export const isSalesOrPartnerSharelead = (to, from, next) => {
  const { isSales, isPartnerSharelead, loading } = auth;

  const verify = () => {
    if (
      !isSales.value &&
      !isPartnerSharelead.value &&
      to.path !== "/user/select-role"
    ) {
      return next({ path: "/user/select-role" });
    } else {
      return next();
    }
  };

  if (!loading.value) {
    return verify();
  }

  // Watch for the loading property to change before we check isAuthenticated
  watchEffect(() => {
    if (loading.value === false) {
      return verify();
    }
  });
};
/**
 *
 * checking joiner permission
 */
export const isJoiner = (to, from, next) => {
  const { isJoiner, loading } = auth;

  const verify = () => {
    if (!isJoiner.value && to.path !== "/user/select-role") {
      return next({ path: "/user/select-role" });
    } else {
      return next();
    }
  };

  if (!loading.value) {
    return verify();
  }

  // Watch for the loading property to change before we check isAuthenticated
  watchEffect(() => {
    if (loading.value === false) {
      return verify();
    }
  });
};
/**
 *
 * checking sharelead permission
 */
export const isSharelead = (to, from, next) => {
  const { isSharelead, loading } = auth;

  const verify = () => {
    if (!isSharelead.value && to.path !== "/user/select-role") {
      return next({ path: "/user/select-role" });
    } else {
      return next();
    }
  };

  if (!loading.value) {
    return verify();
  }

  // Watch for the loading property to change before we check isAuthenticated
  watchEffect(() => {
    if (loading.value === false) {
      return verify();
    }
  });
};

/**
 *
 * checking sharelead permission
 */
export const isShareleadOrPartnerSharelead = (to, from, next) => {
  const { isSharelead, isPartnerSharelead, loading } = auth;

  const verify = () => {
    if (
      !isSharelead.value &&
      !isPartnerSharelead.value &&
      to.path !== "/user/select-role"
    ) {
      return next({ path: "/user/select-role" });
    } else {
      return next();
    }
  };

  if (!loading.value) {
    return verify();
  }

  // Watch for the loading property to change before we check isAuthenticated
  watchEffect(() => {
    if (loading.value === false) {
      return verify();
    }
  });
};

export const isNotSale = (to, from, next) => {
  const { isSales, isAuthenticated, loading } = auth;

  const verify = () => {
    if (isSales.value && isAuthenticated.value) {
      return next({ path: "/sales-console-buses" });
    } else return next();
  };

  if (!loading.value) {
    return verify();
  }

  // Watch for the loading property to change before we check isAuthenticated
  watchEffect(() => {
    if (loading.value === false) {
      return verify();
    }
  });
};
