import React from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AnalysisScreen from '../screens/AnalysisScreen';
import HistoryScreen from '../screens/HistoryScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import QualityCheckScreen from '../screens/QualityCheckScreen';
import UploadScreen from '../screens/UploadScreen';
import { colors } from '../theme';

const TAB_META = {
  Home: { label: 'Home', icon: 'home' },
  Upload: { label: 'Scan', icon: 'scan-outline' },
  History: { label: 'History', icon: 'time-outline' },
  Profile: { label: 'Profile', icon: 'person-outline' },
};

function AppTabBar({ state, descriptors, navigation }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const focusedKey = state.routes[state.index].key;
  const hidden = StyleSheet.flatten(descriptors[focusedKey]?.options?.tabBarStyle)?.display === 'none';
  if (hidden) return null;

  return (
    <View style={[styles.barHost, { paddingBottom: insets.bottom }]}>
      <View style={[styles.bar, width > 420 && styles.barColumn]}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const meta = TAB_META[route.name] || { label: route.name, icon: 'ellipse-outline' };
          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              onPress={() => {
                if (!focused) navigation.navigate(route.name);
              }}
              style={styles.tab}
            >
              <View style={[styles.iconPill, focused && styles.iconPillOn]}>
                <Ionicons
                  name={meta.icon}
                  size={22}
                  color={focused ? '#3B82F6' : '#64748B'}
                />
              </View>
              <Text style={[styles.tabLabel, focused && styles.tabLabelOn]}>{meta.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const UploadStack = createNativeStackNavigator();

function UploadFlow() {
  return (
    <UploadStack.Navigator screenOptions={{ headerShown: false }}>
      <UploadStack.Screen name="UploadMain" component={UploadScreen} />
      <UploadStack.Screen name="QualityCheck" component={QualityCheckScreen} />
      <UploadStack.Screen name="Analysis" component={AnalysisScreen} />
    </UploadStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

/** Tabs shown after a person is logged in. */
export default function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Upload"
        component={UploadFlow}
        options={({ route }) => {
          const focused = getFocusedRouteNameFromRoute(route) ?? 'UploadMain';
          const hideBar = focused !== 'UploadMain';
          return {
            tabBarStyle: hideBar ? { display: 'none' } : undefined,
          };
        }}
      />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  barHost: {
    backgroundColor: '#0F1A35',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#0F1A35',
    borderTopWidth: 1,
    borderTopColor: '#2B3B68',
  },
  barColumn: {
    maxWidth: 420,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconPill: {
    minWidth: 48,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  iconPillOn: {
    backgroundColor: 'rgba(59,130,246,0.18)',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  tabLabelOn: {
    color: '#3B82F6',
  },
});
