import gql from "graphql-tag";

export const getSalesActiveTripList = gql`
  query salesTrips($nextToken: String, $filter: TableTripFilterInput) {
    listSalesActiveTrips(nextToken: $nextToken, filter: $filter) {
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
        max_pax
        total_cancelled_tickets
        deadline_ticket_selling
        deadline_passenger_goal
        name
        category
        info_to_travellers
        website_url
        image_url
        trip_organizer
      }
    }
  }
`;

export const getSalesUnpublishTripList = gql`
  query salesTrips($nextToken: String, $filter: TableTripFilterInput) {
    listSalesUnpublishTrips(nextToken: $nextToken, filter: $filter) {
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
        max_pax
        total_cancelled_tickets
        deadline_ticket_selling
        deadline_passenger_goal
        name
        category
        info_to_travellers
        website_url
        image_url
        trip_organizer
      }
    }
  }
`;

export const getSalesArchivedTripList = gql`
  query salesTrips($nextToken: String, $filter: TableTripFilterInput) {
    listSalesArchivedTrips(nextToken: $nextToken, filter: $filter) {
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
        max_pax
        total_cancelled_tickets
        deadline_ticket_selling
        deadline_passenger_goal
        name
        category
        info_to_travellers
        website_url
        image_url
        trip_organizer
      }
    }
  }
`;
export const getSearchTrip = gql`
  query searchSalesTrips($filter: SearchInput!) {
    searchTrip(input: $filter) {
      total
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
      }
    }
  }
`;

export const CONFIRM_TRIP = gql`
  mutation confirmTripBySales($input: ConfirmTripInput!) {
    confirmTripBySales(input: $input) {
      trip_id
      status
    }
  }
`;

export const COPY_TRIP = gql`
  mutation copy_trip($input: CopyTripInput!) {
    copyTrip(input: $input) {
      trip_id
      status
      message
    }
  }
`;

export const GET_PASSENGERS_LIST = gql`
  query get_passengers_list($trip_id: ID!) {
    getPassengersList(trip_id: $trip_id) {
      name
      phoneNumber
    }
  }
`;
