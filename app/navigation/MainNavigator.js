import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { AuthProvider, useAuth } from '../context/AuthContext'; // Import Auth context

import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen'; // Import the new screen
import SettingsScreen from '../screens/SettingsScreen';
import LoansScreen from '../screens/LoansScreen';
import InterestExpensesScreen from '../screens/InterestExpensesScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import BalanceSheetScreen from '../screens/BalanceSheetScreen';
import FinancialLedgerScreen from '../screens/FinancialLedgerScreen';
import SplashScreen from '../screens/SplashScreen'; // Import SplashScreen
import AddLoanScreen from '../screens/AddLoanScreen'; // Import AddLoanScreen
import RecordTransactionScreen from '../screens/RecordTransactionScreen'; // Import RecordTransactionScreen
import FullReportScreen from '../screens/FullReportScreen'; // Import FullReportScreen
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName; 

        switch (route.name) {
          case 'HomeTab':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'LoansScreen':
            iconName = focused ? 'document' : 'document-outline';
            break;
          case 'InterestExpenses':
            iconName = focused ? 'cash' : 'cash-outline';
            break;
          case 'Transactions':
            iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
            break;
          case 'BalanceSheet':
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            break;
          case 'FinancialLedger':
            iconName = focused ? 'book' : 'book-outline';
            break;
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#2563EB',
      tabBarInactiveTintColor: '#64748B',
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 0,
        elevation: 10,
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
      },
    })}
  >
    <Tab.Screen 
      name="HomeTab" 
      component={HomeScreen}
      options={{ tabBarLabel: 'Home' }}
    />
    <Tab.Screen 
      name="LoansScreen" 
      component={LoansScreen}
      options={{ tabBarLabel: 'Loans' }}
    />
    {/* <Tab.Screen 
      name="InterestExpenses" 
      component={InterestExpensesScreen}
      options={{ tabBarLabel: 'Interest' }}
    /> */}
    <Tab.Screen 
      name="Transactions" 
      component={TransactionsScreen}
      options={{ tabBarLabel: 'Transactions' }}
    />
    <Tab.Screen 
      name="BalanceSheet" 
      component={BalanceSheetScreen}
      options={{ tabBarLabel: 'Balance Sheet' }}
    />
    {/* <Tab.Screen 
      name="FinancialLedger" 
      component={FinancialLedgerScreen}
      options={{ tabBarLabel: 'Financial Ledger' }}
    /> */}
  </Tab.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
  
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={TabNavigator} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="AddLoan" component={AddLoanScreen} /> 
    <Stack.Screen name="RecordTransaction" component={RecordTransactionScreen} /> 
    <Stack.Screen name="FullReport" component={FullReportScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
  </Stack.Navigator>
);

const RootNavigator = () => {
  const { user, loading } = useAuth();
  const navigationRef = useRef();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { screen } = response.notification.request.content.data;
      if (screen) {
        navigationRef.current?.navigate(screen);
      }
    });

    return () => subscription.remove();
  }, []);

  // if (loading) {
  //   return   <SplashScreen />;
  // }

  return !user ? <AuthStack /> : <AppStack />;
};

const MainNavigator = () => {
  const navigationRef = useRef();

  return (
    <NavigationContainer ref={navigationRef}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
};

export default MainNavigator;
