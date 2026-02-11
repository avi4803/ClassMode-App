import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  useColorScheme,
  Alert,
  ActivityIndicator,
  BackHandler
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AuthContext } from "../../src/context/AuthContext";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Prevent going back to protected screens (like Profile) if user logged out
  useEffect(() => {
    const onBackPress = () => {
      // Exit app or do nothing? 
      // Typically on Login screen, back button should exit app if it's the initial screen, 
      // or go back to Welcome screen if that exists.
      // If the user came from Logout, the history stack might still have Profile.
      // We return true to STOP default behavior (popping stack).
      BackHandler.exitApp(); 
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => backHandler.remove();
  }, []);

  const handleLogin = async () => {
      if (!email || !password) {
        Alert.alert('Error', 'Please enter both email and password');
        return;
      }
  
      setIsLoading(true);
      try {
        // Using login from AuthContext
        const response = await login(email.trim(), password);
        
        if (response.success) {
          router.replace("/HomeScreen"); 
        } else {
          Alert.alert('Login Failed', response.message || 'Unknown error occurred');
        }
      } catch (error) {
        console.log("Login Catch Error:", error);
        const errorMessage = error?.message || (typeof error === 'string' ? error : JSON.stringify(error));
        Alert.alert('Login Failed', errorMessage);
      } finally {
        setIsLoading(false);
      }
    };


  // Detect Theme (Light/Dark)
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";



  // Define Theme Colors (Matching Tailwind defaults)
  const theme = {
    bg: isDark ? "#0f172a" : "#f8fafc",
    textPrimary: isDark ? "#ffffff" : "#0f172a", // Slate-900 vs White
    textSecondary: isDark ? "#94a3b8" : "#475569", // Slate-400 vs Slate-600
    border: isDark ? "#334155" : "#cbd5e1", // Slate-700 vs Slate-300
    inputBg: "transparent",
    iconBg: isDark ? "rgba(49, 46, 129, 0.4)" : "#e0e7ff", // Indigo-900/40 vs Indigo-100
    placeholder: "#94a3b8",
    primary: "#4f46e5",
    focusBorder: "#4f46e5",
    focusBg: "rgba(79, 70, 229, 0.05)", // Slight indigo tint on focus
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.mainContainer}>
            <View style={styles.contentWrapper}>
              
              {/* --- Header --- */}
              <View style={styles.header}>
                <View style={[styles.iconWrapper, { backgroundColor: theme.iconBg }]}>
                  <MaterialIcons name="school" size={48} color={theme.primary} />
                </View>
                <Text style={[styles.title, { color: theme.textPrimary }]}>
                  Login to your account
                </Text>
              </View>

              {/* --- Form --- */}
              <View style={styles.formGroup}>
                
                {/* Email Input */}
                  {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>
                    College Email
                  </Text>
                  <View style={[
                      styles.inputWrapper,
                      {
                        borderColor: focusedField === "email" ? theme.focusBorder : theme.border,
                        backgroundColor: focusedField === "email" ? theme.focusBg : theme.inputBg,
                      },
                    ]}>
                    <MaterialIcons name="mail" size={20} color={theme.textSecondary} style={{ marginRight: 8 }} />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="student@college.edu"
                      placeholderTextColor={theme.placeholder}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      style={[styles.inputField, { color: theme.textPrimary }]}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>
                    Password
                  </Text>

                  <View style={[
                      styles.inputWrapper,
                      {
                        borderColor: focusedField === "password" ? theme.focusBorder : theme.border,
                        backgroundColor: focusedField === "password" ? theme.focusBg : theme.inputBg,
                      },
                    ]}>
                    <MaterialIcons name="lock" size={20} color={theme.textSecondary} style={{ marginRight: 8 }} />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="••••••••"
                      placeholderTextColor={theme.placeholder}
                      secureTextEntry={!showPassword}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      style={[styles.inputField, { color: theme.textPrimary }]}
                    />

                    {/* Eye Icon Toggle */}
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                      hitSlop={8}
                    >
                      <MaterialIcons
                        name={showPassword ? "visibility" : "visibility-off"}
                        size={22}
                        color="#94a3b8"
                      />
                    </Pressable>
                  </View>

                  <View style={styles.forgotContainer}>
                    <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/ForgotPasswordScreen")}>
                      <Text style={[styles.linkText, { color: theme.primary }]}>
                        Forgot password?
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* --- Actions --- */}
              <View style={styles.actionGroup}>
                {isLoading ? (
                    <ActivityIndicator size="large" color={theme.primary} style={{ marginVertical: 10 }} />
                ) : (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleLogin}
                      style={[styles.primaryButton, { backgroundColor: theme.primary }]}
                    >
                      <Text style={styles.primaryButtonText}>Login</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.signupContainer}>
                  <Text style={[styles.signupText, { color: theme.textSecondary }]}>
                    Don’t have an account?{" "}
                  </Text>
                  <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/SignupScreen")}>
                    <Text style={[styles.signupLink, { color: theme.primary }]}>
                      Sign up
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24, // px-6
    paddingVertical: 48,   // py-12
  },
  contentWrapper: {
    width: "100%",
    maxWidth: 384, // max-w-sm
  },
  
  // --- Header Styles ---
  header: {
    alignItems: "center",
    marginBottom: 32, // mb-8
  },
  iconWrapper: {
    width: 96,  // w-24
    height: 96, // h-24
    borderRadius: 24, // rounded-3xl
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24, // mb-6
  },
  title: {
    fontSize: 24, // text-2xl
    fontFamily: "Urbanist_700Bold", // font-bold
    textAlign: "center",
  },

  // --- Form Styles ---
  formGroup: {
    gap: 24, // space-y-6 equivalent
  },
  inputGroup: {
    gap: 8, // space-y-2 equivalent
  },
  label: {
    fontSize: 14, // text-sm
    fontFamily: "Urbanist_600SemiBold", // font-medium
  },
  inputWrapper: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 12, // rounded-xl
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16, // px-4
  },
  inputField: {
    flex: 1,
    paddingVertical: 12, // py-3
    fontSize: 14, // text-sm
    fontFamily: "Urbanist_600SemiBold", // font-medium
  },
  eyeIcon: {
    marginLeft: 8,
    padding: 4,
  },
  forgotContainer: {
    alignItems: "flex-end",
    paddingTop: 8, // pt-2
  },
  linkText: {
    fontSize: 14, // text-sm
    fontFamily: "Urbanist_700Bold", // font-medium
  },

  // --- Action Styles ---
  actionGroup: {
    paddingTop: 32, // pt-8
  },
  primaryButton: {
    width: "100%",
    paddingVertical: 16, // py-4
    borderRadius: 12, // rounded-xl
    alignItems: "center",
    // Shadow properties (shadow-sm shadow-indigo-200)
    shadowColor: "#c7d2fe", 
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontFamily: "Urbanist_800ExtraBold", // font-bold
    fontSize: 16, // text-base
  },
  signupContainer: {
    marginTop: 24, // mt-6
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    fontSize: 14, // text-sm
    fontFamily: "Urbanist_600SemiBold", // font-medium
  },
  signupLink: {
    fontFamily: "Urbanist_800ExtraBold", // font-bold (changed from semibold to bold to match visual weight often used in pure CSS)
  },
});
// import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
// import React, { useContext, useState } from 'react'
// import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
// import { StyleSheet,ScrollView } from 'react-native';
// import { useTheme } from '../../src/hooks/useTheme';
// import { MaterialIcons } from "@expo/vector-icons";
// import { TextInput } from 'react-native';
// import { KeyboardAvoidingView } from 'react-native';
// import { Platform } from 'react-native';
// import { useRouter } from 'expo-router';
// import BackButton from '../../src/components/common/BackNavigationButton';
// import { AuthContext } from '../../src/context/AuthContext';

