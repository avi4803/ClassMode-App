import React, { useState, useContext, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../src/hooks/useTheme";
import { AuthContext } from "../../src/context/AuthContext";
import authService from "../../src/services/authService";

// Components
import { CustomDropdown } from "../../src/components/common/EditProfileSectionScreen/CustomDropdown";
import { LockedInput } from "../../src/components/common/EditProfileSectionScreen/LockedInput";

// Simple in-memory cache
let cachedData = null;

export default function EditProfileScreen() {
  const colors = useTheme();
  const { userToken } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  // 1. Central State for Backend Binding
  const [profileData, setProfileData] = useState({
    batch: "",
    section: "",
    email: "",
    college: ""
  });

  const [batchOptions, setBatchOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);

  // Store full objects to specific IDs for saving later (optional for this step but good practice)
  const [rawBatches, setRawBatches] = useState([]);
  const [rawSections, setRawSections] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // Use cache if available
      if (cachedData) {
          setProfileData(cachedData.profile);
          setBatchOptions(cachedData.batchOpts);
          setSectionOptions(cachedData.sectionOpts);
          setRawBatches(cachedData.rawBatches);
          setRawSections(cachedData.rawSections);
          setLoading(false);
          return;
      }

      try {
        setLoading(true);
        // 1. Get Dashboard (User Data)
        const dashboardRes = await authService.getDashboard(userToken);
        if (dashboardRes.success && dashboardRes.data) {
           const { user } = dashboardRes.data;
           
           const batchLabel = user.batch?.year ? `${user.batch.year} ${user.batch.program || ''}`.trim() : "";

           const initialProfile = {
             batch: batchLabel,
             section: user.section?.name || "",
             email: user.email || "",
             college: user.college?.name || ""
           };
           setProfileData(initialProfile);

           // 2. Get Batches (using college ID)
           let bOpts = [];
           let rBatches = [];
           if (user.college?._id) {
               const batchesRes = await authService.getBatches(user.college._id);
               if (batchesRes.success) {
                   rBatches = batchesRes.data;
                   bOpts = batchesRes.data.map(b => `${b.year} ${b.program || ''}`.trim());
                   setRawBatches(rBatches);
                   setBatchOptions(bOpts);
               }
           }

           // 3. Get Sections (using batch ID)
           let sOpts = [];
           let rSections = [];
           if (user.batch?._id) {
               const sectionsRes = await authService.getSections(user.batch._id);
               if (sectionsRes.success) {
                   rSections = sectionsRes.data;
                   sOpts = sectionsRes.data.map(s => s.name);
                   setRawSections(rSections);
                   setSectionOptions(sOpts);
               }
           }
           
           // Update Cache
           cachedData = {
               profile: initialProfile,
               batchOpts: bOpts,
               sectionOpts: sOpts,
               rawBatches: rBatches,
               rawSections: rSections
           };
        }
      } catch (error) {
        console.log("Edit Profile Fetch Error", error);
        Alert.alert("Error", "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userToken]);


  const handleSave = () => {
    // Backend Logic: POST profileData
    // Note: To actually update, we'd need to map the selected string back to an ID using rawBatches/rawSections
    // For now, we just simulate the save as per request to "use real data" for display.
    Alert.alert("Success", "Profile updated locally (Backend Sync Pending)!");
    console.log("Saving to backend:", profileData);
  };

  if (loading) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor: colors.background}}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Edit Profile</Text>
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          
          <CustomDropdown 
            label="Batch" 
            value={profileData.batch} 
            options={batchOptions}
            onSelect={(value) => setProfileData({...profileData, batch: value})}
          />

          <CustomDropdown 
            label="Section" 
            value={profileData.section} 
            options={sectionOptions}
            onSelect={(value) => setProfileData({...profileData, section: value})}
          />

          <LockedInput label="Email" value={profileData.email} />
          
          <LockedInput label="College" value={profileData.college} />

        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <TouchableOpacity 
            onPress={handleSave}
            activeOpacity={0.8}
            style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { height: 60, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontFamily: 'Urbanist_700Bold' },
  container: { padding: 20 },
  footer: { padding: 20, borderTopWidth: 1 },
  saveBtn: { 
    height: 56, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 18, fontFamily: 'Urbanist_700Bold' },
});