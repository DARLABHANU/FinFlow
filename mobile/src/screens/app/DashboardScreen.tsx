import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useTransactionStore } from '../../store/transactionStore';

export default function DashboardScreen({ navigation }: any) {
  const { user, currency } = useAuthStore();
  const transactions = useTransactionStore((state) => state.transactions);
  const fetchTransactions = useTransactionStore((state) => state.fetchTransactions);
  
  const curSymbol = currency === 'USD' ? '$' : '₹';

  useEffect(() => {
    fetchTransactions();
  }, []);

  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const expenseCategoryTotals = transactions
    .filter(t => t.type === 'Expense')
    .reduce((acc: any, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const topCategories = Object.entries(expenseCategoryTotals)
    .map(([name, amount]: any) => ({ name, amount, perc: ((amount / (totalExpense || 1)) * 100).toFixed(0) }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  const colors = ['#1e3b8a', '#3b82f6', '#60a5fa', '#93c5fd'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.profileIcon} onPress={() => navigation.navigate('Profile')}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.profileImg} />
            ) : (
              <MaterialIcons name="person" size={28} color="#1e3b8a" />
            )}
          </TouchableOpacity>
          <View style={styles.greeting}>
            <Text style={styles.greetingSub}>WELCOME BACK</Text>
            <Text style={styles.greetingTitle}>Good Morning, {user?.name || 'Alex'}</Text>
          </View>
          <TouchableOpacity style={styles.notification}>
            <MaterialIcons name="notifications" size={24} color="#64748b" />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>{curSymbol}{balance.toFixed(2)}</Text>
          <View style={styles.balanceStats}>
            <View style={styles.statBox}>
              <MaterialIcons name="arrow-downward" size={16} color="#4ade80" />
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>INCOME</Text>
                <Text style={styles.statValue}>+{curSymbol}{totalIncome.toFixed(2)}</Text>
              </View>
            </View>
            <View style={styles.statBox}>
              <MaterialIcons name="arrow-upward" size={16} color="#f87171" />
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>EXPENSES</Text>
                <Text style={styles.statValue}>-{curSymbol}{totalExpense.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Spending Breakdown</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AnalyticsTab')}>
              <Text style={styles.sectionLink}>Details</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.breakdownCard}>
             <View style={styles.circlePlaceholder}>
               <Text style={styles.circleTotal}>{curSymbol}{totalExpense.toFixed(2)}</Text>
               <Text style={styles.circleLabel}>SPENT</Text>
             </View>
             <View style={styles.legendGrid}>
               {topCategories.length > 0 ? topCategories.map((c, idx) => (
                 <View key={c.name} style={styles.legendItem}>
                   <View style={[styles.dot, {backgroundColor: colors[idx % colors.length]}]}/>
                   <Text style={styles.legendText} numberOfLines={1}>{c.name} ({c.perc}%)</Text>
                 </View>
               )) : (
                 <Text style={{color: '#94a3b8', textAlign: 'center', flex: 1}}>No expenses yet.</Text>
               )}
             </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('HistoryTab')}>
              <Text style={styles.sectionLink}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.list}>
            {transactions.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Text style={{ color: '#94a3b8' }}>No transactions found. Add one!</Text>
              </View>
            ) : (
              transactions.slice(0, 5).map((t) => (
                <View key={t.id} style={styles.transactionCard}>
                  <View style={styles.tIconRow}>
                    <View style={[styles.tIconBox, { backgroundColor: t.type === 'Income' ? '#dcfce7' : '#fee2e2' }]}>
                       <MaterialIcons name={t.type === 'Income' ? "payments" : "shopping-bag"} size={20} color={t.type === 'Income' ? "#16a34a" : "#ea580c"} />
                    </View>
                    <View>
                      <Text style={styles.tNote}>{t.note}</Text>
                      <Text style={styles.tCategory}>{t.category} • {new Date(t.date).toLocaleDateString()}</Text>
                    </View>
                  </View>
                  <Text style={[styles.tAmount, { color: t.type === 'Income' ? '#16a34a' : '#dc2626' }]}>
                    {t.type === 'Income' ? '+' : '-'}{curSymbol}{t.amount.toFixed(2)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* FAB Floating action button handled globally normally, but explicitly here as per UI */}
      <TouchableOpacity 
         style={styles.fab} 
         onPress={() => navigation.navigate('AddTransaction')}
      >
        <MaterialIcons name="add" size={32} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f6f6f8' },
  container: { paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  profileIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1e3b8a10', borderWidth: 2, borderColor: '#1e3b8a20', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  profileImg: { width: '100%', height: '100%', borderRadius: 24 },
  greeting: { flex: 1, paddingHorizontal: 16 },
  greetingSub: { fontSize: 12, fontWeight: '600', color: '#64748b', letterSpacing: 1 },
  greetingTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  notification: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, backgroundColor: '#ef4444', borderRadius: 4 },
  
  balanceCard: { marginHorizontal: 20, padding: 24, backgroundColor: '#1e3b8a', borderRadius: 24, overflow: 'hidden', elevation: 8 },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  balanceAmount: { color: '#FFF', fontSize: 32, fontWeight: 'bold', marginTop: 4 },
  balanceStats: { flexDirection: 'row', marginTop: 24, gap: 16 },
  statBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, gap: 8 },
  statContent: { },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 'bold' },
  statValue: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },

  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  sectionLink: { fontSize: 14, fontWeight: 'bold', color: '#1e3b8a' },

  breakdownCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#f1f5f9' },
  circlePlaceholder: { alignSelf: 'center', width: 140, height: 140, borderRadius: 70, borderWidth: 12, borderColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  circleTotal: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  circleLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748b' },
  legendGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', width: '48%', gap: 8 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 12, color: '#475569' },

  list: { gap: 12 },
  transactionCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  tIconRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  tNote: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  tCategory: { fontSize: 11, color: '#64748b' },
  tAmount: { fontSize: 14, fontWeight: 'bold' },

  fab: { position: 'absolute', bottom: 20, right: 20, width: 64, height: 64, borderRadius: 32, backgroundColor: '#1e3b8a', alignItems: 'center', justifyContent: 'center', elevation: 6 }
});
