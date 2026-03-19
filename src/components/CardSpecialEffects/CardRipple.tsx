import { BlurMask, Canvas, Circle, Group } from '@shopify/react-native-skia';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
    Easing,
    interpolate,
    useDerivedValue,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { CardSpecialEffectProps } from './types';

const RippleRing: React.FC<{ baseR: ReturnType<typeof useDerivedValue<number>>; index: number; color: string }> = ({ baseR, index, color }) => {
    const radius = useDerivedValue(() => baseR.value + (index * 8));
    const strokeWidth = useDerivedValue(() => 1 + index * 1.5);
    const opacity = useDerivedValue(() => (index + 1) * 0.2);
    const blur = useDerivedValue(() => 1 + index);

    return (
        <Circle
            cx={0}
            cy={0}
            r={radius}
            color={color}
            style="stroke"
            strokeWidth={strokeWidth}
            opacity={opacity}
        >
            <BlurMask blur={blur} style="solid" />
        </Circle>
    );
};

const ZenWave: React.FC<CardSpecialEffectProps> = ({ isMenuMode, triggerId, theme }) => {
    const progress = useSharedValue(0);
    const rarityColor = theme.palette.accent;

    React.useEffect(() => {
        progress.value = 0;
        progress.value = withTiming(1, {
            duration: isMenuMode ? 1500 : 4000,
            easing: Easing.bezier(0.2, 1, 0.4, 1)
        });
    }, [isMenuMode, progress, triggerId]);

    const opacity = useDerivedValue(() => interpolate(progress.value, [0, 0.05, 0.6, 1], [0, 0.6, 0.3, 0]));
    const baseR = useDerivedValue(() => interpolate(progress.value, [0, 1], [20, 500]));

    return (
        <Group opacity={opacity} transform={[{ translateX: 110 }, { translateY: 160 }]}>
            {[0, 1, 2, 3].map((i) => <RippleRing key={i} baseR={baseR} index={i} color={rarityColor} />)}
        </Group>
    );
};

export const CardRipple: React.FC<CardSpecialEffectProps> = ({ theme, triggerId, isMenuMode }) => {
    return (
        <View style={styles.container}>
            <Canvas style={styles.canvas}>
                <ZenWave theme={theme} isMenuMode={isMenuMode} triggerId={triggerId} />
            </Canvas>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: 220,
        height: 320,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'visible',
    },
    canvas: {
        width: 1000,
        height: 1000,
        position: 'absolute',
        top: -340,
        left: -390,
    },
});
