import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Play } from 'lucide-react-native';
import { DieMatrix } from '@/components/DieMatrix';

export default function DieMatrixScreen() {
  const router = useRouter();
  const [value, setValue] = useState(1);
  const [rolling, setRolling] = useState(false);

  const rollDie = () => {
    if (rolling) return;
    setRolling(true);
    
    // Simulate server delay/roll time
    setTimeout(() => {
      const newValue = Math.floor(Math.random() * 6) + 1;
      setValue(newValue);
      
      // Stop rolling to trigger the reveal animation
      setTimeout(() => {
        setRolling(false);
      }, 400);
    }, 800);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Matrix Die Showcase</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.componentContainer}>
          <Text style={styles.componentLabel}>Accessible Dot-Matrix Dice</Text>
          
          <View style={styles.dieWrapper}>
            <DieMatrix 
              value={value} 
              rolling={rolling} 
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
            This "Accessible" version of the die uses a 7x7 dot-matrix grid to display numerals. 
            {"\n\n"}
            It features two distinct phases:
            {"\n"}• <Text style={{ fontWeight: '700' }}>Rolling</Text>: Fast scrambling of random digits with sparkle effects.
            {"\n"}• <Text style={{ fontWeight: '700' }}>Idle</Text>: High-contrast static display of the numeral.
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
    backgroundColor: '#0f172a', // Darker background for matrix glow
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
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
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#10b981',
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
    backgroundColor: '#ecfdf5',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065f46',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#047857',
    opacity: 0.8,
  },
});
