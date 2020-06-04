import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  PermissionsAndroid,
  ImageBackground,
  Image,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

import {getDistanceFromLatLonInKm} from '../getDistance';
import {EN_SHORT_TO_RU_LONG_V_P} from '../constants';
import {isShowStreamNow, isWorkTimeNow} from '../calculateTime';

const SmallCompanyBlock = ({item, navigation}) => {
  const [showStream, setShowStream] = useState();
  const [nextStreamTime, setNextStreamTime] = useState();
  const [workTime, setWorkTime] = useState();
  const [isWork, setIsWork] = useState();
  const [distanceTo, setDistanceTo] = useState();
  const [lon, setLon] = useState('');
  const [lat, setLat] = useState('');

  useEffect(() => {
    isShowStreamNow(item, setShowStream, setNextStreamTime);
    isWorkTimeNow(item, setWorkTime, setIsWork);
  }, [item]);

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Cool location Permission',
          message: 'Нужен доступ к вашему местоположению.',
          buttonNeutral: 'Спросить позже',
          buttonNegative: 'Отмена',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use location');
        Geolocation.watchPosition(
          (position) => {
            setLon(position.coords.longitude);
            setLat(position.coords.latitude);
          },
          (error) => console.log(error.code, error.message, 'ERR LOCATION'),
          {enableHighAccuracy: false, timeout: 50000},
        );
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (lon && lat && item && item.coordinates) {
      setDistanceTo(
        getDistanceFromLatLonInKm(
          lat,
          lon,
          item.coordinates.split(',')[0],
          item.coordinates.split(',')[1],
        ).toFixed(1),
      );
    }
  }, [lon, lat, item]);

  const whenIsTranslationTime = () => {
    if (
      nextStreamTime &&
      nextStreamTime.start_time &&
      nextStreamTime.day.toLowerCase() !== 'сегодня'
    ) {
      return (
        'Трансляция начнется в ' +
        EN_SHORT_TO_RU_LONG_V_P[nextStreamTime.day] +
        ' в ' +
        nextStreamTime.start_time
      );
    } else if (
      nextStreamTime &&
      nextStreamTime.start_time &&
      nextStreamTime.day.toLowerCase() === 'сегодня'
    ) {
      return 'Трансляция начнется сегодня в ' + nextStreamTime.start_time;
    } else if (!nextStreamTime) {
      return 'Нет предстоящих трансляций';
    }
  };

  const whenIsWorkTime = () => {
    if (!isWork) {
      return 'закрыто';
    } else {
      if (workTime) {
        return 'до ' + workTime.split('-')[1];
      } else {
        return 'Время работы не задано';
      }
    }
  };

  return (
    <TouchableOpacity
      style={styles.SmallCompanyBlock}
      onPress={(e) => {
        navigation.navigate('Company', {
          data: item,
          distanceTo,
        });
      }}>
      <ImageBackground
        source={item.streams && item.streams[0] && item.streams[0].preview}
        style={{
          flex: 1,
          resizeMode: 'cover',
          justifyContent: 'center',
          backgroundColor: '#000',
          borderRadius: 5,
          position: 'relative',
        }}>
        <View style={styles.videoWrap}>
          {showStream ? (
            <></>
          ) : (
            <View style={styles.backgroundVideo}>
              <Text style={styles.noVideoText}>{whenIsTranslationTime()}</Text>
            </View>
          )}
        </View>
        <View style={styles.description}>
          <Text style={styles.name}>{item.name}</Text>
          {/* <View style={styles.middleText}>
          <Text style={styles.km}>{distanceTo ? distanceTo : 0} km.</Text>
          <Text style={styles.categories}>
            {item.categories && item.categories[0] && item.categories[0].name}
          </Text>
        </View> */}

          <View style={styles.workTimeRow}>
            <View style={styles.circle} />
            <Text style={styles.workTime}>{whenIsWorkTime()}</Text>
          </View>
        </View>
        <Image
          style={{
            position: 'absolute',
            right: 5,
            bottom: 5,
            backgroundColor: '#000',
            width: 16,
            height: 16,
          }}
          source={{
            uri:
              item.categories && item.categories[0] && item.categories[0].slug,
          }}
        />
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  SmallCompanyBlock: {
    backgroundColor: '#fff',
    height: 180,
    margin: 5,
    width: Dimensions.get('window').width / 2 - 10,
    borderRadius: 5,
    borderColor: '#ededed',
    borderWidth: 1,
  },
  videoWrap: {
    height: 130,
    borderRadius: 5,
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    overflow: 'hidden',
    borderRadius: 5,
    height: '100%',
    width: '100%',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noVideoText: {
    color: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  description: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  name: {
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 14,
    color: '#FFFFFF',
  },
  workTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: 5,
    height: 5,
    backgroundColor: 'red',
    borderRadius: 5,
    marginRight: 5,
    marginTop: 3,
  },
  workTime: {
    fontWeight: '500',
    fontSize: 11,
    lineHeight: 14,
    color: '#FFFFFF',
  },
  middleText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categories: {
    color: 'rgb(227, 42, 108)',
    fontWeight: 'bold',
  },
  km: {
    color: 'rgb(227, 42, 108)',
    fontWeight: 'bold',
  },
});

export default SmallCompanyBlock;
