import gql from "graphql-tag";

export const ALL_BOOK_QUERY = gql`
  query allBooks {
    allBooks {
      id
      rating
    }
  }
`;
export const UPDATE_BOOK_QUERY = gql`
  mutation updateBook($id: ID!, $rating: Float) {
    updateBook(input: { id: $id, rating: $rating }) {
      id
      rating
    }
  }
`;
