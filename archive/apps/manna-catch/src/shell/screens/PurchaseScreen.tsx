import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

type PurchaseScreenProps = {
  gameName: string;
  description: string;
  onPurchase: () => void;
  onRestore: () => void;
  onBack: () => void;
};

const TRUST_BADGES: { icon: string; label: string }[] = [
  { icon: '🚫', label: 'No ads' },
  { icon: '🔒', label: 'No data' },
  { icon: '♾️', label: 'No subs' },
];

export default function PurchaseScreen({
  gameName,
  description,
  onPurchase,
  onRestore,
  onBack,
}: PurchaseScreenProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerBar}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backArrow}>{'←'}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{gameName}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.description}>{description}</Text>

        <View style={styles.priceBlock}>
          <Text style={styles.price}>$4.99</Text>
          <Text style={styles.priceSubtext}>one-time purchase</Text>
        </View>

        <View style={styles.badgeRow}>
          {TRUST_BADGES.map(({ icon, label }) => (
            <View key={label} style={styles.badge}>
              <Text style={styles.badgeIcon}>{icon}</Text>
              <Text style={styles.badgeText}>{label}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [styles.purchaseButton, pressed && styles.pressed]}
          onPress={onPurchase}
        >
          <Text style={styles.purchaseButtonText}>Purchase</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.restoreButton, pressed && styles.pressed]}
          onPress={onRestore}
        >
          <Text style={styles.restoreText}>Restore Purchase</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFBF0',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 14,
  },
  backButton: {
    paddingRight: 14,
  },
  backArrow: {
    color: '#D4C36A',
    fontSize: 24,
  },
  headerTitle: {
    color: '#1A1A1A',
    fontSize: 20,
    fontWeight: '800',
    flex: 1,
  },
  headerSpacer: {
    width: 38,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  description: {
    color: '#5A5A5A',
    fontSize: 16,
    lineHeight: 24,
  },
  priceBlock: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  price: {
    color: '#D4C36A',
    fontSize: 48,
    fontWeight: '800',
  },
  priceSubtext: {
    color: '#9A9A9A',
    fontSize: 14,
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  badge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  badgeIcon: {
    fontSize: 20,
  },
  badgeText: {
    color: '#1A1A1A',
    fontSize: 12,
    fontWeight: '600',
  },
  purchaseButton: {
    backgroundColor: '#D4C36A',
    borderRadius: 14,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4C36A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  purchaseButtonText: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '800',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  restoreText: {
    color: '#D4C36A',
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
