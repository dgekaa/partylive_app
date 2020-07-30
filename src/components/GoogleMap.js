import React, {useEffect, useState, useRef} from 'react';
import {
  StyleSheet,
  View,
  ImageBackground,
  Text,
  Image,
  Dimensions,
} from 'react-native';
import {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import {ClusterMap} from 'react-native-cluster-map';
import MapView from 'react-native-map-clustering';
import ClusteredMapView from 'react-native-maps-super-cluster';
import LinearGradient from 'react-native-linear-gradient';
import Geocoder from 'react-native-geocoding';

import {isShowStreamNow, isWorkTimeNow} from '../calculateTime';
import {EN_SHORT_TO_RU_LONG_V_P, EN_SHORT_TO_RU_LONG} from '../constants';
import {getDistanceFromLatLonInKm} from '../getDistance';
import {requestLocationPermission} from '../permission';

import bar from '../img/bar_w.png';
import karaoke from '../img/karaoke_w.png';
import klub from '../img/klub_w.png';
import launge from '../img/launge_w.png';
import pab from '../img/pab_w.png';

const CustomMarker = ({place, getDistanceTo}) => {
  const [showStream, setShowStream] = useState();
  const [nextStreamTime, setNextStreamTime] = useState();
  const [workTime, setWorkTime] = useState();
  const [isWork, setIsWork] = useState();
  const [nextWorkTime, setNextWorkTime] = useState(null);
  const [distanceTo, setDistanceTo] = useState();
  const [lon, setLon] = useState('');
  const [lat, setLat] = useState('');

  useEffect(() => {
    requestLocationPermission(setLon, setLat);
  }, []);

  useEffect(() => {
    isShowStreamNow(place, setShowStream, setNextStreamTime);
    isWorkTimeNow(place, setWorkTime, setIsWork, setNextWorkTime);
  }, [place]);

  useEffect(() => {
    if (lon && lat && place && place.coordinates) {
      const dist = getDistanceFromLatLonInKm(
        lat,
        lon,
        place.coordinates.split(',')[0],
        place.coordinates.split(',')[1],
      ).toFixed(1);
      getDistanceTo(dist);
      setDistanceTo(dist);
    }
  }, [lon, lat, place]);

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
    switch (place.categories[0].slug) {
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
          place.streams &&
          place.streams[0] &&
          place.streams[0].preview,
      }}>
      {console.log(place, '+++++++++++++++++++')}
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
            {place.name}
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

const GoogleMap = ({places, navigation, onePlace, ADDRESSfromCOORD}) => {
  const [lon, setLon] = useState('');
  const [lat, setLat] = useState('');
  const [distanceTo, setDistanceTo] = useState('');
  const [newRegion, setNewRegion] = useState('');
  const [addressFromCoord, setAddresFromCoord] = useState('');
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    requestLocationPermission(setLon, setLat);
  }, []);

  Geocoder.init('AIzaSyAAcvrFmEi8o7u-zXHe6geXvjRey4Qj6tg', {language: 'ru'});

  const [initialRegion, setInitialRegion] = useState({
    latitude: 53.9097,
    longitude: 27.556,
    latitudeDelta: onePlace ? 0.12 : 0.25,
    longitudeDelta: onePlace ? 0.12 : 0.25,
  });

  // useEffect(() => {
  //   if (ADDRESSfromCOORD) {
  //     Geocoder.from(newRegion.latitude, newRegion.longitude)
  //       .then((json) => {
  //         setAddresFromCoord(json.results[0].formatted_address);
  //       })
  //       .catch((error) => console.log(error, 'GEO'));
  //   }
  // }, [newRegion, ADDRESSfromCOORD]);

  const getDistanceTo = (dist) => {
    setDistanceTo(dist);
  };

  const onMapLayout = () => {
    setIsMapReady(true);
  };

  return (
    <View style={styles.container}>
      {!!ADDRESSfromCOORD && (
        <Image
          source={require('../img/location.png')}
          style={styles.newLocation}
        />
      )}
      <MapView
        spiralEnabled={true}
        clusterColor="#e32a6c"
        radius={onePlace ? 1 : 40}
        clusterTextColor="#fff"
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        onRegionChangeComplete={(data) => setNewRegion(data)}
        onRegionChange={(data) => {}}
        onLayout={onMapLayout}
        ADDRESSfromCOORD={
          ADDRESSfromCOORD && ADDRESSfromCOORD(addressFromCoord, newRegion)
        }>
        {/* {!!lat && isMapReady && (
          <Marker coordinate={{latitude: +lat, longitude: +lon}}>
            <Image
              source={require('../img/dancer.png')}
              style={styles.dancer}
            />
          </Marker>
        )}

        {!!onePlace && isMapReady && (
          <Marker
            coordinate={{
              latitude: +onePlace.coordinates.split(',')[0],
              longitude: +onePlace.coordinates.split(',')[1],
            }}></Marker>
        )} */}

        {!!places &&
          !!places.length &&
          isMapReady &&
          places.map((place) => {
            const location = place.coordinates.split(',');
            return (
              <Marker
                onPress={() => {
                  navigation.navigate('Company', {
                    data: place,
                    distanceTo,
                  });
                }}
                id={place.id}
                coordinate={{latitude: +location[0], longitude: +location[1]}}>
                <CustomMarker
                  place={place}
                  navigation={navigation}
                  getDistanceTo={getDistanceTo}
                />
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
    position: 'relative',
  },
  newLocation: {
    position: 'absolute',
    width: 40,
    height: 40,
    top: Dimensions.get('window').height / 2,
    left: Dimensions.get('window').width / 2,
    zIndex: 100,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor: 'red',
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
    justifyContent: 'flex-end',
    position: 'relative',
    overflow: 'hidden',
  },
  descBlock: {
    height: 40,
    width: 130,
    padding: 5,
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
  arrow: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    fontSize: 30,
    color: 'green',
  },
});

export default GoogleMap;
