import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {useMutation, useQuery} from 'react-apollo';
import Dialog, {ScaleAnimation, DialogContent} from 'react-native-popup-dialog';

import Header from '../components/Header';
import {GET_PLACES, CREATE_PLACE, DELETE_PLACE} from '../QUERYES';

const EditCompany = (props) => {
  const {data} = useQuery(GET_PLACES);

  const [isConfirmPopup, setIsConfirmPopup] = useState(false);
  const [deletElId, setDeleteElId] = useState(null);
  const [deleteElName, setDeleteElName] = useState(null);

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
      <SafeAreaView style={{backgroundColor: '#eee', flex: 1}}>
        <Header props={props} />
        <Text style={styles.headerText}>Список заведений</Text>
        <ScrollView>
          {data.places.map((el) => (
            <View style={styles.row} key={el.id}>
              <TouchableOpacity
                style={styles.delete}
                onPress={() => {
                  setDeleteElId(el.id);
                  setDeleteElName(el.name);
                  setIsConfirmPopup(true);
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
      </SafeAreaView>

      <Dialog
        visible={isConfirmPopup}
        onTouchOutside={() => setIsConfirmPopup(false)}>
        <DialogContent style={styles.popupConfirmWrap}>
          <Text style={styles.popupConfirmQuestion}>
            Действительно удалить "{deleteElName}"?
          </Text>
          <View style={styles.popupConfirmBtns}>
            <TouchableOpacity
              style={styles.popupConfirmBtn}
              onPress={() => {
                console.log(deletElId, '_____deletElId');
                deleteOne(deletElId);
                setIsConfirmPopup(false);
              }}>
              <Text style={styles.popupConfirmBtnText}>Да</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.popupConfirmBtn}
              onPress={() => setIsConfirmPopup(false)}>
              <Text style={styles.popupConfirmBtnText}>Нет</Text>
            </TouchableOpacity>
          </View>
        </DialogContent>
      </Dialog>
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
  popupConfirmWrap: {
    padding: 15,
    width: '70%',
  },
  popupConfirmQuestion: {
    fontSize: 18,
    textAlign: 'center',
  },
  popupConfirmBtn: {
    marginTop: 20,
    backgroundColor: '#e32a6c',
    width: 60,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  popupConfirmBtns: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  popupConfirmBtnText: {
    color: '#fff',
  },
});

export default EditCompany;
