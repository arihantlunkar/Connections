import React, { useState, useEffect } from 'react';
import { TouchableOpacity, ScrollView, SafeAreaView, View, StatusBar, Text } from 'react-native';
import { Button } from 'react-native-paper';
import CheckBox from 'react-native-check-box'
import AppConstants from '../constants.json'

const Filter = ({route, navigation}) => {
  const [filterHardcodedData, updateFilterHardcodedData] = useState(route.params['filterHardcodedData']);

  const isSomeFilterSelected = () => {
    for (let i = 0; i < filterHardcodedData.length; ++i) {
      if(filterHardcodedData[i].selectedCount > 0)
          return true;
    } 
    return false;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar
        animated={true}
        backgroundColor="#000" />
      <View style={{ flexDirection: 'column' }}>
        <View style={{ flexDirection: 'row', height: '100%' }}>
          <View style={{ backgroundColor: '#f3f3f3', flex: 1 }}>
            <ScrollView>
              {
                filterHardcodedData.map((data, index) => (
                  <TouchableOpacity key={index} style={{ flexDirection: 'row', padding: 15, alignItems: 'flex-start', backgroundColor: data.isPressed ? '#fff' : '#f3f3f3' }} onPress={() => {
                    for (let i = 0; i < filterHardcodedData.length; ++i) {
                      filterHardcodedData[i].isPressed = (i == index);
                    }
                    updateFilterHardcodedData([...filterHardcodedData])
                  }}>
                    <Text style={{ alignItems: 'flex-start', flex: 3 }}>{data.filterBy}</Text>
                    {
                      0 == data.selectedCount ? (null) : (
                        <View style={{ alignItems: 'flex-end', flex: 1 }}>
                          <Text style={{ color: '#00af91' }}>{data.selectedCount}</Text>
                        </View>
                      )
                    }
                  </TouchableOpacity>
                ))
              }
            </ScrollView>
          </View>
          <View style={{ backgroundColor: '#fff', flex: 2, padding: 15 }}>
            <ScrollView>
              {
                filterHardcodedData.map((data, index) => {
                  if (null != data && null != data.values && data.isPressed) {
                    return data.values.map((text, index) => (
                      <CheckBox
                        key={index}
                        style={{ paddingBottom: 15 }}
                        rightTextStyle={{ paddingLeft: 2 }}
                        onClick={() => {
                          data.isChecked[index] = !data.isChecked[index];
                          data.selectedCount = data.isChecked[index] ? data.selectedCount + 1 : data.selectedCount - 1;
                          updateFilterHardcodedData([...filterHardcodedData])
                        }}
                        isChecked={data.isChecked[index]}
                        rightText={text}
                        checkedCheckBoxColor={AppConstants.THEME_COLOR}
                      />
                    ))
                  }
                })
              }
            </ScrollView>
          </View>
        </View>
        <View style={{ position: 'absolute', bottom: 0, flexDirection: 'row', padding: 15, backgroundColor: '#fff', elevation: 15 }}>
          {
            !isSomeFilterSelected() ? 
            <View style={{ flex: 1, alignItems: 'flex-start', flexDirection: 'column' }}>
              <Text style={{ fontWeight: 'bold' }}>No Selection</Text>
              <Text>All Profiles Will Be Shown</Text>
            </View> : null
          }
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <View style={{ flexDirection: 'row' }}>
              <Button mode="contained" style={{ backgroundColor: '#00af91', borderRadius: 0, marginEnd: 15 }} uppercase={false} onPress={() => {
                for (let i = 0; i < filterHardcodedData.length; ++i) {
                  filterHardcodedData[i].isChecked = [];
                  filterHardcodedData[i].selectedCount = 0;
                }
                updateFilterHardcodedData([...filterHardcodedData])
              }}>Clear
              </Button>
              <Button mode="contained" style={{ backgroundColor: '#00af91', borderRadius: 0 }} uppercase={false} onPress={() => {
                route.params.callback();
                navigation.navigate('Home');
              }}>Apply
              </Button>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Filter;
