import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../src/shell/theme';

function TabIcon({ symbol, focused }: { symbol: string; focused: boolean }) {
  return (
    <View style={styles.iconWrap}>
      <Text
        style={[
          styles.icon,
          { color: focused ? colors.gold : '#6A6A64' },
        ]}
      >
        {symbol}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1C1C1A',
          borderTopColor: '#2A2A28',
          borderTopWidth: 1,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: '#6A6A64',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol={'⌂'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol={'≡'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol={'…'} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
  },
  icon: {
    fontSize: 22,
    fontWeight: '800',
  },
});
