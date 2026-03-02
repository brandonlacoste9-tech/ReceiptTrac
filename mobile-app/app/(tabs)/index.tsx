import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'expo-router';

// Make sure to replace this with your actual local IP address when testing on a physical device!
// For Android Emulator, 10.0.2.2 points to the host machine.
const API_URL = 'http://192.168.2.28:5000';

export default function HomeScreen() {
  const router = useRouter();
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/mobile/recent`);
      setReceipts(response.data);
    } catch (error: any) {
      console.warn('Backend not reachable:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ReceiptTrac</Text>
        <Text style={styles.headerSubtitle}>Recent Scans</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1a5490" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={receipts}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.merchant}>{item.merchant}</Text>
              <Text style={styles.date}>{item.date}</Text>
              <Text style={styles.amount}>${Number(item.total).toFixed(2)}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No receipts found. Tap the Camera tab to scan!</Text>}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/camera')}
      >
        <Text style={styles.fabIcon}>📷</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { backgroundColor: '#1a5490', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  list: { padding: 15 },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  merchant: { fontSize: 18, fontWeight: 'bold' },
  date: { fontSize: 14, color: '#666', marginTop: 5 },
  amount: { fontSize: 18, color: '#1a5490', fontWeight: 'bold', position: 'absolute', right: 15, top: 15 },
  empty: { textAlign: 'center', marginTop: 50, color: '#666' },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#1a5490', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
  fabIcon: { fontSize: 24, color: 'white' }
});