// const Login = () => {
  
//   const router = useRouter();
//   const colors = useTheme();
//   const { login } = useContext(AuthContext);

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   const handleLogin = async () => {
//     if (!email || !password) {
//       Alert.alert('Error', 'Please enter both email and password');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const response = await login(email.trim(), password);
//       // AuthContext handles token storage
//       if (response.success) {
//         router.replace("/HomeScreen"); 
//       } else {
//         Alert.alert('Login Failed', response.message || 'Unknown error occurred');
//       }
//     } catch (error) {
//       console.log("Login Catch Error:", error);
//       const errorMessage = error?.message || (typeof error === 'string' ? error : JSON.stringify(error));
//       Alert.alert('Login Failed', errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <SafeAreaProvider >
//       <KeyboardAvoidingView
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       keyboardVerticalOffset={15}
//       style={{ flex: 1 }}
//     >
    
//       <SafeAreaView style={[styles.container]}>
//         <BackButton backTo='/'/>
//         <View style={[styles.authLayout]}>
          
//           <View style={styles.iconContainer}>
//           <MaterialIcons name="school" size={48} color={colors.primary} />
//           </View>
//           <View>
//             <Text style = {styles.mainTitle}>
//               Login to your account
//             </Text>
//           </View>
          
//           <View style = {[styles.textBox]}>
//             <Text style = {styles.textBoxTitle}>
//               College Email
//             </Text>
//             <TextInput
//             placeholder="student@college.edu"
//             value={email}
//             onChangeText={setEmail}
//             keyboardType="email-address"
//             autoCapitalize="none"
//             autoCorrect={false}
//             style={styles.input}
//       />
//             <Text style = {styles.textBoxTitle}>
//               Password
//             </Text>
//             <TextInput
//             placeholder='••••••••'
//             secureTextEntry={true}
//             value={password}
//             onChangeText={setPassword}
//             style={styles.input}
//       />    
//           </View>
          
//         {isLoading ? (
//            <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 10 }} />
//         ) : (
//           <TouchableOpacity onPress ={handleLogin} style ={[styles.primaryButton, {backgroundColor:colors.primary}]}>
//             <Text style={styles.primaryButtonText} >Login</Text>
//           </TouchableOpacity>
//         )}

//         <View style={styles.bottomTextContainer}>
//           <Text style = {styles.textBoxTitle}>
//               Don't have an account?
//           </Text>
//               <TouchableOpacity onPress={() => router.push("/SignupScreen")} >
//                 <Text style = {styles.textHighlights}>
//                   Sign up
//                 </Text>
//               </TouchableOpacity>
//         </View> 
          
//         </View>
        
//     </SafeAreaView>
    
//     </KeyboardAvoidingView>
//     </SafeAreaProvider>
    
//   )
// }

// const styles = StyleSheet.create({
//   container:{
//     flex:1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor:"#f8fafc",
//   },
//   primaryButton:{
//     width:"100%",
//     padding:"12",
//     alignItems:"center",
//     alignContent:"center",
//     borderRadius:12,
//     marginVertical:10,
//   },

//   primaryButtonText: {
//     color: "#FFFFFF",       // text-white
//     fontSize: 16,           // text-base
//     fontWeight: "600",      // font-semibold
//     letterSpacing: 0.5,
//   },

//   authLayout:{
//     flex:1,
//     width:"80%",
//     justifyContent:"center",
//     alignItems:"center",
//     margin:80
//   },

//   iconContainer:{
//     borderRadius: 15,
//     padding:13,
//     backgroundColor:"#e0e7ff",
  
//   },
//   textBox:{
//     width:"100%",


//   },
//   input: {
//     borderRadius:12,
//     borderColor:"#94a3b8",
//     height: 40,
//     marginVertical: 12,
//     borderWidth: 1,
//     padding: 12,
//   },
//   textBoxTitle:{
//     fontWeight:"500",
//     color:"#475569"

//   },
//   mainTitle:{
//     fontSize:45,
//     fontWeight:"600",
//     marginVertical:20,
    

//   },
//   textHighlights:{
//    fontWeight:"800",
//    color:"#4f46e5"
//   },

//   bottomTextContainer:{
//     flex:1,
//     flexDirection:"row",
    
//   }

// })

// export default Login
