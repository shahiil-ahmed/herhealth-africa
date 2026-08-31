import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import TrackerScreen from '../screens/tracker/TrackerScreen';
import BookingScreen from '../screens/booking/BookingScreen';
import DiscoverScreen from '../screens/discover/DiscoverScreen';
import SisterhoodScreen from '../screens/sisterhood/SisterhoodScreen';
import Colors from '../constants/colors';

const Tab = createBottomTabNavigator();

const TAB_ITEMS = [
  { name: 'Dashboard', component: DashboardScreen, icon: 'home', label: 'home' },
  { name: 'Booking', component: BookingScreen, icon: 'calendar', label: 'book' },
  { name: 'Tracker', component: TrackerScreen, icon: 'pulse', label: 'track' },
  { name: 'Discover', component: DiscoverScreen, icon: 'search', label: 'discover' },
  { name: 'Sisterhood', component: SisterhoodScreen, icon: 'heart', label: 'sisterhood' },
];

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ focused, color, size }) => {
          const item = TAB_ITEMS.find((t) => t.name === route.name);
          const iconName = focused ? item?.icon : `${item?.icon}-outline`;
          return (
            <View style={styles.tabItem}>
              <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
                <Ionicons
                  name={iconName as any}
                  size={18}
                  color={focused ? Colors.rosePink : Colors.darkPlumFaint}
                />
              </View>
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                {item?.label}
              </Text>
            </View>
          );
        },
      })}
    >
      {TAB_ITEMS.map((item) => (
        <Tab.Screen
          key={item.name}
          name={item.name}
          component={item.component}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 88 : 70,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 8,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
  },
  tabItem: {
    alignItems: 'center',
    gap: 4,
  },
  tabIconWrap: {
    width: 48,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapActive: {
    backgroundColor: 'rgba(212, 104, 138, 0.1)',
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: Colors.darkPlumFaint,
    textTransform: 'capitalize',
  },
  tabLabelActive: {
    color: Colors.rosePink,
    fontWeight: '700',
  },
});
