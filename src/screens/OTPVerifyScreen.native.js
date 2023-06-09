import { useNavigation } from '@react-navigation/native'
import OTPInputView from '@twotalltotems/react-native-otp-input'
import React, { useLayoutEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { ArrowLeftIcon } from 'react-native-heroicons/solid'
import { SafeAreaView } from 'react-native-safe-area-context'

const OTPVerifyScreen = () => {

    const navigation = useNavigation();
    
    useLayoutEffect(() => {
      navigation.setOptions({
        headerShown: false
      })
    }, []);

    const [otp, setOtp] = useState();
  return (

    <SafeAreaView>
      <View>
        <TouchableOpacity onPress={navigation.goBack} className="w-9 m-3 p-2 bg-purple-700 rounded-full">
            <ArrowLeftIcon size={20} color="white"></ArrowLeftIcon>
        </TouchableOpacity>
      </View>

      <View>
          <View className="align-center items-center justify-center flex-1 m-5">
            <Text className="text-gray-500 text-2xl mb-5">Enter Verification Code</Text>
            <View className="absolute">
              <View className="mb-10"></View>
            <OTPInputView
                pinCount={6}
                code = {otp}
                onCodeChanged = {code => { 
                  setOtp(code);
                  console.log('halo ' + code);
                }}
                codeInputHighlightStyle={styles.underlineStyleHighLighted}
                codeInputFieldStyle = {styles.codeInputFieldStyle}
                autoFocusOnLoad
                editable={true}
                onCodeFilled = {(otp => {
                    setOtp(otp);
                    console.log(`Code is ${otp}, you are good to go!`)
                    if(otp && otp.length === 6) { // bypass validation. TODO call twilio verification endpoint
                      navigation.navigate('Upload', {});
                  }
                })}
              />
              </View>
            </View>

      </View>

    </SafeAreaView>    
  )
}

const styles = StyleSheet.create({
    
    underlineStyleHighLighted: {
      borderColor: 'blue',
      color: '#6E72FC'
    },
    codeInputFieldStyle: {
      borderColor: 'blue',
      color: '#000FFF'
    },
  
  });

export default OTPVerifyScreen