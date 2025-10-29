import { gql } from "graphql-tag";

export const DOWNLOAD_TICKETS = (tripId: string) => gql`
  query downloadTickets {
    downloadTicket(input: { id: "${tripId}" })
  }
  `;
