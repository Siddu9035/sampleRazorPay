import {
  PermissionsAndroid,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import StopTrip from '../../assets/images/stopTrip.svg';
import Bell from '../../assets/images/bellIcon.svg';
import Sos from '../../assets/images/sos.svg';
import Back from '../../assets/images/VectorBack.svg';
import {
  fontPixel,
  horizontalScale,
  responsiveBorderRadius,
  verticalScale,
} from '../Utils/Dimensions';
import FontFamily from '../Styles/FontFamily';
import BottomTab from '../Components/BottomTab';
import RN from 'react-native';
import {actuatedNormalize} from '../Utils/PixelScaling';
import CustomModal from '../Components/Modal';
import {APIS} from '../APIURLS/ApiUrls';
import {convertedTime, convertedTimeforEvent} from '../Utils/ReusableFunctions';
import axios from 'axios';
import Loader from '../Components/Loader';
import Geolocation from '@react-native-community/geolocation';
const SCREEN_HEIGHT = RN.Dimensions.get('window').height;

const StopTripScreen = ({navigation, route}) => {
  const {roasterId, tripId, idRoasterDays, driverId, mobileNo} = route.params;
  // console.log(
  //   'roasterId',
  //   roasterId,
  //   'tripId',
  //   tripId,
  //   'idRoasterDays',
  //   idRoasterDays,
  //   'driverId',
  //   driverId,
  //   'mobileNo',
  //   mobileNo,
  // );
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpError, setOtpError] = useState({
    isOtpError: false,
    otpErrorMessage: '',
  });
  const [loader, setLoader] = useState(false);

  const formatTime = time => {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const amOrPm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12; // Convert 0 to 12
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${formattedHours}:${formattedMinutes} ${amOrPm}`;
  };

  const sendOtpForEndTrip = async () => {
    setLoader(true);
    setOtpError({
      isOtpError: false,
      otpErrorMessage: '',
    });
    try {
      await requestLocationPermission();
      const currentLocation = await getCurrentLocation();
      const {latitude, longitude} = currentLocation;

      const locationName = await getLocationName(latitude, longitude);
      const apiUrl = `${APIS.sendTripEndOtp}`;
      const endTripRequestBody = {
        roasterId: roasterId,
        tripId: tripId,
        idRoasterDays: idRoasterDays,
        tripEventDtm: convertedTimeforEvent(),
        eventGpsdtm: convertedTime(),
        eventGpslocationLatLon: `${latitude},${longitude}`,
        eventGpslocationName: locationName,
        driverID: driverId,
        mobileNo: mobileNo,
      };
      const response = await axios.post(apiUrl, endTripRequestBody);
      console.log(
        '\nresponse:',
        JSON.stringify(response.data.returnLst, null, 2),
        '\n',
      );
      setShowOtpModal(true);
    } catch (error) {
      console.log('\nerror:', JSON.stringify(error, null, 2), '\n');
    } finally {
      setLoader(false);
    }
  };

  const validateEndTripOtp = async OTP => {
    setLoader(true);
    try {
      await requestLocationPermission();
      const currentLocation = await getCurrentLocation();
      const {latitude, longitude} = currentLocation;
      const locationName = await getLocationName(latitude, longitude);
      const apiUrl = `${APIS.validateTripEndOtp}`;
      const requestEndTripBody = {
        roasterId: roasterId,
        idRoasterDay: idRoasterDays,
        tripId: tripId,
        driverID: driverId,
        mobileNo: mobileNo,
        tripOtp: OTP,
        tripEndOdoMtr: '00000',
        tripEndGpsdtm: convertedTime(),
        tripEndGpslocationLatLon: `${latitude},${longitude}`,
        tripEndGpslocationName: locationName,
      };
      console.log(
        '\nrequestEndTripBody:',
        JSON.stringify(requestEndTripBody, null, 2),
        '\n',
      );
      const response = await axios.post(apiUrl, requestEndTripBody);
      console.log(
        '\nresponse:',
        JSON.stringify(response.data.returnLst, null, 2),
        '\n',
      );
      if (response.data.statusCode === 200) {
        setOtpError({
          isOtpError: false,
          otpErrorMessage: '',
        });
        setTimeout(() => {
        navigation.navigate('Recent');
        }, 1000);
        setShowOtpModal(false);
      } else {
        setOtpError({
          isOtpError: true,
          otpErrorMessage: 'Incorrect Otp',
        });
      }
    } catch (error) {
      console.log('\nerror:', JSON.stringify(error, null, 2), '\n');
    } finally {
      setLoader(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getCurrentLocation();
      } else {
        console.log('Gallery permission denied');
        Alert.alert(
          'Alert!!',
          'Please grant gallery permission to use this feature.',
          [
            {
              text: 'Ask me Later',
            },
            {
              text: 'Cancel',
            },
            {
              text: 'OK',
              onPress: () => {
                openSettings();
              },
            },
          ],
          {cancelable: false},
        );
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude} = position.coords;
          resolve({latitude, longitude});
        },
        error => {
          console.log('Error getting current location:', error);
          reject(error);
        },
      );
    });
  };
  const getLocationName = async (latitude, longitude) => {
    try {
      const apiKey = 'AIzaSyAol1uOPzQnphvxtIatoLH-Ayw6OUwRpbA';
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`,
      );

      // Parse the response
      const {results} = response.data;
      if (results && results.length > 0) {
        // Extract the formatted address or other relevant information
        const locationName = results[0].formatted_address;
        return locationName;
      } else {
        return 'Unknown Location';
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      return 'Unknown Location';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <TouchableOpacity
            style={styles.backbutton}
            onPress={() => {
              navigation.goBack();
            }}>
            <Back width={horizontalScale(25)} height={verticalScale(25)} />
            <Text style={styles.backbuttonText}>My Trips</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.subMainHeader}>
          <TouchableOpacity style={{paddingRight: 20}}>
            <Sos width={actuatedNormalize(40)} height={actuatedNormalize(40)} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={styles.bellButton}>
            <Bell
              width={actuatedNormalize(40)}
              height={actuatedNormalize(40)}
              fill={'#C5197D'}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.subContainer}>
        <View style={styles.stopTripAndImage}>
          <View style={styles.startSubContainer}>
            <StopTrip
              width={actuatedNormalize(50)}
              height={actuatedNormalize(50)}
            />
          </View>
          <Text style={styles.stopTripText}>
            You are about to stop the trip!
          </Text>
        </View>
        <View style={{flex: 0.4, alignItems: 'center'}}>
          <TouchableOpacity
            onPress={() => {
              // navigation.navigate('Recent', {
              //   // stopTrip: true,
              //   // stopTripTime: formatTime(new Date()),
              // });
              sendOtpForEndTrip();
            }}
            style={styles.endTripButton}>
            <Text style={styles.endtripText}>End Trip</Text>
          </TouchableOpacity>
          <CustomModal
            visible={showOtpModal}
            onClose={() => {
              setShowOtpModal(false);
            }}
            onPressSubmitButton={e => {
              validateEndTripOtp(e);
              setShowOtpModal(false);
            }}
            onPressCancelButton={() => {
              setShowOtpModal(false);
            }}
            title={'Enter otp For End Trip'}
            isOtpError={otpError.isOtpError}
            OTPErrorMessage={otpError.otpErrorMessage}
          />
        </View>
        <BottomTab activeTab="MyTrips" />
      </View>
      {loader && <Loader />}
    </View>
  );
};

