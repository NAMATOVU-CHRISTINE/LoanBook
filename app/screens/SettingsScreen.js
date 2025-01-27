import React from 'react';
import { View, Text, Button } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function SettingsScreen() {
  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log('User signed out');
      })
      .catch((error) => {
        console.error('Error signing out: ', error);
      });
  };

  return (
    <View>
      <Text>Settings</Text>
      <Button title="Sign Out" onPress={handleSignOut} />
    </View>
  );
}
