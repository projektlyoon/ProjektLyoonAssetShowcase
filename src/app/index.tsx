import { Link } from 'expo-router';
import { ChevronRight, Dices, Fuel, Square, SquareAsterisk } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MainMenu() {
  const menuItems = [
    {
      title: 'Fuel Bar',
      subtitle: 'Animated sine wave fuel indicator',
      icon: <Fuel size={24} color="#3b82f6" />,
      href: '/fuel-bar' as const,
    },
    {
      title: 'Squircle',
      subtitle: 'Superellipse / Squircle component',
      icon: <Square size={24} color="#ec4899" />,
      href: '/squircle' as const,
    },
    {
      title: '3D Die',
      subtitle: '3D animated Skia dice',
      icon: <Dices size={24} color="#f59e0b" />,
      href: '/die-3d' as const,
    },
    {
      title: 'Matrix Die',
      subtitle: 'Accessible dot-matrix dice',
      icon: <View style={{ width: 24, height: 24, gap: 2, flexWrap: 'wrap', flexDirection: 'row' }}>
        {[...Array(9)].map((_, i) => <View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' }} />)}
      </View>,
      href: '/die-matrix' as const,
    },
    {
      title: 'Playing Card',
      subtitle: 'Interactive game card with special effects',
      icon: <SquareAsterisk size={24} color="#6366f1" />,
      href: '/playing-card' as const,
    },
    // Add more components here as they are developed
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Asset Showcase</Text>
        <Text style={styles.subtitle}>Projekt Lyoon Component Library</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.menuList}>
          {menuItems.map((item, index) => (
            <Link key={index} href={item.href} asChild>
              <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                <View style={styles.iconContainer}>
                  {item.icon}
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                </View>
                <ChevronRight size={20} color="#cbd5e1" />
              </TouchableOpacity>
            </Link>
          ))}
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
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 20,
  },
  menuList: {
    gap: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  footer: {
    padding: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
