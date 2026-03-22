import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/apiClient';
import { THEME } from '../../theme/theme';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

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
        Alert.alert('Missing Fields', 'Please complete all fields to join.');
        return;
      }
      setLoading(true);
      await apiClient.post('/auth/register', { name, email, password, isBiometricEnabled });
      Alert.alert('Success', 'Account created! Please log in to start your journey.', [
        { text: 'Let’s Go', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error: any) {
      Alert.alert('Registration Failed', error?.response?.data?.error || 'Unable to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={THEME.colors.text} />
          </TouchableOpacity>
          
          <View style={styles.header}>
            <Text style={styles.title}>Get Started</Text>
            <Text style={styles.subtitle}>Join thousands managing their wealth smarter.</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="person-outline" size={20} color={THEME.colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={THEME.colors.textTertiary}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputWrapper}>
              <MaterialIcons name="alternate-email" size={20} color={THEME.colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor={THEME.colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock-outline" size={20} color={THEME.colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Creating Password"
                placeholderTextColor={THEME.colors.textTertiary}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={styles.bioWidget}>
               <View style={styles.bioTextContainer}>
                  <Text style={styles.bioTitle}>Biometric Security</Text>
                  <Text style={styles.bioSub}>Easy login with FaceID/Fingerprint</Text>
               </View>
               <Switch 
                 value={isBiometricEnabled}
                 onValueChange={handleBiometricToggle}
                 trackColor={{ true: THEME.colors.primary, false: THEME.colors.border }}
                 thumbColor="#FFF"
               />
            </View>

            <TouchableOpacity activeOpacity={0.9} style={styles.submitBtn} onPress={handleRegister} disabled={loading}>
              <LinearGradient 
                colors={[THEME.colors.primary, THEME.colors.secondary]} 
                style={styles.gradientBtn}
                start={{x:0,y:0}} end={{x:1,y:0}}
              >
                <Text style={styles.submitBtnText}>{loading ? 'Creating Account...' : 'Continue'}</Text>
                <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already a member? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  scroll: { padding: 24, paddingBottom: 60 },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: THEME.colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 32, ...THEME.shadows.sm },
  header: { marginBottom: 40 },
  title: { ...THEME.typography.h1, fontSize: 32, letterSpacing: -1 },
  subtitle: { ...THEME.typography.body, color: THEME.colors.textSecondary, marginTop: 8, lineHeight: 22 },

  formContainer: { gap: 16 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.colors.surface, borderRadius: 14, height: 56, paddingHorizontal: 16, borderWidth: 1, borderColor: THEME.colors.border },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, ...THEME.typography.body, fontSize: 15, color: THEME.colors.text },

  bioWidget: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: `${THEME.colors.primary}05`, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: `${THEME.colors.primary}10`, marginVertical: 8 },
  bioTextContainer: { flex: 1 },
  bioTitle: { ...THEME.typography.body, fontSize: 16, fontWeight: '700', color: THEME.colors.text },
  bioSub: { ...THEME.typography.caption, color: THEME.colors.textTertiary, marginTop: 2 },

  submitBtn: { height: 56, borderRadius: 14, overflow: 'hidden', marginTop: 10 },
  gradientBtn: { width: '100%', height: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  submitBtnText: { color: '#FFF', fontSize: 17, fontWeight: '900' },

  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  loginText: { ...THEME.typography.body, fontSize: 14, color: THEME.colors.textSecondary },
  loginLink: { ...THEME.typography.body, fontSize: 14, color: THEME.colors.primary, fontWeight: '800' },
});
