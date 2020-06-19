import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useMutation, useQuery} from 'react-apollo';

import Header from '../components/Header';
import {GET_PLACES, CREATE_PLACE, DELETE_PLACE} from '../QUERYES';

const EditCompany = (props) => {
  const {data} = useQuery(GET_PLACES);

  const refreshObject = {
    refetchQueries: [
      {
        query: GET_PLACES,
      },
    ],
    awaitRefetchQueries: true,
  };

  const [CREATE_PLACE_mutation] = useMutation(CREATE_PLACE, refreshObject);
  const [DELETE_PLACE_mutation] = useMutation(DELETE_PLACE, refreshObject);

  const create = () => {
    CREATE_PLACE_mutation({
      variables: {
        name: 'Стандартное название',
        address: 'улица Ленина 8, Минск, Беларусь',
        description: 'введите описание',
        coordinates: '53.9006799,27.5582599',
        alias: 'pseudonim',
        categories: {
          connect: 2,
        },
      },
      optimisticResponse: null,
    }).then(
      (res) => console.log(res, 'RES'),
      (err) => console.log(err, 'ERR'),
    );
  };

  const deleteOne = (id) => {
    DELETE_PLACE_mutation({
      variables: {
        id: id,
      },
      optimisticResponse: null,
    }).then(
      (res) => console.log(res, 'RES'),
      (err) => console.log(err, 'ERR'),
    );
  };

  return (
    <View style={styles.EditCompany}>
      <Header props={props} />
      <Text style={styles.headerText}>Список заведений</Text>
      <ScrollView>
        {data.places.map((el) => (
          <View style={styles.row} key={el.id}>
            <TouchableOpacity
              style={styles.delete}
              onPress={() => {
                deleteOne(el.id);
              }}>
              <Text style={styles.deleteText} numberOfLines={1}>
                &#215;
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.textRowName}
              onPress={() => props.navigation.navigate('Admin', {item: el})}>
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
        ))}
        <TouchableOpacity
          style={styles.createCompany}
          onPress={() => {
            create();
          }}>
          <Text style={styles.createCompanyText}>СОЗДАТЬ ЗАВЕДЕНИЕ</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  EditCompany: {
    flex: 1,
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
