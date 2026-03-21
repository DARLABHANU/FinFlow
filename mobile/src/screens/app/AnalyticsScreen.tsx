import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTransactionStore } from '../../store/transactionStore';
import { useAuthStore } from '../../store/authStore';
import { useAnalyticsStore } from '../../store/analyticsStore';

export default function AnalyticsScreen({ navigation }: any) {
  const { transactions } = useTransactionStore();
  const { data, fetchAnalytics, isLoading } = useAnalyticsStore();
  const { currency } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'Overview' | 'Income' | 'Expenses'>('Overview');
  const curSymbol = currency === 'USD' ? '$' : '₹';

  useEffect(() => {
    const fetchType = activeTab === 'Income' ? 'income' : 'expense';
    fetchAnalytics(fetchType);
  }, [activeTab]);

  const totalExpense = transactions
    .filter(t => t.type === 'Expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalIncome = transactions
    .filter(t => t.type === 'Income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const COLORS = ['#1e3b8a', '#38bdf8', '#818cf8', '#94a3b8', '#64748b'];

  if (isLoading && !data) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1e3b8a" />
        <Text style={{ marginTop: 16, color: '#64748b' }}>Calculating insights...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
         <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
         </TouchableOpacity>
         <Text style={styles.headerTitle}>Finance Insights</Text>
         <TouchableOpacity style={styles.iconBtn2} onPress={() => fetchAnalytics()}>
            <MaterialIcons name="refresh" size={20} color="#0f172a" />
         </TouchableOpacity>
      </View>
      
      <View style={styles.tabs}>
         {['Overview', 'Income', 'Expenses'].map((tab: any) => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
               <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
         ))}
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchAnalytics} />}
      >
        <View style={styles.card}>
           <View style={styles.cardHeader}>
             <View>
               <Text style={styles.cardSubtitle}>
                 {activeTab === 'Overview' ? 'Net Balance' : activeTab === 'Income' ? 'Total Income' : 'Total Spending'}
               </Text>
               <Text style={styles.cardTitle}>
                  {curSymbol}{
                    activeTab === 'Overview' ? (totalIncome - totalExpense).toFixed(2) : 
                    activeTab === 'Income' ? totalIncome.toFixed(2) : totalExpense.toFixed(2)
                  }
               </Text>
             </View>
             <View style={styles.badge}>
               <Text style={styles.badgeText}>Real-time</Text>
             </View>
           </View>
           
           <View style={styles.chartArea}>
              <View style={styles.donut}>
                 <Text style={styles.donutLabel}>Summary</Text>
                 <Text style={styles.donutVal}>{transactions.length} Txns</Text>
              </View>
           </View>

           <View style={styles.legend}>
              {data?.categoryBreakdown.map((item, idx) => (
                <View key={item.x} style={styles.lItem}>
                   <View style={[styles.lDot, {backgroundColor: COLORS[idx % COLORS.length]}]}/>
                   <Text style={styles.lText}>{item.x} ({curSymbol}{item.y.toFixed(0)})</Text>
                </View>
              ))}
              {(!data || data.categoryBreakdown.length === 0) && <Text style={styles.lText}>No data to show</Text>}
           </View>
        </View>

        <View style={styles.card}>
           <Text style={styles.cardTitleSm}>Activity Intensity</Text>
           <Text style={styles.cardSubtitle}>Your daily transaction volume over 5 weeks</Text>
           
           <View style={styles.heatmapGrid}>
             {data?.heatmap.map((day) => {
               const val = day.value || 0;
               let color = '#f1f5f9'; // Level 0 (Empty)
               if (val > 0 && val <= 500) color = '#dbeafe'; // Level 1 (Low)
               else if (val > 500 && val <= 2000) color = '#93c5fd'; // Level 2 (Med)
               else if (val > 2000 && val <= 5000) color = '#3b82f6'; // Level 3 (High)
               else if (val > 5000) color = '#1e3b8a'; // Level 4 (Huge)

               return (
                 <View key={day.date} style={[styles.hBox, { backgroundColor: color }]} />
               );
             })}
           </View>

           {/* Color Legend for Heatmap */}
           <View style={styles.hLegend}>
              <Text style={styles.hLegendText}>Less</Text>
              <View style={[styles.hLegendDot, {backgroundColor: '#f1f5f9'}]}/>
              <View style={[styles.hLegendDot, {backgroundColor: '#dbeafe'}]}/>
              <View style={[styles.hLegendDot, {backgroundColor: '#93c5fd'}]}/>
              <View style={[styles.hLegendDot, {backgroundColor: '#3b82f6'}]}/>
              <View style={[styles.hLegendDot, {backgroundColor: '#1e3b8a'}]}/>
              <Text style={styles.hLegendText}>More</Text>
           </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f6f8' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  iconBtn2: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#f1f5f9' },
  headerTitle: { flex: 1, textAlign: 'left', marginLeft: 8, fontSize: 18, fontWeight: 'bold' },
  tabs: { flexDirection: 'row', backgroundColor: '#FFF', gap: 0, paddingHorizontal: 20, justifyContent: 'space-between' },
  tab: { paddingVertical: 16, borderBottomWidth: 3, borderBottomColor: 'transparent', flex: 1, alignItems: 'center' },
  activeTab: { borderBottomColor: '#1e3b8a' },
  tabText: { fontSize: 14, fontWeight: 'bold', color: '#64748b' },
  activeTabText: { fontSize: 14, fontWeight: 'bold', color: '#1e3b8a' },
  
  scroll: { padding: 16, gap: 16 },
  card: { backgroundColor: '#FFF', padding: 24, borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  cardSubtitle: { fontSize: 13, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardTitle: { fontSize: 28, fontWeight: '900', color: '#1e3b8a', marginTop: 4 },
  badge: { backgroundColor: '#ecfdf5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  badgeText: { color: '#10b981', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },

  chartArea: { height: 180, alignItems: 'center', justifyContent: 'center' },
  donut: { width: 140, height: 140, borderRadius: 70, borderWidth: 18, borderColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  donutLabel: { fontSize: 11, color: '#94a3b8', fontWeight: 'bold' },
  donutVal: { fontSize: 14, fontWeight: '900', color: '#1e3b8a' },

  legend: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 24, gap: 12 },
  lItem: { flexDirection: 'row', alignItems: 'center', width: '45%' },
  lDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  lText: { fontSize: 12, fontWeight: '700', color: '#334155' },

  cardTitleSm: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  heatmapGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 20 },
  hBox: { width: '12%', aspectRatio: 1, backgroundColor: '#1e3b8a', borderRadius: 6 },
  hLegend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 12, gap: 4 },
  hLegendText: { fontSize: 10, color: '#94a3b8', fontWeight: 'bold' },
  hLegendDot: { width: 10, height: 10, borderRadius: 2 }
});
