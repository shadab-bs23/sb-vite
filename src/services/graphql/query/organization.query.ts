import gql from "graphql-tag";

export const ORGANIZATION_LIST = gql`
  query listOrganizations(
    $filter: TableOrganizationFilterInput
    $nextToken: String
  ) {
    listOrganizations(filter: $filter, nextToken: $nextToken) {
      items {
        id
        name
      }
      nextToken
    }
  }
`;
