import { DotMatrixText } from '@/components/DotMatrixText';
import { Slider } from '@/components/Slider';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Palette, Settings2, Type } from 'lucide-react-native';
import React, { useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const PRESET_COLORS = [
  { name: 'Neon Green', color: '#10b981' },
  { name: 'Amber', color: '#f59e0b' },
  { name: 'Deep Blue', color: '#3b82f6' },
  { name: 'Hot Pink', color: '#ec4899' },
  { name: 'Cyber White', color: '#f8fafc' },
];

export default function DotMatrixScreen() {
  const router = useRouter();
  const [text, setText] = useState('PROJEKT LYOON');
  const [color, setColor] = useState('#10b981');
  const [dotSize, setDotSize] = useState(4);
  const [dotGap, setDotGap] = useState(1);
  const [charGap, setCharGap] = useState(8);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#f8fafc" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dot Matrix Laboratory</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Matrix Display Area */}
        <View style={styles.displaySection}>
          <View style={styles.matrixWrapper}>
            <DotMatrixText
              text={text || ' '}
              color={color}
              dotSize={dotSize}
              dotGap={dotGap}
              charGap={charGap}
              inactiveOpacity={0.08}
            />
          </View>
        </View>

        {/* Input Section */}
        <View style={styles.configCard}>
          <View style={styles.sectionHeader}>
            <Type size={18} color="#10b981" />
            <Text style={styles.sectionTitle}>Message Input</Text>
          </View>

          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Type something..."
            placeholderTextColor="#475569"
            autoCapitalize="characters"
            maxLength={20}
          />
        </View>

        {/* Style Section */}
        <View style={styles.configCard}>
          <View style={styles.sectionHeader}>
            <Settings2 size={18} color="#3b82f6" />
            <Text style={styles.sectionTitle}>Matrix Parameters</Text>
          </View>

          <Slider
            label="Dot Size"
            min={1}
            max={10}
            value={dotSize}
            onValueChange={setDotSize}
          />

          <Slider
            label="Dot Gap"
            min={0}
            max={5}
            value={dotGap}
            onValueChange={setDotGap}
          />

          <Slider
            label="Character Gap"
            min={2}
            max={20}
            value={charGap}
            onValueChange={setCharGap}
          />
        </View>

        {/* Color Section */}
        <View style={styles.configCard}>
          <View style={styles.sectionHeader}>
            <Palette size={18} color="#ec4899" />
            <Text style={styles.sectionTitle}>Theme Color</Text>
          </View>

          <View style={styles.colorRow}>
            {PRESET_COLORS.map((preset) => (
              <TouchableOpacity
                key={preset.color}
                style={[
                  styles.colorCircle,
                  { backgroundColor: preset.color },
                  color === preset.color && styles.colorCircleActive
                ]}
                onPress={() => setColor(preset.color)}
              />
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Uses a custom 5x5 bitmask glyph system to render high-contrast digital text.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#1e293b',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  displaySection: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: '#000',
    padding: 40,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#1e293b',
    minHeight: 200,
    justifyContent: 'center',
  },
  matrixWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewHint: {
    color: '#475569',
    fontSize: 10,
    marginTop: 20,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '700',
  },
  configCard: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f8fafc',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    color: '#f8fafc',
    fontSize: 18,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    borderWidth: 1,
    borderColor: '#334155',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorCircleActive: {
    borderColor: '#fff',
    transform: [{ scale: 1.1 }],
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
  }
});
