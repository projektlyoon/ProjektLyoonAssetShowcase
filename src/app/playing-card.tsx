import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Switch } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Edit3, Settings } from 'lucide-react-native';
import { PlayingCard, CardDef } from '@/components/PlayingCard';

export default function PlayingCardScreen() {
  const router = useRouter();
  
  const [card, setCard] = useState<CardDef>({
    id: '1',
    name: 'Nitro Surge',
    description: 'Instantly gain +4 fuel but take 1 damage to hull.',
    fuelCost: 4,
    rarity: 'RARE',
  });

  const [effects, setEffects] = useState({
    ripple: true,
    glow: true,
    shimmer: true,
    explosion: false,
    glitch: false,
    shield: false,
    burn: false,
  });

  const toggleEffect = (key: keyof typeof effects) => {
    setEffects(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateCard = (key: keyof CardDef, value: any) => {
    setCard(prev => ({ ...prev, [key]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#f8fafc" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Playing Card</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Card Preview */}
        <View style={styles.previewSection}>
          <PlayingCard 
            card={card} 
            activeEffects={effects}
          />
          <Text style={styles.previewHint}>Drag to tilt • Tap for effects</Text>
        </View>

        {/* Configuration Section */}
        <View style={styles.configContainer}>
          <View style={styles.sectionHeader}>
            <Edit3 size={18} color="#6366f1" />
            <Text style={styles.sectionTitle}>Content Editor</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Card Name</Text>
            <TextInput 
              style={styles.input}
              value={card.name}
              onChangeText={(v) => updateCard('name', v)}
              placeholder="Enter name..."
              placeholderTextColor="#475569"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput 
              style={[styles.input, styles.textArea]}
              value={card.description}
              onChangeText={(v) => updateCard('description', v)}
              placeholder="Enter description..."
              placeholderTextColor="#475569"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.rarityRow}>
             {(['COMMON', 'RARE', 'LEGENDARY'] as const).map((r) => (
               <TouchableOpacity 
                key={r}
                style={[styles.rarityBtn, card.rarity === r && styles.rarityBtnActive]}
                onPress={() => updateCard('rarity', r)}
               >
                 <Text style={[styles.rarityBtnText, card.rarity === r && styles.rarityBtnTextActive]}>{r}</Text>
               </TouchableOpacity>
             ))}
          </View>

          <View style={styles.divider} />

          <View style={styles.sectionHeader}>
            <Settings size={18} color="#10b981" />
            <Text style={styles.sectionTitle}>Special Animations</Text>
          </View>

          <View style={styles.effectList}>
            <EffectToggle 
              label="Ripple on Tap" 
              value={effects.ripple} 
              onToggle={() => toggleEffect('ripple')} 
            />
            <EffectToggle 
              label="Glow Pulse" 
              value={effects.glow} 
              onToggle={() => toggleEffect('glow')} 
            />
            <EffectToggle 
              label="Periodic Shimmer" 
              value={effects.shimmer} 
              onToggle={() => toggleEffect('shimmer')} 
            />
            <EffectToggle 
              label="Explosion on Tap" 
              value={effects.explosion} 
              onToggle={() => toggleEffect('explosion')} 
            />
            <EffectToggle 
              label="Glitch on Tap" 
              value={effects.glitch} 
              onToggle={() => toggleEffect('glitch')} 
            />
            <EffectToggle 
              label="Shield Pulse on Tap" 
              value={effects.shield} 
              onToggle={() => toggleEffect('shield')} 
            />
            <EffectToggle 
              label="Burn on Tap" 
              value={effects.burn} 
              onToggle={() => toggleEffect('burn')} 
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const EffectToggle = ({ label, value, onToggle }: { label: string, value: boolean, onToggle: () => void }) => (
  <View style={styles.effectRow}>
    <Text style={styles.effectLabel}>{label}</Text>
    <Switch 
      value={value} 
      onValueChange={onToggle}
      trackColor={{ false: '#1e293b', true: '#6366f1' }}
      thumbColor="#f8fafc"
    />
  </View>
);

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
  previewSection: {
    alignItems: 'center',
    marginBottom: 40,
    height: 380,
    justifyContent: 'center',
  },
  previewHint: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  configContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f8fafc',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    color: '#f8fafc',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  rarityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  rarityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  rarityBtnActive: {
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  rarityBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
  },
  rarityBtnTextActive: {
    color: '#f8fafc',
  },
  divider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginVertical: 24,
  },
  effectList: {
    gap: 16,
  },
  effectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  effectLabel: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '600',
  },
});
