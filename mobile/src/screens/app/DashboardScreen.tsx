import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, RefreshControl, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { useTransactionStore } from '../../store/transactionStore';
import { THEME } from '../../theme/theme';

export default function DashboardScreen({ navigation }: any) {
  const { user, currency } = useAuthStore();
  const { transactions, fetchTransactions, isLoading } = useTransactionStore();
  const curSymbol = currency === 'USD' ? '$' : '₹';

  useEffect(() => {
    fetchTransactions();
  }, []);

  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = user?.name?.split(' ')[0] || 'Member';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <ScrollView 
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchTransactions} colors={[THEME.colors.secondary]} />}
      >
        {/* Top Branding Section */}
        <View style={styles.topHeader}>
           <View style={styles.userProfile}>
              <TouchableOpacity style={styles.avatarHolder} onPress={() => navigation.navigate('Profile')}>
                 {user?.avatar ? (
                    <Image source={{ uri: user.avatar }} style={styles.pImg} />
                 ) : (
                    <MaterialIcons name="person" size={24} color={THEME.colors.textSecondary} />
                 )}
              </TouchableOpacity>
              <View style={styles.greetingsBox}>
                 <Text style={styles.greetTxt}>{getGreeting()}</Text>
                 <Text style={styles.userName} numberOfLines={1}>{firstName}</Text>
              </View>
           </View>
           <TouchableOpacity style={styles.notifIcon}>
              <MaterialIcons name="notifications-none" size={26} color={THEME.colors.primary} />
              <View style={styles.notifIndicator} />
           </TouchableOpacity>
        </View>

        {/* Global Balance Card */}
        <View style={styles.heroSection}>
           <LinearGradient
             colors={[THEME.colors.primary, '#1E293B', '#334155']}
             style={styles.mainCard}
             start={{ x: 0, y: 0 }}
             end={{ x: 1, y: 1 }}
           >
              <View style={styles.cardInfo}>
                 <Text style={styles.clbl}>TOTAL PORTFOLIO</Text>
                 <Text style={styles.cbal} adjustsFontSizeToFit numberOfLines={1}>
                    {curSymbol}{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                 </Text>
              </View>
              
              <View style={styles.cardStatsGroup}>
                 <View style={styles.cStat}>
                    <View style={styles.sIconBg}><MaterialIcons name="call-received" size={14} color={THEME.colors.accent} /></View>
                    <View>
                       <Text style={styles.sLbl}>INFLOW</Text>
                       <Text style={[styles.sVal, { color: THEME.colors.accent }]}>+{curSymbol}{totalIncome.toLocaleString()}</Text>
                    </View>
                 </View>
                 <View style={styles.vLine} />
                 <View style={styles.cStat}>
                    <View style={[styles.sIconBg, { backgroundColor: 'rgba(244, 63, 94, 0.15)' }]}><MaterialIcons name="call-made" size={14} color={THEME.colors.expense} /></View>
                    <View>
                       <Text style={styles.sLbl}>OUTFLOW</Text>
                       <Text style={[styles.sVal, { color: THEME.colors.expense }]}>-{curSymbol}{totalExpense.toLocaleString()}</Text>
                    </View>
                 </View>
              </View>
           </LinearGradient>
        </View>

        {/* Navigation Grid */}
        <View style={styles.actionGrid}>
           {[
             { name: 'Analytics', icon: 'auto-graph', color: THEME.colors.secondary, screen: 'AnalyticsTab' },
             { name: 'History', icon: 'view-list', color: '#8B5CF6', screen: 'HistoryTab' },
             { name: 'Scanner', icon: 'qr-code-scanner', color: '#F59E0B', screen: 'Scanner' },
             { name: 'Settings', icon: 'settings', color: THEME.colors.textSecondary, screen: 'SettingsTab' }
           ].map(action => (
             <TouchableOpacity 
               key={action.name} 
               style={styles.actionBtn} 
               onPress={() => navigation.navigate(action.screen)}
             >
                <View style={[styles.aIconBg, { backgroundColor: `${action.color}10` }]}>
                   <MaterialIcons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={styles.aLabel}>{action.name}</Text>
             </TouchableOpacity>
           ))}
        </View>

        {/* Recent Transactions List */}
        <View style={styles.sectionHeader}>
           <Text style={styles.secTitle}>Recent Activity</Text>
           <TouchableOpacity onPress={() => navigation.navigate('HistoryTab')}>
              <Text style={styles.viewLink}>View Records</Text>
           </TouchableOpacity>
        </View>

        <View style={styles.activityList}>
           {transactions.length > 0 ? (
             transactions.slice(0, 5).map(txn => (
               <View key={txn.id} style={styles.txnItem}>
                  <View style={[styles.txnFlag, { backgroundColor: txn.type === 'Income' ? '#F0FDF4' : '#FFF1F2' }]}>
                     <MaterialIcons 
                        name={txn.type === 'Income' ? 'trending-up' : 'trending-down'} 
                        size={20} 
                        color={txn.type === 'Income' ? THEME.colors.accent : THEME.colors.expense} 
                     />
                  </View>
                  <View style={styles.txnMeta}>
                     <Text style={styles.txnName} numberOfLines={1}>{txn.note || txn.category}</Text>
                     <Text style={styles.txnDate}>{txn.category} • {new Date(txn.date).toLocaleDateString()}</Text>
                  </View>
                  <Text style={[styles.txnAmt, { color: txn.type === 'Income' ? THEME.colors.accent : THEME.colors.text }]}>
                     {txn.type === 'Income' ? '+' : '-'}{curSymbol}{txn.amount.toLocaleString()}
                  </Text>
               </View>
             ))
           ) : (
             <View style={styles.emptyWrap}>
                <MaterialIcons name="auto-awesome" size={40} color={THEME.colors.border} />
                <Text style={styles.emptyTxt}>Ready for your first record.</Text>
             </View>
           )}
        </View>
      </ScrollView>

      {/* Floating Add Trigger */}
      <TouchableOpacity 
        style={styles.addTrigger}
        activeOpacity={0.9} 
        onPress={() => navigation.navigate('AddTransaction')}
      >
         <LinearGradient
            colors={[THEME.colors.secondary, '#60A5FA']}
            style={styles.addGradient}
            start={{x:0, y:0}}
            end={{x:1, y:1}}
         >
            <MaterialIcons name="add" size={32} color="#FFF" />
         </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: THEME.colors.background },
  container: { paddingBottom: 110 },
  topHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  userProfile: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  avatarHolder: { width: 44, height: 44, borderRadius: 14, backgroundColor: THEME.colors.surface, ...THEME.shadows.soft, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  pImg: { width: '100%', height: '100%' },
  greetingsBox: { flex: 1 },
  greetTxt: { ...THEME.typography.caption, fontSize: 12, color: THEME.colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
  userName: { ...THEME.typography.h3, fontSize: 18, color: THEME.colors.text, fontWeight: '800' },
  notifIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: THEME.colors.surface, alignItems: 'center', justifyContent: 'center', ...THEME.shadows.soft },
  notifIndicator: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: THEME.colors.expense, borderWidth: 2, borderColor: '#FFF' },

  heroSection: { paddingHorizontal: 20, marginBottom: 28 },
  mainCard: { borderRadius: THEME.roundness.lg, padding: 24, paddingVertical: 28, ...THEME.shadows.strong },
  cardInfo: { marginBottom: 30 },
  clbl: { ...THEME.typography.label, color: 'rgba(255,255,255,0.5)', fontSize: 10 },
  cbal: { fontSize: 38, fontWeight: '900', color: '#FFF', marginTop: 8 },
  cardStatsGroup: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: THEME.roundness.md, padding: 16 },
  cStat: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  sIconBg: { width: 24, height: 24, borderRadius: 8, backgroundColor: 'rgba(16, 185, 129, 0.15)', alignItems: 'center', justifyContent: 'center' },
  vLine: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.1)' },
  sLbl: { fontSize: 9, fontWeight: '900', color: 'rgba(255,255,255,0.5)', letterSpacing: 1 },
  sVal: { fontSize: 15, fontWeight: '800', marginTop: 2 },

  actionGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 36 },
  actionBtn: { alignItems: 'center', gap: 10 },
  aIconBg: { width: 62, height: 62, borderRadius: 20, alignItems: 'center', justifyContent: 'center', ...THEME.shadows.soft },
  aLabel: { ...THEME.typography.caption, color: THEME.colors.textSecondary, fontSize: 13, fontWeight: '700' },

  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 18 },
  secTitle: { ...THEME.typography.h3, fontSize: 18, color: THEME.colors.text },
  viewLink: { ...THEME.typography.caption, color: THEME.colors.secondary, fontWeight: '800' },

  activityList: { paddingHorizontal: 20, gap: 12 },
  txnItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.colors.surface, padding: 14, borderRadius: THEME.roundness.lg, ...THEME.shadows.soft, borderWidth: 1, borderColor: THEME.colors.border },
  txnFlag: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  txnMeta: { flex: 1, marginHorizontal: 16 },
  txnName: { ...THEME.typography.body, fontSize: 15, fontWeight: '700', color: THEME.colors.text },
  txnDate: { ...THEME.typography.caption, color: THEME.colors.textTertiary, marginTop: 2 },
  txnAmt: { fontSize: 16, fontWeight: '900' },

  emptyWrap: { alignItems: 'center', gap: 12, paddingVertical: 40 },
  emptyTxt: { ...THEME.typography.caption, color: THEME.colors.textTertiary, fontWeight: '600' },

  addTrigger: { position: 'absolute', bottom: 100, right: 25, width: 68, height: 68, borderRadius: 34, ...THEME.shadows.strong },
  addGradient: { width: '100%', height: '100%', borderRadius: 34, alignItems: 'center', justifyContent: 'center' }
});
