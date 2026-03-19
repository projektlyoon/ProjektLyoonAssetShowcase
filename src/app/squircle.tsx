import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Canvas } from '@shopify/react-native-skia';
import { SkiaSquircle } from '@/components/SkiaSquircle';
import { Slider } from '@/components/Slider';

export default function SquircleScreen() {
  const router = useRouter();
  const [power, setPower] = useState(2.8);
  const [segments, setSegments] = useState(64);

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
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Squircle Showcase</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.componentContainer}>
          <Text style={styles.componentLabel}>Superellipse Visualization</Text>
          
          <View style={styles.canvasContainer}>
            <Canvas style={styles.canvas}>
              <SkiaSquircle 
                x={25} 
                y={25} 
                width={200} 
                height={200} 
                power={power} 
                segments={segments} 
                color="#ec4899"
                style="both"
                strokeColor="#9d174d"
                strokeWidth={4}
              />
            </Canvas>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Power</Text>
              <Text style={styles.statValue}>{power.toFixed(2)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Segments</Text>
              <Text style={styles.statValue}>{Math.round(segments)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <Text style={styles.controlsTitle}>Adjust Parameters</Text>
          
          <Slider 
            label="Power (Superellipse Exponent)"
            min={0.5}
            max={10}
            value={power}
            onValueChange={setPower}
          />

          <Slider 
            label="Segments (Path Detail)"
            min={4}
            max={256}
            value={segments}
            onValueChange={setSegments}
          />
        </View>

        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>Technical Details</Text>
          <Text style={styles.descriptionText}>
            The Superellipse (or Squircle) is a geometric shape defined by the equation: 
            |x/a|^n + |y/b|^n = 1.
            {"\n\n"}
            • n=2: Standard Circle
            {"\n"}
            • n=4: Classic Squircle
            {"\n"}
            • n &gt; 4: Approaching a Square
            {"\n"}
            • n &lt; 2: Star-like shapes
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
    marginBottom: 32,
  },
  componentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 24,
  },
  canvasContainer: {
    width: 250,
    height: 250,
    backgroundColor: '#fff',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 24,
  },
  canvas: {
    width: 250,
    height: 250,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  controlsContainer: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
    alignItems: 'center',
  },
  controlsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  descriptionCard: {
    width: '100%',
    padding: 24,
    backgroundColor: '#fdf2f8',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#fce7f3',
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#be185d',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#9d174d',
    opacity: 0.8,
  },
});
