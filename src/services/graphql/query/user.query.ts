import gql from "graphql-tag";
export const USERS = gql`
  query users {
    users {
      first_name
      last_name
      email
      phone
    }
  }
`;

export const getUserInfo = gql`
  query getUserInfo($id: ID!) {
    getUserInfo(id: $id)
  }
`;

export const RESET_PASSWORD = (variables) => gql`
  query resetPassword {
    resetPassword(input: {email: \"${variables.email}\"})
  }
`;
