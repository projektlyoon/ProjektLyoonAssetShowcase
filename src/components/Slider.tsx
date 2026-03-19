import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onValueChange: (value: number) => void;
  label: string;
}

export const Slider: React.FC<SliderProps> = ({
  min,
  max,
  value,
  onValueChange,
  label,
}) => {
  const SLIDER_WIDTH = 250;
  const THUMB_SIZE = 24;
  
  const translateX = useSharedValue(((value - min) / (max - min)) * SLIDER_WIDTH);

  const gesture = Gesture.Pan()
    .onChange((event) => {
      const newX = Math.min(Math.max(0, event.x), SLIDER_WIDTH);
      translateX.value = newX;
      
      const newValue = min + (newX / SLIDER_WIDTH) * (max - min);
      runOnJS(onValueChange)(newValue);
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value - THUMB_SIZE / 2 }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: translateX.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.valueText}>{value.toFixed(2)}</Text>
      </View>
      <GestureDetector gesture={gesture}>
        <View style={styles.sliderTrack}>
          <View style={styles.inactiveTrack} />
          <Animated.View style={[styles.activeTrack, progressStyle]} />
          <Animated.View style={[styles.thumb, thumbStyle]} />
        </View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    width: 250,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  valueText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    fontFamily: 'monospace',
  },
  sliderTrack: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  inactiveTrack: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    right: 0,
  },
  activeTrack: {
    height: 4,
    backgroundColor: '#ec4899',
    borderRadius: 2,
    position: 'absolute',
    left: 0,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ec4899',
    position: 'absolute',
    left: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
