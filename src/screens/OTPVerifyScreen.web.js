import { useNavigation } from '@react-navigation/native';
import React, { useLayoutEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import OtpInput from 'react-otp-input';

const OTPVerifyScreen = () => {

    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
        headerShown: false
        })
    }, []);

    const [otp, setOtp] = useState();

    return (
        <>
            <View>
                <TouchableOpacity onPress={navigation.goBack} className="w-9 m-3 p-2 bg-purple-700 rounded-full">
                    <ArrowLeftIcon size={20} color="white"></ArrowLeftIcon>
                </TouchableOpacity>
            </View>        
            <View className="align-center items-center justify-center flex-1">
                <Text className="text-gray-500 text-2xl mb-5">Enter Verification Code</Text>
                <OtpInput
                    value={otp}
                    onChange={(otp) => {
                        setOtp(otp);
                        if(otp && otp.length === 6) { // bypass validation. TODO call twilio verification endpoint
                            navigation.navigate('Upload', {});
                        }
                    }}
                    numInputs={6}
                    shouldAutoFocus={true}
                    isInputNum={true}
                    focusStyle={{border: '1px solid #AD1DEB'}}
                    inputStyle={{borderRadius: '4px', border: '1px solid rgba(0, 0, 0, 0.3)', width: '3rem', height: '3rem', fontSize: '2rem'}}
                    separator={<span>&nbsp;-&nbsp;</span>}
                />
                <View></View>
            </View>
        </>
    )
}

export default OTPVerifyScreen