import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/authStore';
import { useTransactionStore } from '../../store/transactionStore';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout, updateUserProfile } = useAuthStore();
  const { transactions } = useTransactionStore();
  
  const [isModalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);

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
      'Logout',
      'Are you sure you want to exit?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  };

  const handleUpdate = async () => {
    if (!newName.trim()) return;
    setIsUpdating(true);
    try {
      await updateUserProfile(newName, user?.avatar);
      setModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const stats = [
    { label: 'Transactions', value: transactions.length, icon: 'receipt' },
    { label: 'Category', value: transactions[0]?.category || 'General', icon: 'restaurant' },
    { label: 'Since', value: user?.createdAt ? new Date(user.createdAt).getFullYear() : '2026', icon: 'event' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity style={styles.editBtn} onPress={() => setModalVisible(true)}>
          <MaterialIcons name="edit" size={20} color="#1e3b8a" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
             {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
             ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
                </View>
             )}
             <TouchableOpacity style={styles.cameraBadge} onPress={pickImage}>
                <MaterialIcons name="camera-alt" size={14} color="#FFF" />
             </TouchableOpacity>
          </TouchableOpacity>
          {isUpdating && <ActivityIndicator size="small" color="#1e3b8a" style={{ marginTop: 10 }} />}
          <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
        </View>

        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statItem}>
              <MaterialIcons name={s.icon as any} size={20} color="#1e3b8a" />
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.menuItems}>
          <Text style={styles.menuLabel}>GENERAL</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => setModalVisible(true)}>
            <View style={[styles.menuIcon, { backgroundColor: '#eff6ff' }]}>
               <MaterialIcons name="person-outline" size={20} color="#2563eb" />
            </View>
            <Text style={styles.menuText}>Personal Details</Text>
             <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
             <View style={[styles.menuIcon, { backgroundColor: '#fef2f2' }]}>
                <MaterialIcons name="security" size={20} color="#dc2626" />
             </View>
            <Text style={styles.menuText}>Password & Security</Text>
             <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
             <View style={[styles.menuIcon, { backgroundColor: '#f0fdf4' }]}>
                <MaterialIcons name="language" size={20} color="#16a34a" />
             </View>
            <Text style={styles.menuText}>Language</Text>
             <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
           <MaterialIcons name="logout" size={20} color="#ef4444" />
           <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>FinFlow v1.0.4 - Premium</Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Profile</Text>
            <Text style={styles.inputLabel}>FULL NAME</Text>
            <TextInput 
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter your name"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate} disabled={isUpdating}>
                {isUpdating ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  editBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },

  scroll: { paddingBottom: 40 },
  profileSection: { alignItems: 'center', paddingVertical: 20 },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1e3b8a', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatar: { },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: '#FFF' },
  avatarImage: { width: '100%', height: '100%' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: '#1e3b8a', borderWidth: 3, borderColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  userName: { fontSize: 24, fontWeight: '900', color: '#0f172a', marginTop: 16 },
  userEmail: { fontSize: 14, color: '#64748b', marginTop: 4, fontWeight: '500' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginVertical: 30 },
  statItem: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 20, width: '30%', alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  statVal: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginVertical: 4 },
  statLabel: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' },

  menuItems: { paddingHorizontal: 20 },
  menuLabel: { fontSize: 11, fontWeight: '900', color: '#94a3b8', letterSpacing: 1.5, marginBottom: 15 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  menuIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  menuText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#334155' },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginTop: 40, height: 56, borderRadius: 16, borderWidth: 1, borderColor: '#fee2e2', gap: 10 },
  logoutText: { fontSize: 16, fontWeight: 'bold', color: '#ef4444' },
  version: { textAlign: 'center', marginTop: 30, fontSize: 12, color: '#cbd5e1', fontWeight: '500' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', marginBottom: 20 },
  inputLabel: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', marginBottom: 8 },
  input: { borderBottomWidth: 1, borderBottomColor: '#e2e8f0', height: 44, fontSize: 16, color: '#0f172a', fontWeight: '600', marginBottom: 30 },
  modalButtons: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end' },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  cancelBtnText: { color: '#64748b', fontWeight: '700' },
  saveBtn: { backgroundColor: '#1e3b8a', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 12, alignItems: 'center', justifyContent: 'center', minWidth: 100 },
  saveBtnText: { color: '#FFF', fontWeight: '700' }
});
