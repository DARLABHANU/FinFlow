import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuthStore } from '../../store/authStore';
import apiClient, { setAuthToken } from '../../api/apiClient';

export default function LoginScreen({ navigation }: any) {
  const { login, rememberedEmail, rememberedPassword, setRememberedCredentials } = useAuthStore();
  const [email, setEmail] = useState(rememberedEmail || '');
  const [password, setPassword] = useState(rememberedPassword || '');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    if (rememberedEmail) setEmail(rememberedEmail);
    if (rememberedPassword) setPassword(rememberedPassword);
  }, [rememberedEmail, rememberedPassword]);

  const handleLogin = async (overrideEmail?: string, overridePass?: string) => {
    const finalEmail = overrideEmail || email;
    const finalPass = overridePass || password;
    
    try {
      if (!finalEmail || !finalPass) {
        return Alert.alert('Error', 'Please enter your email and password.');
      }
      const response = await apiClient.post('/auth/login', { email: finalEmail, password: finalPass });
      setAuthToken(response.data.accessToken);
      
      // If biometric was enabled for this user, remember them on this device
      if (response.data.user.isBiometricEnabled) {
        setRememberedCredentials(finalEmail, finalPass);
      }
      
      login(response.data.user, response.data.accessToken);
    } catch (error: any) {
      console.log('Login failed', error);
      Alert.alert('Login Error', error?.response?.data?.error || 'Invalid credentials');
    }
  };

  const handleBiometricAuth = async () => {
    try {
      if (!rememberedEmail || !rememberedPassword) {
        return Alert.alert('Note', 'Please log in with your password once to enable biometric login.');
      }

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!hasHardware || !isEnrolled) {
        return Alert.alert('Error', 'Biometrics not available.');
      }
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login to FinFlow',
      });

      if (result.success) {
         // Auto-login with saved credentials
         handleLogin(rememberedEmail, rememberedPassword);
      } else {
         Alert.alert('Authentication Failed', 'Identity verification failed.');
      }
    } catch (e) {
      console.log('Biometric error', e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="account-balance-wallet" size={32} color="#FFF" />
            </View>
            <Text style={styles.brandTitle}>FinFlow</Text>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Enter your credentials to access your account</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="mail" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.passwordHeader}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity>
                  <Text style={styles.forgotPassword}>Forgot?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                  <MaterialIcons name={isPasswordVisible ? "visibility" : "visibility-off"} size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.loginButton} onPress={() => handleLogin()}>
                <Text style={styles.loginButtonText}>Log In</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricAuth}>
                <MaterialIcons name="fingerprint" size={28} color="#1e3b8a" />
              </TouchableOpacity>
            </View>

            <View style={styles.dividerContainer}>
               <View style={styles.divider} />
               <Text style={styles.dividerText}>NEW TO FINFLOW?</Text>
               <View style={styles.divider} />
            </View>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.signupLink}>Create account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f6f8', justifyContent: 'center' },
  inner: { flex: 1, justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, shadowColor: '#1e3b8a', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  header: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
  iconContainer: { width: 64, height: 64, backgroundColor: '#1e3b8a', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  brandTitle: { color: '#1e3b8a', fontSize: 24, fontWeight: 'bold' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0f172a', marginTop: 8 },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 8 },
  form: { paddingBottom: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8 },
  passwordHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  forgotPassword: { fontSize: 12, fontWeight: '600', color: '#1e3b8a' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', height: 56 },
  inputIcon: { marginLeft: 16, marginRight: 8 },
  input: { flex: 1, height: '100%', fontSize: 16, color: '#0f172a' },
  eyeIcon: { padding: 16 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  loginButton: { flex: 1, backgroundColor: '#1e3b8a', height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  loginButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  biometricButton: { width: 56, height: 56, backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 32 },
  divider: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  dividerText: { marginHorizontal: 16, fontSize: 12, color: '#64748b', fontWeight: 'bold' },
  signupContainer: { flexDirection: 'row', justifyContent: 'center' },
  signupText: { color: '#475569', fontSize: 14 },
  signupLink: { color: '#1e3b8a', fontSize: 14, fontWeight: 'bold' }
});
