import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/firebaseConfig';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Colors from '../../constants/colors';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup, resetPassword } = useAuth();

  const switchTab = (toLogin: boolean) => {
    setIsLogin(toLogin);
    setError('');
    setMessage('');
    setEmail('');
    setPassword('');
    setName('');
  };

  const getFirebaseError = (code: string): string => {
    switch (code) {
      case 'auth/user-not-found':
        return 'User does not exist. Please check your email or sign up.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-email':
        return 'The email address is invalid.';
      case 'auth/invalid-credential':
        return isLogin
          ? 'Invalid email or password. Please try again.'
          : 'Could not complete sign up. Please check your details.';
      case 'auth/email-already-in-use':
        return 'This email is already registered. Try logging in.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  const handleSubmit = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        // Navigation handled by root layout auth state listener
      } else {
        const userCred = await signup(email, password);
        const user = userCred.user;

        // Update Auth display name
        await updateProfile(user, { displayName: name });

        // Create Firestore user document (same structure as web app)
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: name,
          email: email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          onboardingComplete: false,
          role: 'user',
        });
      }
    } catch (err: any) {
      setError(getFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await resetPassword(email);
      setMessage('Password reset link sent! Check your inbox 🌸');
    } catch {
      setError('Failed to send reset email. Please check the email address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>
              Her<Text style={styles.logoAccent}>Health</Text>
            </Text>
            <Text style={styles.logoSubtitle}>
              {isLogin
                ? 'Welcome back to your health journey.'
                : 'Begin your health journey with us.'}
            </Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Tab Switcher */}
            <View style={styles.tabRow}>
              <TouchableOpacity
                onPress={() => switchTab(true)}
                style={[styles.tab, isLogin && styles.tabActive]}
              >
                <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => switchTab(false)}
                style={[styles.tab, !isLogin && styles.tabActive]}
              >
                <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {!isLogin && (
                <Input
                  label="Full name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              )}

              <Input
                label="Email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
              />

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                isPassword
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />

              {isLogin && (
                <TouchableOpacity
                  onPress={handleForgotPassword}
                  style={styles.forgotButton}
                >
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}

              {/* Error / Success messages */}
              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorBoxText}>{error}</Text>
                </View>
              ) : null}
              {message ? (
                <View style={styles.successBox}>
                  <Text style={styles.successBoxText}>{message}</Text>
                </View>
              ) : null}

              <Button
                title={loading ? 'Processing...' : isLogin ? 'Login →' : 'Sign Up →'}
                onPress={handleSubmit}
                loading={loading}
                style={styles.submitButton}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.petal,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '500',
    color: Colors.darkPlum,
    marginBottom: 8,
  },
  logoAccent: {
    color: Colors.rosePink,
    fontStyle: 'italic',
  },
  logoSubtitle: {
    fontSize: 14,
    color: Colors.darkPlumMuted,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 24,
    gap: 20,
  },
  tab: {
    paddingBottom: 12,
    paddingHorizontal: 4,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.rosePink,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.darkPlumMuted,
  },
  tabTextActive: {
    color: Colors.rosePink,
    fontWeight: '700',
  },
  form: {
    gap: 0,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    marginTop: -8,
  },
  forgotText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.rosePink,
  },
  errorBox: {
    backgroundColor: Colors.errorBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorBoxText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.error,
    textAlign: 'center',
  },
  successBox: {
    backgroundColor: Colors.successBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  successBoxText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.success,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 8,
  },
});
