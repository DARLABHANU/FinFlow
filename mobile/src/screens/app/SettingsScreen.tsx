import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { THEME } from '../../theme/theme';

export default function SettingsScreen({ navigation }: any) {
  const { user, isPrivacyMode, currency, setCurrency, logout, toggleBiometric, togglePrivacyMode } = useAuthStore();

  const getInitials = (name = 'User') => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleCurrencySwitch = () => {
    Alert.alert(
      "Regional Settings",
      "Which currency would you like to use for your balance and analytics?",
      [
        { text: "USD ($)", onPress: () => setCurrency('USD') },
        { text: "INR (₹)", onPress: () => setCurrency('INR') },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout", 
      "Are you sure you want to end your session?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: logout }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Universal Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.headBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={THEME.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headTitle}>Account Preferences</Text>
        <TouchableOpacity style={styles.headBtn} onPress={() => navigation.navigate('Profile')}>
          <MaterialIcons name="person-outline" size={24} color={THEME.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Account Summary */}
        <TouchableOpacity style={styles.heroBox} activeOpacity={0.9} onPress={() => navigation.navigate('Profile')}>
           <View style={styles.heroAvatar}>
              {user?.avatar ? (
                 <Image source={{ uri: user.avatar }} style={styles.heroImg} />
              ) : (
                 <LinearGradient colors={[THEME.colors.secondary, '#60A5FA']} style={styles.initialsBg}>
                    <Text style={styles.initialsTxt}>{getInitials(user?.name)}</Text>
                 </LinearGradient>
              )}
              <View style={styles.premiumBadge}>
                 <MaterialIcons name="verified" size={14} color="#FFF" />
              </View>
           </View>
           <View style={styles.heroDetails}>
              <Text style={styles.heroName} numberOfLines={1}>{user?.name || 'FinFlow User'}</Text>
              <Text style={styles.heroEmail} numberOfLines={1}>{user?.email || 'user@finflow.com'}</Text>
           </View>
           <MaterialIcons name="chevron-right" size={24} color={THEME.colors.border} />
        </TouchableOpacity>

        {/* Settings Categories */}
        <View style={styles.categoryArea}>
           <Text style={styles.catLabel}>General Preference</Text>
           
           <TouchableOpacity style={styles.rowItem} onPress={handleCurrencySwitch}>
              <View style={[styles.rowIcon, { backgroundColor: '#F0F9FF' }]}>
                 <MaterialIcons name="monetization-on" size={20} color={THEME.colors.secondary} />
              </View>
              <View style={styles.rowMain}>
                 <Text style={styles.rowTitle}>Display Currency</Text>
                 <Text style={styles.rowSub}>{currency === 'USD' ? 'US Dollar ($)' : 'Indian Rupee (₹)'}</Text>
              </View>
              <MaterialIcons name="expand-more" size={20} color={THEME.colors.border} />
           </TouchableOpacity>
        </View>

        <View style={styles.categoryArea}>
           <Text style={styles.catLabel}>Safety & Privacy</Text>
           
           <View style={styles.rowItem}>
              <View style={[styles.rowIcon, { backgroundColor: '#F5F3FF' }]}>
                 <MaterialIcons name="fingerprint" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.rowMain}>
                 <Text style={styles.rowTitle}>Secure with Biometrics</Text>
                 <Text style={styles.rowSub}>Quick access to your portfolio</Text>
              </View>
              <Switch 
                value={user?.isBiometricEnabled || false} 
                onValueChange={toggleBiometric}
                trackColor={{ true: THEME.colors.secondary, false: '#E2E8F0' }}
                thumbColor="#FFF"
              />
           </View>

           <View style={styles.rowItem}>
              <View style={[styles.rowIcon, { backgroundColor: '#F0FDF4' }]}>
                 <MaterialIcons name="visibility-off" size={20} color={THEME.colors.accent} />
              </View>
              <View style={styles.rowMain}>
                 <Text style={styles.rowTitle}>Privacy Filter</Text>
                 <Text style={styles.rowSub}>Auto-blur balances in public</Text>
              </View>
              <Switch 
                value={isPrivacyMode} 
                onValueChange={togglePrivacyMode}
                trackColor={{ true: THEME.colors.secondary, false: '#E2E8F0' }}
                thumbColor="#FFF"
              />
           </View>
        </View>

        <View style={styles.categoryArea}>
           <Text style={styles.catLabel}>Support & Info</Text>
           
           {[
             { title: 'Help & Knowledge Base', icon: 'help-outline', color: '#64748B', bg: '#F1F5F9' },
             { title: 'Privacy Policy', icon: 'verified-user', color: '#64748B', bg: '#F1F5F9' },
             { title: 'App Statistics', icon: 'analytics', color: '#64748B', bg: '#F1F5F9', route: 'AnalyticsTab' }
           ].map(item => (
             <TouchableOpacity key={item.title} style={styles.rowItem} onPress={item.route ? () => navigation.navigate(item.route) : undefined}>
                <View style={[styles.rowIcon, { backgroundColor: item.bg }]}>
                   <MaterialIcons name={item.icon as any} size={20} color={item.color} />
                </View>
                <View style={styles.rowMain}>
                   <Text style={styles.rowTitle}>{item.title}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={THEME.colors.border} />
             </TouchableOpacity>
           ))}
        </View>

        <TouchableOpacity style={styles.exitRow} onPress={handleLogout}>
           <View style={styles.exitIcon}>
              <MaterialIcons name="power-settings-new" size={20} color={THEME.colors.expense} />
           </View>
           <Text style={styles.exitTxt}>Disconnect Account</Text>
        </TouchableOpacity>

        <View style={styles.footerWrap}>
           <Text style={styles.versionTxt}>FINFLOW VERSION 3.0.0-PRO</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  topHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: THEME.colors.surface },
  headBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: THEME.colors.background, alignItems: 'center', justifyContent: 'center' },
  headTitle: { ...THEME.typography.h3, fontSize: 17, color: THEME.colors.primary, fontWeight: '800' },

  scroll: { padding: 20, paddingBottom: 60 },
  heroBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.colors.surface, padding: 18, borderRadius: THEME.roundness.xl, ...THEME.shadows.soft, marginBottom: 32, borderWidth: 1, borderColor: THEME.colors.border },
  heroAvatar: { width: 64, height: 64, borderRadius: 22, overflow: 'hidden', marginRight: 18, position: 'relative' },
  heroImg: { width: '100%', height: '100%', borderRadius: 22 },
  initialsBg: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  initialsTxt: { color: '#FFF', fontSize: 24, fontWeight: '900' },
  premiumBadge: { position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, borderRadius: 11, backgroundColor: THEME.colors.secondary, borderWidth: 2, borderColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  heroDetails: { flex: 1 },
  heroName: { ...THEME.typography.body, fontSize: 18, fontWeight: '800', color: THEME.colors.text },
  heroEmail: { ...THEME.typography.sub, color: THEME.colors.textTertiary, marginTop: 4 },

  categoryArea: { marginBottom: 32 },
  catLabel: { ...THEME.typography.label, marginBottom: 14, marginLeft: 4, letterSpacing: 1.5, color: THEME.colors.textTertiary },
  rowItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.colors.surface, padding: 14, borderRadius: THEME.roundness.lg, marginBottom: 12, borderWidth: 1, borderColor: THEME.colors.border, ...THEME.shadows.soft },
  rowIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 18 },
  rowMain: { flex: 1 },
  rowTitle: { ...THEME.typography.body, fontWeight: '700', fontSize: 15, color: THEME.colors.text },
  rowSub: { ...THEME.typography.caption, color: THEME.colors.textTertiary, marginTop: 2, fontSize: 12 },

  exitRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5F5', padding: 16, borderRadius: THEME.roundness.lg, marginTop: 10, borderWidth: 1, borderColor: '#FED7D7', gap: 14 },
  exitIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', ...THEME.shadows.soft },
  exitTxt: { ...THEME.typography.body, color: THEME.colors.expense, fontWeight: '800', fontSize: 15 },

  footerWrap: { marginTop: 44, alignItems: 'center', gap: 6 },
  versionTxt: { ...THEME.typography.label, color: THEME.colors.textTertiary, fontSize: 10 }
});
