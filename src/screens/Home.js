import React, {useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import {Query, useQuery} from 'react-apollo';
import {requestLocationPermission} from '../permission';
import Header from '../components/Header';
import QueryIndicator from '../components/QueryIndicator';
import CompanyTypeNav from '../components/CompanyTypeNav';
import SmallCompanyBlock from '../components/SmallCompanyBlock';
import {GET_CATEGORIES, GET_PLACES} from '../QUERYES';

const Home = (props) => {
  const [companyData, setCompanyData] = useState([]),
    [lon, setLon] = useState(''),
    [lat, setLat] = useState(''),
    [queryIndicator, setQueryIndicator] = useState(false);

  const {loading, error, data, refetch} = useQuery(GET_PLACES);

  useEffect(() => {
    data && setCompanyData(data.places);
    if (data || error) {
      setQueryIndicator(false);
    } else if (loading) {
      setQueryIndicator(true);
    }
  }, [loading, error, data]);

  const clickedType = (type) => {
    if (type.toLowerCase() === 'все') {
      setCompanyData(data.places);
    } else {
      const filteredData = data.places.filter((el) => {
        if (el.categories[0] && el.categories[0].name) {
          return el.categories[0].name.toLowerCase() === type.toLowerCase();
        }
      });
      setCompanyData(filteredData);
    }
  };

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    if (refetch) {
      setRefreshing(true);
      refetch().then((res) => {
        !res.loading && res.data && setRefreshing(false);
      });
    }
  }, []);

  useEffect(() => {
    requestLocationPermission(setLon, setLat);
  }, []);

  return (
    <View style={styles.home}>
      <SafeAreaView style={{backgroundColor: '#fff', flex: 1}}>
        <Header props={props} />
        <Query query={GET_CATEGORIES}>
          {({loading, error, data}) => {
            if (data || error) {
              setQueryIndicator(false);
            } else if (loading) {
              setQueryIndicator(true);
            }
            if (loading) {
              return <></>;
            } else if (error) {
              return <Text>Error! ${error.message}</Text>;
            }
            return <CompanyTypeNav data={data} clickedType={clickedType} />;
          }}
        </Query>
        <View style={styles.content}>
          {error && <Text>Error! ${error.message}</Text>}

          {companyData.length ? (
            <FlatList
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              data={companyData}
              numColumns={2}
              renderItem={({item}) => (
                <SmallCompanyBlock
                  lon={lon}
                  lat={lat}
                  item={item}
                  navigation={props.navigation}
                />
              )}
              keyExtractor={(item) => item.id}
            />
          ) : (
            <Text style={styles.nullFilter}>Нет заведений</Text>
          )}
        </View>
      </SafeAreaView>
      {queryIndicator && <QueryIndicator />}
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
