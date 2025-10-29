export enum STEPS {
  ROUTE_PAGE = "one",
  PASSENGER_GOAL_AND_PRICES = "two",
  TRIP_INFO = "three",
  PUBLISH = "four",
}

export enum CTA {
  SUPPORT = "https://sharebus.zendesk.com/hc/en-us/requests/new",
  ABOUT_SHARE_BUS = "https://www.sharebus.no/om-sharebus#OmOss",
  ABOUT_FERDIA = " https://www.ferdia.no/om-oss",
  HELP = "https://sharebus.zendesk.com/hc/no",
  CONTACT = "contact-us",
}

export enum ROLE {
  SHARELEAD = "sharelead",
  PARTNER_SHARELEAD = "partner-sharelead",
  JOINER = "joiner",
  FERDIA_SALES = "ferdia-sales",
}

export enum DECISION {
  YES,
  NO,
  INTERMEDIATE,
}

export enum CURRENCY {
  NOK = "nok",
}
export enum FilterStatusType {
  ACTIVE = "Ongoing",
  UNPUBLISHED = "Unpublished",
  ARCHIVED = "Archived",
}

export enum LOCAL_VAR {
  REDIRECT_URL = "redirectUrl",
  USER_ROLE = "userRole",
  LANDING_ROLE = "landingRole",
}

export enum TRANSACTION_STATUS {
  REFUNDED = "REFUNDED",
  REFUND_IN_PROGRESS = "REFUND_IN_PROGRESS",
  CANCELED = "CANCELED",
}

export enum ACTION {
  COPY = "copy",
  DETAILS = "details",
}

export enum SUPPORTED_REQUEST {
  TRIP = "TRIP",
  ACCOUNT_RESTORE = "ACCOUNT_RESTORE",
}
