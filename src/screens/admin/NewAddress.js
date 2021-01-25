import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Switch,
  Animated,
  StatusBar,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import AdminHeader from './AdminHeader';
import {useMutation} from 'react-apollo';
import GoogleMap from '../../components/GoogleMap';
import {GET_PLACE, SAVE_ADDRESS} from '../../QUERYES';

const NewAddress = ({navigation, addressValue, moveOut, data}) => {
  const refreshObject = {
    refetchQueries: [
      {
        query: GET_PLACE,
        variables: {id: navigation.state.params.item.id},
      },
    ],
    awaitRefetchQueries: true,
  };

  const [ADDRESS, setADDRESS] = useState(null),
    [COORD, setCOORD] = useState(null);

  const [SAVE_ADDRESS_mutation] = useMutation(SAVE_ADDRESS, refreshObject);

  const ADDRESSfromCOORD = (address, coord) => {
    setADDRESS(address);
    setCOORD(coord);
  };

  const saveNewAddress = () => {
    if (ADDRESS) {
      const coordinate = COORD.latitude + ',' + COORD.longitude;
      SAVE_ADDRESS_mutation({
        variables: {
          id: data.place.id,
          address: ADDRESS,
          coordinates: coordinate,
        },
        optimisticResponse: null,
      })
        .then(
          (res) => console.log(res, 'RES__'),
          (err) => console.log(err, '___ERR___'),
        )
        .catch((err) => console.log(err, '______err_1'));
    }
  };

  return (
    <Animated.ScrollView
      style={[
        styles.sliderAdminMenu,
        {transform: [{translateX: addressValue}, {perspective: 1000}]},
      ]}>
      <SafeAreaView style={{backgroundColor: '#eee', flex: 1}}>
        <AdminHeader
          cancel
          ready
          saveFunction={() => saveNewAddress()}
          cancelFunction={() => {}}
          navigation={navigation}
          moveOut={moveOut}
          who={addressValue}
        />
        <View style={styles.mapWrap}>
          <GoogleMap
            onePlace={navigation.state.params.item}
            ADDRESSfromCOORD={(data, coord) => ADDRESSfromCOORD(data, coord)}
          />
          <Text style={styles.addressStyle}>
            {ADDRESS && ADDRESS.split(',')[0]}
          </Text>
        </View>
      </SafeAreaView>
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
  mapWrap: {
    position: 'relative',
    flex: 1,
    borderRadius: 5,
    backgroundColor: '#999',
    overflow: 'hidden',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  addressStyle: {
    position: 'absolute',
    width: Dimensions.get('window').width - 30,
    top: 15,
    left: 15,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
  },
});

export default NewAddress;
