import {PermissionsAndroid, Platform} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

// export const requestCameraAndAudioPermission = async () => {
//   if (Platform.OS === 'android') {
//     try {
//       const granted = await PermissionsAndroid.requestMultiple([
//         PermissionsAndroid.PERMISSIONS.CAMERA,
//         PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//         PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
//       ]);
//       if (
//         granted['android.permission.RECORD_AUDIO'] ===
//           PermissionsAndroid.RESULTS.GRANTED &&
//         granted['android.permission.CAMERA'] ===
//           PermissionsAndroid.RESULTS.GRANTED
//       ) {
//         console.log('You can use the cameras & mic');
//       } else {
//         console.log('Permission denied');
//       }
//     } catch (err) {
//       console.warn(err);
//     }
//   }
// };

export const requestLocationPermission = async (setLon, setLat) => {
  if (Platform.OS === 'android') {
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
        console.log('You can use location!!!');
        Geolocation.getCurrentPosition(
          (info) => {
            setLon(info.coords.longitude);
            setLat(info.coords.latitude);
          },
          (error) => {
            console.log(error.code, error.message, 'ERR LOCATION');
          },
        );
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err, ' location err');
    }
  }
};
