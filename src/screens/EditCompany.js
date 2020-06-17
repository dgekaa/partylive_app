import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {Query} from 'react-apollo';

import Header from '../components/Header';
import {GET_PLACES} from '../QUERYES';

const EditCompany = (props) => {
  return (
    <View style={styles.EditCompany}>
      <Header props={props} />
      <Text style={styles.headerText}>Список заведений</Text>
      <ScrollView>
        <Query query={GET_PLACES}>
          {({loading, error, data}) => {
            if (loading) {
              return <ActivityIndicator size="large" color="#0000ff" />;
            } else if (error) {
              return <Text>Error! ${error.message}</Text>;
            }

            return data.places.map((el) => (
              <View style={styles.row} key={el.id}>
                <TouchableOpacity style={styles.delete} onPress={() => {}}>
                  <Text style={styles.deleteText} numberOfLines={1}>
                    &#215;
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.textRowName}
                  onPress={() =>
                    props.navigation.navigate('Admin', {item: el})
                  }>
                  <Text style={styles.textRowInnerName} numberOfLines={1}>
                    {el.name}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.textRowAlias} numberOfLines={1}>
                  {el.alias}
                </Text>
                <Text style={styles.textRowType}>
                  {el.categories[0] && el.categories[0].name.toLowerCase()}
                </Text>
              </View>
            ));
          }}
        </Query>
        <TouchableOpacity style={styles.createCompany} onPress={() => {}}>
          <Text style={styles.createCompanyText}>СОЗДАТЬ ЗАВЕДЕНИЕ</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  EditCompany: {
    flex: 1,
    padding: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    paddingBottom: 30,
    textAlign: 'center',
    paddingTop: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: '#EAEAEA',
    borderTopWidth: 1,
    borderBottomWidth: 0,
  },
  delete: {
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 28,
    color: '#e32a6c',
  },
  textRowName: {
    flex: 3,
    padding: 10,
    paddingLeft: 0,
  },
  textRowInnerName: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  textRowAlias: {
    flex: 2,
    padding: 10,
    color: '#aeaeae',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  textRowType: {
    flex: 1.5,
    padding: 10,
    color: '#e32a6c',
    fontWeight: 'bold',
    fontSize: 18,
  },
  createCompany: {
    backgroundColor: '#e32a6c',
    color: '#fff',
    width: 200,
    padding: 8,
    borderRadius: 5,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginTop: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createCompanyText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default EditCompany;