export default StopTripScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(102, 39, 110, 1)',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  backbutton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backbuttonText: {
    color: 'white',
    fontSize: fontPixel(18),
    paddingLeft: 20,
  },
  subMainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subContainer: {
    flex: 1,
    backgroundColor: 'rgba(246, 246, 246, 1)',
    borderTopLeftRadius: responsiveBorderRadius(50),
    borderTopRightRadius: responsiveBorderRadius(50),
  },
  startSubContainer: {
    width: actuatedNormalize(100),
    height: actuatedNormalize(100),
    borderRadius: responsiveBorderRadius(100),
    backgroundColor: 'rgba(229, 229, 229, 1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    alignSelf: 'center',
  },
  stopTripAndImage: {
    flex: 0.6,
    justifyContent: 'flex-end',
    marginBottom: 60,
  },
  stopTripText: {
    color: 'black',
    fontFamily: FontFamily.medium,
    fontSize: fontPixel(16),
    alignSelf: 'center',
    width: horizontalScale(150),
    textAlign: 'center',
  },
  endTripButton: {
    width: horizontalScale(130),
    height: verticalScale(50),
    backgroundColor: 'rgba(197, 25, 125, 1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  endtripText: {
    color: 'white',
    fontFamily: FontFamily.regular,
    fontSize: fontPixel(14),
  },
});
