import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';

// Sub-views
import { ProcessingState } from '../../src/components/common/AddTimetable/ProcessingState';
import { ReviewResults } from '../../src/components/common/AddTimetable/ReviewResults';
import { CloudinaryService } from '../../src/services/CloudinaryService';
import authService from '../../src/services/authService';
import { AuthContext } from '../../src/context/AuthContext';
import { useContext } from 'react';
import { useRouter } from 'expo-router';

export default function AddTimetableScreen() {
  const router = useRouter();
  const colors = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  // States: 'menu' | 'camera' | 'review_file' | 'processing' | 'results'
  const [flowState, setFlowState] = useState('menu');
  const [selectedFile, setSelectedFile] = useState(null);
  const [processingStatus, setProcessingStatus] = useState({ progress: 0, message: 'Preparing...' });
  const [ocrResults, setOcrResults] = useState(null);
  const [currentJobId, setCurrentJobId] = useState(null);

  
  const { userData, userToken } = useContext(AuthContext);

  const SIZE_LIMIT = 1.5 * 1024 * 1024; // 1.5 MB

  // --- Handlers ---
  const handlePickFile = async (type) => {
    let result;
    if (type === 'image') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
          Alert.alert("Permission Required", "Please allow access to your media library to upload photos.");
          return;
      }
      // Smaller delay to ensure activity is stable
      await new Promise(resolve => setTimeout(resolve, 100));
      result = await ImagePicker.launchImageLibraryAsync({ 
          quality: 0.8,
          mediaTypes: ['images'],
          allowsEditing: true, // Native editing (crop/rotate)
      });
    } else {
      result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    }

    if (!result.canceled) {
      const file = result.assets[0];
      if (file.size > SIZE_LIMIT) {
        Alert.alert("File too large", "Please upload a file smaller than 1.5 MB");
        return;
      }
      setSelectedFile(file);
      setFlowState('review_file');
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      setSelectedFile(photo);
      setFlowState('review_file');
    }
  };

  const handleRotate = async () => {
      if (!selectedFile) return;
      try {
          const result = await ImageManipulator.manipulateAsync(
              selectedFile.uri,
              [{ rotate: 90 }],
              { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
          );
          setSelectedFile({ ...selectedFile, uri: result.uri });
      } catch (error) {
          Alert.alert("Error", "Failed to rotate image");
      }
  };

  const startProcessing = async () => {
    setFlowState('processing');
    setProcessingStatus({ progress: 0.1, message: 'Uploading file...' });

    try {
        // 1. Upload to Cloudinary
        const secureUrl = await CloudinaryService.uploadFile(selectedFile, (percent) => {
            setProcessingStatus({ 
                progress: 0.1 + (percent * 0.4), // Upload is first 50% of progress
                message: `Uploading... ${Math.round(percent * 100)}%` 
            });
        });

        console.log("Uploaded URL:", secureUrl);
        setProcessingStatus({ progress: 0.5, message: 'Processing timetable...' });

        // 2. Call OCR API (Step 1: Upload Scan)
        if (!userToken) throw new Error("Missing Authentication Token");

        const result = await authService.uploadTimetableScan(userToken, secureUrl);
        
        console.log("OCR Result (Step 1):", result);
        
        setCurrentJobId(result.data.jobId);
        setOcrResults(result.data.parsedTimetable);
        
        setProcessingStatus({ progress: 1.0, message: 'Finalizing...' });
        setFlowState('results');

    } catch (error) {
        console.error("Processing Error:", error);
        Alert.alert("Error", error.message || "Failed to process timetable");
        setFlowState('review_file'); 
    }
  };

  const handleConfirmTimetable = async (modifiedSchedule) => {
      try {
          if (!currentJobId) throw new Error("No Job ID found");
          
          setFlowState('processing');
          setProcessingStatus({ progress: 0.5, message: 'Saving timetable...' });
          
          await authService.confirmTimetable(userToken, currentJobId, modifiedSchedule);
          
          Alert.alert("Success", "Timetable saved successfully!", [
              { text: "OK", onPress: () => router.replace('/(screen)/HomeScreen') }
          ]);
      } catch (error) {
          console.error("Save Error:", error);
          setFlowState('results'); // revert to review on error
          Alert.alert("Error", "Failed to save timetable. Please try again.");
      }
  };

  // --- UI Renders ---

  if (flowState === 'camera') {
    return (
      <View style={styles.fullScreen}>
        <CameraView ref={cameraRef} style={styles.fullScreen} facing="back" />
        <View style={[StyleSheet.absoluteFill, styles.cameraOverlay]}>
           <TouchableOpacity style={styles.closeBtn} onPress={() => setFlowState('menu')}>
             <MaterialIcons name="close" size={30} color="#fff" />
           </TouchableOpacity>
           <TouchableOpacity style={styles.shutterBtn} onPress={takePicture}>
             <View style={styles.shutterInner} />
           </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (flowState === 'review_file') {
    return (
      <View style={[styles.fullScreen, { backgroundColor: '#000' }]}>
        {selectedFile.uri.endsWith('.pdf') ? (
          <View style={styles.pdfPreview}><MaterialIcons name="picture-as-pdf" size={80} color="#fff" /></View>
        ) : (
          <Image source={{ uri: selectedFile.uri }} style={styles.fullScreen} resizeMode="contain" />
        )}
        <View style={styles.approvalBar}>
           <TouchableOpacity style={[styles.actionRound, { backgroundColor: '#ef4444' }]} onPress={() => setFlowState('menu')}>
             <MaterialIcons name="close" size={32} color="#fff" />
           </TouchableOpacity>
           
           {!selectedFile.uri.endsWith('.pdf') && (
               <TouchableOpacity style={[styles.actionRound, { backgroundColor: colors.bgIndigo }]} onPress={handleRotate}>
                   <MaterialIcons name="rotate-right" size={32} color={colors.primary} />
               </TouchableOpacity>
           )}

           <TouchableOpacity style={[styles.actionRound, { backgroundColor: '#22c55e' }]} onPress={startProcessing}>
             <MaterialIcons name="check" size={32} color="#fff" />
           </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (flowState === 'processing') return <ProcessingState fileName={selectedFile?.name || 'Timetable_Scan.jpg'} progress={processingStatus.progress} statusMessage={processingStatus.message} />;
  if (flowState === 'results') return <ReviewResults data={ocrResults} onBack={() => setFlowState('menu')} onVerify={handleConfirmTimetable} />;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.menuPadding}>
      <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>Add Timetable</Text>
      <Text style={styles.menuSub}>Upload or scan your timetable to auto-create your schedule.</Text>

      {/* <View style={[styles.infoBox, { backgroundColor: colors.bgIndigo }]}>
        <MaterialIcons name="info" size={20} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.textPrimary }]}>Use a clear, well-lit image for best results.</Text>
      </View> */}

      <View style={[styles.infoBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)', alignItems: 'flex-start' }]}>
         <View style={{ backgroundColor: '#ef4444', alignSelf: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8, marginTop: 2 }}>
             <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>IMPORTANT</Text>
         </View>
         <Text style={[styles.infoText, { color: colors.textPrimary, fontSize: 13 }]}>
            Upload correctly oriented image for best results. File must contain data for only one section.
         </Text>
      </View>

      <View style={styles.btnStack}>
        <MenuButton 
          icon="photo-camera" 
          label="Scan with Camera" 
          primary 
          onPress={async () => {
            if (!permission?.granted) {
              const res = await requestPermission();
              if (!res.granted) {
                Alert.alert("Permission Required", "Camera access is needed to scan timetables.");
                return;
              }
            }
            setFlowState('camera');
          }} 
        />
        <MenuButton icon="image" label="Upload Image" onPress={() => handlePickFile('image')} />
        <MenuButton icon="picture-as-pdf" label="Upload PDF" onPress={() => handlePickFile('pdf')} />
      </View>
    </ScrollView>
  );
}

const MenuButton = ({ icon, label, primary, onPress }) => {
  const colors = useTheme();
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.menuBtn, { backgroundColor: primary ? colors.primary : colors.card, borderColor: colors.border }]}
    >
      <MaterialIcons name={icon} size={24} color={primary ? '#fff' : colors.textPrimary} />
      <Text style={[styles.menuBtnText, { color: primary ? '#fff' : colors.textPrimary }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fullScreen: { flex: 1 },
  cameraOverlay: { flex: 1, justifyContent: 'space-between', padding: 40, alignItems: 'center' },
  closeBtn: { alignSelf: 'flex-start' },
  shutterBtn: { width: 70, height: 70, borderRadius: 35, borderWidth: 4, borderColor: '#fff', padding: 4 },
  shutterInner: { flex: 1, borderRadius: 30, backgroundColor: '#fff' },
  approvalBar: { position: 'absolute', bottom: 50, flexDirection: 'row', width: '100%', justifyContent: 'space-evenly' },
  actionRound: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  menuPadding: { padding: 24, paddingTop: 60 },
  menuTitle: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  menuSub: { color: '#64748b', fontSize: 16, marginBottom: 30 },
  infoBox: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, gap: 12, marginBottom: 30 },
  infoText: { fontSize: 14, flex: 1 },
  btnStack: { gap: 16 },
  menuBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 12, borderWidth: 1, gap: 12 },
  menuBtnText: { fontSize: 16, fontWeight: '600' },
  pdfPreview: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});