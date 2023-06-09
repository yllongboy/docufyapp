import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TailwindProvider } from 'tailwindcss-react-native';
import DetailScreen from './src/screens/DetailScreen';
import HomeScreen from './src/screens/HomeScreen';
//@ts-ignore
import OTPVerifyScreen from './src/screens/OTPVerifyScreen';
import SearchScreen from './src/screens/SearchScreen';
import UploadScreen from './src/screens/UploadScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <TailwindProvider>
        <Stack.Navigator>
          <Stack.Screen name='Home' component={HomeScreen}/>
          <Stack.Screen name='Detail' component={DetailScreen}/>
          <Stack.Screen name='Search' component={SearchScreen}/>
          <Stack.Screen name='OTPVerify' component={OTPVerifyScreen}/>
          <Stack.Screen name='Upload' component={UploadScreen}/>
        </Stack.Navigator>
      </TailwindProvider>
    </NavigationContainer>
  );
}