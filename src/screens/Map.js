import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, ActivityIndicator} from 'react-native';
import {Query, useQuery} from 'react-apollo';

import Header from '../components/Header';
import GoogleMap from '../components/GoogleMap';
import CompanyTypeNav from '../components/CompanyTypeNav';
import {GET_CATEGORIES, GET_PLACES} from '../QUERYES';

const Map = (props) => {
  const {data} = useQuery(GET_PLACES);

  const [companyData, setCompanyData] = useState([]);

  useEffect(() => {
    data.places && setCompanyData(data.places);
  }, [data]);

  const clickedType = (type) => {
    if (type.toLowerCase() !== 'все') {
      const filteredData = data.places.filter(
        (el) => el.categories[0].name.toUpperCase() === type.toUpperCase(),
      );
      setCompanyData(filteredData);
    } else {
      setCompanyData(data.places);
    }
  };

  return (
    <View style={styles.Map}>
      <Header props={props} />
      <Query query={GET_CATEGORIES}>
        {({loading, error, data}) => {
          if (loading) {
            return <ActivityIndicator size="large" color="#0000ff" />;
          } else if (error) {
            return <Text>Error! ${error.message}</Text>;
          }
          return <CompanyTypeNav data={data} clickedType={clickedType} />;
        }}
      </Query>
      <View style={styles.content}>
        {<GoogleMap places={companyData} navigation={props.navigation} />}
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
