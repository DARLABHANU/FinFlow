import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTransactionStore } from '../../store/transactionStore';
import { useAuthStore } from '../../store/authStore';
import { THEME } from '../../theme/theme';

export default function TransactionHistoryScreen({ navigation }: any) {
  const { transactions, fetchTransactions, deleteApiTransaction } = useTransactionStore();
  const { currency } = useAuthStore();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  
  const curSymbol = currency === 'USD' ? '$' : '₹';

  const categoryChips = ['All', 'Shop', 'Food', 'Travel', 'Bills', 'Salary', 'Business', 'Health', 'Invest', 'Others'];

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = (t.note || t.category).toLowerCase().includes(search.toLowerCase());
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
      'Delete Record',
      'This action cannot be undone. Are you sure?',
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <MaterialIcons name="tune" size={22} color={THEME.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.topSticky}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color={THEME.colors.textTertiary} />
          <TextInput 
             style={styles.searchInput} 
             placeholder="Search transactions..." 
             placeholderTextColor={THEME.colors.textTertiary} 
             value={search}
             onChangeText={setSearch}
          />
          {search.length > 0 && (
             <TouchableOpacity onPress={() => setSearch('')}>
                <MaterialIcons name="cancel" size={20} color={THEME.colors.textTertiary} />
             </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={{ paddingRight: 40, gap: 10 }}>
          {categoryChips.map(c => (
             <TouchableOpacity 
               key={c} 
               style={[styles.chip, activeCategory === c && styles.activeChip]}
               onPress={() => setActiveCategory(c)}
             >
                <Text style={[styles.chipText, activeCategory === c && styles.activeChipText]}>{c}</Text>
             </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.colors.primary} />}
      >
        {Object.keys(grouped).length === 0 ? (
          <View style={styles.emptyWrap}>
             <View style={styles.emptyIconCircle}>
               <MaterialIcons name="receipt-long" size={48} color={THEME.colors.border} />
             </View>
             <Text style={styles.emptyText}>No transactions found</Text>
             <Text style={styles.emptySub}>Try adjusting your filters or search keywords</Text>
          </View>
        ) : (
          Object.keys(grouped).map(date => (
            <View key={date} style={styles.dayGroup}>
              <View style={styles.dateHeader}>
                 <View style={styles.dateLine} />
                 <Text style={styles.dateText}>{date}</Text>
                 <View style={styles.dateLine} />
              </View>
              {grouped[date].map(t => (
                <View key={t.id} style={styles.transactionCard}>
                  <View style={[styles.iconBox, { backgroundColor: t.type === 'Income' ? '#f0fdf4' : '#fff1f2' }]}>
                    <MaterialIcons 
                      name={t.type === 'Income' ? 'south-west' : 'north-east'} 
                      size={22} 
                      color={t.type === 'Income' ? THEME.colors.success : THEME.colors.danger} 
                    />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.noteLabel} numberOfLines={1}>{t.note || t.category}</Text>
                    <Text style={styles.categorySub}>{t.category} • {new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                  </View>
                  <View style={styles.cardRight}>
                    <Text style={[styles.amountText, { color: t.type === 'Income' ? THEME.colors.success : THEME.colors.text }]}>
                      {t.type === 'Income' ? '+' : '-'}{curSymbol}{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </Text>
                    <TouchableOpacity onPress={() => handleDelete(t.id)} style={styles.actionBtn}>
                      <MaterialIcons name="delete-sweep" size={18} color={THEME.colors.textTertiary} />
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
  container: { flex: 1, backgroundColor: THEME.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: THEME.colors.surface },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: THEME.colors.background, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...THEME.typography.h3, fontSize: 18 },
  filterBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: `${THEME.colors.primary}10`, alignItems: 'center', justifyContent: 'center' },

  topSticky: { backgroundColor: THEME.colors.surface, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: THEME.colors.border },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.colors.background, borderRadius: 16, marginHorizontal: 20, paddingHorizontal: 16, height: 52, marginTop: 4 },
  searchInput: { flex: 1, marginLeft: 12, ...THEME.typography.body, fontSize: 16, color: THEME.colors.text },
  
  chipScroll: { marginTop: 20, paddingHorizontal: 20 },
  chip: { paddingHorizontal: 20, height: 40, borderRadius: 20, backgroundColor: THEME.colors.background, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: THEME.colors.border },
  activeChip: { backgroundColor: THEME.colors.primary, borderColor: THEME.colors.primary, ...THEME.shadows.sm },
  chipText: { ...THEME.typography.caption, fontSize: 13, fontWeight: '700', color: THEME.colors.textSecondary },
  activeChipText: { color: '#FFF' },

  listContainer: { padding: 20, paddingBottom: 60 },
  dayGroup: { marginBottom: 32 },
  dateHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 20 },
  dateLine: { flex: 1, height: 1, backgroundColor: THEME.colors.border },
  dateText: { ...THEME.typography.label, color: THEME.colors.textTertiary },

  transactionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.colors.surface, padding: 14, borderRadius: THEME.roundness.xl, marginBottom: 12, ...THEME.shadows.sm, borderWidth: 1, borderColor: THEME.colors.border },
  iconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1, marginHorizontal: 16 },
  noteLabel: { ...THEME.typography.body, fontWeight: '800', fontSize: 16, color: THEME.colors.text },
  categorySub: { ...THEME.typography.caption, color: THEME.colors.textSecondary, marginTop: 2 },
  cardRight: { alignItems: 'flex-end', justifyContent: 'center', gap: 6 },
  amountText: { fontSize: 16, fontWeight: '900' },
  actionBtn: { padding: 4 },

  emptyWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 80, gap: 12 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: THEME.colors.surface, alignItems: 'center', justifyContent: 'center', ...THEME.shadows.sm },
  emptyText: { ...THEME.typography.h3, color: THEME.colors.text },
  emptySub: { ...THEME.typography.body, fontSize: 14, color: THEME.colors.textTertiary, textAlign: 'center', paddingHorizontal: 40 }
});
