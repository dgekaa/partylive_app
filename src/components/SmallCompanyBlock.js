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
import LinearGradient from 'react-native-linear-gradient';

import bar from '../img/bar_w.png';
import karaoke from '../img/karaoke_w.png';
import klub from '../img/klub_w.png';
import launge from '../img/launge_w.png';
import pab from '../img/pab_w.png';

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
  const [nextWorkTime, setNextWorkTime] = useState(null);

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

  useEffect(() => {
    isShowStreamNow(item, setShowStream, setNextStreamTime);
    isWorkTimeNow(item, setWorkTime, setIsWork);
  }, [item]);

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

  const getImg = () => {
    switch (item.categories[0].slug) {
      case 'bar':
        return bar;
      case 'klub':
        return klub;
      case 'launge':
        return launge;
      case 'pab':
        return pab;
      case 'karaoke':
        return karaoke;
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
        style={styles.backgroundStyle}
        source={{
          uri: item.streams && item.streams[0] && item.streams[0].preview,
        }}>
        <View style={styles.videoWrap}>
          {!showStream && (
            <View style={styles.backgroundVideo}>
              <Text style={styles.noVideoText}>{whenIsTranslationTime()}</Text>
            </View>
          )}
        </View>

        <View style={styles.description}>
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)']}
            style={styles.linearGradient}>
            <View style={styles.nameRow}>
              <Image style={styles.imgType} source={getImg()} />
              <Text style={styles.name}>{item.name}</Text>
            </View>

            <View style={styles.bottomRow}>
              <View style={styles.workTimeRow}>
                <View
                  style={[
                    !isWork
                      ? {backgroundColor: '#04b000'}
                      : {backgroundColor: '#6D6D6D'},
                    styles.circle,
                  ]}
                />
                <Text style={styles.workTime}>{whenIsWorkTime()}</Text>
              </View>
              {distanceTo && <Text style={styles.km}>{distanceTo} km.</Text>}
            </View>
          </LinearGradient>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  SmallCompanyBlock: {
    backgroundColor: '#fff',
    height: 190,
    margin: 5,
    width: Dimensions.get('window').width / 2 - 10,
    borderRadius: 5,
    borderColor: '#ededed',
    borderWidth: 1,
    overflow: 'hidden',
  },
  backgroundStyle: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    backgroundColor: '#000',
    borderRadius: 5,
    position: 'relative',
  },
  videoWrap: {
    height: 120,
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
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 50,
    borderRadius: 5,
  },
  linearGradient: {
    paddingHorizontal: 10,
    padding: 5,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imgType: {
    width: 16,
    height: 16,
    marginRight: 5,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  workTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: 7,
    height: 7,
    borderRadius: 5,
    marginTop: 3,
    marginLeft: 4.5,
    marginRight: 9.5,
  },
  workTime: {
    fontWeight: 'normal',
    fontSize: 12,
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
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default SmallCompanyBlock;
