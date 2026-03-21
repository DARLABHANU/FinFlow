import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/apiClient';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!hasHardware || !isEnrolled) {
        Alert.alert('Unavailable', 'Biometrics are not set up or available on this device.');
        return;
      }
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify identity to enable biometric login for FinFlow',
      });
      if (result.success) {
        setIsBiometricEnabled(true);
      } else {
        setIsBiometricEnabled(false);
      }
    } else {
      setIsBiometricEnabled(false);
    }
  };

  const handleRegister = async () => {
    try {
      if (!name || !email || !password) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
      const response = await apiClient.post('/auth/register', { name, email, password, isBiometricEnabled });
      Alert.alert('Success', 'Account created! Please log in.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error: any) {
      console.log('Register failed', error);
      Alert.alert('Registration Failed', error?.response?.data?.error || error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#1e3b8a" />
          </TouchableOpacity>
          
          <View style={styles.header}>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>Join FinFlow to start managing your finances professionally.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="person" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor="#94a3b8"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="mail" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            <View style={styles.bioGroup}>
               <View>
                 <Text style={styles.bioTitle}>Enable Biometric Login</Text>
                 <Text style={styles.bioSub}>Use Fingerprint or FaceID to sign in</Text>
               </View>
               <Switch 
                 value={isBiometricEnabled}
                 onValueChange={handleBiometricToggle}
                 trackColor={{ true: '#1e3b8a', false: '#cbd5e1' }}
               />
            </View>

            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.registerButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f6f8' },
  scroll: { padding: 24, paddingTop: 40, flexGrow: 1, justifyContent: 'center' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1e3b8a10', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  header: { marginBottom: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#475569', lineHeight: 24 },
  form: { },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#0f172a', marginBottom: 8, marginLeft: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', height: 56 },
  inputIcon: { marginLeft: 16, marginRight: 8 },
  input: { flex: 1, height: '100%', fontSize: 16, color: '#0f172a' },
  registerButton: { backgroundColor: '#1e3b8a', height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  registerButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  bioGroup: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  bioTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  bioSub: { fontSize: 12, color: '#64748b' },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  loginText: { color: '#475569', fontSize: 14 },
  loginLink: { color: '#1e3b8a', fontSize: 14, fontWeight: 'bold' },
});
