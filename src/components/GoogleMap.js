import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  ImageBackground,
  Text,
  Image,
  PermissionsAndroid,
} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import LinearGradient from 'react-native-linear-gradient';
import Geolocation from '@react-native-community/geolocation';

import {isShowStreamNow, isWorkTimeNow} from '../calculateTime';
import {EN_SHORT_TO_RU_LONG_V_P, EN_SHORT_TO_RU_LONG} from '../constants';
import {getDistanceFromLatLonInKm} from '../getDistance';

import bar from '../img/bar_w.png';
import karaoke from '../img/karaoke_w.png';
import klub from '../img/klub_w.png';
import launge from '../img/launge_w.png';
import pab from '../img/pab_w.png';

const CustomMarker = ({marker}) => {
  // console.log(marker, 'CUSTOM');

  const [showStream, setShowStream] = useState();
  const [nextStreamTime, setNextStreamTime] = useState();
  const [workTime, setWorkTime] = useState();
  const [isWork, setIsWork] = useState();
  const [nextWorkTime, setNextWorkTime] = useState(null);
  const [distanceTo, setDistanceTo] = useState();
  const [lon, setLon] = useState('');
  const [lat, setLat] = useState('');

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
        Geolocation.getCurrentPosition(
          (position) => {
            console.log(position, 'POSition');
            setLon(position.coords.longitude);
            setLat(position.coords.latitude);
          },
          (err) => console.log(err, 'err'),
        );
        // Geolocation.watchPosition(
        //   (position) => {
        //     console.log(position, '_____________________position');
        //     setLon(position.coords.longitude);
        //     setLat(position.coords.latitude);
        //   },
        //   (error) => console.log(error.code, error.message, 'ERR LOCATION'),
        //   {enableHighAccuracy: false, timeout: 50000},
        // );
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
    isShowStreamNow(marker, setShowStream, setNextStreamTime);
    isWorkTimeNow(marker, setWorkTime, setIsWork, setNextWorkTime);
  }, [marker]);

  useEffect(() => {
    if (lon && lat && marker && marker.coordinates) {
      setDistanceTo(
        getDistanceFromLatLonInKm(
          lat,
          lon,
          marker.coordinates.split(',')[0],
          marker.coordinates.split(',')[1],
        ).toFixed(1),
      );
    }
  }, [lon, lat, marker]);

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
    switch (marker.categories[0].slug) {
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
    <ImageBackground
      style={styles.customMarker}
      source={{
        uri:
          showStream &&
          marker.streams &&
          marker.streams[0] &&
          marker.streams[0].preview,
      }}>
      {!showStream && (
        <View style={styles.noVideo}>
          <Text style={styles.noVideoText}>
            {nextWorkTime
              ? isWork
                ? whenIsTranslationTime()
                : 'Откроется:'
              : isWork
              ? whenIsTranslationTime()
              : 'Закрыто'}
          </Text>

          {nextWorkTime && nextWorkTime.start_time && (
            <Text style={styles.noVideoText}>
              {nextWorkTime.day.toLowerCase() !== 'сегодня'
                ? EN_SHORT_TO_RU_LONG[nextWorkTime.day]
                : nextWorkTime.day}
            </Text>
          )}

          {nextWorkTime && nextWorkTime.start_time && (
            <Text style={styles.noVideoText}>
              {nextWorkTime.start_time + '-' + nextWorkTime.end_time}
            </Text>
          )}
        </View>
      )}
      <LinearGradient
        colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.7)']}
        style={styles.descBlock}>
        <View style={styles.nameRow}>
          <Image style={styles.imgType} source={getImg()} />
          <Text style={styles.name} numberOfLines={1}>
            {marker.name}
          </Text>
        </View>
        <View style={styles.bottomRow}>
          <View style={styles.workTimeRow}>
            <View
              style={[
                isWork
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
    </ImageBackground>
  );
};

const GoogleMap = ({places}) => {
  const [lon, setLon] = useState('');
  const [lat, setLat] = useState('');

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
        console.log('You can use location----');
        Geolocation.getCurrentPosition(
          (position) => {
            console.log(position, 'POSition');
            setLon(position.coords.longitude);
            setLat(position.coords.latitude);
          },
          (err) => console.log(err, 'err'),
        );
        // Geolocation.watchPosition(
        //   (position) => {
        //     console.log(position, '_____________________position');
        //     setLon(position.coords.longitude);
        //     setLat(position.coords.latitude);
        //   },
        //   (error) => console.log(error.code, error.message, 'ERR LOCATION'),
        //   {enableHighAccuracy: false, timeout: 50000},
        // );
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

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={{
          latitude: 53.9097,
          longitude: 27.556,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }}>
        {console.log(lat, '==========================', lon)}
        {!!lat && (
          <Marker coordinate={{latitude: +lat, longitude: +lon}}>
            <Image
              source={require('../img/dancer.png')}
              style={styles.dancer}
            />
          </Marker>
        )}

        {places.map((marker) => {
          const location = marker.coordinates.split(',');
          return (
            <Marker
              coordinate={{latitude: +location[0], longitude: +location[1]}}>
              <CustomMarker marker={marker} />
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  dancer: {
    width: 30,
    height: 30,
  },
  customMarker: {
    width: 130,
    height: 130,
    backgroundColor: '#000',
    borderRadius: 5,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  descBlock: {
    height: 40,
    width: 130,
    padding: 3,
    paddingRight: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imgType: {
    height: 16,
    width: 16,
    marginRight: 5,
  },
  name: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 40,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noVideoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
  km: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default GoogleMap;
