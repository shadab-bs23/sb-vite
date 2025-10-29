import { graphql } from "msw";
import { mockConfigResponse } from "../../../../../tests/testData/sharebus/setup/configData";

export const sharebusSetupMockHandlers = [
  graphql.query(`getConfiguration`, (req, res, ctx) => {
    return res(ctx.data(mockConfigResponse));
  }),
];
