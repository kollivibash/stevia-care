/**
 * Main Navigator — Tab Bar
 * Design inspired by:
 *   Apple Health   → minimal clean tab bar, green accent
 *   Calm           → soft rounded active pill
 *   Flo            → icon + label, active color fill
 *   Samsung Health → compact tab with indicator dot
 */
import React, { useRef, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore, getTheme } from '../store/themeStore';

import DashboardScreen         from '../screens/Dashboard/DashboardScreen';
import HealthHubScreen         from '../screens/HealthHub/HealthHubScreen';
import FamilyScreen            from '../screens/Family/FamilyScreen';
import FamilyInsightsScreen    from '../screens/Family/FamilyInsightsScreen';
import AddMemberScreen         from '../screens/Family/AddMemberScreen';
import ProfileScreen            from '../screens/Profile/ProfileScreen';
import PersonalInfoScreen       from '../screens/Profile/PersonalInfoScreen';
import MedicalConditionsScreen  from '../screens/Profile/MedicalConditionsScreen';
import BloodVitalsScreen        from '../screens/Profile/BloodVitalsScreen';
import PrivacySecurityScreen    from '../screens/Profile/PrivacySecurityScreen';
import HelpFAQScreen            from '../screens/Profile/HelpFAQScreen';
import LabAnalyzerScreen       from '../screens/LabAnalyzer/LabAnalyzerScreen';
import LabResultScreen         from '../screens/LabAnalyzer/LabResultScreen';
import RemindersScreen         from '../screens/Reminders/RemindersScreen';
import TrackerScreen           from '../screens/Tracker/TrackerScreen';
import TrackerAnalysisScreen   from '../screens/Tracker/TrackerAnalysisScreen';
import ChatScreen              from '../screens/Chat/ChatScreen';
import VitalsScreen            from '../screens/Vitals/VitalsScreen';
import SymptomCheckerScreen    from '../screens/SymptomChecker/SymptomCheckerScreen';
import LabHistoryScreen        from '../screens/LabAnalyzer/LabHistoryScreen';
import EmergencySOSScreen      from '../screens/Emergency/EmergencySOSScreen';
import DrugInteractionScreen  from '../screens/DrugInteraction/DrugInteractionScreen';
import HandwrittenRxScreen    from '../screens/Prescription/HandwrittenRxScreen';
import CaregiverScreen        from '../screens/Caregiver/CaregiverScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardHome" component={DashboardScreen} />
    </Stack.Navigator>
  );
}

function HealthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="HealthHubHome">
      <Stack.Screen name="HealthHubHome"      component={HealthHubScreen} />
      <Stack.Screen name="LabHome"            component={LabAnalyzerScreen} />
      <Stack.Screen name="LabResult"          component={LabResultScreen} />
      <Stack.Screen name="LabHistory"         component={LabHistoryScreen} />
      <Stack.Screen name="RemindersHome"      component={RemindersScreen} />

      <Stack.Screen name="TrackerHome"        component={TrackerScreen} />
      <Stack.Screen name="TrackerAnalysis"    component={TrackerAnalysisScreen} />
      <Stack.Screen name="ChatScreen"         component={ChatScreen} />
      <Stack.Screen name="VitalsHome"         component={VitalsScreen} />
      <Stack.Screen name="SymptomChecker"     component={SymptomCheckerScreen} />
      <Stack.Screen name="EmergencySOS"       component={EmergencySOSScreen} />
      <Stack.Screen name="DrugInteraction"   component={DrugInteractionScreen} />
      <Stack.Screen name="HandwrittenRx"     component={HandwrittenRxScreen} />
      <Stack.Screen name="CaregiverMode"     component={CaregiverScreen} />
    </Stack.Navigator>
  );
}

function FamilyStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FamilyHome"     component={FamilyScreen} />
      <Stack.Screen name="FamilyInsights" component={FamilyInsightsScreen} />
      <Stack.Screen name="AddMember"      component={AddMemberScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome"         component={ProfileScreen} />
      <Stack.Screen name="PersonalInfo"        component={PersonalInfoScreen} />
      <Stack.Screen name="MedicalConditions"   component={MedicalConditionsScreen} />
      <Stack.Screen name="BloodVitals"         component={BloodVitalsScreen} />
      <Stack.Screen name="PrivacySecurity"     component={PrivacySecurityScreen} />
      <Stack.Screen name="HelpFAQ"             component={HelpFAQScreen} />
    </Stack.Navigator>
  );
}

const TABS = [
  { name: 'Home',    label: 'Home',    icon: 'home',          iconOut: 'home-outline'          },
  { name: 'Health',  label: 'Health',  icon: 'pulse',         iconOut: 'pulse-outline'         },
  { name: 'Family',  label: 'Family',  icon: 'people',        iconOut: 'people-outline'        },
  { name: 'Profile', label: 'Profile', icon: 'person-circle', iconOut: 'person-circle-outline' },
];

function TabItem({ tab, focused, onPress }) {
  const { isDark } = useThemeStore();
  const T = getTheme(isDark);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacAnim  = useRef(new Animated.Value(focused ? 1 : 0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: focused ? 1.1 : 1, tension: 150, friction: 10, useNativeDriver: true }),
      Animated.timing(opacAnim,  { toValue: focused ? 1 : 0.5, duration: 150, useNativeDriver: true }),
    ]).start();
  }, [focused]);

  return (
    <TouchableOpacity style={styles.tabItem} onPress={onPress} activeOpacity={0.8}>
      <Animated.View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive, { transform: [{ scale: scaleAnim }] }]}>
        <Animated.View style={{ opacity: opacAnim }}>
          <Ionicons
            name={focused ? tab.icon : tab.iconOut}
            size={22}
            color={focused ? '#16A34A' : T.textMuted}
          />
        </Animated.View>
        {focused && <View style={styles.activeDot} />}
      </Animated.View>
      <Animated.Text style={[styles.tabLabel, { color: focused ? '#16A34A' : T.textMuted, opacity: opacAnim }]}>
        {tab.label}
      </Animated.Text>
    </TouchableOpacity>
  );
}

function CustomTabBar({ state, navigation, descriptors }) {
  const { isDark } = useThemeStore();
  const T = getTheme(isDark);

  return (
    <View style={[styles.tabBar, {
      backgroundColor: T.card,
      borderTopColor: T.border,
      shadowColor: isDark ? '#000' : '#16A34A',
    }]}>
      {state.routes.map((route, index) => {
        const tab = TABS.find(t => t.name === route.name);
        const focused = state.index === index;
        return (
          <TabItem
            key={route.key}
            tab={tab}
            focused={focused}
            onPress={() => {
              if (focused) {
                const navState = descriptors[route.key]?.navigation;
                if (navState?.popToTop) navState.popToTop();
              } else {
                navigation.navigate(route.name);
              }
            }}
          />
        );
      })}
    </View>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home"    component={HomeStack} />
      <Tab.Screen name="Health"  component={HealthStack}
        listeners={({ navigation }) => ({
          tabPress: () => navigation.navigate('Health', { screen: 'HealthHubHome' }),
        })}
      />
      <Tab.Screen name="Family"  component={FamilyStack}
        listeners={({ navigation }) => ({
          tabPress: () => navigation.navigate('Family', { screen: 'FamilyHome' }),
        })}
      />
      <Tab.Screen name="Profile" component={ProfileStack}
        listeners={({ navigation }) => ({
          tabPress: () => navigation.navigate('Profile', { screen: 'ProfileHome' }),
        })}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    paddingHorizontal: 8,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 16,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 3 },
  tabIconWrap: { width: 42, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  tabIconWrapActive: { backgroundColor: '#16A34A12' },
  activeDot: { position: 'absolute', bottom: -2, width: 4, height: 4, borderRadius: 2, backgroundColor: '#16A34A' },
  tabLabel: { fontSize: 10, fontFamily: 'Nunito_700Bold', letterSpacing: 0.2 },
});
