import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Util from '../common/Util';

const CustomCard = ({data, title, uid, desc}) => {
    const navigation = useNavigation();
  return (
    <View className="mt-5">
        <TouchableOpacity onPress={() => {
            Util.claimantCaseID = title;
            Util.subDomain = getSubDomain(title);
            navigation.navigate('Detail', {
                title,
                desc,
                uid,
                data
            });
        }}>
            <View className="overflow-hidden rounded-lg flex-1">
                <LinearGradient colors={['rgb(99, 102, 241)', 'rgb(168, 85, 247)']}>
                    <View className="flex-1">
                        <View className="py-10 items-center">
                            <Text className="font-bold text-white text-xl">{title}</Text>
                            <Text className="text-gray-300 text-sm text-ellipsis">{desc}</Text>
                        </View>
                        
                        <View className="flex-row justify-between p-3">
                            <Text className="text-purple-200">Total uploads: {data?.docs?.length}</Text>
                            <Text className="text-purple-200">Status: {data?.status}</Text>
                        </View>
                    </View>

                </LinearGradient>
            </View>
        </TouchableOpacity>

        {/* <LinearGradient colors={['#AD1DEB', '#6E72FC']}>
            
        */}
        
        {/* <View className="mt-8"></View>
        <TouchableOpacity onPress={() => {
            navigation.navigate('Detail', {
                title,
                desc
            });
        }}>
            <View className="overflow-hidden rounded-lg flex-1">
                <LinearGradient colors={['rgb(255, 105, 104)', 'rgb(163, 52, 250)', 'rgb(6, 149, 255)']}>
                    <View className="flex-1">
                        <View className="py-10 items-center">
                            <Text className="font-bold text-white text-xl">{title}</Text>
                            <Text className="text-gray-300 text-sm text-ellipsis">{desc}</Text>
                        </View>
                        
                        <View className="flex-row justify-between p-3">
                            <Text className="text-purple-200">Total uploads: 0</Text>
                            <Text className="text-purple-200">Status: Approved</Text>
                        </View>
                    </View>

                </LinearGradient>
            </View>
        </TouchableOpacity>         */}
    </View>

  )
}

const getSubDomain = (caseid) => {
    let caseSplit = caseid.split('-')
    let subDomain = caseSplit.length >= 2 ? caseSplit[0].toLowerCase() : '___';
    return subDomain;
}

export default CustomCard