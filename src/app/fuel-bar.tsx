import { FuelBar, FuelNotification, MAX_FUEL } from '@/components/FuelBar';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Minus, Plus } from 'lucide-react-native';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';

export default function FuelBarScreen() {
  const router = useRouter();

  const [fuel, setFuel] = useState(8);
  const [notification, setNotification] = useState<FuelNotification | null>(null);
  const fuelSharedValue = useSharedValue(8);

  const increaseFuel = () => {
    const next = Math.min(MAX_FUEL, fuel + 2);
    const delta = next - fuel;
    if (delta > 0) {
      setFuel(next);
      fuelSharedValue.value = withTiming(next);
      setNotification({ id: Date.now().toString(), delta, reason: 'Refill' });
    }
  };

  const decreaseFuel = () => {
    const next = Math.max(0, fuel - 1);
    const delta = next - fuel;
    if (delta < 0) {
      setFuel(next);
      fuelSharedValue.value = withTiming(next);
      setNotification({ id: Date.now().toString(), delta, reason: 'Used' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#e2e8f0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fuel Bar Showcase</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.componentContainer}>
          <View style={styles.fuelContainer}>
            <FuelBar
              fuel={fuel}
              fuelSharedValue={fuelSharedValue}
              fuelChange={notification}
            />
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <Text style={styles.controlsTitle}>Adjust Fuel Level</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={decreaseFuel}
              style={[styles.controlButton, styles.decreaseButton]}
            >
              <Minus size={24} color="#ef4444" />
              <Text style={[styles.buttonText, { color: '#ef4444' }]}>Drain (-1)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={increaseFuel}
              style={[styles.controlButton, styles.increaseButton]}
            >
              <Plus size={24} color="#22c55e" />
              <Text style={[styles.buttonText, { color: '#22c55e' }]}>Refill (+2)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#334155',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f8fafc',
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
  },
  componentContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  componentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 24,
  },
  fuelContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  controlsContainer: {
    width: '100%',
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 24,
  },
  controlsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
  },
  decreaseButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  increaseButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionCard: {
    width: '100%',
    padding: 24,
    backgroundColor: '#1e293b',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#cbd5e1',
    opacity: 0.8,
  },
});
