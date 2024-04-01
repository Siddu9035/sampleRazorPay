import {FlatList, StyleSheet, Text, View} from 'react-native';
import React, {useContext, useState} from 'react';
import FontFamily from './Styles/FontFamily';
import {AirbnbRating, Rating} from 'react-native-ratings';
import {AppContext, UpcomingLists} from './Context/AppContext';
import {fontPixel} from './Utils/Dimensions';
import {formatDate} from './Utils/ReusableFunctions';
import {useFocusEffect} from '@react-navigation/native';

const RecentScreen = () => {
  const {
    driverRoasterList: {recent},
  } = useContext(AppContext);

  useFocusEffect(React.useCallback(() => {}, [recent]));

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
    <View style={{flex: 1, backgroundColor: 'rgba(246, 246, 246, 1)'}}>
      {recent.length === 0 ? (
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
          data={recent}
          renderItem={renderItems}
          style={{marginTop: 20}}
        />
      )}
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
