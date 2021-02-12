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
import {GET_CATEGORIES, GET_PLACES, GET_PLACES_WITH_FILTER} from '../QUERYES';

const Home = (props) => {
  const [companyData, setCompanyData] = useState([]),
    [lon, setLon] = useState(''),
    [lat, setLat] = useState(''),
    [queryIndicator, setQueryIndicator] = useState(false),
    [refreshing, setRefreshing] = useState(false),
    [first, setFirst] = useState(12);

  const {loading, error, data, refetch} = useQuery(
    GET_PLACES,
    {
      variables: {first: first},
    },
    {
      manual: true,
    },
  );

  useEffect(() => {
    data && setCompanyData(data.places.data);
    if (data || error) {
      setQueryIndicator(false);
    } else if (loading) {
      setQueryIndicator(true);
    }
  }, [loading, error, data]);

  const clickedType = (type) => {
      if (type.toLowerCase() === 'все') {
        setCompanyData(data.places.data);
      } else {
        const filteredData = data.places.data.filter((el) => {
          if (el.categories[0] && el.categories[0].name) {
            return el.categories[0].name.toLowerCase() === type.toLowerCase();
          }
        });
        setCompanyData(filteredData);
      }
    },
    onRefresh = () => {
      setRefreshing(true);
      refetch().then((res) => {
        !res.loading && res.data && setRefreshing(false);
      });
    },
    toggleQueryIndicator = ({data, error, loading}) => {
      if (data || error) {
        setQueryIndicator(false);
      } else if (loading) {
        setQueryIndicator(true);
      }
    },
    refetchPlaces = () => {
      setFirst((prev) => prev + 12);
      refetch();
    };

  data && requestLocationPermission(setLon, setLat);

  return (
    <View style={styles.home}>
      <SafeAreaView style={{backgroundColor: '#fff', flex: 1}}>
        <Header props={props} />
        <Query query={GET_CATEGORIES}>
          {({loading, error, data}) => {
            toggleQueryIndicator(loading, error, data);

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
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => onRefresh()}
                />
              }
              data={companyData}
              numColumns={2}
              onEndReachedThreshold={0}
              onEndReached={refetchPlaces}
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
      {(queryIndicator || loading) && <QueryIndicator />}
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
