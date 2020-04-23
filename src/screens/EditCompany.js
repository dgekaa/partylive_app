import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import Header from '../components/Header';

import {Query} from 'react-apollo';
import gql from 'graphql-tag';

const GET_PLACES = gql`
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

const EditCompany = (props) => {
  return (
    <View style={styles.EditCompany}>
      <Header props={props} />
      <Text style={styles.headerText}>Список заведений</Text>
      <Query query={GET_PLACES}>
        {({loading, error, data}) => {
          if (loading)
            return (
              <View>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            );
          if (error) return <Text>Error! ${error.message}</Text>;
          return data.places.map((el, id) => {
            return (
              <View style={styles.row} key={el.id}>
                <TouchableOpacity
                  style={styles.textRowName}
                  onPress={() => {
                    props.navigation.navigate('Admin', {item: el});
                  }}>
                  <Text>{el.name}</Text>
                </TouchableOpacity>
                <Text style={styles.textRowId}>{el.id}</Text>
                <Text style={styles.textRowType}>{el.categories[0].name}</Text>
              </View>
            );
          });
        }}
      </Query>
    </View>
  );
};

const styles = StyleSheet.create({
  EditCompany: {
    flex: 1,
    padding: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    paddingBottom: 30,
    paddingTop: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textRowName: {
    flex: 4,
    padding: 10,
    paddingLeft: 0,
  },
  textRowId: {
    flex: 2,
    padding: 10,
    color: '#aeaeae',
  },
  textRowType: {
    flex: 2,
    padding: 10,
    color: '#e32a6c',
  },
});

export default EditCompany;
