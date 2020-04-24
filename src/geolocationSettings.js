import PermissionsAndroid from 'react-native';
import Geolocation from '@react-native-community/geolocation';

const requestLocationPermission = async ({setLon, setLat}) => {
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
        (error) => console.log(error.code, error.message, ' ERR LOCATION'),
        {enableHighAccuracy: false, timeout: 50000},
      );
    } else {
      console.log('Location permission denied');
    }
  } catch (err) {
    console.log(err, ' LOCATION ERR');
  }
};

export default requestLocationPermission;
