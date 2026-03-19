import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Play } from 'lucide-react-native';
import { Die3D } from '@/components/Die3D';

export default function Die3DScreen() {
  const router = useRouter();
  const [value, setValue] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [nonce, setNonce] = useState(0);

  const rollDie = () => {
    if (rolling) return;
    
    const newValue = Math.floor(Math.random() * 6) + 1;
    setValue(newValue);
    setNonce(n => n + 1);
    setRolling(true);
    
    // Stop rolling after some time
    setTimeout(() => {
      setRolling(false);
    }, 600);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>3D Die Showcase</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.componentContainer}>
          <Text style={styles.componentLabel}>Animated 3D Skia Dice</Text>
          
          <View style={styles.dieWrapper}>
            <Die3D 
              value={value} 
              rolling={rolling} 
              rollNonce={nonce} 
              size={200}
              highlighted={rolling}
            />
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.valueText}>
              {rolling ? 'ROLLING...' : `VALUE: ${value}`}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.rollButton, rolling && styles.disabledButton]} 
          onPress={rollDie}
          disabled={rolling}
        >
          <Play size={24} color="#fff" fill="#fff" />
          <Text style={styles.rollButtonText}>ROLL DICE</Text>
        </TouchableOpacity>

        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>Technical Details</Text>
          <Text style={styles.descriptionText}>
            This component renders a fully dynamic 3D cube using Skia. 
            It uses 3D rotation matrices and perspective projection calculated in real-time on the UI thread via Reanimated worklets.
            {"\n\n"}
            The faces are depth-sorted to ensure correct rendering, and each face calculates its own 'facing factor' to adjust lighting and opacity.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
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
  dieWrapper: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  infoContainer: {
    marginTop: 32,
  },
  valueText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 2,
  },
  rollButton: {
    flexDirection: 'row',
    backgroundColor: '#f59e0b',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 40,
  },
  disabledButton: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
  },
  rollButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  descriptionCard: {
    width: '100%',
    padding: 24,
    backgroundColor: '#fff7ed',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ffedd5',
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9a3412',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#c2410c',
    opacity: 0.8,
  },
});
