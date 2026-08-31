import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/colors';

/**
 * Shared top header — matches the web Navbar.
 * Shows "HerHealth" logo on the left and a profile avatar button on the right.
 * Tapping the avatar navigates to the Profile modal screen.
 */
export default function AppHeader() {
  const navigation = useNavigation<any>();
  const { currentUser } = useAuth();

  const userName = currentUser?.displayName || currentUser?.email || 'U';
  const userInitial = userName[0]?.toUpperCase() || 'U';

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Text style={styles.logo}>
        Her<Text style={styles.logoAccent}>Health</Text>
      </Text>

      {/* Profile avatar button */}
      <TouchableOpacity
        style={styles.avatarBtn}
        onPress={() => navigation.navigate('Profile')}
        activeOpacity={0.85}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.avatarText}>{userInitial}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    // Shadow matching web navbar
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 3,
  },
  logo: {
    fontSize: 22,
    fontWeight: '500',
    color: Colors.darkPlum,
    letterSpacing: 0.2,
  },
  logoAccent: {
    color: Colors.rosePink,
    fontStyle: 'italic',
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.rosePink,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.rosePink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
});
