import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTransactionStore } from '../../store/transactionStore';
import { useAuthStore } from '../../store/authStore';

export default function TransactionHistoryScreen({ navigation }: any) {
  const { transactions, fetchTransactions, deleteApiTransaction } = useTransactionStore();
  const { currency } = useAuthStore();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  
  const curSymbol = currency === 'USD' ? '$' : '₹';

  // Categories for chips
  const categoryChips = ['All', 'Shop', 'Food', 'Travel', 'Bills', 'Salary', 'Business'];

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.note.toLowerCase().includes(search.toLowerCase()) || 
                             t.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [transactions, search, activeCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to remove this record?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteApiTransaction(id) }
      ]
    );
  };

  const groupTransactions = (txs: any[]) => {
    const groups: { [key: string]: any[] } = {};
    txs.forEach(t => {
      const date = new Date(t.date);
      const now = new Date();
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);

      let label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      if (date.toDateString() === now.toDateString()) label = 'TODAY';
      else if (date.toDateString() === yesterday.toDateString()) label = 'YESTERDAY';

      if (!groups[label]) groups[label] = [];
      groups[label].push(t);
    });
    return groups;
  };

  const grouped = groupTransactions(filteredTransactions);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.title}>History</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialIcons name="filter-list" size={24} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <View style={styles.contentHeader}>
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={20} color="#94a3b8" />
          <TextInput 
             style={styles.searchInput} 
             placeholder="Search by note or category..." 
             placeholderTextColor="#94a3b8" 
             value={search}
             onChangeText={setSearch}
          />
          {search.length > 0 && (
             <TouchableOpacity onPress={() => setSearch('')}>
                <MaterialIcons name="close" size={18} color="#94a3b8" />
             </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow} contentContainerStyle={{ gap: 8 }}>
          {categoryChips.map(c => (
             <TouchableOpacity 
              key={c} 
              style={[styles.chip, activeCategory === c && styles.activeChip]}
              onPress={() => setActiveCategory(c)}
             >
                <Text style={activeCategory === c ? styles.activeChipText : styles.chipText}>{c}</Text>
             </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {Object.keys(grouped).length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="history" size={64} color="#e2e8f0" />
            <Text style={styles.emptyText}>No records found</Text>
          </View>
        ) : (
          Object.keys(grouped).map(date => (
            <View key={date} style={styles.group}>
              <Text style={styles.dateLabel}>{date}</Text>
              {grouped[date].map(t => (
                <View key={t.id} style={styles.card}>
                  <View style={[styles.iconBox, { backgroundColor: t.type === 'Income' ? '#eff6ff' : '#fff1f2' }]}>
                    <MaterialIcons 
                      name={t.type === 'Income' ? 'call-received' : 'call-made'} 
                      size={20} 
                      color={t.type === 'Income' ? '#2563eb' : '#e11d48'} 
                    />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.note} numberOfLines={1}>{t.note || t.category}</Text>
                    <Text style={styles.category}>{t.category} • {new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                  </View>
                  <View style={styles.cardRight}>
                    <Text style={[styles.amount, { color: t.type === 'Income' ? '#16a34a' : '#0f172a' }]}>
                      {t.type === 'Income' ? '+' : '-'}{curSymbol}{t.amount.toFixed(2)}
                    </Text>
                    <TouchableOpacity onPress={() => handleDelete(t.id)} style={styles.deleteBtn}>
                      <MaterialIcons name="delete-outline" size={18} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF' },
  iconBtn: { padding: 4 },
  title: { fontSize: 20, fontWeight: '900', color: '#0f172a' },

  contentHeader: { backgroundColor: '#FFF', paddingBottom: 20 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 16, marginHorizontal: 20, paddingHorizontal: 16, height: 50 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1e293b', fontWeight: '500' },
  chipsRow: { marginTop: 20, paddingHorizontal: 20 },
  chip: { paddingHorizontal: 16, height: 38, borderRadius: 19, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  activeChip: { backgroundColor: '#1e3b8a', borderColor: '#1e3b8a' },
  chipText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  activeChipText: { fontSize: 13, fontWeight: '700', color: '#FFF' },

  list: { padding: 20, paddingBottom: 40 },
  group: { marginBottom: 25 },
  dateLabel: { fontSize: 11, fontWeight: '900', color: '#94a3b8', letterSpacing: 1.5, marginBottom: 15, textTransform: 'uppercase' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 20, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 1 },
  iconBox: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1, marginHorizontal: 12 },
  note: { fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
  category: { fontSize: 12, color: '#94a3b8', fontWeight: '500', marginTop: 2 },
  cardRight: { alignItems: 'flex-end', justifyContent: 'space-between', height: 44 },
  amount: { fontSize: 15, fontWeight: '900' },
  deleteBtn: { padding: 2 },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 14, fontWeight: 'bold', color: '#94a3b8' }
});
