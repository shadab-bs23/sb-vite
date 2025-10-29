import gql from "graphql-tag";

export const fetchShareleadPaymentIntent = gql`
  mutation MyMutation($input: StripeShareleadPaymentInitInput!) {
    stripeShareleadPaymentInit(input: $input) {
      transaction_id
      client_secret
    }
  }
`;

export const fetchJoinerPaymentIntent = gql`
  mutation MyMutation($input: StripeJoinerTicketBookingAndPaymentInput!) {
    stripeJoinerTicketBookingAndPayment(input: $input) {
      transaction_id
      client_secret
    }
  }
`;

export const fetchVippsPaymentURLShareLead = gql`
  mutation VippsPaymentInitShareLead($input: VippsShareleadPaymentInitInput!) {
    vippsShareleadPaymentInit(input: $input) {
      transaction_id
      vipps_redirect_url
    }
  }
`;
export const vippsPaymentConfirmation = gql`
  mutation PaymentConfirm($input: VippsPaymentConfirmInput!) {
    vippsPaymentConfirm(input: $input) {
      status
    }
  }
`;
export const joinerTicketBooked = gql`
  mutation VippsPaymentInitJoiner(
    $input: VippsJoinerTicketBookingAndPaymentInput!
  ) {
    vippsJoinerTicketBookingAndPayment(input: $input) {
      vipps_redirect_url
      transaction_id
    }
  }
`;
