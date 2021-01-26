import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  StatusBar,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {useMutation} from 'react-apollo';
import {NodeCameraView} from 'react-native-nodemediaclient';
import QueryIndicator from '../../components/QueryIndicator';
import AdminHeader from './AdminHeader';
import {GET_PLACE, UPDATE_MOBILE_STREAM} from '../../QUERYES';

const Translation = ({navigation, translationValue, moveOut, data}) => {
  const refreshObject = {
    refetchQueries: [
      {
        query: GET_PLACE,
        variables: {id: navigation.state.params.item.id},
      },
    ],
    awaitRefetchQueries: true,
  };

  const vbRef = useRef(null);

  const [publishBtnTitle, setPublishBtnTitle] = useState('Начать трансляцию'),
    [isPublish, setIsPublish] = useState(false),
    [queryIndicator, setQueryIndicator] = useState(false);

  const [UPDATE_MOBILE_STREAM_mutation] = useMutation(
    UPDATE_MOBILE_STREAM,
    refreshObject,
  );

  const disableMobileStream = () => {
      setPublishBtnTitle('Начать трансляцию');
      setIsPublish(false);
      vbRef.current.stop();
      updateMobileStream(false);
    },
    enableMobileStream = () => {
      setPublishBtnTitle('Остановить трансляцию');
      setIsPublish(true);
      vbRef.current.start();
      updateMobileStream(true);
    };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple(
          [
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          ],
          {
            title: 'Cool Photo App Camera And Microphone Permission',
            message:
              'Cool Photo App needs access to your camera ' +
              'so you can take awesome pictures.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('You can use the camera');
        } else {
          console.log('Camera permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const updateMobileStream = (bool) => {
    setQueryIndicator(true);
    UPDATE_MOBILE_STREAM_mutation({
      variables: {
        id: data.place.id,
        mobile_stream: bool,
      },
      optimisticResponse: null,
    }).then(
      (res) => {
        console.log(res, 'RES mob stream');
        setQueryIndicator(false);
      },
      (err) => {
        console.log(err, 'ERR');
        setQueryIndicator(false);
      },
    );
  };

  return (
    <Animated.ScrollView
      style={[
        styles.sliderAdminMenu,
        {
          transform: [{translateX: translationValue}, {perspective: 1000}],
        },
      ]}>
      <SafeAreaView style={{backgroundColor: '#eee', flex: 1}}>
        <AdminHeader
          navigation={navigation}
          disableMobileStream={disableMobileStream}
          moveOut={moveOut}
          who={translationValue}
        />
        <NodeCameraView
          style={styles.nodeCameraStyle}
          ref={vbRef}
          outputUrl={`rtmp://partylivestream.web4net.ru/streaming/${data.place.id}`}
          camera={{cameraId: 1, cameraFrontMirror: true}}
          audio={{bitrate: 60000, profile: 1, samplerate: 44100}}
          video={{
            preset: 12,
            bitrate: 300000,
            profile: 1,
            fps: 15,
            videoFrontMirror: false,
          }}
          autopreview={true}
        />
        <Text style={styles.headerTranslTitle}>ТРАНСЛЯЦИЯ</Text>
        <View style={styles.mobStreamBtnsBlock}>
          <TouchableOpacity
            style={[styles.translStartStopBtn]}
            onPress={() => {
              vbRef.current.switchCamera();
            }}>
            <Text
              style={[styles.startTranslBtn, styles.startTranslBtnNotClicked]}>
              Переключить камеру
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.translStartStopBtn}
            onPress={() => {
              requestCameraPermission();
              isPublish ? disableMobileStream() : enableMobileStream();
            }}>
            <Text
              style={[
                styles.startTranslBtn,
                isPublish
                  ? styles.startTranslBtnClicked
                  : styles.startTranslBtnNotClicked,
              ]}>
              {publishBtnTitle}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      {queryIndicator && <QueryIndicator />}
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
  nodeCameraStyle: {
    height: Dimensions.get('window').height - 74,
    width: '100%',
  },
  mobStreamBtnsBlock: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
  },
  translStartStopBtn: {
    alignSelf: 'center',
  },
  startTranslBtn: {
    height: 50,
    width: 279,
    alignSelf: 'center',
    marginTop: 35,
    lineHeight: 50,
    textAlign: 'center',
    textTransform: 'uppercase',
    borderRadius: 15,
    fontWeight: 'bold',
    fontSize: 18,
  },
  startTranslBtnClicked: {
    borderWidth: 2,
    borderColor: '#909090',
    color: '#999',
  },
  startTranslBtnNotClicked: {
    backgroundColor: '#E32A6C',
    color: '#fff',
  },
  headerTranslTitle: {
    width: '100%',
    position: 'absolute',
    fontSize: 18,
    fontWeight: 'bold',
    top: 60,
    color: '#fff',
    textAlign: 'center',
  },
});

export default Translation;
