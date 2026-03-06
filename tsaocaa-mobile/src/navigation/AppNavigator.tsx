import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Typography } from '../constants/colors';

// Screens
import HomeScreen from '../screens/HomeScreen';
import MenuScreen from '../screens/MenuScreen';
import DrinkDetailScreen from '../screens/DrinkDetailScreen';
import GameScreen from '../screens/GameScreen';
import CouponDetailScreen from '../screens/CouponDetailScreen';
import StoreScreen from '../screens/StoreScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';

const Tab = createBottomTabNavigator();
const MenuStack = createStackNavigator();
const GameStack = createStackNavigator();
const ProfileStack = createStackNavigator();

function MenuStackNavigator() {
  return (
    <MenuStack.Navigator screenOptions={{ headerShown: false }}>
      <MenuStack.Screen name="MenuList" component={MenuScreen} />
      <MenuStack.Screen name="DrinkDetail" component={DrinkDetailScreen} />
    </MenuStack.Navigator>
  );
}

function GameStackNavigator() {
  return (
    <GameStack.Navigator screenOptions={{ headerShown: false }}>
      <GameStack.Screen name="GameMain" component={GameScreen} />
      <GameStack.Screen name="CouponDetail" component={CouponDetailScreen} />
    </GameStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="Login" component={LoginScreen} />
      <ProfileStack.Screen name="SignUp" component={SignUpScreen} />
    </ProfileStack.Navigator>
  );
}

const TAB_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  Home: 'home',
  Menu: 'book-open',
  Game: 'gift',
  Store: 'map-pin',
  Profile: 'user',
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopColor: Colors.border,
            paddingBottom: Platform.OS === 'ios' ? 20 : 8,
            paddingTop: 8,
            height: Platform.OS === 'ios' ? 88 : 64,
          },
          tabBarActiveTintColor: Colors.tabActive,
          tabBarInactiveTintColor: Colors.tabInactive,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500' as const,
            fontFamily: Typography.medium,
          },
          tabBarIcon: ({ focused }) => (
            <Feather
              name={TAB_ICONS[route.name]}
              size={22}
              color={focused ? Colors.tabActive : Colors.tabInactive}
            />
          ),
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Menu" component={MenuStackNavigator} />
        <Tab.Screen name="Game" component={GameStackNavigator} />
        <Tab.Screen name="Store" component={StoreScreen} />
        <Tab.Screen name="Profile" component={ProfileStackNavigator} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
