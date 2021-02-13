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
import {GET_CATEGORIES, GET_PLACES, GET_PLACES_WITH_FILTER} from '../QUERYES';
import {requestLocationPermission} from '../permission';
import QueryIndicator from '../components/QueryIndicator';

const Map = (props) => {
  const [companyData, setCompanyData] = useState([]),
    [lon, setLon] = useState(null),
    [lat, setLat] = useState(null),
    [queryIndicator, setQueryIndicator] = useState(false),
    [first, setFirst] = useState(200),
    [companyId, setCompanyId] = useState(null);

  const {loading, error, data} = useQuery(GET_PLACES, {
      variables: {first: first},
    }),
    FILTER = useQuery(
      GET_PLACES_WITH_FILTER,
      {
        variables: {first: first, value: companyId},
      },
      {
        manual: true,
      },
    );

  useEffect(() => {
    data && data.places && setCompanyData(data.places.data);

    if (data || error) {
      setQueryIndicator(false);
    } else if (loading) {
      setQueryIndicator(true);
    }

    FILTER.data && companyId && setCompanyData(FILTER.data.places.data);
  }, [data, loading, error, FILTER]);

  const clickedType = (type, id) =>
      type.toLowerCase() === 'все' ? setCompanyId(null) : setCompanyId(id),
    toggleQueryIndicator = ({data, error, loading}) => {
      if (data || error) {
        setQueryIndicator(false);
      } else if (loading) {
        setQueryIndicator(true);
      }
    };

  data && requestLocationPermission(setLon, setLat);

  return (
    <View style={styles.Map}>
      <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
        <Header props={props} />
        <Query query={GET_CATEGORIES}>
          {({loading, error, data}) => {
            toggleQueryIndicator(loading, error, data);

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
