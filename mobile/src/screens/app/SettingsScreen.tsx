import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

export default function SettingsScreen({ navigation }: any) {
  const { user, isPrivacyMode, currency, setCurrency, logout, toggleBiometric, togglePrivacyMode } = useAuthStore();

  const getInitials = (name = 'User') => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleCurrencySwitch = () => {
    Alert.alert(
      "Choose Currency",
      "Select your preferred currency display:",
      [
        { text: "USD ($)", onPress: () => setCurrency('USD') },
        { text: "INR (₹)", onPress: () => setCurrency('INR') },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
           <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.iconBtn}>
           <MaterialIcons name="person" size={24} color="#1e3b8a" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.profileCard} onPress={() => navigation.navigate('Profile')}>
          <View style={styles.avatar}>
             {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
             ) : (
                <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
             )}
          </View>
          <View>
             <Text style={styles.pName}>{user?.name || 'My Profile'}</Text>
             <Text style={styles.pBadge}>{user?.email || 'admin@finflow.com'}</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>GENERAL</Text>
        <TouchableOpacity style={styles.settingItem} onPress={handleCurrencySwitch}>
           <View style={styles.sLeft}>
             <View style={styles.sIcon}><MaterialIcons name="payments" size={20} color="#1e3b8a" /></View>
             <Text style={styles.sText}>Currency</Text>
           </View>
           <View style={styles.sRight}>
             <Text style={styles.sVal}>{currency === 'USD' ? 'USD ($)' : 'INR (₹)'}</Text>
             <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
           </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>SECURITY & PRIVACY</Text>
        <View style={styles.settingItem}>
           <View style={styles.sLeft}>
             <View style={styles.sIcon}><MaterialIcons name="fingerprint" size={20} color="#1e3b8a" /></View>
             <View>
                <Text style={styles.sText}>Biometric Login</Text>
                <Text style={styles.sSub}>Use FaceID or Fingerprint</Text>
             </View>
           </View>
           <Switch 
             value={user?.isBiometricEnabled || false} 
             onValueChange={toggleBiometric}
             trackColor={{ true: '#1e3b8a', false: '#cbd5e1' }} 
           />
        </View>

        <View style={styles.settingItem}>
           <View style={styles.sLeft}>
             <View style={styles.sIcon}><MaterialIcons name="visibility-off" size={20} color="#1e3b8a" /></View>
             <View>
                <Text style={styles.sText}>Privacy Mode</Text>
                <Text style={styles.sSub}>Blur balances when inactive</Text>
             </View>
           </View>
           <Switch 
             value={isPrivacyMode} 
             onValueChange={togglePrivacyMode}
             trackColor={{ true: '#1e3b8a', false: '#cbd5e1' }} 
           />
        </View>
        
        <TouchableOpacity style={styles.logoutBtn} onPress={() => logout()}>
           <MaterialIcons name="logout" size={20} color="#dc2626" />
           <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
        
        <Text style={styles.version}>FinFlow Version 2.4.1</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f6f8' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(30,59,138,0.1)' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(30,59,138,0.1)' },
  
  scroll: { padding: 16 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 24, gap: 16 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#1e3b8a', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%', borderRadius: 28 },
  avatarText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  pName: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  pBadge: { fontSize: 14, color: '#64748b' },

  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#64748b', letterSpacing: 1, marginBottom: 8, paddingHorizontal: 8 },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 8 },
  sLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  sIcon: { width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(30,59,138,0.1)', alignItems: 'center', justifyContent: 'center' },
  sText: { fontSize: 16, fontWeight: '500', color: '#0f172a' },
  sSub: { fontSize: 12, color: '#64748b' },
  sRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sVal: { fontSize: 14, color: '#64748b' },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fef2f2', padding: 16, borderRadius: 16, marginTop: 40, borderWidth: 1, borderColor: '#fee2e2', gap: 8 },
  logoutText: { fontSize: 16, fontWeight: 'bold', color: '#dc2626' },
  version: { textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 24, fontWeight: '500' }
});
