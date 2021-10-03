import React, { useState, useEffect } from 'react';
import { SafeAreaView, RefreshControl, StatusBar, Text, View, FlatList, Linking, Dimensions, Alert, BackHandler} from 'react-native';
import { SearchBar } from 'react-native-elements';
import { FAB, Snackbar } from 'react-native-paper';
import { MenuProvider, Menu, MenuOptions, MenuOption, MenuTrigger  } from 'react-native-popup-menu';
import { Icon } from 'react-native-elements'
import AppConstants from '../constants.json'
import Card from './Card'
import AsyncStorage from '@react-native-community/async-storage';
import { LoginManager } from 'react-native-fbsdk';


const Home = ({route, navigation}) => {
  
  const SUCCESS_CODE = 3003;
  const [showLoading, setShowLoading] = useState(true);
  const [filterHardcodedData, setFilterHardcodedData] = useState([]);
  const [data, setData] = useState([]);
  const [dataAfterSearch, setSearchData] = useState([]);
  const [dataAfterFilter, setFilterData] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentCardIndexAfterFilter, setCurrentCardIndexAfterFilter] = useState(0);
  const [snackBarText, setSnackBarText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { width, height } = Dimensions.get('window');

  const getFilterHardcodedData = () => {
    setShowLoading(true);
    const xhr = new XMLHttpRequest();
    xhr.onerror = () => {
      setSnackBarText('Error occured at server.');
      setShowLoading(false);
    };
    xhr.ontimeout = () => {
      setSnackBarText('Connection to server timed out.');
      setShowLoading(false);
    };
    xhr.onload = () => {
      const jsonResponse = JSON.parse(xhr.response);
      if(null !== jsonResponse && null !== jsonResponse['visibleOnUI'] && 0 !== jsonResponse['visibleOnUI'].length)
      {
        for(let i=0; i<jsonResponse['visibleOnUI'].length; ++i)
        {
          if(null !== jsonResponse['visibleOnUI'][i])
          {
            let filterBy = jsonResponse['visibleOnUI'][i].split(',')[1];
            let filterVariableName = jsonResponse['visibleOnUI'][i].split(',')[0];
            if(null !== jsonResponse[filterVariableName] && -1 === filterHardcodedData.findIndex(function(post, index) {
              if(post.filterBy == filterBy)
                return true;
            }))
            {
              filterHardcodedData.push({
                filterBy: filterBy,
                selectedCount: 0,
                values: jsonResponse[filterVariableName],
                isChecked: [],
                isPressed: i == 0
              });
            }
          }
        }
        setFilterHardcodedData([...filterHardcodedData]);
      }
      setShowLoading(false);
    };
    xhr.open('GET', AppConstants.BACKEND_HARDCODED_FILTERDATA_URL + '?' + Math.random().toString(36).slice(2) /*to avoid cache*/);
    xhr.timeout = 5000;
    xhr.send();
  };

  const getData = async () => {
    setShowLoading(true);
    const formData = new FormData();
    formData.append('task', 'display');
    formData.append('currentPosition', currentCardIndex);
    const xhr = new XMLHttpRequest();
    xhr.onerror = () => {
      setSnackBarText('Error occured at server.');
      setShowLoading(false);
    };
    xhr.ontimeout = () => {
      setSnackBarText('Connection to server timed out.');
      setShowLoading(false);
    };
    xhr.onload = async () => {
      const jsonResponse = JSON.parse(xhr.response);
      if(null !== jsonResponse && null !== jsonResponse['code'] && SUCCESS_CODE == jsonResponse['code'] && 
      null !== jsonResponse['data'] && 0 != jsonResponse['data'].length)
      {
        for(let i = 0; i < jsonResponse['data'].length; ++i)
        {
          if(null !== jsonResponse['data'][i] && 
          null !== jsonResponse['data'][i]['image1Link'] && 
          null !== jsonResponse['data'][i]['name'] && 
          null !== jsonResponse['data'][i]['age'] && 
          null !== jsonResponse['data'][i]['height'] && 
          null !== jsonResponse['data'][i]['educations'] && 
          null !== jsonResponse['data'][i]['profession'] && 
          null !== jsonResponse['data'][i]['additionalDetails'] && 
          null !== jsonResponse['data'][i]['place'] && 
          null !== jsonResponse['data'][i]['lookingFor'] && 
          null !== jsonResponse['data'][i]['biodataLink'] && 
          null !== jsonResponse['data'][i]['id'] )
          {
            data.push({
              key: currentCardIndex + i, 
              imageUrl: AppConstants.BACKEND_PATH + jsonResponse['data'][i]['image1Link'],
              text1: jsonResponse['data'][i]['name'],
              text2: jsonResponse['data'][i]['age'] + ' yrs, ' + jsonResponse['data'][i]['height'],
              text3: jsonResponse['data'][i]['educations'].split(',').join(', '),
              text4: jsonResponse['data'][i]['profession'],
              text5: jsonResponse['data'][i]['additionalDetails'],
              text6: jsonResponse['data'][i]['place'],
              color:  jsonResponse['data'][i]['lookingFor'] === 'Bride' ? '#4285f4' : '#fbbc05',
              option1Text : 'Download Biodata',
              onImgClickCallback: () => {
                navigation.navigate('ImageSlider', jsonResponse['data'][i]);
              },
              option1ClickCallback: () => {
                AsyncStorage.getItem('FROM_ID').then(val => {
                  if(val !== null && val !== undefined)
                  {
                    AsyncStorage.getItem(val+"_DownloadCount").then(value => {
                      if(value !== null && value !== undefined)
                      {
                        const downloadedIds = value.split(',')[2];
                        const isAlreadyDownloaded = downloadedIds.split(':').indexOf(jsonResponse['data'][i]['id']);
                        if(-1 === isAlreadyDownloaded)
                        {
                          const today = new Date(Date.now()); 
                          const counter = parseInt(value.split(',')[1]);
                          if(counter < AppConstants.DOWNLOAD_LIMIT)
                          {
                            AsyncStorage.setItem(val+"_DownloadCount", today + ',' + parseInt(counter + 1) + ',' + downloadedIds + ':' + jsonResponse['data'][i]['id']);
                            Linking.openURL(AppConstants.BACKEND_PATH + jsonResponse['data'][i]['biodataLink']);
                          }
                          else
                          {
                            const lastTimeStored = new Date(value.split(',')[0]);
                            const noOfDaysSinceLastDownload = Math.abs(today - lastTimeStored) / (1000 * 3600 * 24);
                            if(noOfDaysSinceLastDownload > 1)
                            {
                              AsyncStorage.setItem(val+"_DownloadCount", today + ',1,' + jsonResponse['data'][i]['id']);
                              Linking.openURL(AppConstants.BACKEND_PATH + jsonResponse['data'][i]['biodataLink']);
                            }
                            else
                            {
                              //Limit exceeded
                              Alert.alert(
                                "Limit Exceeded",
                                "Downloaded limit reached for today, try again tomorrow.",
                                [,
                                  { 
                                    text: "Ok", onPress: () => {}
                                  }
                                ],  
                                {cancelable: true} 
                              );
                            }
                          }
                        }
                        else
                        {
                          Linking.openURL(AppConstants.BACKEND_PATH + jsonResponse['data'][i]['biodataLink']);
                        }
                      }
                      else
                      {
                        const today = new Date(Date.now()); 
                        AsyncStorage.setItem(val+"_DownloadCount", today + ',1,' + jsonResponse['data'][i]['id']);
                        Linking.openURL(AppConstants.BACKEND_PATH + jsonResponse['data'][i]['biodataLink']);
                      }
                    });
                  }
                })
              },
            });
          }
        }
        setData([...data]);
        setCurrentCardIndex(currentCardIndex + jsonResponse['data'].length);
      }
      setShowLoading(false);
    };
    xhr.open('POST', AppConstants.BACKEND_INDEX_URL);
    xhr.setRequestHeader('Content-Type', 'multipart/form-data');
    xhr.timeout = 5000;
    xhr.send(formData);
  };

  const onChangeSearch = query => {
    if(0 === query.length)
    {
      setSearchQuery(query);
      setSearchData([]);
      return;
    }
    setShowLoading(true);
    setSearchQuery(query);
    const queryToLowerCase = query.toLowerCase();
    const originalData = isSomeFilterSelected() ? [...dataAfterFilter] :  [...data];
    setSearchData(originalData.filter(element =>
      element.text1.toLowerCase().includes(queryToLowerCase) ||
      element.text2.toLowerCase().includes(queryToLowerCase) ||
      element.text3.toLowerCase().includes(queryToLowerCase) ||
      element.text4.toLowerCase().includes(queryToLowerCase) ||
      element.text5.toLowerCase().includes(queryToLowerCase) ||
      element.text6.toLowerCase().includes(queryToLowerCase)));
    setShowLoading(false);
  }
  
  const onDismissSnackBar = () => setSnackBarText('');

  const renderCard = ({ item }) => (
    <Card data={item} />
  );

  const isSomeFilterSelected = () => {
    for (let i = 0; i < filterHardcodedData.length; ++i) {
      if(filterHardcodedData[i].selectedCount > 0)
          return true;
    } 
    return false;
  }

  const getDataBasedOnFilter = async (i) => {
    if(!isSomeFilterSelected())
    {
      setCurrentCardIndexAfterFilter(0);
      setFilterData([]);
      return;
    }
    setShowLoading(true);
    let index = currentCardIndexAfterFilter;
    if(0 == i)
    {
      index = 0;
      dataAfterFilter.splice(0, dataAfterFilter.length);
    }
    const formData = new FormData();
    formData.append('task', 'filter');
    formData.append('currentPosition', index);
    for (let i = 0; i < filterHardcodedData.length; ++i) {
      if(filterHardcodedData[i].selectedCount > 0)
      {
        const selectedFilterValues = [];
        for (let j = 0; j < filterHardcodedData[i].isChecked.length; ++j) 
        {
          if(undefined !== filterHardcodedData[i].isChecked[j] && null !== filterHardcodedData[i].isChecked[j] && filterHardcodedData[i].isChecked[j]
          && undefined !== filterHardcodedData[i].values[j] && null !== filterHardcodedData[i].values[j])
          {
            selectedFilterValues.push(filterHardcodedData[i].values[j]);
          }
        }
        selectedFilterValues.forEach(tag => formData.append(filterHardcodedData[i].filterBy + '[]', tag));
      }
    } 
    const xhr = new XMLHttpRequest();
    xhr.onerror = () => {
      setSnackBarText('Error occured at server.');
      setShowLoading(false);
    };
    xhr.ontimeout = () => {
      setSnackBarText('Connection to server timed out.');
      setShowLoading(false);
    };
    xhr.onload = async () => {
      const jsonResponse = JSON.parse(xhr.response);
      if(null !== jsonResponse && null !== jsonResponse['code'] && SUCCESS_CODE == jsonResponse['code'] && 
      null !== jsonResponse['data'] && 0 != jsonResponse['data'].length)
      {
        for(let i = 0; i < jsonResponse['data'].length; ++i)
        {
          if(null !== jsonResponse['data'][i] && 
          null !== jsonResponse['data'][i]['image1Link'] && 
          null !== jsonResponse['data'][i]['name'] && 
          null !== jsonResponse['data'][i]['age'] && 
          null !== jsonResponse['data'][i]['height'] && 
          null !== jsonResponse['data'][i]['educations'] && 
          null !== jsonResponse['data'][i]['profession'] && 
          null !== jsonResponse['data'][i]['additionalDetails'] && 
          null !== jsonResponse['data'][i]['place'] && 
          null !== jsonResponse['data'][i]['lookingFor'] && 
          null !== jsonResponse['data'][i]['biodataLink'])
          {
            dataAfterFilter.push({
              key: index + i, 
              imageUrl: AppConstants.BACKEND_PATH + jsonResponse['data'][i]['image1Link'],
              text1: jsonResponse['data'][i]['name'],
              text2: jsonResponse['data'][i]['age'] + ' yrs, ' + jsonResponse['data'][i]['height'],
              text3: jsonResponse['data'][i]['educations'].split(',').join(', '),
              text4: jsonResponse['data'][i]['profession'],
              text5: jsonResponse['data'][i]['additionalDetails'],
              text6: jsonResponse['data'][i]['place'],
              color:  jsonResponse['data'][i]['lookingFor'] === 'Bride' ? '#4285f4' : '#fbbc05',
              option1Text : 'Download Biodata',
              onImgClickCallback: () => {
                navigation.navigate('ImageSlider', jsonResponse['data'][i]);
              },
              option1ClickCallback: () => {
                AsyncStorage.getItem('FROM_ID').then(val => {
                  if(val !== null && val !== undefined)
                  {
                    AsyncStorage.getItem(val+"_DownloadCount").then(value => {
                      if(value !== null && value !== undefined)
                      {
                        const downloadedIds = value.split(',')[2];
                        const isAlreadyDownloaded = downloadedIds.split(':').indexOf(jsonResponse['data'][i]['id']);
                        if(-1 === isAlreadyDownloaded)
                        {
                          const today = new Date(Date.now()); 
                          const counter = parseInt(value.split(',')[1]);
                          if(counter < AppConstants.DOWNLOAD_LIMIT)
                          {
                            AsyncStorage.setItem(val+"_DownloadCount", today + ',' + parseInt(counter + 1) + ',' + downloadedIds + ':' + jsonResponse['data'][i]['id']);
                            Linking.openURL(AppConstants.BACKEND_PATH + jsonResponse['data'][i]['biodataLink']);
                          }
                          else
                          {
                            const lastTimeStored = new Date(value.split(',')[0]);
                            const noOfDaysSinceLastDownload = Math.abs(today - lastTimeStored) / (1000 * 3600 * 24);
                            if(noOfDaysSinceLastDownload > 1)
                            {
                              AsyncStorage.setItem(val+"_DownloadCount", today + ',1,' + jsonResponse['data'][i]['id']);
                              Linking.openURL(AppConstants.BACKEND_PATH + jsonResponse['data'][i]['biodataLink']);
                            }
                            else
                            {
                              //Limit exceeded
                              Alert.alert(
                                "Limit Exceeded",
                                "Downloaded limit reached for today, try again tomorrow.",
                                [,
                                  { 
                                    text: "Ok", onPress: () => {}
                                  }
                                ],  
                                {cancelable: true} 
                              );
                            }
                          }
                        }
                        else
                        {
                          Linking.openURL(AppConstants.BACKEND_PATH + jsonResponse['data'][i]['biodataLink']);
                        }
                      }
                      else
                      {
                        const today = new Date(Date.now()); 
                        AsyncStorage.setItem(val+"_DownloadCount", today + ',1,' + jsonResponse['data'][i]['id']);
                        Linking.openURL(AppConstants.BACKEND_PATH + jsonResponse['data'][i]['biodataLink']);
                      }
                    });
                  }
                });
              }
            });
          }
        }
        setFilterData([...dataAfterFilter]);
        setCurrentCardIndexAfterFilter(index + jsonResponse['data'].length);
      }
      setShowLoading(false);
    };
    xhr.open('POST', AppConstants.BACKEND_INDEX_URL);
    xhr.setRequestHeader('Content-Type', 'multipart/form-data');
    xhr.timeout = 5000;
    xhr.send(formData);
  }

  useEffect(async () => {
    getData();
    getFilterHardcodedData();

    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if(1 != navigation.getState()["index"]) return false;// If not home
      return true;
    });

    return () => backHandler.remove();
  }, []);

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: '#fff',
    }}>
      <MenuProvider>
        <StatusBar
          animated={true}
          backgroundColor='#000' />

        <View style={{flexDirection:'row'}}>
          <SearchBar
            leftIconContainerStyle={{ backgroundColor: '#fff' }}
            rightIconContainerStyle={{ backgroundColor: '#fff' }}
            inputContainerStyle={{ backgroundColor: '#fff' }}
            containerStyle={{
              backgroundColor: '#fff',
              borderBottomColor: '#fff',
              borderTopColor: 'transparent',
              flex: 0.9*width
            }}
            inputStyle={{ color: '#000' }}
            searchIcon={{ color: '#000' }}
            placeholderTextColor={'#000'}
            clearIcon={{ color: '#000' }}
            placeholder='Search'
            onChangeText={onChangeSearch}
            value={searchQuery}
            showLoading={showLoading}
          />
          <View style={{flex:0.1*width, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center'}}>
            <Menu>
                <MenuTrigger>
                    <Icon name={'logout'} color={'#000'} size={32} />
                </MenuTrigger>
                <MenuOptions >
                    <MenuOption text={'Logout'} onSelect={() => {
                      LoginManager.logOut();
                      navigation.navigate('Login');
                    }} />
                </MenuOptions>
            </Menu>
          </View>
        </View>
        { 
          (null != dataAfterSearch && 0 != dataAfterSearch.length && 0 !== searchQuery.length) ? <FlatList data={dataAfterSearch} renderItem={renderCard} keyExtractor={item => item.key}/> : (
          (null != dataAfterFilter && 0 != dataAfterFilter.length && 0 === searchQuery.length && isSomeFilterSelected()) ? <FlatList onEndReached={getDataBasedOnFilter} onEndReachedThreshold={.8} data={dataAfterFilter} renderItem={renderCard} keyExtractor={item => item.key}/> : (
          (null != data && 0 != data.length && 0 === searchQuery.length && !isSomeFilterSelected()) ? <FlatList onEndReached={getData} onEndReachedThreshold={.8} data={data} renderItem={renderCard} keyExtractor={item => item.key}/> : 
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#000' }}>No Results Found.</Text></View>))
        }
        {
          (null !== filterHardcodedData && 0 !== filterHardcodedData.length) ?  
          <FAB
            style={{
              position: 'absolute',
              margin: 16,
              marginBottom:80,
              right: 0,
              bottom: 0,
              backgroundColor: '#00af91'
            }}
            small={false}
            icon='filter'
            color={'#fff'}
            onPress={() => {
              for (let i = 0; i < filterHardcodedData.length; ++i) {
                filterHardcodedData[i].isPressed = false;
              }
              filterHardcodedData[0].isPressed = true;
              navigation.navigate('Filter', {filterHardcodedData, callback : () => getDataBasedOnFilter(0)})
            }}
          /> : null
        }
        
        <FAB
          style={{
            position: 'absolute',
            margin: 16,
            right: 0,
            bottom: 0,
            backgroundColor: '#00af91'
          }}
          small={false}
          icon='plus'
          color={'#fff'}
          onPress={() => navigation.navigate('Upload')}
        />
        <Snackbar
          visible={snackBarText.length != 0}
          onDismiss={onDismissSnackBar}
          action={{
            label: 'Ok'
          }}>
          {snackBarText}
        </Snackbar>
      </MenuProvider>
    </SafeAreaView>
  );
};

export default Home;
