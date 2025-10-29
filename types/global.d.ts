// Global type definitions for [~FERDIA_CUSTOM~]
// Project: [~sharebus-frontend~]
declare module "*.gql" {
  import { DocumentNode } from "graphql";

  const value: DocumentNode;
  export = value;
}

declare interface Window {
  // Global window object
  FERDIA_CUSTOM: FERDIA_CUSTOM & typeof FERDIA_CUSTOM;
  google: google & typeof google;
  Stripe: Stripe & typeof Stripe;
  bootstrap: Bootstrap & typeof Bootstrap;
}

declare interface FERDIA_CUSTOM {
  BUILD_INFO: BUILD_INFO & typeof BUILD_INFO;
  FROM_URL: FROM_URL & typeof FROM_URL;
}

/**
 * Info derived from URL - assuming standardized setup (see implementation in index.html):
 */
declare interface FROM_URL {
  /** actual environment in which we are running: `local`|`dev`|`test`|`staging`|`production` */
  ENV: string;
  /** part of url referring to sales channel / company */
  CORP: string;
  /** ISO 316 Alpha-2 country code */
  COUNTRY: string;
}

// See vue.config.js
declare interface BUILD_INFO {
  /** Time for build, ISO format */
  BUILD_TIME: string;
  LAST_COMMIT?: LAST_COMMIT & typeof LAST_COMMIT;
  VERSION: string; // version from package.json
  NAME: string; // name from package.json
  /** corresponding to process.env.NODE_ENV at build time */
  BUILT_FOR_ENV: string;
}

declare interface LAST_COMMIT {
  gitBranch: string;
  gitRemote: string;
  gitTag: string;
  gitUrl: string;
  hash: string;
  shortHash: string;
  sanitizedSubject: string;
}

/**
 * Misc. info in the global namespace, used for debugging, logging and reporting tools.
 */
declare namespace FERDIA_CUSTOM {
  /**
   *Build info that has been injected during build process
   */
  const BUILD_INFO: BUILD_INFO;
}
