import gql from "graphql-tag";

export const createSharebusMutation = gql`
  mutation CreateSB($input: CreateSharebusInput!) {
    createSharebus(input: $input)
  }
`;

export const publishSharebusMutation = gql`
  mutation publishSharebusMT($input: publishTripInput!) {
    publishTrip(input: $input) {
      id
    }
  }
`;

export const getShareLeadTripListQuery = gql`
  query listBusses($filter: TableTripFilterInput, $nextToken: String) {
    listShareleadBusses(filter: $filter, nextToken: $nextToken) {
      items {
        is_unpublished_by_sales
        name
        id
        booking_reference
        outbound_from
        trip_status
        outbound_to
        outbound_from_datetime
        outbound_to_datetime
        return_from
        return_from_datetime
        return_to_datetime
        return_to
        trip_type
        is_published
        sharelead_payment_status
        passenger_goal
        total_earlybird_tickets
        total_regular_tickets
        available_earlybird_tickets
        available_regular_tickets
        max_pax
      }
      nextToken
    }
  }
`;

export const cancelSharebusMutation = gql`
  mutation cancelSharebusMT($input: CancelTripInput) {
    cancelTrip(input: $input) {
      status
    }
  }
`;
