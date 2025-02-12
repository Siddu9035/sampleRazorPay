import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useContext, useState} from 'react';
import FontFamily from './Styles/FontFamily';
import {AirbnbRating, Rating} from 'react-native-ratings';
import {AppContext} from './Context/AppContext';
import {fontPixel} from './Utils/Dimensions';
import {formatDate} from './Utils/ReusableFunctions';
import {useFocusEffect} from '@react-navigation/native';
import Loader from './Components/Loader';

const RecentScreen = () => {
  const [loader, setLoader] = useState(true);
  const {driverRoasterList, getDriverList, driverId} = useContext(AppContext);
  // const [visibleData, setVisibleData] = useState([]);
  // console.log('🚀 ~ RecentScreen ~ visibleData:', visibleData.length);
  // const [page, setPage] = useState(1);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [driverId]),
  );
  const loadData = async () => {
    setLoader(true);
    await getDriverList(driverId);
    setLoader(false);
  };

  // const loadMoreData = () => {
  //   setLoader(true);
  //   console.log('===>>>>');
  //   const itemsPerPage = 10;
  //   const startIndex = (page - 1) * itemsPerPage;
  //   const endIndex = startIndex + itemsPerPage;
  //   const nextItems = driverRoasterList?.recent.slice(startIndex, endIndex);
  //   if (nextItems.length > 0) {
  //     setVisibleData([...visibleData, ...nextItems]);
  //     setPage(page + 1);
  //   } else {
  //     setLoader(false);
  //   }
  // };

  const renderItems = ({item, index}) => {
    return (
      <View style={{marginVertical: 10, marginHorizontal: 20}}>
        <Text style={styles.ticketNoText}>
          {`Ticket no. - ${item?.idRoaster}`}
        </Text>
        <Text style={styles.dateAndTimeText}>
          {`Date: ${formatDate(item?.roasterDate)}`}
        </Text>
        <Text style={styles.dbTestText}>{`${item?.fleetAgencyName}`}</Text>
        <View style={styles.rateing}>
          <Text style={styles.rateingText}>OR O5 1234</Text>
          <Rating
            type="star"
            tintColor="#F6F6F6"
            // ratingImage={require('../assets/images/star.png')}
            ratingBackgroundColor="white"
            ratingColor="#C5197D"
            ratingCount={5}
            imageSize={18}
            fractions={1}
            jumpValue={0.5}
            startingValue={4.5}
            readonly
          />
        </View>
      </View>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'rgba(246, 246, 246, 1)',
        justifyContent:
          driverRoasterList?.recent.length === 0 ? 'center' : null,
      }}>
      {driverRoasterList?.recent.length === 0 ? (
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <Text
            style={{
              fontFamily: FontFamily.medium,
              fontSize: fontPixel(18),
              color: 'black',
            }}>
            No Recent Trips
          </Text>
        </View>
      ) : (
        <FlatList
          data={driverRoasterList?.recent}
          renderItem={renderItems}
          // onEndReached={loadMoreData}
          // onEndReachedThreshold={0.8}
          showsVerticalScrollIndicator={false}
          style={{marginTop: 20}}
        />
      )}
      {loader && <Loader />}
    </View>
  );
};

export default RecentScreen;

const styles = StyleSheet.create({
  ticketNoText: {
    color: 'black',
    fontSize: fontPixel(19),
    fontFamily: FontFamily.semiBold,
  },
  dateAndTimeText: {
    color: 'black',
    marginTop: 8,
    fontSize: fontPixel(14),
    fontFamily: FontFamily.regular,
  },
  dbTestText: {
    color: 'black',
    marginTop: 8,
    fontSize: fontPixel(14),
    fontFamily: FontFamily.regular,
  },
  rateing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateingText: {
    color: 'black',
    marginTop: 8,
    fontSize: fontPixel(14),
    fontFamily: FontFamily.regular,
  },
});
