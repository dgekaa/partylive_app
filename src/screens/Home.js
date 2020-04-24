import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  FlatList,
} from 'react-native';

import Header from '../components/Header';

import CompanyTypeNav from '../components/CompanyTypeNav';
import SmallCompanyBlock from '../components/SmallCompanyBlock';
import BottomTabNavigator from '../components/BottomTabNavigator';

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

const GET_CATEGORIES = gql`
  query {
    categories {
      id
      name
      slug
    }
  }
`;

const Home = (props) => {
  const [DATA, setDATA] = useState([]);
  const [companyData, setCompanyData] = useState([]);

  const clickedType = (type) => {
    if (type.toLowerCase() === 'все') {
      setCompanyData(DATA.places);
    } else {
      const filteredData = DATA.places.filter((el) => {
        if (el.categories[0] && el.categories[0].name) {
          return el.categories[0].name.toUpperCase() === type.toUpperCase();
        }
      });
      setCompanyData(filteredData);
    }
  };

  return (
    <View style={styles.home}>
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
        <Query query={GET_PLACES}>
          {({loading, error, data}) => {
            if (loading)
              return (
                <View>
                  <ActivityIndicator size="large" color="#0000ff" />
                </View>
              );
            if (error) return <Text>Error! ${error.message}</Text>;
            setDATA(data);
            if (companyData.length) {
              return (
                <FlatList
                  data={companyData.length ? companyData : []}
                  numColumns={2}
                  renderItem={({item, index}) => (
                    <SmallCompanyBlock
                      item={item}
                      navigation={props.navigation}
                    />
                  )}
                  keyExtractor={(item) => item.id}
                />
              );
            }
            if (!companyData.length) {
              return <Text style={styles.nullFilter}>Нет заведений</Text>;
            }
          }}
        </Query>
      </View>
      {/* <BottomTabNavigator navigation={navigation} route={route} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  home: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  nullFilter: {
    textAlign: 'center',
    paddingTop: 20,
  },
});

export default Home;
