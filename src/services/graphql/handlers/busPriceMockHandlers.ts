import { graphql } from "msw";
import { busPriceData } from "../../../../tests/testData/busInfo/busPriceData";

export const busPriceMockHandlers = [
  graphql.query(`getBusPrice`, (req, res, ctx) => {
    return res(ctx.data(busPriceData));
  }),
];
