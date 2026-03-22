import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import { useTransactionStore } from '../../store/transactionStore';
import { useAuthStore } from '../../store/authStore';
import { useAnalyticsStore } from '../../store/analyticsStore';
import { THEME } from '../../theme/theme';

const screenWidth = Dimensions.get('window').width;

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#10b981',      // Emerald Green
  Shopping: '#3b82f6',  // Blue
  Travel: '#8b5cf6',    // Violet
  Health: '#ef4444',    // Red
  Bill: '#f59e0b',      // Amber
  Salary: '#8b5cf6',    // Violet
  Others: '#64748b',    // Slate
  Education: '#06b6d4'  // Cyan
};

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

  const chartData = (data?.categoryBreakdown || []).map((item, idx) => ({
    name: item.x,
    population: item.y,
    color: CATEGORY_COLORS[item.x] || ['#1e3b8a', '#38bdf8', '#818cf8', '#94a3b8', '#64748b'][idx % 5],
    legendFontColor: THEME.colors.textSecondary,
    legendFontSize: 12
  }));

  if (isLoading && !data) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={{ marginTop: 16, color: THEME.colors.textSecondary }}>Crafting Insights...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
         <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={THEME.colors.text} />
         </TouchableOpacity>
         <Text style={styles.headerTitle}>Financial Insights</Text>
         <TouchableOpacity style={styles.refreshBtn} onPress={() => fetchAnalytics()}>
            <MaterialIcons name="refresh" size={20} color={THEME.colors.primary} />
         </TouchableOpacity>
      </View>
      
      {/* Custom Tab Bar */}
      <View style={styles.tabContainer}>
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
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchAnalytics} tintColor={THEME.colors.primary} />}
      >
        {/* Main Stats Card */}
        <View style={styles.summaryCard}>
           <Text style={styles.summaryLabel}>
             {activeTab === 'Overview' ? 'NET CASHFLOW' : activeTab === 'Income' ? 'TOTAL RECEIPTS' : 'TOTAL OUTFLOW'}
           </Text>
           <Text style={styles.summaryValue} adjustsFontSizeToFit numberOfLines={1}>
              {curSymbol}{
                activeTab === 'Overview' ? (totalIncome - totalExpense).toLocaleString(undefined, { minimumFractionDigits: 2 }) : 
                activeTab === 'Income' ? totalIncome.toLocaleString() : totalExpense.toLocaleString()
              }
           </Text>
           <View style={styles.divider} />
           
           <View style={styles.chartSection}>
              {chartData.length > 0 ? (
                <View style={styles.chartWrap}>
                  <PieChart
                    data={chartData}
                    width={screenWidth - 64}
                    height={200}
                    chartConfig={{ color: (op = 1) => `rgba(0,0,0,${op})` }}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="20"
                    center={[10, 0]}
                    absolute
                    hasLegend={false}
                  />
                  <View style={styles.chartOverlay}>
                     <Text style={styles.overlayText}>TOP CATEGORIES</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.emptyChart}>
                   <MaterialIcons name="pie-chart-outlined" size={64} color={THEME.colors.border} />
                   <Text style={styles.emptyText}>No data to chart yet</Text>
                </View>
              )}
           </View>

           <View style={styles.legendGrid}>
              {chartData.map((item) => (
                <View key={item.name} style={styles.lItem}>
                   <View style={[styles.lDot, {backgroundColor: item.color}]}/>
                   <Text style={styles.lText} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
                   <Text style={styles.lVal}>{curSymbol}{item.population.toLocaleString()}</Text>
                </View>
              ))}
           </View>
        </View>

        {/* Heatmap Card */}
        <View style={styles.statsCard}>
           <View style={styles.statsHeader}>
             <MaterialIcons name="insights" size={20} color={THEME.colors.accent} />
             <Text style={styles.statsTitle}>Activity Density</Text>
           </View>
           <Text style={styles.statsSub}>Frequency of transactions over 5 weeks</Text>
           
           <View style={styles.heatmapWrapper}>
             {data?.heatmap.map((day) => {
               const val = day.value || 0;
               let color = THEME.colors.border;
               if (val > 0 && val <= 500) color = '#dbeafe';
               else if (val > 500 && val <= 2000) color = '#93c5fd';
               else if (val > 2000 && val <= 5000) color = '#3b82f6';
               else if (val > 5000) color = THEME.colors.primary;

               return (
                 <View key={day.date} style={[styles.hBox, { backgroundColor: color }]} />
               );
             })}
           </View>

           <View style={styles.hLegend}>
              <Text style={styles.hScaleText}>LESS</Text>
              {[THEME.colors.border, '#dbeafe', '#93c5fd', '#3b82f6', THEME.colors.primary].map(c => (
                 <View key={c} style={[styles.hScaleDot, {backgroundColor: c}]}/>
              ))}
              <Text style={styles.hScaleText}>MORE</Text>
           </View>
        </View>

        {/* Insights Alert */}
        <View style={[styles.statsCard, { backgroundColor: THEME.colors.primary, borderColor: THEME.colors.primary }]}>
           <View style={styles.statsHeader}>
             <MaterialIcons name="auto-awesome" size={20} color="#FFF" />
             <Text style={[styles.statsTitle, { color: '#FFF' }]}>Smart Insight</Text>
           </View>
           <Text style={[styles.statsSub, { color: 'rgba(255,255,255,0.7)' }]}>
             You've spent {((totalExpense / (totalIncome || 1)) * 100).toFixed(0)}% of your income this period. 
             {totalExpense > totalIncome ? ' Try cutting back on travel costs.' : ' Keep it up!'}
           </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15, backgroundColor: THEME.colors.surface },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: THEME.colors.background, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...THEME.typography.h3, fontSize: 18, flex: 1, textAlign: 'center' },
  refreshBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: `${THEME.colors.primary}10`, alignItems: 'center', justifyContent: 'center' },

  tabContainer: { flexDirection: 'row', backgroundColor: THEME.colors.surface, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: THEME.colors.border },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: THEME.colors.primary },
  tabText: { ...THEME.typography.caption, fontSize: 13, color: THEME.colors.textSecondary },
  activeTabText: { color: THEME.colors.primary, fontWeight: '800' },

  scroll: { padding: 16, gap: 16 },
  summaryCard: { backgroundColor: THEME.colors.surface, borderRadius: THEME.roundness.xl, padding: THEME.spacing.lg, ...THEME.shadows.md, borderWidth: 1, borderColor: THEME.colors.border },
  summaryLabel: { ...THEME.typography.label, textAlign: 'center', color: THEME.colors.textSecondary },
  summaryValue: { ...THEME.typography.h1, textAlign: 'center', fontSize: 32, marginVertical: 8 },
  divider: { height: 1, backgroundColor: THEME.colors.border, marginVertical: 16 },

  chartSection: { alignItems: 'center', position: 'relative' },
  chartWrap: { alignItems: 'center', justifyContent: 'center' },
  chartOverlay: { position: 'absolute', top: '42%', alignItems: 'center' },
  overlayText: { fontSize: 8, fontWeight: '900', color: THEME.colors.textTertiary, letterSpacing: 1.5 },

  legendGrid: { marginTop: 20, gap: 0 },
  lItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: THEME.colors.border },
  lDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  lText: { flex: 1, ...THEME.typography.body, fontSize: 14, fontWeight: '700' },
  lVal: { ...THEME.typography.body, fontSize: 14, fontWeight: '800', color: THEME.colors.text },

  emptyChart: { paddingVertical: 40, alignItems: 'center', gap: 12 },
  emptyText: { ...THEME.typography.caption, color: THEME.colors.textTertiary },

  statsCard: { backgroundColor: THEME.colors.surface, borderRadius: THEME.roundness.xl, padding: THEME.spacing.lg, ...THEME.shadows.sm, borderWidth: 1, borderColor: THEME.colors.border },
  statsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  statsTitle: { ...THEME.typography.h3, fontSize: 16 },
  statsSub: { ...THEME.typography.caption, lineHeight: 18 },

  heatmapWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 20 },
  hBox: { width: '12%', aspectRatio: 1, borderRadius: 4 },
  hLegend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 16, gap: 6 },
  hScaleText: { ...THEME.typography.label, fontSize: 8 },
  hScaleDot: { width: 10, height: 10, borderRadius: 3 }
});
