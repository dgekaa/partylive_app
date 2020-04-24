import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import Header from '../components/Header';
import GoogleMap from '../components/GoogleMap';
import CompanyTypeNav from '../components/CompanyTypeNav';

import {Query} from 'react-apollo';
import gql from 'graphql-tag';

const GET_CATEGORIES = gql`
  query {
    categories {
      id
      name
      slug
    }
  }
`;

const Map = (props) => {
  const [DATA, setDATA] = useState([]);
  const [companyData, setCompanyData] = useState([]);

  const clickedType = (type) => {
    // if (type.toLowerCase() !== 'все') {
    //   const filteredData = DATA.places.filter(
    //     (el) => el.categories[0].name.toUpperCase() === type.toUpperCase(),
    //   );
    //   setCompanyData(filteredData);
    // } else {
    //   setCompanyData(DATA.places);
    // }
  };

  return (
    <View style={styles.Map}>
      <Header props={props} />
      <Query query={GET_CATEGORIES}>
        {({loading, error, data}) => {
          if (loading)
            return (
              <View>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            );
          if (error) return <Text>Error! ${error.message}</Text>;
          return <CompanyTypeNav data={data} clickedType={clickedType} />;
        }}
      </Query>
      <View style={styles.content}>
        <GoogleMap />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  Map: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default Map;
