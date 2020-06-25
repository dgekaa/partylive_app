import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
} from 'react-native';
import {Query} from 'react-apollo';

import Header from '../components/Header';
import CompanyTypeNav from '../components/CompanyTypeNav';
import SmallCompanyBlock from '../components/SmallCompanyBlock';
import {GET_CATEGORIES, GET_PLACES} from '../QUERYES';

const Home = (props) => {
  const [DATA, setDATA] = useState([]);
  const [companyData, setCompanyData] = useState([]);

  useEffect(() => {
    DATA.places && setCompanyData(DATA.places);
  }, [DATA]);

  const clickedType = (type) => {
    if (type.toLowerCase() === 'все') {
      setCompanyData(DATA.places);
    } else {
      const filteredData = DATA.places.filter((el) => {
        if (el.categories[0] && el.categories[0].name) {
          return el.categories[0].name.toLowerCase() === type.toLowerCase();
        }
      });
      setCompanyData(filteredData);
    }
  };

  return (
    // <SafeAreaView style={{backgroundColor: '#eee'}}>
    <View style={styles.home}>
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
        <Query query={GET_PLACES}>
          {({loading, error, data}) => {
            if (loading) {
              return (
                <View>
                  <ActivityIndicator size="large" color="#0000ff" />
                </View>
              );
            } else if (error) {
              return <Text>Error! ${error.message}</Text>;
            }
            setDATA(data);

            if (companyData.length) {
              return (
                <FlatList
                  data={companyData}
                  numColumns={2}
                  renderItem={({item}) => (
                    <SmallCompanyBlock
                      item={item}
                      navigation={props.navigation}
                    />
                  )}
                  keyExtractor={(item) => item.id}
                />
              );
            } else {
              return <Text style={styles.nullFilter}>Нет заведений</Text>;
            }
          }}
        </Query>
      </View>
    </View>
    // </SafeAreaView>
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
