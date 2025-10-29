import {
  deleteFromLocalStorage,
  localStorageGetItem,
  localStorageSetItem,
} from "@/core/localStorage/LocalStorage";
import { useUserStore } from "@/store";
import {
  getRedirectLink,
  getRedirectLinkForLandingRole,
  routerPushHash,
} from "@/utils";
import { ROLE, LOCAL_VAR } from "@/components/common/enums/enums";

const user = useUserStore();
export const useRedirect = () => {
  const setUrl = (url: string) => {
    if (!url) return;
    localStorageSetItem(LOCAL_VAR.REDIRECT_URL, url);
  };

  const setLandingRole = (role: string) => {
    if (!role) return;
    localStorageSetItem(LOCAL_VAR.LANDING_ROLE, role);
  };

  const getUrl = () => {
    return localStorageGetItem(LOCAL_VAR.REDIRECT_URL) ?? "";
  };

  const getRole = () => {
    return localStorageGetItem(LOCAL_VAR.USER_ROLE) ?? "";
  };

  const getLandingRole = () => {
    return localStorageGetItem(LOCAL_VAR.LANDING_ROLE) ?? "";
  };

  const setRedirectAfterAuthenticate = (query) => {
    if (Object.keys(query)?.length) {
      if (query.redirectUrl) {
        setUrl(query.redirectUrl as string);
      }
      if (query.role) {
        setLandingRole(query.role as string);
      }
    }
  };

  const roleBasedRedirect = (role: string) => {
    const path = getRedirectLink(role);
    user.setUserRoleAction(role);
    return routerPushHash(path);
  };

  const landingRoleRedirect = (role: string) => {
    deleteFromLocalStorage(LOCAL_VAR.LANDING_ROLE);
    const path = getRedirectLinkForLandingRole(role);
    user.setUserRoleAction(role);
    return routerPushHash(path);
  };

  const urlBasedRedirect = (url: string) => {
    deleteFromLocalStorage(LOCAL_VAR.REDIRECT_URL);
    if (url.toLowerCase().includes("book-ticket")) {
      user.setUserRoleAction("joiner");
    } else if (url.toLowerCase().includes("setup-sharebus")) {
      user.setUserRoleAction("sharelead");
    }
    return routerPushHash(url);
  };

  const redirect = () => {
    const url = getUrl();
    const role = getRole();
    const landingRole = getLandingRole();
    if (!url && !role && !landingRole) return roleBasedRedirect("");
    if (url) return urlBasedRedirect(url);
    if (landingRole) return landingRoleRedirect(landingRole);
    if (role) {
      if (role === ROLE.FERDIA_SALES && !user.getSalesPermission) {
        return roleBasedRedirect("");
      }
      return roleBasedRedirect(role);
    }
  };

  return {
    redirect,
    setRedirectAfterAuthenticate,
  };
};
