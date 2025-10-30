import gql from "graphql-tag";

export const GET_PUBLIC_TRIP = (tripId: string) => gql`
  query getPublicTrip {
    getPublicTrip(id: "${tripId}"){
    id
    name
    outbound_from
    outbound_to
    country
    outbound_from_datetime
    outbound_to_datetime
    outbound_timezone
    return_from
    return_to
    return_from_datetime
    return_to_datetime
    return_timezone
    route_points
    passenger_goal
    booking_reference
    embedded_link
    trip_type
    max_pax
    discount_scheme
    category
    regular_ticket_price
    earlybird_ticket_price
    available_earlybird_tickets
    available_regular_tickets
    total_regular_tickets
    total_earlybird_tickets
    trip_status
    regular_ticket_price
    earlybird_ticket_price
    deadline_ticket_selling
    info_to_travellers
    image_url
    is_published
    website_url
    trip_organizer
    vat_percent
    deadline_passenger_goal
    updated_at
    show_available_seats
    ticket_pricing {
      categories {
        enabled
        name
      }
      via_points {
        category_prices {
          name
          price
        }
        id
      }
    }
    ticket_discounts {
      days
      percent
    }
  }
  }
`;
