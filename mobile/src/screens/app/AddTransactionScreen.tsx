import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTransactionStore } from '../../store/transactionStore';
import { useAuthStore } from '../../store/authStore';

export default function AddTransactionScreen({ navigation }: any) {
  const [type, setType] = useState<'Income' | 'Expense'>('Expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());
  
  const createApiTransaction = useTransactionStore((state) => state.createApiTransaction);
  const { currency } = useAuthStore();
  const curSymbol = currency === 'USD' ? '$' : '₹';

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleSave = async () => {
    try {
      if (!amount || isNaN(parseFloat(amount))) {
        return Alert.alert('Error', 'Please enter a valid amount');
      }
      await createApiTransaction({
        amount,
        type,
        category,
        note,
        date: date.toISOString()
      });
      navigation.goBack();
    } catch (e) {
      console.log('Failed to save transaction');
    }
  };

  const expenseCategories = [
    { name: 'Shop', icon: 'shopping-cart' },
    { name: 'Food', icon: 'restaurant' },
    { name: 'Travel', icon: 'directions-car' },
    { name: 'Bills', icon: 'payments' },
  ];

  const incomeSources = [
    { name: 'Salary', icon: 'account-balance-wallet' },
    { name: 'Business', icon: 'business' },
    { name: 'Gift', icon: 'card-giftcard' },
    { name: 'Investment', icon: 'trending-up' },
  ];

  const currentCategories = type === 'Expense' ? expenseCategories : incomeSources;

  // Reset category when type changes to ensure it's valid for the current list
  useEffect(() => {
    setCategory(type === 'Expense' ? 'Food' : 'Salary');
  }, [type]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="close" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Transaction</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Scanner')} style={styles.closeBtn}>
          <MaterialIcons name="camera-alt" size={24} color="#1e3b8a" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleBtn, type === 'Income' && styles.activeToggle]}
            onPress={() => setType('Income')}
          >
            <Text style={[styles.toggleText, type === 'Income' && styles.activeToggleText]}>Income</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, type === 'Expense' && styles.activeToggle]}
            onPress={() => setType('Expense')}
          >
            <Text style={[styles.toggleText, type === 'Expense' && styles.activeToggleText]}>Expense</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Enter Amount</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currency}>{curSymbol}</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>{type === 'Expense' ? 'SELECT CATEGORY' : 'SELECT INCOME SOURCE'}</Text>
        <View style={styles.catGrid}>
          {currentCategories.map((c: any) => (
            <TouchableOpacity 
              key={c.name} 
              style={styles.catItem}
              onPress={() => setCategory(c.name)}
            >
              <View style={[styles.catIconBox, category === c.name && styles.activeCatBox]}>
                <MaterialIcons name={c.icon as any} size={24} color={category === c.name ? '#FFF' : '#64748b'} />
              </View>
              <Text style={[styles.catText, category === c.name && styles.activeCatText]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.fieldContainer}>
          <View style={styles.fieldRow}>
            <View style={styles.fieldIcon}><MaterialIcons name="calendar-today" size={20} color="#1e3b8a" /></View>
            <View style={styles.fieldInputGroup}>
              <Text style={styles.fieldLabel}>Date</Text>
              <Text style={styles.fieldVal}>{formatDate(date)}</Text>
            </View>
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.fieldIcon}><MaterialIcons name="description" size={20} color="#1e3b8a" /></View>
            <View style={styles.fieldInputGroup}>
              <Text style={styles.fieldLabel}>Notes</Text>
              <TextInput 
                style={styles.noteInput} 
                placeholder="What was this for?" 
                value={note}
                onChangeText={setNote}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <MaterialIcons name="check-circle" size={24} color="#FFF" />
          <Text style={styles.saveBtnText}>Save Transaction</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f6f8' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  closeBtn: { padding: 8, borderRadius: 20 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  
  scroll: { padding: 16 },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 12, padding: 4, height: 48 },
  toggleBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  activeToggle: { backgroundColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  activeToggleText: { color: '#1e3b8a' },

  amountContainer: { alignItems: 'center', paddingVertical: 40 },
  amountLabel: { fontSize: 14, fontWeight: '500', color: '#64748b', marginBottom: 8 },
  amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  currency: { fontSize: 32, fontWeight: 'bold', color: '#1e3b8a', marginRight: 4 },
  amountInput: { fontSize: 48, fontWeight: 'bold', color: '#0f172a', minWidth: 100, textAlign: 'center' },

  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#64748b', letterSpacing: 1, marginBottom: 16 },
  catGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  catItem: { alignItems: 'center' },
  catIconBox: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  activeCatBox: { backgroundColor: '#1e3b8a', shadowColor: '#1e3b8a', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  catText: { fontSize: 12, fontWeight: '500', color: '#64748b' },
  activeCatText: { color: '#1e3b8a', fontWeight: 'bold' },

  fieldContainer: { gap: 16 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 16, gap: 16 },
  fieldIcon: { backgroundColor: 'rgba(30,59,138,0.1)', padding: 8, borderRadius: 8 },
  fieldInputGroup: { flex: 1 },
  fieldLabel: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' },
  fieldVal: { fontSize: 14, fontWeight: '600', color: '#0f172a', marginTop: 4 },
  noteInput: { fontSize: 14, fontWeight: '600', color: '#0f172a', padding: 0, marginTop: 4 },

  footer: { padding: 24, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  saveBtn: { backgroundColor: '#1e3b8a', height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#1e3b8a', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
