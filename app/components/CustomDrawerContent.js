import React from 'react';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { View, Text, Switch } from 'react-native';

export default function CustomDrawerContent(props) {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Logout"
        onPress={() => {
          // Handle logout
        }}
      />
      <DrawerItem
        label="Export to CSV"
        onPress={() => {
          // Handle export to CSV
        }}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
        <Text style={{ flex: 1 }}>Dark Mode</Text>
        <Switch
          value={isDarkMode}
          onValueChange={(value) => setIsDarkMode(value)}
        />
      </View>
    </DrawerContentScrollView>
  );
}
