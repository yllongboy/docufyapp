
import { useNavigation, useRoute } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Util from '../common/Util';
import Firebase from '../config/Firebase';


const firestore = Firebase.firestore();

// Want to do local development?
// Uncomment this and use `yarn test:emulator:start`
// firestore.useEmulator('http://localhost:8081');


const SearchScreen = ({docid}) => {

  const [domain, setDomain] = useState();
  const [docId, setDocId] = useState();
  const [caseFound, setCaseFound] = useState();
  const route = useRoute();


  const navigation = useNavigation();
    useLayoutEffect(() => {
      navigation.setOptions({
        headerShown: false
      });
      
    }, []);
    
    useEffect(() => {
      const docid = route.params.docid;
      setDocId(docid);
      let subDomain = '___';
      if(docid) {
        const caseSplit = docid.split('-');
        subDomain = caseSplit.length >= 2 ? caseSplit[0].toLowerCase() : '___';
      }
      setDomain(subDomain);
      Util.subDomain = subDomain;      
      _retrieveData(docid, subDomain);

    }, []);


    console.log('caseFound->' + caseFound);

    const _retrieveData = async (docid, subDomain) => {

      try {
    
      
        if (docid !== null) {
    
          firestore.collection(`${subDomain}_pendingreview`).where('caseID', '==', docid).get().then((data) => {
    
            if(data && data.docs && data.docs.length > 0 ) {
              
              const res = {
                data: data.docs[0].data(),
                uid: data.docs[0].id
              }
              console.log('-->' + JSON.stringify(res))
              setCaseFound(true);
            } else {
              // show upload screen
            }
    
          });
    
    
        }else{
          setCaseFound(false);
        }
      } catch (error) {
        console.log(error)
      }
    };
    
  return (
  
    <SafeAreaView className="h-full bg-gray-50">
      <View className="bg-gray-50">
        <TouchableOpacity onPress={navigation.goBack} className="w-9 m-3 p-2 bg-purple-700 rounded-full">
            <ArrowLeftIcon size={20} color="white"></ArrowLeftIcon>
        </TouchableOpacity>
      </View> 

      <View className="m-5 relative items-center">
        <Text className="font-semibold text-pink-500 text-lg mb-3">{docId}</Text>
        { 
          caseFound ?
          <LottieView
            source={require('../../assets/lottie-files/otp_verify.json')}
            autoPlay
            loop={true}
            className={Platform.OS == 'web' ? "px-1" : "w-full px-1"}
          />
          :          
          <LottieView
            source={require('../../assets/lottie-files/case_not_found.json')}
            autoPlay
            loop={true}
            className={Platform.OS == 'web' ? "px-1" : "w-full px-1"}
          />              
        }
          
          { caseFound ? 
            (
              <>
                <Text className="text-gray-500 font-semibold mt-3">Application Found. You would need to verify your registered Phone Number before you can proceed.</Text>
                <Button 
                className="rounded-full bg-docufy-primary mt-5" 
                mode='contained' 
                onPress={()=>{
                  navigation.navigate('OTPVerify', {});
                }}>
                  Proceed
                </Button>
              </>
            )
                        
            :
            <Text className="text-gray-500 font-semibold mt-3">We couldn't find your application. Please contact our support team if you think your application exists in our system.</Text>
          } 

    
      </View>
    </SafeAreaView>
  )
}



export default SearchScreen