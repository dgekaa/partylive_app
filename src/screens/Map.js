import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import {Query, useQuery} from 'react-apollo';

import Header from '../components/Header';
import GoogleMap from '../components/GoogleMap';
import CompanyTypeNav from '../components/CompanyTypeNav';
import {GET_CATEGORIES, GET_PLACES} from '../QUERYES';
import {requestLocationPermission} from '../permission';

const Map = (props) => {
  const {data, loading, error} = useQuery(GET_PLACES);

  const [companyData, setCompanyData] = useState([]),
    [lon, setLon] = useState(null),
    [lat, setLat] = useState(null),
    [queryIndicator, setQueryIndicator] = useState(false);

  useEffect(() => {
    data && data.places && setCompanyData(data.places);

    if (data || error) {
      setQueryIndicator(false);
    } else if (loading) {
      setQueryIndicator(true);
    }
  }, [data, loading, error]);

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

  useEffect(() => {
    requestLocationPermission(setLon, setLat);
  }, []);

  return (
    <View style={styles.Map}>
      <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
        <Header props={props} />
        <Query query={GET_CATEGORIES}>
          {({loading, error, data}) => {
            if (data || error) {
              setQueryIndicator(false);
            } else if (loading) {
              setQueryIndicator(true);
            }

            if (loading) {
              return <ActivityIndicator size="large" color="#0000ff" />;
            } else if (error) {
              return <Text>Error! ${error.message}</Text>;
            }
            return <CompanyTypeNav data={data} clickedType={clickedType} />;
          }}
        </Query>
        <View style={styles.content}>
          <GoogleMap
            places={companyData}
            navigation={props.navigation}
            lon={lon}
            lat={lat}
          />
        </View>
      </SafeAreaView>
      {queryIndicator && <QueryIndicator />}
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
