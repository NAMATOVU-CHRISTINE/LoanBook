import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  StatusBar
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../config/firebase'; // Import Firestore
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'react-native-linear-gradient';
import { doc, setDoc } from 'firebase/firestore'; // Import Firestore methods
import Modal from 'react-native-modal'; // Import react-native-modal

const { width, height } = Dimensions.get('window');

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  // Using useRef for animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for the logo
    const pulseSequence = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(pulseSequence).start();

    return () => {
      fadeAnim.setValue(0);
      slideAnim.setValue(0);
      shakeAnim.setValue(0);
      pulseAnim.setValue(1);
    };
  }, []);

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(phone);
  };

  // const validatePassword = (password) => {
  //   const hasUpperCase = /[A-Z]/.test(password);
  //   const hasLowerCase = /[a-z]/.test(password);
  //   const hasNumber = /\d/.test(password);
  //   return password.length >= 8 && hasUpperCase && hasLowerCase && hasNumber;
  // };

  const formatPhoneNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6,10)}`;
    } else if (cleaned.length >= 6) {
      return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length >= 3) {
      return `(${cleaned.slice(0,3)}) ${cleaned.slice(3)}`;
    }
    return cleaned;
  };

  const handleSignUp = async () => {
    Keyboard.dismiss();
    setError('');
    
    if (!email.trim() || !phone.trim() || !password.trim()) {
      setError('Please fill in all fields');
      shakeError();
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      shakeError();
      return;
    }

    if (!validatePhone(phone.replace(/\D/g, ''))) {
      setError('Please enter a valid phone number');
      shakeError();
      return;
    }

    // if (!validatePassword(password)) {
    //   setError('Password must be at least 8 characters long and contain uppercase, lowercase, and numbers');
    //   shakeError();
    //   return;
    // }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        phone: phone,
        password: password,
        createdAt: new Date()
      });
      setModalVisible(true);
      setTimeout(() => {
        setModalVisible(false);
        navigation.replace('Login');
      }, 2000);
    } catch (error) {
      let errorMessage = 'Sign up failed. Please try again.';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          break;
      }
      console.log(error);
      setError(errorMessage);
      shakeError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={"#222"}/>
        <LinearGradient
          colors={['#1a237e', '#4a148c', '#4a148c']}
          style={styles.gradient}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
            keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
          >
            <Animated.View 
              style={[
                styles.formContainer,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                    {
                      translateX: shakeAnim,
                    },
                  ],
                },
              ]}
            >
              <View style={styles.logoContainer}>
                <Animated.View style={[styles.logoCircle, { transform: [{ scale: pulseAnim }] }]}>
                  <Feather name="user-plus" size={40} color="#fff" />
                </Animated.View>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join our community today</Text>
              </View>

              <View style={styles.inputContainer}>
                <View style={[
                  styles.inputWrapper,
                  emailFocused && styles.inputWrapperFocused,
                ]}>
                  <Feather name="mail" size={20} color={emailFocused ? "#fff" : "rgba(255,255,255,0.7)"} />
                  <TextInput
                    style={[styles.input, emailFocused && styles.inputFocused]}
                    placeholder="Email"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </View>

                <View style={[
                  styles.inputWrapper,
                  phoneFocused && styles.inputWrapperFocused,
                ]}>
                  <Feather name="phone" size={20} color={phoneFocused ? "#fff" : "rgba(255,255,255,0.7)"} />
                  <TextInput
                    style={[styles.input, phoneFocused && styles.inputFocused]}
                    placeholder="Phone Number"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={phone}
                    onChangeText={(text) => setPhone(formatPhoneNumber(text))}
                    keyboardType="phone-pad"
                    onFocus={() => setPhoneFocused(true)}
                    onBlur={() => setPhoneFocused(false)}
                  />
                </View>

                <View style={[
                  styles.inputWrapper,
                  passwordFocused && styles.inputWrapperFocused,
                ]}>
                  <Feather name="lock" size={20} color={passwordFocused ? "#fff" : "rgba(255,255,255,0.7)"} />
                  <TextInput
                    style={[styles.input, passwordFocused && styles.inputFocused]}
                    placeholder="Password"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}
                  >
                    <Feather 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color="rgba(255,255,255,0.7)" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <Feather name="alert-circle" size={16} color="#ff6b6b" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
                onPress={handleSignUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.signUpButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialButtonsContainer}>
                <TouchableOpacity style={styles.socialButton}>
                  <Feather name="github" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Feather name="twitter" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Feather name="facebook" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>

              <Modal isVisible={isModalVisible}>
                <View style={styles.modalContent}>
                  <Feather name="check-circle" size={80} color="#4caf50" />
                  <Text style={styles.modalText}>Sign Up Successful!</Text>
                </View>
              </Modal>
            </Animated.View>
          </KeyboardAvoidingView>
        </LinearGradient>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inputContainer: {
    gap: 16,
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputWrapperFocused: {
    borderColor: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
  },
  inputFocused: {
    color: '#fff',
  },
  passwordToggle: {
    padding: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#ff6b6b',
    marginLeft: 8,
    fontSize: 14,
  },
  signUpButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  signUpButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    shadowOpacity: 0,
  },
  signUpButtonText: {
    color: '#4f46e5',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  loginLink: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
});

export default SignUpScreen;