import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/authStore';
import { useTransactionStore } from '../../store/transactionStore';
import { THEME } from '../../theme/theme';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout, updateUserProfile } = useAuthStore();
  const { transactions } = useTransactionStore();
  
  const [isModalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const getInitials = (name = 'U') => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to change your avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setIsUpdating(true);
      try {
        const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
        await updateUserProfile(user?.name || 'User', base64);
        Alert.alert('Success', 'Profile picture updated!');
      } catch (err) {
        Alert.alert('Error', 'Failed to upload image');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to log out of FinFlow?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: logout }
      ]
    );
  };

  const handleUpdate = async () => {
    if (!newName.trim()) return;
    setIsUpdating(true);
    try {
      await updateUserProfile(newName, user?.avatar);
      setModalVisible(false);
      Alert.alert('Success', 'Profile updated!');
    } catch (e) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setIsUpdating(false);
    }
  };

  const stats = [
    { label: 'Activity', value: transactions.length, icon: 'receipt', color: THEME.colors.secondary },
    { label: 'Status', value: 'Premium', icon: 'verified', color: THEME.colors.accent },
    { label: 'Joined', value: user?.createdAt ? new Date(user.createdAt).getFullYear() : '2026', icon: 'event', color: THEME.colors.secondary },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <MaterialIcons name="arrow-back" size={24} color={THEME.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={() => setModalVisible(true)}>
          <MaterialIcons name="tune" size={22} color={THEME.colors.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHero}>
          <TouchableOpacity style={styles.mainAvatar} onPress={pickImage} activeOpacity={0.9}>
             {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
             ) : (
                <View style={styles.initialsBox}>
                   <Text style={styles.initialsText}>{getInitials(user?.name)}</Text>
                </View>
             )}
             <LinearGradient 
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)']} 
                style={styles.avatarOverlay}
             >
                <MaterialIcons name="photo-camera" size={20} color="#FFF" />
             </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.nameText} numberOfLines={1}>{user?.name || 'User Profile'}</Text>
          <Text style={styles.emailText}>{user?.email || 'user@finflow.com'}</Text>
          {isUpdating && <ActivityIndicator color={THEME.colors.secondary} style={{ marginTop: 12 }} />}
        </View>

        <View style={styles.statsBar}>
           {stats.map((s, idx) => (
             <React.Fragment key={s.label}>
               <View style={styles.statCell}>
                  <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
               </View>
               {idx < 2 && <View style={styles.statDivider} />}
             </React.Fragment>
           ))}
        </View>

        <View style={styles.menuSection}>
           <Text style={styles.sectionLabel}>PREFERENCES</Text>
           
           {[
             { title: 'Personal Information', icon: 'person-outline', color: THEME.colors.secondary, bg: '#F0F9FF', onPress: () => setModalVisible(true) },
             { title: 'Security & Access', icon: 'lock-open', color: THEME.colors.expense, bg: '#FFF1F2' },
             { title: 'App Language', icon: 'translate', color: THEME.colors.accent, bg: '#F0FDF4' },
             { title: 'Regional Format', icon: 'monetization-on', color: THEME.colors.secondary, bg: '#F0F9FF', route: 'Settings' }
           ].map((item, idx) => (
             <TouchableOpacity key={idx} style={styles.menuItem} onPress={item.onPress || (item.route ? () => navigation.navigate(item.route) : undefined)}>
                <View style={[styles.menuIcon, { backgroundColor: item.bg }]}>
                   <MaterialIcons name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <MaterialIcons name="chevron-right" size={20} color={THEME.colors.border} />
             </TouchableOpacity>
           ))}
        </View>

        <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
           <View style={styles.logoutIcon}>
              <MaterialIcons name="power-settings-new" size={22} color={THEME.colors.expense} />
           </View>
           <Text style={styles.logoutLabel}>Disconnect Account</Text>
        </TouchableOpacity>

        <View style={styles.footerInfo}>
           <Text style={styles.footerVersion}>FINFLOW PREMIUM v3.0.0-PRO</Text>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Update Details</Text>
            <Text style={styles.labelSmall}>FULL NAME</Text>
            <TextInput 
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Your name"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleUpdate} disabled={isUpdating}>
                 {isUpdating ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmText}>Update</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: THEME.colors.surface },
  headerBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: THEME.colors.background, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...THEME.typography.h3, fontSize: 17, color: THEME.colors.primary, fontWeight: '800' },

  scroll: { paddingBottom: 60 },
  profileHero: { alignItems: 'center', marginTop: 32 },
  mainAvatar: { width: 120, height: 120, borderRadius: 40, overflow: 'hidden', backgroundColor: THEME.colors.primary, ...THEME.shadows.medium },
  avatarImg: { width: '100%', height: '100%', borderRadius: 40 },
  initialsBox: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  initialsText: { fontSize: 48, fontWeight: '900', color: '#FFF' },
  avatarOverlay: { position: 'absolute', bottom: 0, left:0, right: 0, height: 40, alignItems: 'center', justifyContent: 'center' },
  nameText: { ...THEME.typography.h2, fontSize: 26, marginTop: 24, color: THEME.colors.text },
  emailText: { ...THEME.typography.sub, color: THEME.colors.textTertiary, marginTop: 4 },

  statsBar: { flexDirection: 'row', backgroundColor: THEME.colors.surface, marginHorizontal: 20, marginTop: 32, borderRadius: THEME.roundness.lg, padding: 20, alignItems: 'center', ...THEME.shadows.soft, borderWidth: 1, borderColor: THEME.colors.border },
  statCell: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 30, backgroundColor: THEME.colors.border },
  statValue: { ...THEME.typography.h3, fontSize: 18, color: THEME.colors.primary },
  statLabel: { ...THEME.typography.label, fontSize: 9, marginTop: 4, color: THEME.colors.textTertiary },

  menuSection: { marginTop: 32, paddingHorizontal: 20 },
  sectionLabel: { ...THEME.typography.label, marginBottom: 16, marginLeft: 4, color: THEME.colors.textTertiary },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: THEME.colors.border },
  menuIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  menuTitle: { flex: 1, ...THEME.typography.body, fontWeight: '700', color: THEME.colors.text, fontSize: 15 },

  logoutRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 32, backgroundColor: '#FFF5F5', marginHorizontal: 20, padding: 16, borderRadius: THEME.roundness.lg, borderWidth: 1, borderColor: '#FED7D7' },
  logoutIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', marginRight: 16, ...THEME.shadows.soft },
  logoutLabel: { ...THEME.typography.body, color: THEME.colors.expense, fontWeight: '800', fontSize: 15 },

  footerInfo: { marginTop: 48, alignItems: 'center', gap: 6 },
  footerVersion: { ...THEME.typography.label, color: THEME.colors.textTertiary, fontSize: 10 },

  modalBg: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'center', padding: 24 },
  modalBox: { backgroundColor: THEME.colors.surface, borderRadius: 28, padding: 28, ...THEME.shadows.strong },
  modalTitle: { ...THEME.typography.h2, fontSize: 22, marginBottom: 24 },
  labelSmall: { ...THEME.typography.label, marginBottom: 8, color: THEME.colors.textTertiary },
  modalInput: { borderBottomWidth: 2, borderBottomColor: THEME.colors.secondary, height: 52, fontSize: 18, fontWeight: '700', color: THEME.colors.text, marginBottom: 32 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 20 },
  cancelText: { ...THEME.typography.sub, color: THEME.colors.textTertiary, fontWeight: '700' },
  confirmBtn: { backgroundColor: THEME.colors.secondary, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 14, ...THEME.shadows.medium },
  confirmText: { ...THEME.typography.body, color: '#FFF', fontWeight: '800' }
});
