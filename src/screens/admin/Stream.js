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
} from 'react-native';
import AdminHeader from './AdminHeader';
import VideoPlayer from 'react-native-video-controls';
import {useMutation} from 'react-apollo';

import {
  GET_PLACE,
  UPDATE_STREAM,
  CREATE_STREAM,
  UPDATE_SEE_YOU_TOMORROW,
} from '../../QUERYES';

const Stream = ({
  streamValue,
  navigation,

  streams,
  data,
  moveOut,
}) => {
  const refreshObject = {
    refetchQueries: [
      {
        query: GET_PLACE,
        variables: {id: navigation.state.params.item.id},
      },
    ],
    awaitRefetchQueries: true,
  };

  const [UPDATE_STREAM_mutation] = useMutation(UPDATE_STREAM, refreshObject),
    [CREATE_STREAM_mutation] = useMutation(CREATE_STREAM, refreshObject),
    [UPDATE_SEE_YOU_TOMORROW_mutation] = useMutation(
      UPDATE_SEE_YOU_TOMORROW,
      refreshObject,
    );

  const [inputCameraAddress, setInputCameraAddress] = useState(''),
    [isStreamOff, setIsStreamOff] = useState(false);

  const videoRef = useRef(null);

  useEffect(() => {
    data &&
      data.place &&
      data.place.streams &&
      data.place.streams[0] &&
      data.place.streams[0].see_you_tomorrow &&
      setIsStreamOff(data.place.streams[0].see_you_tomorrow === dateNow);
  }, [data, dateNow]);

  const dateNow = new Date()
    .toLocaleDateString()
    .split('.')
    .reverse()
    .join('-');

  const updateStream = (inputCameraAddress) => {
    UPDATE_STREAM_mutation({
      variables: {
        id: data.place.streams[0].id,
        url: `https://partycamera.org/${inputCameraAddress}/index.m3u8`,
        preview: `http://partycamera.org/${inputCameraAddress}/preview.jpg`,
      },
      optimisticResponse: null,
    })
      .then(
        (res) => console.log(res, 'stream RES__'),
        (err) => console.log(err, 'stream ERR___'),
      )
      .catch((err) => console.log(err, '______err_1'));
  };

  const createStream = (inputCameraAddress) => {
    CREATE_STREAM_mutation({
      variables: {
        name: data.place.name,
        url: `https://partycamera.org/${inputCameraAddress}/index.m3u8`,
        preview: `http://partycamera.org/${inputCameraAddress}/preview.jpg`,
        place: {
          connect: '' + data.place.id,
        },
      },
      optimisticResponse: null,
    })
      .then(
        (res) => console.log(res, 'create stream RES__'),
        (err) => console.log(err, 'create stream ERR___'),
      )
      .catch((err) => console.log(err, '______err_1'));
  };

  const videoPause = () => {
    !videoRef.current.state.paused &&
      videoRef.current.methods.togglePlayPause();
  };

  const disableStream = (see_you_tomorrow) => {
    if (data.place.streams[0]) {
      UPDATE_SEE_YOU_TOMORROW_mutation({
        variables: {
          id: data.place.streams[0].id,
          see_you_tomorrow: see_you_tomorrow,
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

  const cancel = () => {
    data &&
    data.place &&
    data.place.streams &&
    data.place.streams[0] &&
    data.place.streams[0].see_you_tomorrow
      ? setIsStreamOff(data.place.streams[0].see_you_tomorrow)
      : setIsStreamOff(false);
  };

  const save = () => {
    disableStream(isStreamOff ? dateNow : null);
    if (inputCameraAddress) {
      if (!data.place.streams[0]) {
        createStream(inputCameraAddress);
      } else {
        updateStream(inputCameraAddress);
      }
    }
  };

  const isStream =
      data && data.place && data.place.streams && data.place.streams[0],
    placeholder =
      (isStream && data.place.streams[0].url) || 'Введите адрес стрима';

  return (
    <Animated.ScrollView
      style={[
        styles.sliderAdminMenu,
        {transform: [{translateX: streamValue}, {perspective: 1000}]},
      ]}>
      <AdminHeader
        cancel
        ready
        saveFunction={() => save()}
        cancelFunction={() => cancel()}
        navigation={navigation}
        moveOut={moveOut}
        who={streamValue}
        videoPause={videoPause}
      />
      <Text style={styles.headerAdminTitle}>Стрим</Text>
      <View style={styles.videoWrap}>
        <VideoPlayer
          ref={videoRef}
          poster={streams[0] && streams[0].preview}
          paused={true}
          source={{uri: streams[0] && streams[0].url}}
          disableSeekbar
          disableTimer
          disableBack
          disableFullscreen
          toggleResizeModeOnFullscreen={false}
        />
      </View>
      {isStream && (
        <View style={styles.streamOffMainWrap}>
          <View>
            <Text style={styles.streamOffMainText}>Отключить стрим</Text>
            <Text style={styles.streamOffText}>
              Выключается до следующего дня
            </Text>
          </View>
          <Switch
            trackColor={{false: '#aeaeae', true: '#e32a6c'}}
            ios_backgroundColor="#3e3e3e"
            onValueChange={setIsStreamOff}
            value={isStreamOff}
          />
        </View>
      )}
      <View style={styles.cameraAddress}>
        <Text>Адрес камеры:</Text>
        <TextInput
          style={styles.textInputStyle}
          onChangeText={(text) => setInputCameraAddress(text)}
          value={inputCameraAddress}
          placeholder={placeholder}
        />
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
  videoWrap: {
    height: 250,
  },
  streamOffMainWrap: {
    flexDirection: 'row',
    paddingTop: 20,
    alignItems: 'center',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  streamOffMainText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  streamOffText: {
    fontSize: 16,
    color: '#999',
  },
  cameraAddress: {
    margin: 10,
  },
  textInputStyle: {
    borderBottomColor: '#999',
    borderBottomWidth: 1,
    flex: 2.5,
    fontSize: 16,
    fontWeight: '300',
  },
});

export default Stream;
