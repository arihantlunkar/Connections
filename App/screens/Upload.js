import React, { useState } from 'react';
import { ScrollView, SafeAreaView, View, StatusBar, Text, Alert, Linking } from 'react-native';
import { Button, Avatar, ProgressBar, Snackbar } from 'react-native-paper';
import DocumentPicker from 'react-native-document-picker'
import AppConstants from '../constants.json'
import AsyncStorage from '@react-native-community/async-storage';

const Upload = () => {
  const SUCCESS_CODE = 3003;
  const UPLOAD_LIMIT_REACHED_CODE = 2005;
  const [snackBarText, setSnackBarText] = useState("");
  const onDismissSnackBar = () => setSnackBarText("");
  const [biodata, setBiodata] = useState(null);
  const [images, setImages] = useState(null);
  const [currentState, updateCurrentState] = useState(0);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [uploadData, updateUploadData] = useState([
    {
      bottomButtonIcon: 'select-drag',
      bottomButtonText: 'Drag Biodata',
      instructions1: 'Step 1 : Browse the biodata you want to upload',
      instructions2: 'Preferable format : *.pdf, *.jpeg, *.png',
      instructions3: 'Max file size allowed is 5 MB.',
      leftIconName: ['file-pdf'],
      rightIconName: ['lock-open-variant'],
      fileName: ['Biodata.pdf'],
      fileSize: ['Max 5 MB'],
      progress: [0],
      isAdded: [false]
    },
    {
      bottomButtonIcon: 'select-multiple',
      bottomButtonText: 'Drag Photos',
      instructions1: 'Step 2 : Upload multiple bride or groom photos',
      instructions2: 'Preferable format : *.jpeg, *.png',
      instructions3: 'Max file size allowed is 5 MB.',
      leftIconName: ['file-pdf', 'image-outline', 'image-outline', 'image-outline', 'image-outline', 'image-outline'],
      rightIconName: ['lock', 'lock-open-variant', 'lock-open-variant', 'lock-open-variant', 'lock-open-variant', 'lock-open-variant'],
      fileName: ['Biodata.pdf', 'Photo1.png', 'Photo2.png', 'Photo3.png', 'Photo4.png', 'Photo5.png'],
      fileSize: ['3.5 MB', 'Max 5 MB', 'Max 5 MB', 'Max 5 MB', 'Max 5 MB', 'Max 5 MB'],
      progress: [0, 0, 0, 0, 0, 0],
      isAdded: [true, false, false, false, false, false]
    },
    {
      bottomButtonIcon: 'upload',
      bottomButtonText: 'Upload',
      leftIconName: ['file-pdf', 'image-outline', 'image-outline', 'image-outline', 'image-outline', 'image-outline'],
      rightIconName: ['lock', 'lock', 'lock', 'lock', 'lock', 'lock'],
      fileName: ['Biodata.pdf', 'Photo1.png', 'Photo2.png', 'Photo3.png', 'Photo4.png', 'Photo5.png'],
      fileSize: ['3.5 MB', 'Max 5 MB', 'Max 5 MB', 'Max 5 MB', 'Max 5 MB', 'Max 5 MB'],
      progress: [0, 0, 0, 0, 0, 0],
      isAdded: [true, true, true, true, true, true],
      instructions1: 'Ready for upload',
      instructions2: 'Files will be sent for review',
      instructions3: 'Biodata : 1, Photo : 5'
    }]);
  
  const pickBiodata = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
      });

      if(null === res[0]) return;

      if(res[0] && res[0].size && res[0].size > 5000000)
      {
        setSnackBarText('Biodata size cannot exceed 5 MB.');
        return;
      }

      setBiodata(res[0]);
      uploadData[currentState+1].fileName[0] = res[0].name;
      uploadData[currentState+1].fileSize[0] = "";
      updateUploadData(uploadData);
      updateCurrentState(1);

    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        setSnackBarText('Biodata selection cancelled.');
      }
    }
  }

  const pickImages = async () => {
    try {
      const res = await DocumentPicker.pickMultiple({
        type: [DocumentPicker.types.images],
        
      });

      if(res.length > 5)
      {
        setSnackBarText('Max 5 photos can be selected.');
        return;
      }

      for(let i = 0; i < res.length; ++i)
      {
        if(res[i] && res[i].size && res[i].size > 5000000)
        {
          setSnackBarText('Image ' + (i+1) + ' size cannot exceed 5 MB.');
          return;
        }
      }
      
      setImages(res);

      uploadData[currentState + 1].fileName[0] = uploadData[1].fileName[0];
      uploadData[currentState + 1].fileSize[0] = uploadData[1].fileSize[0];

      uploadData[currentState + 1].leftIconName = new Array(res.length + 1);
      uploadData[currentState + 1].leftIconName[0] = 'file-pdf';
      
      for(let i = 0; i < res.length; ++i)
      {
        if(res[i] && res[i].name)
        {
          uploadData[currentState + 1].fileName[i+1] = res[i].name;
          uploadData[currentState + 1].fileSize[i+1] = '';
          uploadData[currentState + 1].leftIconName[i+1] = 'image-outline';
        }
      }

      uploadData[currentState + 1].instructions3 = 'Biodata : 1, Photos : ' + res.length;

      updateUploadData(uploadData);
      updateCurrentState(2);

    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        setSnackBarText('Biodata selection cancelled.');
      }
      else {
        setSnackBarText('Unknown error : ' + err);
      }
    }
  };

  const startUpload = async () => {
    AsyncStorage.getItem('FROM_ID').then(val => {
      if(val !== null && val !== undefined)
      {
        uploadData[currentState].instructions1 = 'Upload in progress';
        uploadData[currentState].instructions2 = 'Please wait ...';
        setButtonClicked(true);
        
        const formData = new FormData();
        formData.append('task', 'upload');
        formData.append('fromID', val);
        formData.append('biodata', biodata);
        for(let i = 0; i < images.length; ++i)
        {
          formData.append('picture'+ (i+1), images[i]);
        }

        const xhr = new XMLHttpRequest();
        xhr.onerror = () => { 
          uploadData[currentState].instructions1 = 'Ready for upload';
          uploadData[currentState].instructions2 = 'Files will be sent for review';
          setButtonClicked(false);
          setTimeout(function(){
            setSnackBarText('Upload failure.');
          }, 500);
        };
        xhr.ontimeout = () => {
          uploadData[currentState].instructions1 = 'Ready for upload';
          uploadData[currentState].instructions2 = 'Files will be sent for review';
          setButtonClicked(false);
          setTimeout(function(){
            setSnackBarText('Connection to server timed out.');
          }, 500);
        };
        xhr.onload = () => {
          let jsonResponse = JSON.parse(xhr.response);
          if(null !== jsonResponse && null !== jsonResponse['code'] && SUCCESS_CODE == jsonResponse['code'])
          {
            uploadData[currentState].instructions1 = 'Biodata under screening';
            uploadData[currentState].instructions2 = 'Will take some time to get reflected in the App';
            uploadData[currentState].progress[0] = 100;
            for(let i = 0; i < images.length; ++i)
            {
              uploadData[currentState].progress[i+1] = 100;
            }
            setButtonClicked(true);
            setTimeout(function(){
              setSnackBarText('Upload successful.');
            }, 500);
          }
          else if(null !== jsonResponse && null !== jsonResponse['code'] && UPLOAD_LIMIT_REACHED_CODE == jsonResponse['code'])
          {
            uploadData[currentState].instructions1 = 'Upload limit reached';
            uploadData[currentState].instructions2 = 'Try again in an hour';
            setButtonClicked(true);
            setTimeout(function(){
              setSnackBarText('Upload limit reached.');
            }, 500);
          }
          else
          {
            uploadData[currentState].instructions1 = 'Ready for upload';
            uploadData[currentState].instructions2 = 'Files will be sent for review';
            setButtonClicked(false);
            setTimeout(function(){
              setSnackBarText('Upload failure.');
            }, 500);
          }
        };
        xhr.open('POST', AppConstants.BACKEND_INDEX_URL);
        xhr.setRequestHeader("Content-Type", "multipart/form-data");
        xhr.timeout = 10000;
        xhr.send(formData);
      }
      else {
        setSnackBarText('Upload failure, invalid user.');
      }
    });
  }

  const triggerUpload = async () => {
    AsyncStorage.getItem('TermsAndConditionsAgreed').then(value => {
      if(value == null || value !== 'Yes')
      {
        Alert.alert(
          "Terms and Conditions",
          "By clicking Agree, Connections will receive the information you share and you agree to our Terms. Learn more by reading our Data Use Policy.",
          [,
            { 
              text: "Read Policy", onPress: () => Linking.openURL(AppConstants.TERMS_AND_CONDITIONS_URL)
            },
            { 
              text: "Agree", onPress: () => {
                AsyncStorage.setItem('TermsAndConditionsAgreed', 'Yes');
                startUpload();
              } 
            }
          ],  
          {cancelable: true} 
        );
      } 
      else if(value === 'Yes')
      {
        startUpload();
      }
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar
        animated={true}
        backgroundColor="#000" />
      <View style={{ flex: 1, flexDirection: 'column', backgroundColor: '#fff' }}>
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <ScrollView style={{ flex: 1 }}>
            <View style={{ backgroundColor: '#f1fcfc' }}>
              {
                uploadData[currentState].leftIconName.map((data, index) => (
                  <View style={{ flexDirection: 'row', margin: 15 }} key={index}>
                    <Avatar.Icon icon={uploadData[currentState].leftIconName[index]} color='#fff' style={{ backgroundColor: '#5b8c85', borderRadius: 0 }} />
                    <View style={{ flex: 1, alignSelf: 'center', padding: 15, flexDirection: 'column' }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 4 }}>
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={{ color: '#70757a' }}>{uploadData[currentState].fileName[index].substr(0,25)}</Text>
                          {
                            uploadData[currentState].isAdded[index] ?
                              (<Avatar.Icon icon='check' size={16} color='#fff' style={{ marginStart: 5, backgroundColor: AppConstants.THEME_COLOR, alignSelf: 'center', borderColor: AppConstants.THEME_COLOR }} />)
                              : null
                          }
                        </View>
                        <Text style={{ color: '#70757a' }}>{uploadData[currentState].fileSize[index]}</Text>
                      </View>
                      <ProgressBar progress={uploadData[currentState].progress[index] / 100} color={AppConstants.THEME_COLOR} />
                    </View>
                    <Avatar.Icon icon={uploadData[currentState].rightIconName[index]} size={48} color='#fff' style={{ backgroundColor: '#434e52', alignSelf: 'center', borderColor: AppConstants.THEME_COLOR }} />
                  </View>
                ))}
            </View>
          </ScrollView>
          <View style={{ alignItems: 'center', padding: 15 }}>
            <Text style={{ paddingBottom: 5, color: '#434e52' }}>{uploadData[currentState].instructions1}</Text>
            <Text style={{ color: '#e7b2a5', paddingBottom: 5 }}>{uploadData[currentState].instructions2}</Text>
            <Text style={{ color: '#c4b6b6' }}>{uploadData[currentState].instructions3}</Text>
          </View>
        </View>
        <Button disabled={buttonClicked} icon={uploadData[currentState].bottomButtonIcon} mode="contained" style={{ backgroundColor: AppConstants.THEME_COLOR, borderRadius: 0, height: 48, justifyContent: 'center' }} uppercase={false} 
        onPress={() => {
            0 == currentState ? pickBiodata() : (1 == currentState ? pickImages() : triggerUpload())
          }}>
          {uploadData[currentState].bottomButtonText}
        </Button>
        <Snackbar
          visible={snackBarText.length != 0}
          onDismiss={onDismissSnackBar}
          action={{
            label: 'Ok'
          }}>
          {snackBarText}
        </Snackbar>
      </View>
    </SafeAreaView>
  );
};

export default Upload;
