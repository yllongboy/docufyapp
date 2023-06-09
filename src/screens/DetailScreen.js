import { useNavigation, useRoute } from '@react-navigation/native';
import { Collapse, CollapseBody, CollapseHeader } from 'accordion-collapse-react-native';
import React, { useLayoutEffect, useState } from 'react';
import { Dimensions, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeftIcon, ChatBubbleOvalLeftEllipsisIcon, DocumentTextIcon } from 'react-native-heroicons/solid';
import { Button, Chip, IconButton, Modal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import uuid from 'uuid/v4';
import Util from '../common/Util';
import Firebase from '../config/Firebase';
const firestore = Firebase.firestore();

const DetailScreen = () => {
  const route = useRoute();
  const data = route.params.data;
  const uid = route.params.uid;
  const [msg, setMsg] = useState();
  const [modalMsg, setModalMsg] = useState();

  const [visible, setVisible] = useState();
  const [isError, setIsError] = useState();
  const [isSuccess, setIsSuccess] = useState();
  const showModal = () => setVisible(true);
  const hideModal = () => {
    setVisible(false);
    if(isSuccess) navigation.navigate('Home', {});
  };
  const containerStyle = {backgroundColor: 'white', padding: 20, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', borderRadius: '5px', width: Dimensions.get('window').width * 0.90};

  const navigation = useNavigation();
  
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false
    })
  }, []);

  const listComments = (item) => {
    const approversComment = item?.startsWith('^');
    const newItemWithNoA = approversComment ? item.substring(1) : item;
    const parsedLen = newItemWithNoA?.split('-').length;
    const newItem = parsedLen >= 2 && approversComment ? newItemWithNoA?.split('-').slice(0,-1).join(' ').trim() : newItemWithNoA;
    const date = parsedLen >= 2 && approversComment ? new Date(newItemWithNoA?.split('-')[parsedLen-1]).toISOString().slice(0, 16).replace('T', ' '): '';
    return (
      approversComment ? 
      <View className="m-2 items-start">
          <Text className="text-gray-500 text-right"><b>Approver</b> {date}</Text>
          <View className="rounded-r-lg rounded-tr-lg rounded-bl-lg bg-fuchsia-500 p-2 mt-1">
            <Text className="text-right text-white">{newItem}</Text>
          </View>
      </View> 
      :
      <View className="m-2 items-end">
          <Text className="text-gray-500 text-right">{data?.name} {date}</Text>
          <View className="rounded-l-lg rounded-tl-lg rounded-br-lg bg-gray-200 p-2 mt-1">
            <Text className="text-right">{newItem}</Text>
          </View>
      </View>

    )
  }

  const listDocs = (doc) => {
    
    return (
      <View className="m-2 items-start">
          <View className="flex-row items-center">
            <Text className="text-gray-500 text-right">{new Date(doc?.dateSubmitted.seconds * 1000).toISOString().slice(0, 16).replace('T', ' ')} </Text>
            <Text>{' '}</Text>
            {
              doc?.category ?
              <Chip icon={'information'}>{ doc?.category }</Chip>
              :
              <Chip icon={'information'}>Unknown</Chip>  
            }
          </View>
          <View className="rounded-tr-lg rounded-bl-lg bg-fuchsia-500 p-2 mt-1">
            <Text className="text-right text-white">{doc?.friendlyName}</Text>
          </View>
      </View> 
    )
  }

  const onCommentSubmit = () => {
    console.log(msg);
    console.log(data)
    console.log(uid)
    if(!data.comment) data.comment = []; // init comment

    data.comment.push(msg);
    firestore.collection(`${Util.subDomain}_pendingreview`).doc(uid).set(
      { comment: data.comment },
      { merge: true }
      ).then(() => {
        setIsSuccess(true);
        setModalMsg('Message has been sent successfully. Your application will be reviewed again.');
        showModal();
    }).catch(e => {
        setIsSuccess(false);
        setModalMsg('There was an error in submitting your reply. Please try again.');
        showModal();
    })
    
  }

  return (
    <SafeAreaView className="h-full bg-gray-50">
        <View className="bg-gray-50">
            <View>
                <TouchableOpacity onPress={navigation.goBack} className="w-9 m-3 p-2 bg-purple-700 rounded-full">
                    <ArrowLeftIcon size={20} color="white"></ArrowLeftIcon>
                </TouchableOpacity>
            </View>

            <View className="ml-5 mr-5 align-bottom">
              <View className="flex-wrap">
                <Text className="text-gray-700 font-bold text-xl">{route.params.title}</Text>  
                <Text className="text-gray-600">Submitted on {route.params.desc}</Text>
              </View>
              <Text className="text-gray-600 mt-5">Submitted by {data?.name}</Text>
                <Text className="text-gray-600">Mobile {data?.dialingCode}{data?.mobileNo}</Text>
                <Text className="text-gray-600">Status is {data?.status}</Text>
            </View>

            <View className="ml-5 mr-5 mt-5">
              <Collapse>
                <CollapseHeader>
                  <View className="flex-row">
                    <View>
                      <ChatBubbleOvalLeftEllipsisIcon size={30} color="#00A7B7"/>
                    </View>
                    <Text className="text-purple-500 font-semibold text-lg ml-1">
                      Comments ({data?.comment?.length ? data?.comment?.length : 0})
                    </Text>
                  </View>
                </CollapseHeader>
                <CollapseBody>
                  {data?.reason?.length ? 
                    <>
                      <FlatList                    
                        data={data?.comment}
                        renderItem={({ item }) => listComments(item)}
                        keyExtractor={item => `${uuid() + item}`}
                       />
                      <View className="flex-row mt-3">
                        <View className="rounded-l-lg rounded-tl-lg bg-gray-200 p-2 flex-1">
                          <TextInput placeholder='Type a new message' className="pt-2 pl-2 text-gray-700 text-base" multiline={true} value={msg} onChangeText={(e) => setMsg(e)}></TextInput>
                        </View>  
                        <View className="rounded-br-lg rounded-tr-lg bg-docufy-primary flex-none">
                          <IconButton 
                            icon={'send'} 
                            color={'white'} 
                            size={30} 
                            onPress={() => {
                              if(msg) {
                                setIsSuccess(true);
                                onCommentSubmit();
                              }
                            }}
                          ></IconButton>
                        </View>
                      </View>
                    </>
                  :
                    <Text className="text-gray-700 italic text-l ml-8 mt-5">No Comments</Text>  
                  }

                </CollapseBody>
              </Collapse>              
            </View>

            <View className="ml-5 mr-5 mt-5">
              <Collapse>
                <CollapseHeader>
                  <View className="flex-row">
                    <View>
                      <DocumentTextIcon size={30} color="#00A7B7"/>
                    </View>
                    <Text className="text-purple-500 font-semibold text-lg ml-1">
                      Documents ({data?.docs?.length ? data?.docs?.length : 0})
                    </Text>
                  </View>
                </CollapseHeader>
                <CollapseBody>
                  {data?.docs?.length ? 
                    <>
                      <FlatList                   
                        data={data?.docs}
                        renderItem={({ item }) => listDocs(item)}
                        keyExtractor={item => `${uuid() + item.name}`}
                       />
                    </>
                  :
                    <Text className="text-gray-700 italic text-l ml-8 mt-5">No Documents Uploaded.</Text>  
                  }

                </CollapseBody>
              </Collapse>       
              <View className="flex-1 mt-3 mb-3"> 
                <Button className="rounded-full bg-docufy-primary mt-5" mode='contained' onPress={()=> {navigation.navigate('Upload', {})}}>Attach Document</Button>
              </View>                     
            </View>   


        </View>
        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={containerStyle}>
          <Text className="mt-5 text-lg text-gray-700">{modalMsg}</Text>
          <Button className={!isError ? "rounded-full bg-docufy-primary mt-5" : "rounded-full bg-red-500 mt-5"} mode='contained' onPress={hideModal}>OK</Button>
         </Modal>            
    </SafeAreaView>    
  )
}

export default DetailScreen