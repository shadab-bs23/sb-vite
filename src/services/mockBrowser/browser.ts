import { setupWorker } from "msw";
import { organizationMockHandlers } from "../graphql/handlers/organizationMockHandlers";
import { busPriceMockHandlers } from "../graphql/handlers/busPriceMockHandlers";
import { sharebusSetupMockHandlers } from "../graphql/handlers/sharebus/setupMockHandlers";

export const worker = setupWorker(
  ...organizationMockHandlers,
  ...busPriceMockHandlers,
  ...sharebusSetupMockHandlers
);
