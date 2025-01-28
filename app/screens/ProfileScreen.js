import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Platform,
  Animated,
  ImageBackground,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Feather,
  MaterialCommunityIcons,
  Ionicons,
} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { auth, storage, db } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    accountBalance: 0,
    activeInvestments: 0,
    pendingTasks: 0,
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Animations
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [200, 120],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    fetchUserData();
    fetchUserStats();
  }, []);

  const fetchUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        setUser({ id: userDoc.id, ...userDoc.data() });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', auth.currentUser.uid)
      );
      const transactionsSnap = await getDocs(transactionsQuery);
      
      let balance = 0;
      transactionsSnap.forEach(doc => {
        const transaction = doc.data();
        balance += transaction.type === 'income' ? transaction.amount : -transaction.amount;
      });

      setStats({
        totalTransactions: transactionsSnap.size,
        accountBalance: balance,
        activeInvestments: Math.floor(Math.random() * 5), // Replace with actual data
        pendingTasks: Math.floor(Math.random() * 10), // Replace with actual data
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadProfileImage = async (uri) => {
    try {
      setUploadingImage(true);
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const storageRef = ref(storage, `profile_images/${auth.currentUser.uid}`);
      await uploadBytes(storageRef, blob);
      
      const downloadURL = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        profileImage: downloadURL,
      });
      
      setUser(prev => ({ ...prev, profileImage: downloadURL }));
      setUploadingImage(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
      setUploadingImage(false);
    }
  };

  const renderStatsCard = (title, value, icon) => (
    <View style={styles.statsCard}>
      <LinearGradient
        colors={isDarkMode ? ['#2c3e50', '#3498db'] : ['#e0f7fa', '#80deea']}
        style={styles.statsGradient}
      >
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color={isDarkMode ? '#fff' : '#000'}
        />
        <Text style={[styles.statsValue, isDarkMode && styles.darkModeText]}>
          {value}
        </Text>
        <Text style={[styles.statsTitle, isDarkMode && styles.darkModeText]}>
          {title}
        </Text>
      </LinearGradient>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#6c63ff" />
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkModeContainer]}>
      <ImageBackground
        source={require('../../assets/images/bg.jpg')}
        style={styles.backgroundImage}
      >
        <BlurView
          intensity={isDarkMode ? 70 : 50}
          style={StyleSheet.absoluteFill}
        />
        
        {/* Animated Header */}
        <Animated.View style={[styles.header, { height: headerHeight, opacity: headerOpacity }]}>
          <LinearGradient
            colors={isDarkMode ? ['#2c3e50', '#3498db'] : ['#e0f7fa', '#80deea']}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity
                style={styles.profileImageContainer}
                onPress={handleImagePick}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Image
                      source={
                        user?.profileImage
                          ? { uri: user.profileImage }
                          : require('../../assets/images/default.jpg')
                      }
                      style={styles.profileImage}
                    />
                    <View style={styles.editIconContainer}>
                      <Feather name="edit" size={16} color="#fff" />
                    </View>
                  </>
                )}
              </TouchableOpacity>
              
              <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
              
              <View style={styles.badgesContainer}>
                {user?.badges?.map((badge, index) => (
                  <View key={index} style={styles.badge}>
                    <MaterialCommunityIcons name={badge.icon} size={16} color="#fff" />
                    <Text style={styles.badgeText}>{badge.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {renderStatsCard('Transactions', stats.totalTransactions, 'bank-transfer')}
            {renderStatsCard('Balance', `$${stats.accountBalance}`, 'wallet')}
            {renderStatsCard('Investments', stats.activeInvestments, 'chart-line')}
            {renderStatsCard('Tasks', stats.pendingTasks, 'checkbox-marked-circle')}
          </View>

          {/* Settings Section */}
          <View style={styles.settingsSection}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkModeText]}>
              Settings
            </Text>
            
            {/* Settings Items */}
            <View style={styles.settingsCard}>
              <TouchableOpacity style={styles.settingsItem}>
                <View style={styles.settingsItemLeft}>
                  <Ionicons name="person-outline" size={24} color={isDarkMode ? '#fff' : '#000'} />
                  <Text style={[styles.settingsItemText, isDarkMode && styles.darkModeText]}>
                    Edit Profile
                  </Text>
                </View>
                <Feather name="chevron-right" size={24} color={isDarkMode ? '#fff' : '#000'} />
              </TouchableOpacity>

              <View style={styles.settingsDivider} />

              <View style={styles.settingsItem}>
                <View style={styles.settingsItemLeft}>
                  <Ionicons name="notifications-outline" size={24} color={isDarkMode ? '#fff' : '#000'} />
                  <Text style={[styles.settingsItemText, isDarkMode && styles.darkModeText]}>
                    Notifications
                  </Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#767577', true: '#6c63ff' }}
                  thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
                />
              </View>

              <View style={styles.settingsDivider} />

              <View style={styles.settingsItem}>
                <View style={styles.settingsItemLeft}>
                  <Ionicons name="moon-outline" size={24} color={isDarkMode ? '#fff' : '#000'} />
                  <Text style={[styles.settingsItemText, isDarkMode && styles.darkModeText]}>
                    Dark Mode
                  </Text>
                </View>
                <Switch
                  value={isDarkMode}
                  onValueChange={setIsDarkMode}
                  trackColor={{ false: '#767577', true: '#6c63ff' }}
                  thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>

            {/* Additional Options */}
            <View style={styles.settingsCard}>
              <TouchableOpacity style={styles.settingsItem}>
                <View style={styles.settingsItemLeft}>
                  <Ionicons name="shield-outline" size={24} color={isDarkMode ? '#fff' : '#000'} />
                  <Text style={[styles.settingsItemText, isDarkMode && styles.darkModeText]}>
                    Privacy & Security
                  </Text>
                </View>
                <Feather name="chevron-right" size={24} color={isDarkMode ? '#fff' : '#000'} />
              </TouchableOpacity>

              <View style={styles.settingsDivider} />

              <TouchableOpacity style={styles.settingsItem}>
                <View style={styles.settingsItemLeft}>
                  <Ionicons name="help-circle-outline" size={24} color={isDarkMode ? '#fff' : '#000'} />
                  <Text style={[styles.settingsItemText, isDarkMode && styles.darkModeText]}>
                    Help & Support
                  </Text>
                </View>
                <Feather name="chevron-right" size={24} color={isDarkMode ? '#fff' : '#000'} />
              </TouchableOpacity>

              <View style={styles.settingsDivider} />

              <TouchableOpacity
                style={styles.settingsItem}
                onPress={() =>{
                    auth.signOut()
                
                }}
              >
                <View style={styles.settingsItemLeft}>
                  <Ionicons name="log-out-outline" size={24} color="#ff4444" />
                  <Text style={[styles.settingsItemText, { color: '#ff4444' }]}>
                    Sign Out
                  </Text>
                </View>
                <Feather name="chevron-right" size={24} color="#ff4444" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  darkModeContainer: {
    backgroundColor: '#121212',
  },
  backgroundImage: {
    flex: 1,
  },
  header: {
    width: '100%',
    overflow: 'hidden',
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#6c63ff',
    borderRadius: 15,
    padding: 6,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },
  badgesContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginHorizontal: 5,
  },
  badgeText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 12,
},
statsGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  padding: 15,
  marginTop: 20,
},
statsCard: {
  width: '48%',
  marginBottom: 15,
  borderRadius: 15,
  overflow: 'hidden',
},
statsGradient: {
  padding: 15,
  alignItems: 'center',
  borderRadius: 15,
},
statsValue: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#000',
  marginVertical: 5,
},
statsTitle: {
  fontSize: 14,
  color: '#666',
},
settingsSection: {
  padding: 15,
},
sectionTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#000',
  marginBottom: 15,
},
settingsCard: {
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: 15,
  marginBottom: 15,
  ...Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    android: {
      elevation: 5,
    },
  }),
},
settingsItem: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 15,
},
settingsItemLeft: {
  flexDirection: 'row',
  alignItems: 'center',
},
settingsItemText: {
  fontSize: 16,
  marginLeft: 15,
  color: '#000',
},
settingsDivider: {
  height: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  marginHorizontal: 15,
},
darkModeText: {
  color: '#fff',
},
centered: {
  justifyContent: 'center',
  alignItems: 'center',
},
// Activity section styles
activitySection: {
  padding: 15,
},
activityCard: {
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: 15,
  padding: 15,
  marginBottom: 15,
},
activityItem: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 15,
},
activityIcon: {
  width: 40,
  height: 40,
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 15,
},
activityInfo: {
  flex: 1,
},
activityTitle: {
  fontSize: 16,
  fontWeight: '500',
  marginBottom: 5,
},
activityTime: {
  fontSize: 12,
  color: '#666',
},
// Premium badge styles
premiumBadge: {
  position: 'absolute',
  top: 10,
  right: 10,
  backgroundColor: '#FFD700',
  borderRadius: 15,
  paddingVertical: 5,
  paddingHorizontal: 10,
  flexDirection: 'row',
  alignItems: 'center',
},
premiumText: {
  color: '#000',
  fontWeight: 'bold',
  marginLeft: 5,
},
});

// Utility functions for the profile screen
const formatDate = (date) => {
return new Date(date).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
};

const getInitials = (name) => {
if (!name) return '';
return name
  .split(' ')
  .map(word => word[0])
  .join('')
  .toUpperCase();
};

const validateEmail = (email) => {
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
return emailRegex.test(email);
};

const handleUpdateProfile = async (userId, updates) => {
try {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, updates);
  return true;
} catch (error) {
  console.error('Error updating profile:', error);
  return false;
}
};

export default ProfileScreen;