import React, {useState, useEffect, useCallback, useRef} from 'react';
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
    [companyId, setCompanyId] = useState(null),
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
    ),
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
    console.log(first, '---first');
    console.log(companyId, '---companyId');
  }, [first, companyId]);

  useEffect(() => {
    data && setCompanyData(data.places.data);
    if (data || error) {
      setQueryIndicator(false);
    } else if (loading) {
      setQueryIndicator(true);
    }
    FILTER.data && companyId && setCompanyData(FILTER.data.places.data);
  }, [loading, error, data, FILTER]);

  const flatListRef = useRef(null);

  const clickedType = (type, id) => {
      setFirst(12);
      flatListRef.current.scrollToOffset({animated: true, offset: 0});
      type.toLowerCase() === 'все' ? setCompanyId(null) : setCompanyId(id);
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
              ref={flatListRef}
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
