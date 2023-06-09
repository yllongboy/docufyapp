import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import CryptoJS from "crypto-js";
import Constants from 'expo-constants';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import LottieView from 'lottie-react-native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Dimensions, Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeftIcon, DocumentIcon } from 'react-native-heroicons/solid';
import ImageResizer from 'react-native-image-resizer';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Button, Modal, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import uuid from 'uuid/v4';
import Util from '../common/Util';
import Firebase from '../config/Firebase';

const firestore = Firebase.firestore();
const storage = Firebase.storage();
let imgResp = null;
let uploadTask = null;
let itemsRef = null;
let notifRef = null;
let appSettings = null;
let approver = null;

const UploadScreen = () => {

    const SELECT_CATEGORY_LBL = '--Select a Category--';
    const navigation = useNavigation();
    const [selectedFile, setSelectedFile] = useState();
    const [selectedImage, setSelectedImage] = useState();
    const [selectedCategory, setSelectedCategory] = useState();
    const [fileName, setFileName] = useState();
    const [category, setCategory] = useState([]);
    const [visible, setVisible] = useState();
    const [msg, setMsg] = useState();
    const [isError, setIsError] = useState();
    const [isSuccess, setIsSuccess] = useState();
    const [multipleApprover, setMultipleApprover] = useState();
    const [approverIdList, setApproverIdList] = useState();
    const [caseIDArr, setCaseIDArr] = useState([]);
  
    const showModal = () => setVisible(true);
    const hideModal = () => {
      setVisible(false);
      if(isSuccess) navigation.navigate('Home', {});
    };
    const containerStyle = {backgroundColor: 'white', padding: 20, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', borderRadius: 5, width: Dimensions.get('window').width * 0.90};
    
    let catRef = null;
    let uploading = false;
    
    useLayoutEffect(() => {
      navigation.setOptions({
        headerShown: false
      })
    }, []);

    useEffect(() => {

      catRef = firestore.collection(`${Util.subDomain}_categories`);
      itemsRef = firestore.collection(`${Util.subDomain}_pendingreview`);
      notifRef = firestore.collection(`${Util.subDomain}_notifications`);
      appSettings = firestore.collection(`${Util.subDomain}_appsettings`);
    
      const categoryList = [];
      catRef.orderBy('date', 'desc').get().then(data => {
        if(data && data.size > 0) {
          data.forEach(e=>{
            categoryList.push(
              {
                label: e.data().name,
                value: e.data().identifier
              }
            )
          })
        }
      }).then(()=> {
        setCategory(categoryList);
      });

      appSettings.where("type", "==", "approverSettings").get().then(res => {
        if(res && res.docs && res.docs.length > 0 && res.docs[0].data().hasMultipleApprover == true){
          let approverIDs = [];
          let appList = res.docs[0].data().approvers;
          appList.forEach((app) => {
            approverIDs.push(app.userID)
          })
          setMultipleApprover(true);
          setApproverIdList(approverIDs);
        }else{
          let arrayData = [];
          let ref = firestore.collection(`${Util.subDomain}_users`).where('roles.approver','==', true).get();
          ref.then( (res) => {
            res.forEach((d) => {
              arrayData.push(d.data())
            });
            let aprvr = arrayData[Math.floor(Math.random() * arrayData.length)];
            let myApp = [];
            myApp.push(aprvr.uid)
            approver = myApp;
            setMultipleApprover(false);
            setApproverIdList(myApp);
          })
        }
      });

      _retrieveLocalData();

    }, []);
    
  const renderCategoryList = () => {
    return category?.map((item, index) => {
        return (<Picker.Item label={item.label} value={item.value} key={index}/>) 
    });
  }

  const _retrieveLocalData = async () => {
    let myCaseIDs = [];
    try {
      let caseIDList = await AsyncStorage.getItem('caseID');
      caseIDList = JSON.parse(caseIDList)
      if (caseIDList) {
        caseIDList.forEach(item => {
          myCaseIDs.push(item)
        })
        if(!caseIDList.includes(Util.claimantCaseID)){
          myCaseIDs.push(Util.claimantCaseID)
        }
      }else{
        myCaseIDs.push(Util.claimantCaseID)
      }
      setCaseIDArr(myCaseIDs);
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * Select image method
   */
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    console.log(result);

    imgResp = result;
    if (!result.cancelled) {
      return result;
    }

    return null;
  };


  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({});
    console.log(result.uri);
    console.log(result);

    imgResp = result;
    if (!result.cancelled) {
      return result;
    }

    return null;
  };


  // to move to a different file
  const updatePendingReviewDocs = (uid, data, newDoc) => {
    let reasonArr = [];
    if(data.docs) reasonArr = reasonArr.concat(data.docs)
    reasonArr.push(newDoc)

    let tokenArr = [];
    // push notifications removed. to revisit implementation.
    // if(data.deviceTokens) tokenArr = tokenArr.concat(data.deviceTokens)
    // if(!tokenArr.includes(this.props.token)) tokenArr.push(this.props.token)
    let appr = data.approvers ? data.approvers : approverIdList;

    itemsRef.doc(uid).set(
      { 
        docs: reasonArr,
        status: 'PENDING',
        approver: appr[0],
        deviceTokens: tokenArr,
        multipleApprover: false,
        approvers: [appr[0]]
      },
      { merge: true }
    ).then(e => {
      console.log('updatePendingReviewDocs: ', e)
      createNotification()
    }).catch(e=>{
      console.error('updatePendingReviewDocs err', e)
    })
  };

  const sendForReview = (caseID, newDoc) => {
    itemsRef.where('caseID', '==', caseID).limit(1).get().then((data) => {
      if(data && data.size > 0) {
        data.forEach( doc => {
          updatePendingReviewDocs(doc.id, doc.data(), newDoc);
        });
      }
    }).catch(e=>{
      console.log('sendForReview error'+e)
    })
  };

  const createNotification = () => {
    let approvers = [];

    if(multipleApprover){
      approvers.push(approverIdList[0]);
    }else{
      approvers.push(approver[0])
    }

      let data = {
        uid: approvers,
        type: 'applicationUpdate',
        dateCreated: new Date(),
        info: {
          caseID: Util.claimantCaseID
        },
        unread: true, 
        url: '/pages/workflows'
      };

      notifRef.add(data).then(res => {
        console.log("success", res)
      }).catch(err => {
        console.log("Error", err)
      });
  }

  /**
   * Upload image method
   */
  const uploadImage = async () => {

    console.log('new file name: ' + fileName);
    if(Platform.OS == 'web') {
      setMsg('Encrypting Web file...')
      uploadFileForWeb(imgResp.uri, fileName, imgResp.size || imgResp.fileSize);
    } else {
      fileURL_to_blob(imgResp.uri).then(e => {
        setMsg('Encrypting file...')
        uploadFile(e, fileName, imgResp.size || imgResp.fileSize);
      }).catch(e => {
        console.log('uploadImage' + e);
      })
    }
    

  };

  const reduceFileSize = () =>{
    console.log('Reducing file size for file: ' + imgResp?.uri);
    let newHeight = imgResp.height ? imgResp.height * .75 : 1000;
    let newWidth = imgResp.width ? imgResp.width * .75 : 750;
    let ext = imgResp.fileName ? imgResp.fileName.split('.').pop() : imgResp.name ? imgResp.name.split('.').pop() : imgResp.uri.split('.').pop();
    let newExt = (ext == 'png') ? 'PNG' : 'JPEG'
    
    ImageResizer.createResizedImage(imgResp.uri, newWidth, newHeight, newExt, 100)
      .then(response => {
        imgResp = response;
        let fsize = imgResp.size / 1048576;
        fsize = fsize.toFixed(2)
        if(fsize > 3){
          reduceFileSize()
        }else{
          uploadImage()
        }
      })
      .catch(err => {
        console.log(err)
      });
  }

  const uploadFile = async (base64File, fname, fsize) => {
    const filename = `${uuid()}`; // Generate unique name
    let fileLoc = `beamo/docufy/${Util.subDomain}/docs/${Util.claimantCaseID}/${filename}`;
    let ciphertext = CryptoJS.AES.encrypt(base64File, Constants.manifest.extra.encKey).toString();
    let ext = fname ? fname.split('.').pop() : 'png';

    console.log('Saving at Storage Location: ' + fileLoc);
    const gifDir = FileSystem.cacheDirectory + 'docufy/';
    const gifFileUri = () => gifDir + `file.encrypted`;

    const dirInfo = await FileSystem.getInfoAsync(gifDir);
    if (!dirInfo.exists) {
      console.log("directory doesn't exist, creating...");
      await FileSystem.makeDirectoryAsync(gifDir, { intermediates: true });
    }

    FileSystem.writeAsStringAsync(gifFileUri(), ciphertext).then(e => {
      uploadFinal(gifFileUri(), fsize, filename, fileLoc, ext, fname);
    }).catch(e => {
      console.log('uploadFile->' + e)
    })
    
  }

  const uploadFileForWeb = async (base64File, fname, fsize) => {
    const filename = `${uuid()}`; // Generate unique name
    let fileLoc = `beamo/docufy/${Util.subDomain}/docs/${Util.claimantCaseID}/${filename}`;
    let ciphertext = CryptoJS.AES.encrypt(base64File, Constants.manifest.extra.encKey).toString();
    let ext = fname ? fname.split('.').pop() : 'png';

    console.log('Saving at Storage Location: ' + fileLoc);
    const useBase64 = true;
    uploadFinal(ciphertext, fsize, filename, fileLoc, ext, fname, useBase64);
  }

  const uploadFinal = async(path, fsize, filename, fileLoc, ext, fname, useBase64 = false) => {

    console.log('uploading final');
    let fileInfo;
    if(!useBase64) {
      fileInfo = await FileSystem.getInfoAsync(path);
      console.log(fileInfo.exists);
    }
    
    if(useBase64 || fileInfo.exists) {
      setMsg('Uploading File...');
      uploadTask = storage.ref(fileLoc).put(path)

      uploadTask.on('state_changed', (snapshot) => {
          
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done')
        
        },
        (error) => {
          setMsg('Error occurred while uploading to storage.');
          setIsSuccess(false);
          if(!useBase64) FileSystem.deleteAsync(fileInfo);
        },
        (success) => {

          let newDoc = {
            name: filename,
            location: fileLoc,
            dateSubmitted: new Date(),
            category: selectedCategory,
            friendlyName: fname
          }
          console.log('Storing info: ' + JSON.stringify(newDoc));
          sendForReview(Util.claimantCaseID, newDoc);
          setMsg('Successfully Uploaded File and waiting for approval.');
          setIsSuccess(true);
          // to save to storage in an array
          
          AsyncStorage.setItem('caseID', JSON.stringify(caseIDArr));
          console.log('caseID-> ' + JSON.stringify(caseIDArr));
          if(!useBase64) FileSystem.deleteAsync(fileInfo);
        });

        uploadTask.catch(err => {
        console.log("erer", err)
      }).catch(e => {
        if(!useBase64) FileSystem.deleteAsync(fileInfo)
        console.log(e)
      })

    };
  };

  return (
    <SafeAreaView className="h-full">
    
    <View>
      <TouchableOpacity onPress={() => navigation.pop(2)} className="w-9 m-3 p-2 mb-0 bg-purple-700 rounded-full">
          <ArrowLeftIcon size={20} color="white"></ArrowLeftIcon>
      </TouchableOpacity>
    </View> 

    <KeyboardAwareScrollView
     extraHeight={10}
     enableOnAndroid={true}
     enableAutomaticScroll={true}
     extraScrollHeight={10}>
      
      <View className="m-5 relative items-center">
        <Text className="font-semibold text-gray-500 text-lg mb-3">Select file to upload</Text>

        { 
          !selectedImage && !selectedFile ? 
          <LottieView
            source={require('../../assets/lottie-files/upload_files.json')}
            autoPlay
            loop={true}
            className={Platform.OS == 'web' ? "px-1" : "w-full px-1"}
          /> :
          
          (
            selectedImage ? 
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
              <Image source={{uri: selectedImage}}  resizeMode={'contain'} style={{flex:1 , aspectRatio: 2}}/>
            </View> :
            <DocumentIcon size={200} color="#b093eb"></DocumentIcon>
          )         
        }
          
        <Text className="text-gray-500 font-semibold mt-3">Maximum size per file is limited to 5Mb only. All files will be encrypted before it gets uploaded.</Text>
        <View className="justify-items-stretch">
          <Button 
            className="rounded-full bg-docufy-primary mt-5" 
            mode='contained' 
            onPress={()=>{
              pickDocument().then(e => {
                if(e) {
                  setSelectedImage(null);
                  setSelectedFile(e.uri);
                  setFileName(e.name);
                }
              });
            }}>
              Browse from Files
          </Button>

          { Platform.OS !== 'web' ?
            <Button 
              className="rounded-full bg-docufy-primary mt-5" 
              mode='contained' 
              onPress={()=>{
                pickImage().then(e => {
                  if(e) {
                    setSelectedFile(null);
                    setSelectedImage(e.uri);
                    const fName = e.uri?.split('/');
                    setFileName(fName[fName.length-1]);
                  }
                });
              }}>
                Browse from Gallery
            </Button>     
            :
            <></>
          }   
        </View>  
      </View>
      
      <View className="m-5">
        { (selectedImage || selectedFile) && (
            <View>
              <View>
                <Text className="font-normal text-gray-500 text-sm mb-3">Change file name</Text>
                <TextInput
                    label='File Name'
                    underlineDuration={1000}
                    activeColor='#2196f3'
                    color='#2196f3'
                    underlineColor='#2196f3'
                    returnKeyType="next"
                    onChangeText={(text) => {
                      setFileName(text);
                    }}
                    autoFocus
                    autoCapitalize= "none"
                    labelActiveColor='#2196f3'
                    labelColor='#2196f3'
                    value={fileName}
                  />
                
                <Picker
                  selectedValue={selectedCategory}
                  placeholder={"placeholder"}
                  onValueChange={value => {
                    setSelectedCategory(value);
                  }}
                >
                  <Picker.Item label={SELECT_CATEGORY_LBL} value={null} />
                  {renderCategoryList()}                   
                  </Picker>   

              </View>

              {category && (<View className="justify-items-stretch">
                <Button
                  className="rounded-full bg-docufy-primary" 
                  mode='contained' 
                  onPress={() => {
                    showModal();
                    setIsSuccess(false);
                    if(selectedCategory && selectedCategory !== SELECT_CATEGORY_LBL ) {
                      setIsError(false);
                      uploadImage();
                    } else {
                      setIsError(true);
                      setMsg('Please select a category in the dropdown.');
                    }
                    
                  }} disabled={uploading}>
                  {uploading ? `Uploading ...` : `Upload`}
                  </Button>  
              </View>
              )}

            </View>
          )}        
      </View>
              
    </KeyboardAwareScrollView>  
    <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={containerStyle}>
        <Text className="mt-5 text-lg text-gray-700">{msg}</Text>
        <Button className={!isError ? "rounded-full bg-docufy-primary mt-5" : "rounded-full bg-red-500 mt-5"} mode='contained' onPress={hideModal}>Close</Button>
    </Modal>    
  </SafeAreaView>
  )
  
}

const fileURL_to_blob = (file_url) => {
  return new Promise((resolve, reject) => {
    let request = new XMLHttpRequest();
    request.open('GET', file_url, true);
    request.responseType = 'blob';
    request.onload = function() {
        var reader = new FileReader();
        reader.readAsDataURL(request.response);
        reader.onload =  function(e){
            resolve(e.target.result);
        };
    };
    request.onerror=function(e){
      reject(e);
    }
    request.send();
  });
}
export default UploadScreen