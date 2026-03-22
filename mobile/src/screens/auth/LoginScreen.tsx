import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuthStore } from '../../store/authStore';
import apiClient, { setAuthToken } from '../../api/apiClient';
import { THEME } from '../../theme/theme';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }: any) {
  const { login, rememberedEmail, rememberedPassword, setRememberedCredentials } = useAuthStore();
  const [email, setEmail] = useState(rememberedEmail || '');
  const [password, setPassword] = useState(rememberedPassword || '');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (rememberedEmail) setEmail(rememberedEmail);
    if (rememberedPassword) setPassword(rememberedPassword);
  }, [rememberedEmail, rememberedPassword]);

  const handleLogin = async (overrideEmail?: string, overridePass?: string) => {
    const finalEmail = overrideEmail || email;
    const finalPass = overridePass || password;
    
    try {
      if (!finalEmail || !finalPass) {
        return Alert.alert('Missing Info', 'Please provide both email and password.');
      }
      setLoading(true);
      const response = await apiClient.post('/auth/login', { email: finalEmail, password: finalPass });
      setAuthToken(response.data.accessToken);
      
      if (response.data.user.isBiometricEnabled) {
        setRememberedCredentials(finalEmail, finalPass);
      }
      
      login(response.data.user, response.data.accessToken);
    } catch (error: any) {
      Alert.alert('Login Failed', error?.response?.data?.error || 'Check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      if (!rememberedEmail || !rememberedPassword) {
        return Alert.alert('Action Required', 'Log in once with your password to enable biometric access.');
      }

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) return Alert.alert('Unavailable', 'Biometrics not configured.');
      
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Unlock FinFlow' });
      if (result.success) handleLogin(rememberedEmail, rememberedPassword);
    } catch (e) {
      console.log('Biometric error', e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <View style={styles.heroSection}>
           <LinearGradient colors={[THEME.colors.primary, THEME.colors.secondary]} style={styles.logoCircle}>
              <MaterialIcons name="account-balance-wallet" size={40} color="#FFF" />
           </LinearGradient>
           <Text style={styles.brandName}>FinFlow</Text>
           <Text style={styles.heroText}>Your Intelligent Financial Partner</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Welcome Back</Text>
          <Text style={styles.formSubtitle}>Please sign in to continue</Text>

          <View style={styles.inputStack}>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="alternate-email" size={20} color={THEME.colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor={THEME.colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock-outline" size={20} color={THEME.colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={THEME.colors.textTertiary}
                secureTextEntry={!isPasswordVisible}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                <MaterialIcons name={isPasswordVisible ? "visibility" : "visibility-off"} size={20} color={THEME.colors.textTertiary} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
             <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.mainBtn} onPress={() => handleLogin()} disabled={loading}>
              <LinearGradient colors={[THEME.colors.primary, THEME.colors.secondary]} style={styles.gradientBtn} start={{x:0,y:0}} end={{x:1,y:0}}>
                <Text style={styles.mainBtnText}>{loading ? 'Authenticating...' : 'Sign In'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.bioBtn} onPress={handleBiometricAuth}>
               <MaterialIcons name="fingerprint" size={32} color={THEME.colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.footerLink}>
             <Text style={styles.footerText}>Don't have an account? </Text>
             <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.linkText}>Create Account</Text>
             </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  heroSection: { alignItems: 'center', marginBottom: 40 },
  logoCircle: { width: 80, height: 80, borderRadius: 28, alignItems: 'center', justifyContent: 'center', ...THEME.shadows.lg },
  brandName: { ...THEME.typography.h1, marginTop: 16, letterSpacing: -1 },
  heroText: { ...THEME.typography.caption, color: THEME.colors.textSecondary, marginTop: 4 },

  formCard: { backgroundColor: THEME.colors.surface, borderRadius: THEME.roundness.xl, padding: 24, ...THEME.shadows.md, borderWidth: 1, borderColor: THEME.colors.border },
  formTitle: { ...THEME.typography.h2, fontSize: 22 },
  formSubtitle: { ...THEME.typography.caption, color: THEME.colors.textTertiary, marginTop: 4, marginBottom: 32 },

  inputStack: { gap: 16 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.colors.background, borderRadius: 14, height: 56, paddingHorizontal: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, ...THEME.typography.body, fontSize: 15, color: THEME.colors.text },
  eyeIcon: { padding: 4 },

  forgotBtn: { alignSelf: 'flex-end', marginTop: 12, marginBottom: 32 },
  forgotText: { ...THEME.typography.caption, color: THEME.colors.primary, fontWeight: '800' },

  actionRow: { flexDirection: 'row', gap: 12 },
  mainBtn: { flex: 1, height: 56, borderRadius: 14, overflow: 'hidden' },
  gradientBtn: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  mainBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  bioBtn: { width: 56, height: 56, borderRadius: 14, backgroundColor: `${THEME.colors.primary}10`, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: `${THEME.colors.primary}20` },

  footerLink: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { ...THEME.typography.body, fontSize: 14, color: THEME.colors.textSecondary },
  linkText: { ...THEME.typography.body, fontSize: 14, color: THEME.colors.primary, fontWeight: '800' }
});
