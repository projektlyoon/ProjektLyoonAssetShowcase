import { BlurMask, Canvas, Rect } from '@shopify/react-native-skia';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { CardSpecialEffectProps } from './types';

interface DigitalFragmentProps {
    colors: string[];
    delay: number;
    intense?: boolean;
    triggerId: string;
}

const DigitalFragment: React.FC<DigitalFragmentProps> = ({ colors, delay, intense, triggerId }) => {
    const opacity = useSharedValue(0);
    const x = useSharedValue(0);
    const y = useSharedValue(0);
    const w = useSharedValue(0);
    const h = useSharedValue(0);
    const colorIndex = useSharedValue(Math.floor(Math.random() * colors.length));

    useEffect(() => {
        let isCancelled = false;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const scheduleNext = (ms: number) => {
            timeoutId = setTimeout(() => {
                if (isCancelled) return;
                trigger();
            }, ms);
        };

        const trigger = () => {
            const duration = 20 + Math.random() * 40;
            opacity.value = withSequence(
                withTiming(intense ? 0.9 : 0.6, { duration }),
                withDelay(30, withTiming(0, { duration }))
            );

            x.value = 110 + (Math.random() - 0.5) * 220; // Adjusted for card width
            y.value = 160 + (Math.random() - 0.5) * 320; // Adjusted for card height

            if (intense) {
                w.value = 50 + Math.random() * 150;
                h.value = 5 + Math.random() * 20;
            } else {
                w.value = 10 + Math.random() * 50;
                h.value = 1 + Math.random() * 5;
            }

            colorIndex.value = Math.floor(Math.random() * colors.length);
            scheduleNext(10 + Math.random() * (intense ? 60 : 40));
        };

        scheduleNext(delay);

        return () => {
            isCancelled = true;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [colorIndex, colors.length, delay, h, intense, opacity, triggerId, w, x, y]);

    const activeColor = useDerivedValue(() => colors[colorIndex.value]);

    return (
        <Rect x={x} y={y} width={w} height={h} color={activeColor} opacity={opacity}>
            {intense ? <BlurMask blur={4} style="solid" /> : null}
        </Rect>
    );
};

export const CardGlitch: React.FC<CardSpecialEffectProps> = ({ theme, triggerId, isMenuMode }) => {
    const progress = useSharedValue(0);
    const jitter = useSharedValue(0);

    const colors = [
        theme.game.tokens.palette.RED,
        theme.game.tokens.palette.GREEN,
        theme.game.tokens.palette.BLUE,
        theme.game.tokens.palette.YELLOW,
    ];

    useEffect(() => {
        progress.value = 0;
        progress.value = withTiming(1, { duration: isMenuMode ? 1000 : 1500, easing: Easing.linear });
        jitter.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 25 }),
                withTiming(0, { duration: 25 })
            ),
            -1,
            true
        );
    }, [isMenuMode, jitter, progress, triggerId]);

    const containerStyle = useAnimatedStyle(() => {
        const p = progress.value;
        const j = jitter.value;
        const dx = interpolate(j, [0, 1], [-10, 10]) * (p < 0.95 ? 1 : 0);
        const dy = interpolate(j, [0, 1], [-5, 5]) * (p < 0.95 ? 1 : 0);

        return {
            transform: [{ translateX: dx }, { translateY: dy }],
            opacity: interpolate(p, [0, 0.1, 0.9, 1], [0, 1, 1, 0]),
        };
    });

    return (
        <Animated.View style={[styles.container, containerStyle]}>
            <Canvas style={styles.canvas}>
                <DigitalFragment colors={colors} delay={20} intense triggerId={`${triggerId}-tear-1`} />
                <DigitalFragment colors={colors} delay={60} intense triggerId={`${triggerId}-tear-2`} />
                <DigitalFragment colors={colors} delay={100} intense triggerId={`${triggerId}-tear-3`} />

                <DigitalFragment colors={colors} delay={0} triggerId={`${triggerId}-frag-1`} />
                <DigitalFragment colors={colors} delay={50} triggerId={`${triggerId}-frag-2`} />
                <DigitalFragment colors={colors} delay={100} triggerId={`${triggerId}-frag-3`} />
                <DigitalFragment colors={colors} delay={150} triggerId={`${triggerId}-frag-4`} />
                <DigitalFragment colors={colors} delay={250} triggerId={`${triggerId}-frag-5`} />
            </Canvas>
        </Animated.View>
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
        width: 440,
        height: 640,
        position: 'absolute',
        top: -160,
        left: -110,
    },
});
