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
import MapView from 'react-native-map-clustering';
import LinearGradient from 'react-native-linear-gradient';
import Geocoder from 'react-native-geocoding';

import {isShowStreamNow, isWorkTimeNow} from '../calculateTime';
import {EN_SHORT_TO_RU_LONG_V_P, EN_SHORT_TO_RU_LONG} from '../constants';

import bar from '../img/bar_w.png';
import karaoke from '../img/karaoke_w.png';
import klub from '../img/klub_w.png';
import launge from '../img/launge_w.png';
import pab from '../img/pab_w.png';

const CustomMarker = ({place, loadedPlace, getDistanceTo, newRegion}) => {
  const [showStream, setShowStream] = useState(),
    [nextStreamTime, setNextStreamTime] = useState(),
    [workTime, setWorkTime] = useState(),
    [isWork, setIsWork] = useState(),
    [nextWorkTime, setNextWorkTime] = useState(null),
    [distanceTo, setDistanceTo] = useState();

  useEffect(() => {
    isShowStreamNow(place, setShowStream, setNextStreamTime);
    isWorkTimeNow(place, setWorkTime, setIsWork, setNextWorkTime);
  }, [place]);

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
    },
    getImg = () => {
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

  // newRegion.latitudeDelta < 0.1 &&
  //   newRegion.longitudeDelta < 0.15 &&
  //   place.profile_image
  // ?
  return (
    <ImageBackground
      onLoad={() => loadedPlace(place)}
      style={styles.customMarker}
      source={{
        uri: showStream
          ? place.streams && place.streams[0] && place.streams[0].preview
          : place.profile_image
          ? 'https://backend.partylive.by/storage/' +
            place.profile_image.replace('.png', '.jpg')
          : '',
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

const GoogleMap = ({
  places,
  navigation,
  onePlace,
  ADDRESSfromCOORD,
  lon,
  lat,
}) => {
  const [distanceTo, setDistanceTo] = useState(''),
    [newRegion, setNewRegion] = useState(''),
    [addressFromCoord, setAddresFromCoord] = useState(''),
    [isMapReady, setIsMapReady] = useState(false),
    [tracksViewChanges, setTracksViewChanges] = useState([]);

  const initialRegion = {
    latitude: 53.9097,
    longitude: 27.556,
    latitudeDelta: onePlace ? 0.12 : 0.25,
    longitudeDelta: onePlace ? 0.12 : 0.25,
  };

  useEffect(() => {
    Geocoder.init('AIzaSyAAcvrFmEi8o7u-zXHe6geXvjRey4Qj6tg', {language: 'ru'});
  }, []);

  const getGeocoderPosition = (lat, lon) => {
    Geocoder.from(lat, lon)
      .then((json) => setAddresFromCoord(json.results[0].formatted_address))
      .catch((error) => console.log(error, 'GEO'));
  };

  useEffect(() => {
    ADDRESSfromCOORD &&
      getGeocoderPosition(newRegion.latitude, newRegion.longitude);
  }, [newRegion]);

  useEffect(() => {
    ADDRESSfromCOORD && ADDRESSfromCOORD(addressFromCoord, newRegion);
  }, [addressFromCoord, newRegion]);

  const getDistanceTo = (dist) => setDistanceTo(dist),
    onMarkerPress = (place) =>
      navigation.navigate('Company', {
        data: place,
        distanceTo,
      }),
    onMapLayout = () => setIsMapReady(true),
    loadedPlace = (place) =>
      setTracksViewChanges((prevArray) => [...prevArray, +place.id]);

  return (
    <View style={styles.container}>
      {!!ADDRESSfromCOORD && (
        <Image
          source={require('../img/location.png')}
          style={styles.newLocation}
        />
      )}
      <MapView
        spiralEnabled={false}
        // spiderLineColor={'#000'}
        clusterColor="#e32a6c"
        radius={onePlace ? 1 : 50}
        clusterTextColor="#fff"
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        zoomEnabled={true}
        initialRegion={initialRegion}
        onRegionChangeComplete={(data) => setNewRegion(data)}
        onLayout={onMapLayout}
        onMarkersChange={(data) => {}}
        // onChangeMap
      >
        {lat && lon && (
          <Marker
            coordinate={{
              latitude: lat,
              longitude: lon,
            }}>
            <Image
              source={require('../img/dancer.png')}
              style={styles.dancer}
            />
          </Marker>
        )}

        {!!places &&
          !!places.length &&
          isMapReady &&
          places.map((place, i) => {
            const location = place.coordinates.split(',');
            return (
              <Marker
                key={i}
                tracksViewChanges={
                  tracksViewChanges.indexOf(+place.id) !== -1 ? false : true
                }
                onPress={() => onMarkerPress(place)}
                id={place.id}
                coordinate={{latitude: +location[0], longitude: +location[1]}}>
                <CustomMarker
                  newRegion={newRegion}
                  place={place}
                  navigation={navigation}
                  getDistanceTo={getDistanceTo}
                  loadedPlace={(place) => loadedPlace(place)}
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
    top: Dimensions.get('window').height / 2 - 40,
    left: Dimensions.get('window').width / 2 - 20,
    zIndex: 100,
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
    textAlign: 'center',
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
