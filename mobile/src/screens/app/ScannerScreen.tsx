import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import apiClient from '../../api/apiClient';
import { useTransactionStore } from '../../store/transactionStore';
import { useAuthStore } from '../../store/authStore';
import { THEME } from '../../theme/theme';

const { width } = Dimensions.get('window');

export default function ScannerScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [torch, setTorch] = useState(false);
  const [ocrData, setOcrData] = useState<any>(null);
  const cameraRef = useRef<any>(null);
  
  const createApiTransaction = useTransactionStore((state) => state.createApiTransaction);
  const { currency } = useAuthStore();
  const curSymbol = currency === 'USD' ? '$' : '₹';

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <View style={styles.permissionIcon}>
           <MaterialIcons name="camera-alt" size={48} color={THEME.colors.secondary} />
        </View>
        <Text style={styles.permissionTitle}>Camera Required</Text>
        <Text style={styles.permissionSub}>FinFlow needs camera access to high-tech scan receipts with AI.</Text>
        <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
           <Text style={styles.grantTxt}>Review Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      setIsScanning(true);
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.5,
      });

      const response = await apiClient.post('/ocr/scan', { imageBase64: photo.base64 });
      if (response.data?.success) {
        setOcrData(response.data.data);
      } else {
        Alert.alert('AI Scanner', 'The receipt was too blurry. Try again in better light.');
      }
    } catch (error) {
       Alert.alert('Scanner Error', 'We could not capture the image.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirm = async () => {
    if (!ocrData) return;
    try {
      await createApiTransaction({
        amount: ocrData.amount,
        type: 'Expense',
        category: ocrData.category,
        note: ocrData.merchant,
        date: ocrData.date || new Date().toISOString()
      });
      navigation.goBack();
    } catch (error) {
       Alert.alert('Save Failed', 'Unable to record scanned purchase.');
    }
  };

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing="back" 
        enableTorch={torch}
        ref={cameraRef}
      >
        <SafeAreaView style={styles.safe}>
           {/* Header Controls */}
           <View style={styles.topBar}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <MaterialIcons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
              <View style={styles.titleArea}>
                 <Text style={styles.titleMain}>AI Scanner</Text>
                 <Text style={styles.titleSub}>{isScanning ? 'Processing...' : 'Point & Scan'}</Text>
              </View>
              <TouchableOpacity style={styles.torchButton} onPress={() => setTorch(!torch)}>
                <MaterialIcons name={torch ? "flash-on" : "flash-off"} size={22} color="#FFF" />
              </TouchableOpacity>
           </View>

           {/* Viewport Frame */}
           <View style={styles.frameWrap}>
              <View style={styles.viewport}>
                 <View style={[styles.corner, styles.tl]} />
                 <View style={[styles.corner, styles.tr]} />
                 <View style={[styles.corner, styles.bl]} />
                 <View style={[styles.corner, styles.br]} />
                 {isScanning && (
                   <LinearGradient
                     colors={['rgba(59, 130, 246, 0)', 'rgba(59, 130, 246, 0.5)', 'rgba(59, 130, 246, 0)']}
                     style={styles.scanLine}
                   />
                 )}
              </View>
              <View style={styles.tipBox}>
                 <Text style={styles.tipText}>Place the receipt centered within the corners</Text>
              </View>
           </View>

           {/* Controls Bottom */}
           <View style={styles.bottomArea}>
              {!ocrData && !isScanning && (
                 <TouchableOpacity style={styles.shutter} activeOpacity={0.8} onPress={takePicture}>
                    <View style={styles.shutterRing}>
                       <View style={styles.shutterInside} />
                    </View>
                 </TouchableOpacity>
              )}
              
              {isScanning && (
                 <View style={styles.processingCard}>
                    <ActivityIndicator size="large" color={THEME.colors.secondary} />
                    <Text style={styles.processingTxt}>AI Analyzing Details...</Text>
                 </View>
              )}
           </View>

           {/* Result Sheet (Glassmorphism) */}
           {ocrData && !isScanning && (
              <View style={styles.resultSheet}>
                 <BlurView intensity={100} tint="light" style={styles.glassContainer}>
                    <View style={styles.sheetHandle} />
                    <View style={styles.sheetHeader}>
                       <View style={styles.checkIcon}>
                          <MaterialIcons name="receipt-long" size={24} color={THEME.colors.secondary} />
                       </View>
                       <View>
                          <Text style={styles.sheetTitle}>Receipt Analyzed</Text>
                          <Text style={styles.sheetSub}>FinFlow AI successfully extracted data</Text>
                       </View>
                    </View>

                    <View style={styles.dataGrid}>
                       <View style={styles.dataCell}>
                          <Text style={styles.dataLabel}>MERCHANT</Text>
                          <Text style={styles.dataValue} numberOfLines={1}>{ocrData.merchant}</Text>
                       </View>
                       <View style={styles.dataCell}>
                          <Text style={styles.dataLabel}>DATE</Text>
                          <Text style={styles.dataValue}>{new Date(ocrData.date).toLocaleDateString()}</Text>
                       </View>
                       <View style={[styles.dataCell, styles.wideCell]}>
                          <View>
                             <Text style={[styles.dataLabel, { color: THEME.colors.secondary }]}>EXTRACTED AMOUNT</Text>
                             <Text style={styles.amountText}>{curSymbol}{Number(ocrData.amount).toFixed(2)}</Text>
                          </View>
                          <MaterialIcons name="credit-card" size={32} color={THEME.colors.border} />
                       </View>
                    </View>

                    <View style={styles.sheetActions}>
                       <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                          <LinearGradient colors={[THEME.colors.secondary, '#60A5FA']} style={styles.confirmGradient} start={{x:0,y:0}} end={{x:1,y:0}}>
                             <MaterialIcons name="check-circle" size={22} color="#FFF" />
                             <Text style={styles.confirmTxt}>Confirm & Record</Text>
                          </LinearGradient>
                       </TouchableOpacity>
                       <TouchableOpacity style={styles.rejectButton} onPress={() => setOcrData(null)}>
                          <MaterialIcons name="refresh" size={24} color={THEME.colors.expense} />
                       </TouchableOpacity>
                    </View>
                 </BlurView>
              </View>
           )}
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  safe: { flex: 1 },

  permissionIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: `${THEME.colors.secondary}10`, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  permissionTitle: { ...THEME.typography.h2, color: '#FFF', marginBottom: 12 },
  permissionSub: { ...THEME.typography.body, color: THEME.colors.textTertiary, textAlign: 'center', marginBottom: 40 },
  grantBtn: { backgroundColor: THEME.colors.secondary, paddingVertical: 16, paddingHorizontal: 40, borderRadius: 16 },
  grantTxt: { color: '#FFF', fontWeight: '900', fontSize: 16 },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  backButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  titleArea: { alignItems: 'center' },
  titleMain: { color: '#FFF', fontSize: 17, fontWeight: '900' },
  titleSub: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  torchButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },

  frameWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  viewport: { width: width * 0.8, aspectRatio: 3/4, borderRadius: 32, position: 'relative', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: THEME.colors.secondary, borderWidth: 4 },
  tl: { top: 32, left: 32, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 16 },
  tr: { top: 32, right: 32, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 16 },
  bl: { bottom: 32, left: 32, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 16 },
  br: { bottom: 32, right: 32, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 16 },
  scanLine: { width: '100%', height: 4, position: 'absolute', top: '20%' },
  tipBox: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginTop: 40 },
  tipText: { color: '#FFF', fontSize: 12, fontWeight: '700' },

  bottomArea: { height: 160, alignItems: 'center', justifyContent: 'center' },
  shutter: { width: 84, height: 84, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 42, alignItems: 'center', justifyContent: 'center', padding: 6, borderWidth: 4, borderColor: '#FFF' },
  shutterInside: { width: '100%', height: '100%', backgroundColor: '#FFF', borderRadius: 40 },
  shutterRing: { width: '100%', height: '100%', borderRadius: 40, padding: 4 },

  processingCard: { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: '#FFF', borderRadius: 24, padding: 32, alignItems: 'center', gap: 16, ...THEME.shadows.strong },
  processingTxt: { ...THEME.typography.h3, fontSize: 16, color: THEME.colors.primary },

  resultSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8 },
  glassContainer: { borderRadius: 32, padding: 24, paddingBottom: 40, overflow: 'hidden' },
  sheetHandle: { width: 48, height: 5, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 3, alignSelf: 'center', marginBottom: 24 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 28 },
  checkIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: `${THEME.colors.secondary}10`, alignItems: 'center', justifyContent: 'center' },
  sheetTitle: { ...THEME.typography.h3, fontSize: 20 },
  sheetSub: { ...THEME.typography.caption, color: THEME.colors.textTertiary, marginTop: 2 },

  dataGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  dataCell: { width: (width - 64) / 2, backgroundColor: 'rgba(255,255,255,0.6)', padding: 16, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' },
  wideCell: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.1)' },
  dataLabel: { ...THEME.typography.label, fontSize: 10, color: THEME.colors.textTertiary },
  dataValue: { ...THEME.typography.body, fontWeight: '800', fontSize: 15, marginTop: 4, color: THEME.colors.text },
  amountText: { ...THEME.typography.h1, fontSize: 28, color: THEME.colors.secondary },

  sheetActions: { flexDirection: 'row', gap: 14 },
  confirmButton: { flex: 1, borderRadius: 18, overflow: 'hidden', height: 62, ...THEME.shadows.medium },
  confirmGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  confirmTxt: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  rejectButton: { width: 62, height: 62, borderRadius: 18, backgroundColor: 'rgba(244, 63, 94, 0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(244, 63, 94, 0.2)' }
});
