import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import CryptoJS from "crypto-js";
import Constants from 'expo-constants';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, Modal, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReactNativeTypewriter from 'react-native-typewriter';
import Util from '../common/Util';
import CustomCard from '../components/CustomCard';
import Firebase from '../config/Firebase';


const firestore = Firebase.firestore();
const auth = Firebase.auth();

const HomeScreen = () => {

  const [user, setUser] = useState({});
  let [caseID, setCaseID] = useState([]);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false
    })
  }, []);
  
  const [visible, setVisible] = React.useState(false);
  //const [docid, setDocid] = React.useState("SIT-85040421000017"); use for local dev
  const [docid, setDocid] = React.useState("");

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = {backgroundColor: 'white', padding: 20,  justifyContent: 'center', alignItems: 'center', alignSelf: 'center', borderRadius: '5px'};

  useEffect(() => {
    let bytes  = CryptoJS.AES.decrypt(Constants.manifest.extra.pwd, Constants.manifest.extra.encKey);
    let _pswd = bytes.toString(CryptoJS.enc.Utf8);
    auth.signInWithEmailAndPassword(Constants.manifest.extra.email, _pswd)
      .then((data) => {
        setUser(data);
      })
      .catch(e => console.error(e))
  }, []);


  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const arr = [];
      caseID = []
      if(user)_retrieveData();  
    });
    return () => unsubscribe();
  }, [navigation]);
  
  
  const _retrieveData = async () => {
    try {
      const case_id = await AsyncStorage.getItem('caseID');
      if (case_id) {
        let theCaseID = JSON.parse(case_id)

        Promise.all(
          theCaseID.map(async (current_case_id) => {
            const caseSplit = current_case_id.split('-');
            const subDomain = caseSplit.length >= 2 ? caseSplit[0].toLowerCase() : '___';
            const querySnapshot = await firestore
              .collection(`${subDomain}_pendingreview`)
              .where('caseID', '==', current_case_id)
              .get();
            if (querySnapshot.docs.length > 0) {
              const data = querySnapshot.docs[0].data();
              const uid = querySnapshot.docs[0].id;
              return { data, uid };
            }
            return null;
          })
        ).then((results) => {
          const filteredResults = results.filter((result) => result !== null);
          setCaseID(filteredResults);
          console.log('number of cases: '+filteredResults.length);
        });

      }else{
        //TODO perform necessary prompt to user
      }
    } catch (error) {
      console.log(error)
    }

  };

  const renderCaseIDLists = () => {
    return caseID?.map((item, index) => {
        return (<CustomCard data={item.data} title ={item.data.caseID} uid={item.uid} desc={new Date(item.data.date.seconds * 1000).toISOString().slice(0, 16).replace('T', ' ')} key={index}></CustomCard>) 
    });
  }

  return (
    <SafeAreaView className="h-full">
        <View className="ml-3 mr-3 mt-10 align-bottom">
          <View className="flex-row items-center flex-wrap">
            <Text className="text-gray-700 font-bold text-4xl">Search for your </Text>  
            <ReactNativeTypewriter className="text-purple-500 font-bold text-3xl" typing={1}>docufy id here!</ReactNativeTypewriter>
          </View>  
          <View className="mt-10 space-y-3">
            <TextInput className="rounded-none flex-1 bg-transparent" 
              placeholder="XXX-1234567890"
              label="Docufy ID"
              value={docid}
              onChangeText={docid => setDocid(docid)}
              right={
                <TextInput.Icon
                  name="magnify"
                  color="#8e24aa"
                  onPress={()=> {
                    Util.claimantCaseID = docid;
                    docid && docid.length > 5 ? 
                    navigation.navigate('Search', {
                      docid: docid
                    })
                    :
                    showModal()
                  }}
                />
              }/>   
          </View>                        
        </View>

        <ScrollView className="ml-3 mr-3 align-bottom">
            {renderCaseIDLists()}
        </ScrollView>
        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={containerStyle}>
            <Text className="mt-5 text-lg text-gray-700">Please specify a valid Document ID.</Text>
            <Button className="rounded-full bg-docufy-primary mt-5" mode='contained' onPress={hideModal}>Close</Button>
        </Modal>      
    </SafeAreaView>
  )
}

export default HomeScreen