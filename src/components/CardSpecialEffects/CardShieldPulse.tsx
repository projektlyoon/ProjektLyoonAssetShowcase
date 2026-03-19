import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { CardSpecialEffectProps } from './types';

interface ShieldRingProps {
    color: string;
    delay: number;
    size: number;
    triggerId: string;
    isMenuMode?: boolean;
}

const ShieldRing: React.FC<ShieldRingProps> = ({ color, delay, size, triggerId, isMenuMode }) => {
    const progress = useSharedValue(0);

    React.useEffect(() => {
        progress.value = 0;
        progress.value = withDelay(
            delay,
            withTiming(1, {
                duration: isMenuMode ? 900 : 1500,
                easing: Easing.out(Easing.cubic),
            })
        );
    }, [delay, isMenuMode, progress, triggerId]);

    const style = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0, 0.2, 0.85, 1], [0, 0.9, 0.35, 0]),
        transform: [{ scale: interpolate(progress.value, [0, 1], [0.4, 1.2]) }],
    }));

    return (
        <Animated.View
            style={[
                styles.ring,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderColor: color,
                },
                style,
            ]}
        />
    );
};

export const CardShieldPulse: React.FC<CardSpecialEffectProps> = ({ theme, triggerId, isMenuMode }) => {
    const orbit = useSharedValue(0);
    const corePulse = useSharedValue(0);
    const shieldColor = theme.game.tokens.palette.BLUE;
    const glowColor = theme.palette.accent;

    React.useEffect(() => {
        orbit.value = 0;
        orbit.value = withTiming(1, {
            duration: isMenuMode ? 1000 : 1700,
            easing: Easing.inOut(Easing.quad),
        });

        corePulse.value = 0;
        corePulse.value = withSequence(
            withTiming(1, { duration: 240, easing: Easing.out(Easing.quad) }),
            withTiming(0.75, { duration: isMenuMode ? 700 : 1100, easing: Easing.inOut(Easing.quad) })
        );
    }, [corePulse, isMenuMode, orbit, triggerId]);

    const orbitStyle = useAnimatedStyle(() => ({
        opacity: interpolate(orbit.value, [0, 0.15, 1], [0, 1, 0]),
        transform: [{ rotate: `${interpolate(orbit.value, [0, 1], [0, 180])}deg` }],
    }));

    const coreStyle = useAnimatedStyle(() => ({
        opacity: interpolate(corePulse.value, [0, 0.2, 1], [0, 0.95, 0]),
        transform: [{ scale: interpolate(corePulse.value, [0, 1], [0.45, 1.15]) }],
    }));

    return (
        <View style={styles.box}>
            <ShieldRing color={shieldColor} delay={0} size={110} triggerId={triggerId} isMenuMode={isMenuMode} />
            <ShieldRing color={glowColor} delay={120} size={154} triggerId={triggerId} isMenuMode={isMenuMode} />
            <ShieldRing color={shieldColor} delay={220} size={198} triggerId={triggerId} isMenuMode={isMenuMode} />

            <Animated.View style={[styles.core, { backgroundColor: shieldColor + '33' }, coreStyle]} />

            <Animated.View style={[styles.orbit, orbitStyle]}>
                <View style={[styles.orbitDot, { backgroundColor: shieldColor, top: 10, left: 114 }]} />
                <View style={[styles.orbitDot, { backgroundColor: glowColor, top: 114, right: 10 }]} />
                <View style={[styles.orbitDot, { backgroundColor: shieldColor, bottom: 10, left: 114 }]} />
                <View style={[styles.orbitDot, { backgroundColor: glowColor, top: 114, left: 10 }]} />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    box: {
        position: 'absolute',
        width: 240,
        height: 240,
        marginLeft: -120,
        marginTop: -120,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'visible',
    },
    ring: {
        position: 'absolute',
        borderWidth: 2,
    },
    core: {
        position: 'absolute',
        width: 72,
        height: 72,
        borderRadius: 36,
        shadowColor: '#FFFFFF',
        shadowOpacity: 0.28,
        shadowRadius: 14,
    },
    orbit: {
        position: 'absolute',
        width: 240,
        height: 240,
    },
    orbitDot: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        shadowColor: '#FFFFFF',
        shadowOpacity: 0.35,
        shadowRadius: 10,
    },
});
