import { graphql } from "msw";
import { mockOrganizationList } from "../../../../tests/testData/organization/organizationData";

export const organizationMockHandlers = [
  graphql.query(`listOrganizations`, (req, res, ctx) => {
    return res(ctx.data(mockOrganizationList));
  }),
  // graphql.mutation(UPDATE_BOOK_QUERY, (req, res, ctx) => {
  //   return res(ctx.data({ updateBook: req.variables }));
  // }),
];
