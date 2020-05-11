import gql from 'graphql-tag';

export const REGISTER = gql`
  mutation REGISTER(
    $name: String!
    $password: String!
    $password_confirmation: String!
    $email: String!
  ) {
    register(
      input: {
        name: $name
        password: $password
        password_confirmation: $password_confirmation
        email: $email
      }
    ) {
      status
      tokens {
        access_token
        refresh_token
        expires_in
        token_type
        user {
          name
          email
        }
      }
    }
  }
`;

export const LOGIN = gql`
  mutation LOGIN($username: String!, $password: String!) {
    login(input: {username: $username, password: $password}) {
      access_token
      user {
        id
        name
        email
      }
    }
  }
`;

export const GET_CATEGORIES = gql`
  query {
    categories {
      id
      name
      slug
    }
  }
`;

export const GET_PLACES = gql`
  query {
    places {
      id
      name
      address
      description
      logo
      menu
      actions
      coordinates
      streams {
        url
        name
        id
        preview
        schedules {
          id
          day
          start_time
          end_time
        }
      }
      schedules {
        id
        day
        start_time
        end_time
      }
      categories {
        id
        name
      }
    }
  }
`;

export const GET_PLACE = gql`
  query GETPLACE($id: ID!) {
    place(id: $id) {
      id
      name
      address
      description
      logo
      menu
      actions
      coordinates
      streams {
        url
        name
        id
        preview
        schedules {
          id
          day
          start_time
          end_time
        }
      }
      schedules {
        id
        day
        start_time
        end_time
      }
      categories {
        id
        name
      }
    }
  }
`;

export const CREATE_WORK_TIME = gql`
  mutation CREATEWORKTIME(
    $id: ID!
    $day: WeekDay!
    $start_time: String!
    $end_time: String!
  ) {
    updatePlace(
      input: {
        id: $id
        schedules: {
          create: {day: $day, start_time: $start_time, end_time: $end_time}
        }
      }
    ) {
      id
    }
  }
`;

export const UPDATE_WORK_SCHEDULE = gql`
  mutation UPDATEWORKSCHEDULE(
    $id: ID!
    $start_time: String!
    $end_time: String!
  ) {
    updateSchedule(
      input: {id: $id, start_time: $start_time, end_time: $end_time}
    ) {
      id
    }
  }
`;

export const UPDATE_PLACE_DATA = gql`
  mutation UPDATEPLACEDATA(
    $id: ID!
    $name: String
    $description: String
    $categories: CreateCategoryMorphToMany
  ) {
    updatePlace(
      input: {
        id: $id
        name: $name
        description: $description
        categories: $categories
      }
    ) {
      id
      name
      description
      categories {
        id
        name
      }
    }
  }
`;

export const DELETE_SCHEDULE = gql`
  mutation DELETESCHEDULE($id: ID!) {
    deleteSchedule(id: $id) {
      id
    }
  }
`;
export const UPDATE_STREAMS_SCHEDULE = gql`
  mutation UPDATESTREAMSSCHEDULE($id: ID!, $update: [UpdateScheduleInput!]) {
    updateStream(input: {id: $id, schedules: {update: $update}}) {
      id
    }
  }
`;

export const CREATE_STREAMS_SCHEDULE = gql`
  mutation CREATESTREAMSSCHEDULE(
    $id: ID!
    $day: WeekDay!
    $start_time: String!
    $end_time: String!
  ) {
    updateStream(
      input: {
        id: $id
        schedules: {
          create: [{day: $day, start_time: $start_time, end_time: $end_time}]
        }
      }
    ) {
      id
    }
  }
`;

export const UPDATE_IMAGE = gql`
  mutation UPDATEIMAGE($file: Upload!) {
    PlaceImage(file: $file)
  }
`;