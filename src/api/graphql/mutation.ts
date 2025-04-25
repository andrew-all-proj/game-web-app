import { gql } from "@apollo/client";

export const USER_LOGIN = gql`
  mutation Login($initData: String!, $telegramId: String!) {
    UserLogin(initData: $initData, telegramId: $telegramId) {
      id
      token
      nameProfessor
    }
  }
`;

export const USER_UPDATE = gql`
  mutation UpdateUser($id: String!, $nameProfessor: String!) {
    UserUpdate(id: $id, nameProfessor: $nameProfessor) {
      id
      name
      nameProfessor
    }
  }
`;
