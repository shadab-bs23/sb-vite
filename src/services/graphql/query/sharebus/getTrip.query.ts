import gql from "graphql-tag";

export const GET_TRIP = (tripId: string) => gql`
  query getTrip {
    getTrip(id: "${tripId}"){
      id
      name
      outbound_from
      outbound_from_lat_long {
        lat
        lng
      }
      outbound_to
      outbound_to_lat_long {
        lat
        lng
      }
      outbound_from_datetime
      outbound_to_datetime
      outbound_timezone
      return_from
      return_from_lat_long{
        lat
        lng
      }
      return_to
      return_to_lat_long{
        lat
        lng
      }
      country
      return_from_datetime
      return_to_datetime
      return_timezone
      route_points
      max_pax
      max_pax_teq
      passenger_goal
      booking_reference
      requester
      trip_type
      category
      id
      regular_ticket_price
      price_for_subsidizing
      total_bus_price
      regular_ticket_price
      earlybird_ticket_price
      total_regular_tickets
      total_earlybird_tickets
      deadline_ticket_selling
      trip_status,
      regular_ticket_price
      earlybird_ticket_price
      club_share_per_extra_ticket
      info_to_travellers
      image_url
      is_published
      website_url,
      embedded_link,
      trip_organizer
      available_earlybird_tickets
      available_regular_tickets
      sharelead_payment_status
      sharelead_ticket_reserved_price
      sharelead_contributed_amount
      tickets_reserved
      discount_scheme
      vat_percent
      deadline_passenger_goal
      update_history {
        trip_location_time
        trip_goal
        trip_pricing
        trip_general_info
        trip_republish
        trip_deadline_passenger_goal
        updated_by_ferdia_sales
        updated_by_sharelead
      }
      bus_availability
    }
    listTickets(trip_id: "${tripId}", filter: {status: {eq: "BOOKED"}}){
     items{
      trip_id
      ticket_id
      type
      ticket_price
      transaction_id
      download_url,
      requester
     }
    }
  }
`;
