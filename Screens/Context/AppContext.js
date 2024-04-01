import React, {createContext, useState, useContext, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {APIS} from '../APIURLS/ApiUrls';
import axios from 'axios';

export const AppContext = createContext();

export const AppProvider = ({children}) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const [ongoingRoasters, setOngoingRoasters] = useState([]);
  // const [upcomingRoasters, setUpcomingRoasters] = useState([]);
  const [driverRoasterList, setDriverRoasterList] = useState({upcoming: [],onGoing:[], recent:[]})
  const [driverId, setDriverId] = useState('');
  const [driverDetails, setDriverDetails] = useState(null)

  useEffect(() => {
    saveIsLoggedIn();
    getDriverId();
  }, [isLoggedIn]);

  const saveIsLoggedIn = async () => {
    try {
      const loggedIn = await AsyncStorage.getItem('isLoggedIn');
      if (loggedIn !== null && loggedIn === 'true') {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error saving isLoggedIn to AsyncStorage:', error);
    }
  };

  const handleLogin = async () => {
    setIsLoggedIn(true);
    try {
      await AsyncStorage.setItem('isLoggedIn', 'true');
      console.log('isLoggedIn set to true successfully');
    } catch (error) {
      console.error('Error setting isLoggedIn to true:', error);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    AsyncStorage.setItem('isLoggedIn', 'false');
  };

  const getDriverId = async () => {
    const storedOtpResponseData = await AsyncStorage.getItem('otpResponseData');
    if (storedOtpResponseData) {
      const driverId = JSON.parse(storedOtpResponseData);
      const idDriver = driverId?.idDriver;
      const driverdetails = driverId
      setDriverId(idDriver);
      setDriverDetails(driverdetails)
    }
  };

  useEffect(() => {
    if (driverId) {
    getDriverList(driverId);
    }
  }, [driverId]);

  const getDriverList = async (driverId) => {
    try {
      const apiUrl = `${APIS.getDriverRoasterList}/${driverId}`;
      const response = await axios.get(apiUrl);
      const data = response.data;

      // seggerate data based on "roasterStatus"
      let keys = { upcoming: 0,onGoing:1, recent:2}

      let seggerateData = Object
      .entries(keys)
      .reduce((prvObj,[key,value])=>{
        let filterData = data.returnLst.filter(filObj=> filObj.roasterStatus == value)
        return {...prvObj, ...Object.fromEntries([[key, filterData]])}
      },{})
      // console.log("\nseggerateData",JSON.stringify(seggerateData,null,2),"\n")
      setDriverRoasterList(seggerateData)

      // const ongoing = data.returnLst.filter(
      //   roaster => roaster.roasterStatus === 1,
      // );
      // const upcoming = data.returnLst.filter(
      //   roaster => roaster.roasterStatus === 0,
      // );
      // setOngoingRoasters(ongoing);
      // setUpcomingRoasters(upcoming);
      // console.log('Ongoing Roasters:', data);
    } catch (error) {
      console.error('Error fetching driver list:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        selectedItem,
        setSelectedItem,
        isLoggedIn,
        setIsLoggedIn,
        handleLogin,
        handleLogout,
        // ongoingRoasters,
        // upcomingRoasters,
        driverDetails,
        driverRoasterList,
        driverId
      }}>
      {children}
    </AppContext.Provider>
  );
};
