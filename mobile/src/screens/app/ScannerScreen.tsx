import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../../api/apiClient';
import { useTransactionStore } from '../../store/transactionStore';
import { useAuthStore } from '../../store/authStore';

export default function ScannerScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [torch, setTorch] = useState(false);
  const [ocrData, setOcrData] = useState<any>(null);
  const cameraRef = useRef<any>(null);
  
  const createApiTransaction = useTransactionStore((state) => state.createApiTransaction);
  const { currency } = useAuthStore();
  const curSymbol = currency === 'USD' ? '$' : '₹';

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <MaterialIcons name="camera-alt" size={64} color="#1e3b8a" />
        <Text style={{ color: '#FFF', fontSize: 18, textAlign: 'center', marginVertical: 20 }}>
          FinFlow needs camera access to scan receipts
        </Text>
        <TouchableOpacity style={styles.confirmBtn} onPress={requestPermission}>
          <Text style={styles.confirmText}>Grant Permission</Text>
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
        Alert.alert('Scan Failed', 'AI could not find receipt details.');
      }
    } catch (error) {
       console.log("Scanner Error:", error);
       Alert.alert('Error', 'Camera capture failed.');
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
       Alert.alert('Error', 'Failed to save transaction.');
    }
  };

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.bg} 
        facing="back" 
        enableTorch={torch}
        ref={cameraRef}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Scan Receipt</Text>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setTorch(!torch)}>
              <MaterialIcons name={torch ? "flash-on" : "flash-off"} size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.frameContainer}>
             <View style={styles.frame}>
                {isScanning && <View style={styles.scanLine} />}
             </View>
             <View style={styles.instructionBox}>
                <Text style={styles.instruction}>
                  {isScanning ? 'AI analyzing receipt...' : 'Frame the receipt & tap Capture'}
                </Text>
             </View>
          </View>

          {/* Capture Button or AI Sheet */}
          {!isScanning && !ocrData && (
             <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
                <View style={styles.captureCircleOuter}>
                   <View style={styles.captureCircleInner} />
                </View>
             </TouchableOpacity>
          )}

          {!isScanning && ocrData && (
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <View style={styles.sheetHeader}>
                 <View style={styles.sheetIconBox}>
                   <MaterialIcons name="receipt-long" size={24} color="#1e3b8a" />
                 </View>
                 <View>
                   <Text style={styles.sheetTitle}>Receipt Detected</Text>
                   <Text style={styles.sheetSub}>FinFlow AI extracted the details</Text>
                 </View>
              </View>

              <View style={styles.grid}>
                 <View style={styles.gridBox}>
                   <Text style={styles.gridLabel}>MERCHANT</Text>
                   <Text style={styles.gridVal} numberOfLines={1}>{ocrData.merchant}</Text>
                 </View>
                 <View style={styles.gridBox}>
                   <Text style={styles.gridLabel}>DATE</Text>
                   <Text style={styles.gridVal}>{new Date(ocrData.date).toLocaleDateString()}</Text>
                 </View>
                 <View style={[styles.gridBox, styles.gridBoxFull]}>
                   <View>
                     <Text style={[styles.gridLabel, { color: '#1e3b8a' }]}>TOTAL AMOUNT</Text>
                     <Text style={styles.gridAm}>{curSymbol}{Number(ocrData.amount).toFixed(2)}</Text>
                   </View>
                   <MaterialIcons name="payments" size={32} color="rgba(30,59,138,0.2)" />
                 </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                  <MaterialIcons name="check-circle" size={20} color="#FFF" />
                  <Text style={styles.confirmText}>Confirm & Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.editBtn} onPress={() => setOcrData(null)}>
                  <MaterialIcons name="close" size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {isScanning && (
             <View style={[styles.sheet, { alignItems: 'center', justifyContent: 'center' }]}>
               <ActivityIndicator size="large" color="#1e3b8a" />
               <Text style={{ marginTop: 10, color: '#1e3b8a', fontWeight: 'bold' }}>AI processing receipt...</Text>
             </View>
          )}
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1, width: '100%' },
  safeArea: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)' },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  iconBtn: { width: 44, height: 44, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

  frameContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frame: { width: '85%', aspectRatio: 3/4, borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)', borderRadius: 20, overflow: 'hidden' },
  scanLine: { width: '100%', height: 4, backgroundColor: '#1e3b8a', elevation: 15, shadowColor: '#1e3b8a', shadowOpacity: 1, shadowRadius: 10, top: '25%' },
  instructionBox: { backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, marginTop: 30 },
  instruction: { color: '#FFF', fontSize: 13, fontWeight: '600' },

  captureBtn: { alignSelf: 'center', marginBottom: 40 },
  captureCircleOuter: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', padding: 5, borderWidth: 4, borderColor: '#FFF' },
  captureCircleInner: { width: '100%', height: '100%', borderRadius: 35, backgroundColor: '#FFF' },

  sheet: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, elevation: 25 },
  handle: { width: 48, height: 5, backgroundColor: '#e2e8f0', borderRadius: 3, alignSelf: 'center', marginBottom: 24 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 24 },
  sheetIconBox: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(30,59,138,0.08)', alignItems: 'center', justifyContent: 'center' },
  sheetTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  sheetSub: { fontSize: 14, color: '#64748b', fontWeight: '500' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  gridBox: { width: '48%', backgroundColor: '#f8fafc', padding: 18, borderRadius: 18, borderWidth: 1, borderColor: '#f1f5f9' },
  gridBoxFull: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#eff6ff', borderColor: '#dbeafe' },
  gridLabel: { fontSize: 10, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4, letterSpacing: 0.5 },
  gridVal: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  gridAm: { fontSize: 26, fontWeight: '900', color: '#1e3b8a' },

  actions: { flexDirection: 'row', gap: 16 },
  confirmBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#1e3b8a', height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', gap: 10, elevation: 8 },
  confirmText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  editBtn: { width: 60, height: 60, backgroundColor: '#fee2e2', borderRadius: 18, alignItems: 'center', justifyContent: 'center' }
});
