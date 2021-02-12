import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  FlatList,
} from 'react-native';
import {useMutation, useQuery} from 'react-apollo';
import Dialog, {DialogContent} from 'react-native-popup-dialog';

import Header from '../components/Header';
import QueryIndicator from '../components/QueryIndicator';
import {GET_PLACES, CREATE_PLACE, DELETE_PLACE} from '../QUERYES';

const EditCompany = (props) => {
  const [isConfirmPopup, setIsConfirmPopup] = useState(false),
    [deletElId, setDeleteElId] = useState(null),
    [deleteElName, setDeleteElName] = useState(null),
    [queryIndicator, setQueryIndicator] = useState(false),
    [first, setFirst] = useState(200),
    [refreshing, setRefreshing] = useState(false);

  const {data, loading, error, refetch} = useQuery(
    GET_PLACES,
    {
      variables: {first: first},
    },
    {
      manual: true,
    },
  );

  const refreshObject = {
    refetchQueries: [
      {
        query: GET_PLACES,
      },
    ],
    awaitRefetchQueries: true,
  };

  useEffect(() => {
    if (data || error) {
      setQueryIndicator(false);
    } else if (loading) {
      setQueryIndicator(true);
    }
  }, [data, loading, error]);

  const [CREATE_PLACE_mutation] = useMutation(CREATE_PLACE, refreshObject),
    [DELETE_PLACE_mutation] = useMutation(DELETE_PLACE, refreshObject);

  const create = () => {
      setQueryIndicator(true);
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
        (res) => {
          console.log(res, 'RES');
          setQueryIndicator(false);
        },
        (err) => {
          console.log(err, 'ERR');
          setQueryIndicator(false);
        },
      );
    },
    allowDelete = (id) => {
      setQueryIndicator(true);
      setIsConfirmPopup(false);
      DELETE_PLACE_mutation({
        variables: {
          id: id,
        },
        optimisticResponse: null,
      }).then(
        (res) => {
          console.log(res, 'RES');
          setQueryIndicator(false);
        },
        (err) => {
          console.log(err, 'ERR');
          setQueryIndicator(false);
        },
      );
    },
    deleteClick = (el) => {
      setDeleteElId(el.id);
      setDeleteElName(el.name);
      setIsConfirmPopup(true);
    },
    toCompany = (el) => props.navigation.navigate('Admin', {item: el}),
    refetchPlaces = () => {
      setFirst((prev) => prev + 100);
      refetch();
    },
    onRefresh = () => {
      setRefreshing(true);
      refetch().then((res) => !res.loading && res.data && setRefreshing(false));
    };

  return (
    <View style={styles.EditCompany}>
      <SafeAreaView style={{backgroundColor: '#eee', flex: 1}}>
        <Header props={props} />
        <Text style={styles.headerText}>Список заведений</Text>
        {data && data.places && (
          <FlatList
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => onRefresh()}
              />
            }
            data={data.places.data}
            numColumns={1}
            onEndReachedThreshold={0.01}
            onEndReached={() => refetchPlaces()}
            renderItem={({item}) => (
              <>
                <View style={styles.row} key={item.id}>
                  <TouchableOpacity
                    style={styles.delete}
                    onPress={() => deleteClick(item)}>
                    <Text style={styles.deleteText} numberOfLines={1}>
                      &#215;
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.textRowName}
                    onPress={() => toCompany(item)}>
                    <Text style={styles.textRowInnerName} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.textRowAlias} numberOfLines={1}>
                    {item.alias}
                  </Text>
                  <Text style={styles.textRowType}>
                    {item.categories[0] &&
                      item.categories[0].name.toLowerCase()}
                  </Text>
                </View>
              </>
            )}
            keyExtractor={(item) => item.id}
          />
        )}
        <TouchableOpacity style={styles.createCompany} onPress={() => create()}>
          <Text style={styles.createCompanyText}>СОЗДАТЬ ЗАВЕДЕНИЕ</Text>
        </TouchableOpacity>
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
              onPress={() => allowDelete(deletElId)}>
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

      {queryIndicator && <QueryIndicator />}
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
    marginBottom: 5,
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
