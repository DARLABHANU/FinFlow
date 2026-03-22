import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTransactionStore } from '../../store/transactionStore';
import { useAuthStore } from '../../store/authStore';
import { THEME } from '../../theme/theme';

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
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
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
    { name: 'Shop', icon: 'shopping-cart', color: '#3b82f6' },
    { name: 'Food', icon: 'restaurant', color: '#10b981' },
    { name: 'Travel', icon: 'directions-car', color: '#8b5cf6' },
    { name: 'Bills', icon: 'payments', color: '#ef4444' },
    { name: 'Health', icon: 'medical-services', color: '#f43f5e' },
    { name: 'Others', icon: 'more-horiz', color: '#64748b' },
  ];

  const incomeSources = [
    { name: 'Salary', icon: 'account-balance-wallet', color: '#8b5cf6' },
    { name: 'Business', icon: 'business', color: '#3b82f6' },
    { name: 'Gift', icon: 'card-giftcard', color: '#f59e0b' },
    { name: 'Invest', icon: 'trending-up', color: '#10b981' },
  ];

  const currentCategories = type === 'Expense' ? expenseCategories : incomeSources;

  useEffect(() => {
    setCategory(type === 'Expense' ? 'Food' : 'Salary');
  }, [type]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="close" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>New Entry</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Scanner')} style={styles.scannerBtn}>
          <MaterialIcons name="camera-alt" size={22} color={THEME.colors.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Amount Display */}
          <View style={styles.amountContainer}>
             <Text style={styles.amountLabel}>ENTER THE AMOUNT</Text>
             <View style={styles.amountRow}>
                <Text style={styles.currencySymbol}>{curSymbol}</Text>
                <TextInput
                  style={styles.amountInput}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor="rgba(15, 23, 42, 0.2)"
                  autoFocus
                />
             </View>
          </View>

          {/* Type Toggle */}
          <View style={styles.toggleRow}>
             {['Income', 'Expense'].map((t: any) => (
                <TouchableOpacity 
                   key={t}
                   style={[styles.toggleBtn, type === t && (t === 'Income' ? styles.toggleIncome : styles.toggleExpense)]}
                   onPress={() => setType(t)}
                >
                   <Text style={[styles.toggleText, type === t && styles.activeToggleText]}>{t}</Text>
                </TouchableOpacity>
             ))}
          </View>

          {/* Category Scroller */}
          <Text style={styles.sectionTitle}>CATEGORY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            {currentCategories.map((c: any) => (
              <TouchableOpacity 
                key={c.name} 
                style={styles.catItem}
                onPress={() => setCategory(c.name)}
              >
                <View style={[styles.catIconBox, category === c.name && { backgroundColor: c.color }]}>
                  <MaterialIcons name={c.icon as any} size={26} color={category === c.name ? '#0f172a' : c.color} />
                </View>
                <Text style={[styles.catLabel, category === c.name && styles.activeCatLabel]}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Form Fields */}
          <View style={styles.form}>
             <View style={styles.inputGroup}>
                <View style={[styles.fieldIcon, { backgroundColor: '#f0f9ff' }]}>
                   <MaterialIcons name="event" size={20} color="#0284c7" />
                </View>
                <View style={styles.fieldContent}>
                   <Text style={styles.fieldLabel}>TRANSACTION DATE</Text>
                   <Text style={styles.fieldValue}>{formatDate(date)}</Text>
                </View>
             </View>

             <View style={styles.inputGroup}>
                <View style={[styles.fieldIcon, { backgroundColor: '#fdf4ff' }]}>
                   <MaterialIcons name="segment" size={20} color="#a21caf" />
                </View>
                <View style={styles.fieldContent}>
                   <Text style={styles.fieldLabel}>ADD A NOTE</Text>
                   <TextInput 
                     style={styles.noteInput}
                     placeholder="What was this for?"
                     value={note}
                     onChangeText={setNote}
                     placeholderTextColor={THEME.colors.textTertiary}
                   />
                </View>
             </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.9} onPress={handleSave}>
          <LinearGradient
             colors={[THEME.colors.primary, THEME.colors.secondary]}
             style={styles.saveBtn}
             start={{x:0, y:0}}
             end={{x:1, y:1}}
          >
             <MaterialIcons name="check" size={24} color="#FFF" />
             <Text style={styles.saveBtnText}>Record Transaction</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 15 },
  closeBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: THEME.colors.background },
  scannerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: `${THEME.colors.primary}10` },
  title: { ...THEME.typography.h3, fontSize: 18 },
  
  scroll: { padding: 24 },
  amountContainer: { alignItems: 'center', marginVertical: 32 },
  amountLabel: { ...THEME.typography.label, color: THEME.colors.textTertiary, letterSpacing: 2 },
  amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  currencySymbol: { fontSize: 36, fontWeight: '900', color: THEME.colors.primary, marginRight: 8 },
  amountInput: { fontSize: 52, fontWeight: '900', color: THEME.colors.text, minWidth: 100, textAlign: 'center' },

  toggleRow: { flexDirection: 'row', backgroundColor: THEME.colors.background, borderRadius: THEME.roundness.lg, padding: 6, marginBottom: 40 },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: THEME.roundness.md },
  toggleIncome: { backgroundColor: THEME.colors.success },
  toggleExpense: { backgroundColor: THEME.colors.danger },
  toggleText: { ...THEME.typography.body, fontWeight: 'bold', color: THEME.colors.textSecondary },
  activeToggleText: { color: '#0f172a' },

  sectionTitle: { ...THEME.typography.label, marginBottom: 20 },
  catScroll: { marginHorizontal: -24, paddingHorizontal: 24, marginBottom: 40 },
  catItem: { alignItems: 'center', marginRight: 24, gap: 10 },
  catIconBox: { width: 62, height: 62, borderRadius: 18, backgroundColor: THEME.colors.background, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: THEME.colors.border },
  catLabel: { ...THEME.typography.caption, fontWeight: '700', color: THEME.colors.textSecondary },
  activeCatLabel: { color: THEME.colors.text },

  form: { gap: 16 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.colors.background, padding: 16, borderRadius: THEME.roundness.lg, gap: 16, borderLeftWidth: 4, borderLeftColor: THEME.colors.primary },
  fieldIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  fieldContent: { flex: 1 },
  fieldLabel: { ...THEME.typography.label, fontSize: 9, color: THEME.colors.textSecondary },
  fieldValue: { ...THEME.typography.body, fontSize: 15, fontWeight: '700', marginTop: 2, color: THEME.colors.text },
  noteInput: { ...THEME.typography.body, fontSize: 15, fontWeight: '700', padding: 0, marginTop: 2, color: THEME.colors.text },

  footer: { padding: 24, paddingBottom: 32, backgroundColor: THEME.colors.surface },
  saveBtn: { height: 60, borderRadius: THEME.roundness.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, ...THEME.shadows.lg },
  saveBtnText: { color: '#FFF', fontSize: 17, fontWeight: '900', letterSpacing: 0.5 }
});
