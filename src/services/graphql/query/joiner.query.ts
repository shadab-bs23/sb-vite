import { gql } from "graphql-tag";

export const getPublicTripList = gql`
  query PublicTrips($filter: TableTripPublicFilterInput, $nextToken: String) {
    listPublicTrips(filter: $filter, nextToken: $nextToken) {
      nextToken
      items {
        id
        outbound_from
        outbound_from_datetime
        outbound_to
        outbound_to_datetime
        outbound_timezone
        return_from
        return_from_datetime
        return_to
        return_to_datetime
        return_timezone
        passenger_goal
        trip_type
        booking_reference
        trip_status
        is_published
        regular_ticket_price
        earlybird_ticket_price
        total_regular_tickets
        available_regular_tickets
        total_earlybird_tickets
        available_earlybird_tickets
        total_cancelled_tickets
        deadline_ticket_selling
        name
        category
        info_to_travellers
        website_url
        image_url
        trip_organizer
        route_points
      }
    }
  }
`;
const joinerTripListGetParams = `
  items {
    id
    outbound_from
    outbound_from_datetime
    outbound_to
    outbound_to_datetime
    outbound_timezone
    return_from
    return_from_datetime
    return_to
    return_to_datetime
    return_timezone
    passenger_goal
    trip_type
    booking_reference
    trip_status
    is_published
    regular_ticket_price
    earlybird_ticket_price
    total_regular_tickets
    available_regular_tickets
    total_earlybird_tickets
    available_earlybird_tickets
    max_pax
    total_cancelled_tickets
    deadline_ticket_selling
    name
    category
    info_to_travellers
    website_url
    image_url
    trip_organizer
    route_points
  }
  nextToken
`;
export const GET_JOINER_TRIP_LIST = gql`
  query joinerTrips($filter: TableTripFilterInput, $nextToken: String) {
    listJoinerTrips(filter: $filter, nextToken: $nextToken) {
     ${joinerTripListGetParams}
    }
  }
`;
export const GET_JOINER_TRIP_LIST_ARCHIVED = gql`
  query joinerTrips($filter: TableTripFilterInput, $nextToken: String) {
    listJoinerArchivedTrips(filter: $filter, nextToken: $nextToken) {
      ${joinerTripListGetParams}
      nextToken
    }
  }
`;

export const GET_JOINER_TRIP_LIST_BOOKING_CANCELLED = gql`
  query joinerTrips($input: JoinerHistoryInput!) {
    cancelTicketJoinerHistory(input: $input) {
      items {
        id
        outbound_from
        outbound_from_datetime
        outbound_to
        outbound_to_datetime
        outbound_timezone
        return_from
        return_from_datetime
        return_to
        return_to_datetime
        return_timezone
        passenger_goal
        trip_type
        booking_reference
        trip_status
        is_published
        regular_ticket_price
        earlybird_ticket_price
        total_regular_tickets
        available_regular_tickets
        max_pax
        total_earlybird_tickets
        available_earlybird_tickets
        total_cancelled_tickets
        deadline_ticket_selling
        name
        category
        info_to_travellers
        website_url
        image_url
        trip_organizer
        canceled_tickets {
          ticket_id
          ticket_price
          status
          type
          transaction_id
        }
        canceled_tickets_transactions {
          id
          amount
          payment_with
          status
        }
      }
      nextToken
    }
  }
`;

export const CANCEL_TICKETS = gql`
  mutation CancelTicketsMutation($input: TripId!) {
    cancelTicket(input: $input)
  }
`;

export const CONTACT_SUPPORT = gql`
  mutation submitSupportRequestMutation($input: SupportRequestInput!) {
    submitSupportRequest(input: $input) {
      support_request_id
      message
    }
  }
`;
