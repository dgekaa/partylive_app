import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Animated,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import AdminHeader from './AdminHeader';
import {useMutation} from 'react-apollo';
import {GET_PLACE, UPDATE_PLACE_DATA, UPDATE_PLACE_IMAGE} from '../../QUERYES';
import QueryIndicator from '../../components/QueryIndicator';

const Profile = ({
  navigation,
  profileValue,
  moveOut,
  data,
  setInputName,
  inputName,
  setInputAlias,
  inputAlias,
  inputDesc,
  moveIn,
  chooseCategoryValue,
  addressValue,
  descriptionValue,
}) => {
  const [pickerImageData, setpPickerImageData] = useState(''),
    [queryIndicator, setQueryIndicator] = useState(false);

  const refreshObject = {
    refetchQueries: [
      {
        query: GET_PLACE,
        variables: {id: navigation.state.params.item.id},
      },
    ],
    awaitRefetchQueries: true,
  };

  const isPlace = data && data.place;

  useEffect(() => {
    isPlace.profile_image &&
      setpPickerImageData(
        'https://backend.partylive.by/storage/' +
          isPlace.profile_image.replace('.png', '.jpg'),
      );
  }, [data]);

  const [UPDATE_PLACE_DATA_mutation] = useMutation(
      UPDATE_PLACE_DATA,
      refreshObject,
    ),
    [UPDATE_PLACE_IMAGE_mutation] = useMutation(
      UPDATE_PLACE_IMAGE,
      refreshObject,
    );

  const goToPickImage = (token) => {
    var options = {
      title: 'Select Image',
      customButtons: [
        {name: 'customOptionKey', title: 'Choose Photo from Custom Option'},
      ],
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    const UPLOAD_IMAGE = (img) => {
      setQueryIndicator(true);
      UPDATE_PLACE_IMAGE_mutation({
        variables: {
          id: isPlace.id,
          profile_image: img,
        },
        optimisticResponse: null,
      }).then(
        (res) => {
          console.log(res, 'RES mob profile_image');
          setQueryIndicator(false);
        },
        (err) => {
          console.log(err, 'ERR mob profile_image');
          setQueryIndicator(false);
        },
      );
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      const formData = new FormData(),
        operations = `{"query": "mutation ($file: Upload!){ placeImage(file: $file) }", "variables": { "file": null }}`,
        map = '{"0": ["variables.file"]}';

      formData.append('operations', operations);
      formData.append('map', map);

      NativeModules.ImageCropPicker.openCropper({
        path: Platform.OS === 'ios' ? `file:///${response.uri}` : response.uri,
        width: 200,
        height: 200,
      })
        .then((image) => {
          const finishImage = {
            name: 'images.jpeg',
            type: image.mime,
            uri: Platform.OS === 'ios' ? `file:///${image.path}` : image.path,
          };
          formData.append('0', finishImage);

          fetch('https://backend.partylive.by/graphql', {
            method: 'post',
            headers: {
              'Content-Type': 'multipart/form-data;',
              authorization: `Bearer ${token}`,
            },
            body: formData,
          })
            .then((res) => res.json())
            .then((responseJson) => {
              setpPickerImageData(image.path);
              UPLOAD_IMAGE(responseJson.data.placeImage);
            })
            .catch((err) => console.log(err, 'ERR upload'));
        })
        .catch((e) => Alert.alert(e.message ? e.message : e));
    });
  };

  const getAsyncToken = async () => {
    const token = await getToken();
    return token;
  };

  const saveNewData = () => {
    setQueryIndicator(true);
    UPDATE_PLACE_DATA_mutation({
      variables: {
        id: isPlace.id,
        name: inputName || isPlace.name,
        alias: inputAlias || isPlace.alias,
      },
      optimisticResponse: null,
    }).then(
      (res) => {
        console.log(res, 'RES');
        setQueryIndicator(false);
      },
      (err) => {
        console.log(err, 'ERR');
        setQueryIndicator(false);
      },
    );
  };

  const changePhoto = () =>
      getAsyncToken().then((token) => goToPickImage(token)),
    deletePhoto = () => {
      UPLOAD_IMAGE('');
      setpPickerImageData('');
    };

  return (
    <Animated.ScrollView
      style={[
        styles.sliderAdminMenu,
        {transform: [{translateX: profileValue}, {perspective: 1000}]},
      ]}>
      <AdminHeader
        navigation={navigation}
        moveOut={moveOut}
        who={profileValue}
      />
      <View style={styles.profileWrap}>
        <Text style={styles.headerAdminTitle}>Профиль заведения</Text>
        <View>
          {pickerImageData ? (
            <>
              <Image
                style={styles.pickerImageStyle}
                source={{
                  uri: pickerImageData,
                }}
              />
              <View style={styles.imgBtnsWrap}>
                <TouchableOpacity onPress={() => changePhoto()}>
                  <Text style={styles.changeDeleteBtn}>Изменить</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deletePhoto()}>
                  <Text style={styles.changeDeleteBtn}>Удалить</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.noPickerImageStyle}
                onPress={() => changePhoto()}>
                <Text style={styles.noPickerImageText}>Загрузить фото</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.textInputWrap}>
          <Text style={styles.textInputTitleText}>Название:</Text>
          <TextInput
            style={styles.textInputStyle}
            onChangeText={(text) => setInputName(text)}
            value={inputName}
            placeholder={isPlace.name}
          />
        </View>
        <View style={styles.textInputWrap}>
          <Text style={styles.textInputTitleText}>Псевдоним:</Text>
          <TextInput
            style={styles.textInputStyle}
            onChangeText={(text) => setInputAlias(text)}
            value={inputAlias}
            placeholder={isPlace.alias}
          />
        </View>
        <View style={styles.textInputWrap}>
          <Text style={styles.textInputTitleText}>Категория:</Text>
          <View style={styles.btnCategoryWrap}>
            <View style={styles.btnCategoryOuter}>
              <Text style={styles.btnCategoryInner}>
                {isPlace.categories[0].name}
              </Text>
            </View>
            <TouchableOpacity onPress={() => moveIn(chooseCategoryValue)}>
              <Text style={styles.chooseNewCategory}>Выбрать...</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.textInputWrap}>
          <Text style={styles.textInputTitleText}>Адрес:</Text>
          <TouchableOpacity
            style={styles.addressText}
            onPress={() => moveIn(addressValue)}>
            <TextInput
              style={styles.textInputStyle}
              value={isPlace.address}
              contextMenuHidden={true}
              editable={false}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.textInputWrap}>
          <View style={styles.textInputTitleText}>
            <Text style={styles.textInputText}>Описание:</Text>
          </View>
          <TouchableOpacity
            style={styles.textInputMultilineStyleWrap}
            onPress={() => moveIn(descriptionValue)}>
            <Text style={styles.textInputMultilineStyle} numberOfLines={2}>
              {inputDesc}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.pinkBtn} onPress={() => saveNewData()}>
          <Text style={styles.pinkBtnText}>СОХРАНИТЬ</Text>
        </TouchableOpacity>
      </View>
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
  profileWrap: {
    padding: 20,
  },
  headerAdminTitle: {
    textTransform: 'uppercase',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 15,
    fontSize: 18,
  },
  pickerImageStyle: {
    alignSelf: 'center',
    borderRadius: 5,
    width: Dimensions.get('window').width * 0.8,
    height: Dimensions.get('window').width * 0.8 * 0.56,
  },
  imgBtnsWrap: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 10,
  },
  changeDeleteBtn: {
    textTransform: 'uppercase',
  },
  noPickerImageStyle: {
    alignSelf: 'center',
    width: Dimensions.get('window').width * 0.8,
    height: Dimensions.get('window').width * 0.8 * 0.56,
    backgroundColor: '#f2f2f7',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPickerImageText: {
    color: '#aeaeae',
    fontSize: 18,
  },
  textInputWrap: {
    marginVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInputTitleText: {
    fontSize: 16,
    color: '#4F4F4F',
    fontWeight: 'bold',
    flex: 1.2,
  },
  textInputStyle: {
    borderBottomColor: '#999',
    borderBottomWidth: 1,
    flex: 2.5,
    fontSize: 16,
    fontWeight: '300',
  },
  btnCategoryWrap: {
    marginTop: 10,
    flex: 2.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  btnCategoryOuter: {
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#C4C4C4',
    borderWidth: 1,
    width: 70,
    height: 35,
  },
  btnCategoryInner: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  chooseNewCategory: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e32a6c',
  },
  addressText: {
    flex: 2.5,
  },
  textInputText: {
    fontSize: 16,
    color: '#4F4F4F',
    fontWeight: 'bold',
  },
  textInputMultilineStyleWrap: {
    flex: 2.5,
  },
  textInputMultilineStyle: {
    borderBottomColor: '#4f4f4f',
    borderBottomWidth: 1,
    fontWeight: '300',
    fontSize: 16,
    lineHeight: 24,
    paddingLeft: 5,
    paddingBottom: 12,
  },
  pinkBtn: {
    backgroundColor: '#E32A6C',
    borderRadius: 5,
    height: 36,
    width: 244,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  pinkBtnText: {
    color: '#fff',
  },
});

export default Profile;
