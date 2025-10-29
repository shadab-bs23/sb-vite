import { setupServer } from "msw/node";
import { organizationMockHandlers } from "@/services/graphql/handlers/organizationMockHandlers";
import { busPriceMockHandlers } from "@/services/graphql/handlers/busPriceMockHandlers";
import { sharebusSetupMockHandlers } from "@/services/graphql/handlers/sharebus/setupMockHandlers";

// Setup requests interception using the given handlers.
export const server = setupServer(
  ...organizationMockHandlers,
  ...busPriceMockHandlers,
  ...sharebusSetupMockHandlers
);
