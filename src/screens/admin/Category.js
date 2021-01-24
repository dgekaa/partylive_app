import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  StatusBar,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import AdminHeader from './AdminHeader';
import {Query, useMutation} from 'react-apollo';
import {GET_PLACE, GET_CATEGORIES, UPDATE_PLACE_DATA} from '../../QUERYES';

const Category = ({navigation, chooseCategoryValue, moveOut, data}) => {
  const refreshObject = {
    refetchQueries: [
      {
        query: GET_PLACE,
        variables: {id: navigation.state.params.item.id},
      },
    ],
    awaitRefetchQueries: true,
  };

  const [UPDATE_PLACE_DATA_mutation] = useMutation(
    UPDATE_PLACE_DATA,
    refreshObject,
  );

  const [typeOfCompany, setTypeOfCompany] = useState(''),
    [typeOfCompanyId, setTypeOfCompanyId] = useState('');

  const categories = data.place.categories && data.place.categories[0];

  const chooseCategory = () => {
    UPDATE_PLACE_DATA_mutation({
      variables: {
        id: data.place.id,
        categories: {
          disconnect: categories.id,
          connect: typeOfCompanyId,
        },
      },
      optimisticResponse: null,
    }).then(
      (res) => console.log(res, 'RES'),
      (err) => console.log(err, 'ERR'),
    );
  };

  const categoryClick = (el) => {
    setTypeOfCompany(el.name);
    setTypeOfCompanyId(el.id);
  };

  const categoryOuterStyle = (el) =>
      typeOfCompany && typeOfCompany === el.name
        ? styles.bacgrBtn
        : !typeOfCompany && el.name && categories && categories.name === el.name
        ? styles.bacgrBtn
        : {},
    categoryTextStyle = (el) =>
      typeOfCompany && typeOfCompany === el.name
        ? styles.cliked
        : !typeOfCompany && el.name && categories && categories.name === el.name
        ? styles.cliked
        : styles.notClicked;

  return (
    <Animated.ScrollView
      style={[
        styles.sliderAdminMenu,
        {
          transform: [{translateX: chooseCategoryValue}, {perspective: 1000}],
        },
      ]}>
      <AdminHeader
        cancel
        ready
        saveFunction={() => chooseCategory()}
        cancelFunction={() => {}}
        navigation={navigation}
        moveOut={moveOut}
        who={chooseCategoryValue}
      />
      <Text style={styles.headerAdminTitle}>Тип заведения</Text>
      <View style={styles.categoryBtnsRow}>
        <Query query={GET_CATEGORIES}>
          {(prop) => {
            if (prop.loading)
              return (
                <View>
                  <ActivityIndicator size="large" color="#0000ff" />
                </View>
              );

            if (prop.error) return <Text>Error! ${prop.error.message}</Text>;

            return prop.data.categories.map((el, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.btnCategoryOuter,
                  styles.btnCategoryInNewWindow,
                  categoryOuterStyle(el),
                ]}
                onPress={() => categoryClick(el)}>
                <Text style={categoryTextStyle(el)}>{el.name}</Text>
              </TouchableOpacity>
            ));
          }}
        </Query>
      </View>
    </Animated.ScrollView>
  );
};

const isIPhoneX = () => {
  const dimen = Dimensions.get('window');
  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    (dimen.height === 812 ||
      dimen.width === 812 ||
      dimen.height === 896 ||
      dimen.width === 896)
  );
};

const getStatusBarHeight = (skipAndroid) => {
  return Platform.select({
    ios: isIPhoneX() ? 44 : 20,
    android: skipAndroid ? 0 : StatusBar.currentHeight,
    default: 0,
  });
};

const styles = StyleSheet.create({
  sliderAdminMenu: {
    position: 'absolute',
    // top: getStatusBarHeight(),
    top: 0, // в андроиде смещалось вниз
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#fff',
    width: '100%',
    translateX: -Dimensions.get('window').width,
    flex: 1,
  },
  headerAdminTitle: {
    textTransform: 'uppercase',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 15,
    fontSize: 18,
  },
  categoryBtnsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  btnCategoryOuter: {
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#C4C4C4',
    borderWidth: 1,
    width: 70,
    height: 35,
  },
  btnCategoryInNewWindow: {
    width: Dimensions.get('window').width / 2 - 20,
    height: 50,
    margin: 10,
  },
  bacgrBtn: {
    backgroundColor: '#e32a6c',
  },
  cliked: {
    color: '#fff',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  notClicked: {
    color: '#000',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
});

export default Category;
