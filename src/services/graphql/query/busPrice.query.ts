import gql from "graphql-tag";

export const BUS_PRICE = gql`
  query getBusPrice($input: BusPriceInput!) {
    getBusPrice(input: $input) {
      total
      order_type
      bus_availability
      vat_percent
    }
  }
`;
