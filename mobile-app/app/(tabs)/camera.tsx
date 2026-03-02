import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Image } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';

// Same API URL configuration as in index.tsx
const API_URL = 'http://192.168.2.28:5000';

export default function CameraScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [photo, setPhoto] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    const [extractedData, setExtractedData] = useState<any>(null);
    const cameraRef = useRef<CameraView>(null);
    const router = useRouter();

    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            const photoData = await cameraRef.current.takePictureAsync({ base64: true });
            setPhoto(photoData);
        }
    };

    const uploadReceipt = async () => {
        if (!photo) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', {
                uri: photo.uri,
                type: 'image/jpeg',
                name: 'receipt.jpg',
            } as any);

            // Ask Flask backend to analyze the receipt
            const response = await axios.post(`${API_URL}/api/mobile/scan`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log('API Response:', response.data);
            setExtractedData(response.data);
        } catch (error: any) {
            console.error('Upload failed:', error.message);
            alert('Upload failed. Is the Flask server running?');
        } finally {
            setUploading(false);
        }
    };

    const saveReceipt = async () => {
        if (!extractedData) return;
        try {
            // Save data back to the database
            await axios.post(`${API_URL}/api/mobile/save`, extractedData);
            alert('Success! Receipt saved to dashboard.');
            setPhoto(null);
            setExtractedData(null);
            router.push('/');
        } catch (e: any) {
            alert('Failed to save: ' + e.message);
        }
    };

    if (extractedData) {
        return (
            <View style={styles.container}>
                <View style={styles.resultsCard}>
                    <Text style={styles.title}>Results Extracted</Text>
                    <Text style={styles.resultRow}>🏢 Merchant: {extractedData.merchant}</Text>
                    <Text style={styles.resultRow}>💰 Total: ${extractedData.total}</Text>
                    <Text style={styles.resultRow}>🏷️ Category: {extractedData.category}</Text>
                    <View style={styles.buttonGroup}>
                        <Button title="Save to Dashboard" onPress={saveReceipt} color="#1a5490" />
                        <Text>{"\n"}</Text>
                        <Button title="Discard & Try Again" onPress={() => { setPhoto(null); setExtractedData(null); }} color="#888" />
                    </View>
                </View>
            </View>
        );
    }

    if (photo) {
        return (
            <View style={styles.container}>
                <Image style={{ flex: 1 }} source={{ uri: photo.uri }} />
                <View style={styles.previewControls}>
                    {uploading ? (
                        <ActivityIndicator size="large" color="white" />
                    ) : (
                        <>
                            <Button title="Upload & Process AI" onPress={uploadReceipt} color="#1a5490" />
                            <Button title="Retake" onPress={() => setPhoto(null)} color="#ff3b30" />
                        </>
                    )}
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing={"back"} ref={cameraRef}>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={takePicture}>
                        <View style={styles.captureBtn} />
                    </TouchableOpacity>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', backgroundColor: '#f0f2f5' },
    message: { textAlign: 'center', paddingBottom: 10 },
    camera: { flex: 1 },
    buttonContainer: { flex: 1, flexDirection: 'row', backgroundColor: 'transparent', margin: 64, justifyContent: 'center', alignItems: 'flex-end' },
    button: { alignSelf: 'flex-end', alignItems: 'center' },
    captureBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'white', borderWidth: 5, borderColor: 'rgba(0,0,0,0.2)' },
    previewControls: { position: 'absolute', bottom: 50, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
    resultsCard: { margin: 20, padding: 20, backgroundColor: 'white', borderRadius: 10, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#1a5490' },
    resultRow: { fontSize: 18, marginBottom: 12 },
    buttonGroup: { marginTop: 20 }
});
