import React, {useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import {Query, useQuery} from 'react-apollo';

import Header from '../components/Header';
import CompanyTypeNav from '../components/CompanyTypeNav';
import SmallCompanyBlock from '../components/SmallCompanyBlock';
import {GET_CATEGORIES, GET_PLACES} from '../QUERYES';

const Home = (props) => {
  const [companyData, setCompanyData] = useState([]);

  const PLACES = useQuery(GET_PLACES);
  useEffect(() => {
    PLACES.data && setCompanyData(PLACES.data.places);
  }, [PLACES]);

  const clickedType = (type) => {
    if (type.toLowerCase() === 'все') {
      setCompanyData(PLACES.data.places);
    } else {
      const filteredData = PLACES.data.places.filter((el) => {
        if (el.categories[0] && el.categories[0].name) {
          return el.categories[0].name.toLowerCase() === type.toLowerCase();
        }
      });
      setCompanyData(filteredData);
    }
  };

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    if (PLACES.refetch) {
      setRefreshing(true);
      PLACES.refetch().then((res) => {
        console.log(res.loading, '...LOAD');
        !res.loading && res.data && setRefreshing(false);
      });
    }
  }, []);

  return (
    <View style={styles.home}>
      <SafeAreaView style={{backgroundColor: '#eee', flex: 1}}>
        <Header props={props} />
        <Query query={GET_CATEGORIES}>
          {({loading, error, data}) => {
            if (loading) {
              return <></>;
            } else if (error) {
              return <Text>Error! ${error.message}</Text>;
            }
            return <CompanyTypeNav data={data} clickedType={clickedType} />;
          }}
        </Query>
        <View style={styles.content}>
          {PLACES.loading && (
            <View>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          )}

          {PLACES.error && <Text>Error! ${error.message}</Text>}

          {companyData.length ? (
            <FlatList
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              data={companyData}
              numColumns={2}
              renderItem={({item}) => (
                <SmallCompanyBlock item={item} navigation={props.navigation} />
              )}
              keyExtractor={(item) => item.id}
            />
          ) : (
            <Text style={styles.nullFilter}>Нет заведений</Text>
          )}
        </View>
      </SafeAreaView>
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
