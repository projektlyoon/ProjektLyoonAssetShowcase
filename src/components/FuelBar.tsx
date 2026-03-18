import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import React, { useEffect, useMemo } from 'react';
import { LayoutChangeEvent, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
    cancelAnimation,
    createAnimatedComponent,
    Easing,
    SharedValue,
    useAnimatedProps,
    useAnimatedReaction,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

export const MAX_FUEL = 12;

export interface FuelNotification {
    id: string;
    delta: number;
    reason: string;
}

export interface FuelBarProps {
    fuel: number;
    fuelSharedValue?: SharedValue<number>;
    fuelChange?: FuelNotification | null;
    color?: string;
    highlighted?: boolean;
    onLayout?: (e: any) => void;
}

const AnimatedTextInput = createAnimatedComponent(TextInput);

const clamp = (v: number, min: number, max: number) => {
    'worklet';
    return v < min ? min : v > max ? max : v;
};

const buildWavePath = (
    fillW: number,
    midY: number,
    amplitude: number,
    wavelength: number,
    phase: number,
    stepPx: number = 2
) => {
    'worklet';
    const p = Skia.Path.Make();
    const safeFillW = Math.max(0, fillW);
    const safeStepPx = Math.max(0.75, Math.min(stepPx, wavelength / 8));
    const getY = (x: number) => midY + amplitude * Math.sin(((2 * Math.PI * x) / wavelength) + phase);
    const startY = getY(0);

    p.moveTo(0, startY);

    if (safeFillW === 0) {
        return p;
    }

    let prevX = 0;
    let prevY = startY;

    for (let x = safeStepPx; x < safeFillW; x += safeStepPx) {
        const y = getY(x);
        const midPointX = (prevX + x) / 2;
        const midPointY = (prevY + y) / 2;
        p.quadTo(prevX, prevY, midPointX, midPointY);
        prevX = x;
        prevY = y;
    }

    p.quadTo(prevX, prevY, safeFillW, getY(safeFillW));

    return p;
};

const SkiaWaveLine = ({
    height,
    barWShared,
    fillWShared,
    emptyColor,
    fillColor,
    glowColor,
}: {
    height: number;
    barWShared: SharedValue<number>;
    fillWShared: SharedValue<number>;
    emptyColor: string;
    fillColor: string;
    glowColor: string;
}) => {
    const midY = height / 2;
    const amplitude = 2.0; 
    const wavelength = 12;
    const animationDurationMs = 1000;

    const phase = useSharedValue(0);

    useEffect(() => {
        cancelAnimation(phase);

        // Run phase progression on the UI thread for a steadier, continuous wave.
        phase.value = withRepeat(
            withTiming(2 * Math.PI, {
                duration: animationDurationMs,
                easing: Easing.linear,
            }),
            -1,
            false
        );

        return () => {
            cancelAnimation(phase);
        };
    }, [animationDurationMs, phase]);

    const basePath = useDerivedValue(() => {
        const w = barWShared.value;
        const fw = fillWShared.value;
        const p = Skia.Path.Make();

        // Start exactly where the fill ends
        p.moveTo(fw, midY);
        p.lineTo(Math.max(fw, w), midY);
        return p;
    });

    const wavePath = useDerivedValue(() => {
        const fw = fillWShared.value;
        const currentPhase = phase.value;
        return buildWavePath(fw, midY, amplitude, wavelength, currentPhase, 1.5);
    });

    return (
        <Canvas style={StyleSheet.absoluteFill}>
            {/* Unfilled part: starts from fillWidth to totalWidth */}
            <Path
                path={basePath}
                style="stroke"
                strokeWidth={2.5}
                strokeCap="round"
                strokeJoin="round"
                color={emptyColor}
            />

            {/* Filled part: glow pass (behind main line) */}
            <Path
                path={wavePath}
                style="stroke"
                strokeWidth={5.0}
                strokeCap="round"
                strokeJoin="round"
                color={glowColor}
            />

            {/* Filled part: colored squiggle up to fillWidth */}
            <Path
                path={wavePath}
                style="stroke"
                strokeWidth={2.5}
                strokeCap="round"
                strokeJoin="round"
                color={fillColor}
            />
        </Canvas>
    );
};

const FloatingNotification = ({ notification, styles }: { notification: FuelNotification | null, styles: any }) => {
    const opacity = useSharedValue(0);
    const [current, setCurrent] = React.useState<FuelNotification | null>(null);

    useEffect(() => {
        if (notification) {
            setCurrent(notification);
            opacity.value = 0;
            opacity.value = withSequence(
                withTiming(1, { duration: 200 }),
                withDelay(1500, withTiming(0, { duration: 400 }))
            );
        }
    }, [notification, opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        marginRight: 8,
    }));

    if (!current) return null;

    const isPositive = current.delta > 0;
    const color = isPositive ? '#4ADE80' : '#FF3B30'; // fallback error color

    return (
        <Animated.View style={animatedStyle} pointerEvents="none">
            <Text style={[styles.notificationText, { color }]}>
                {isPositive ? '+' : ''}{current.delta} {current.reason.toUpperCase()}
            </Text>
        </Animated.View>
    );
};

export const FuelBar: React.FC<FuelBarProps> = ({ fuel, fuelSharedValue, fuelChange, color, highlighted, onLayout }) => {
    // Unkind Dark Theme Default Colors
    const defaultThemeColors = {
        label: 'rgba(255,255,255,0.55)',
        value: '#FFFFFF',
        line: {
            empty: 'rgba(255,255,255,0.25)',
            fill: '#FFD60A',
            glow: 'rgba(255, 214, 10, 0.15)',
        }
    };
    
    const styles = useMemo(() => createStyles(defaultThemeColors, color), [color]);

    const barW = useSharedValue(0);

    const onBarLayout = (e: LayoutChangeEvent) => {
        const w = e.nativeEvent.layout.width;
        if (Math.abs(w - barW.value) > 0.5) barW.value = w;
    };

    const fuelVal = useDerivedValue(() => {
        'worklet';
        const raw = fuelSharedValue ? fuelSharedValue.value : fuel;
        const safe = Number.isFinite(raw) ? raw : 0;
        return clamp(safe, 0, MAX_FUEL);
    }, [fuel, fuelSharedValue]);

    const progress01 = useDerivedValue(() => {
        'worklet';
        return clamp(fuelVal.value / MAX_FUEL, 0, 1);
    });

    const fillWidth = useDerivedValue(() => {
        'worklet';
        return barW.value * progress01.value;
    });

    // animated number
    const displayFuel = useDerivedValue(() => {
        'worklet';
        return Math.round(fuelVal.value);
    });

    const animatedTextProps = useAnimatedProps(() => {
        'worklet';
        return { text: `${displayFuel.value}/${MAX_FUEL}` } as any;
    });

    // pop ONLY on increase
    const pop = useSharedValue(1);
    const prev = useSharedValue<number>(-1);

    useAnimatedReaction(
        () => displayFuel.value,
        (cur) => {
            if (prev.value < 0) {
                prev.value = cur;
                return;
            }
            const last = prev.value;
            prev.value = cur;

            if (cur > last) {
                pop.value = withSequence(
                    withTiming(1.06, { duration: 120, easing: Easing.out(Easing.quad) }),
                    withTiming(1.0, { duration: 220, easing: Easing.out(Easing.quad) })
                );
            }
        },
        []
    );

    const popStyle = useAnimatedStyle(() => {
        'worklet';
        return { transform: [{ scale: pop.value }] };
    });

    const fallbackText = useMemo(() => {
        const safe = Math.max(0, Math.min(MAX_FUEL, Math.round(fuel)));
        return `${safe}/${MAX_FUEL}`;
    }, [fuel]);

    return (
        <View style={styles.container} onLayout={onLayout}>
            <View style={styles.labelContainer} pointerEvents="none">
                <Text style={styles.label}>FUEL</Text>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FloatingNotification notification={fuelChange || null} styles={styles} />
                    <Animated.View style={popStyle}>
                        <AnimatedTextInput
                            editable={false}
                            underlineColorAndroid="transparent"
                            pointerEvents="none"
                            style={styles.value}
                            defaultValue={fallbackText}
                            animatedProps={animatedTextProps}
                        />
                    </Animated.View>
                </View>
            </View>

            {/* Measuring box + Skia overlay */}
            <View
                style={[styles.lineHost, highlighted && {
                    shadowColor: '#FFD60A',
                    shadowOpacity: 1,
                    shadowRadius: 10,
                    elevation: 10,
                    borderWidth: 1,
                    borderColor: '#FFD60A',
                    borderRadius: 6,
                }]}
                onLayout={onBarLayout}
                pointerEvents="none"
            >
                <SkiaWaveLine
                    height={LINE_H}
                    barWShared={barW}
                    fillWShared={fillWidth}
                    emptyColor={defaultThemeColors.line.empty}
                    fillColor={color || defaultThemeColors.line.fill}
                    glowColor={color ? color + '44' : defaultThemeColors.line.glow}
                />
            </View>
        </View>
    );
};

const LINE_H = 12;

const createStyles = (themeColors: any, customColor?: string) => StyleSheet.create({
    container: { width: '100%', paddingHorizontal: 0, marginVertical: 10 },

    labelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
        alignItems: 'center',
    },
    label: {
        color: customColor || themeColors.label,
        fontSize: 12,
        fontWeight: Platform.select({
            android: undefined,
            ios: '900',
        }) as any,
        letterSpacing: 1,
    },
    value: {
        color: customColor || themeColors.value,
        fontSize: 12,
        fontWeight: Platform.select({
            android: undefined,
            ios: '900',
        }) as any,
        padding: 0,
        margin: 0,
        textAlign: 'right',
        minWidth: 56,
    },
    notificationText: {
        fontSize: 10,
        fontWeight: Platform.select({
            android: undefined,
            ios: '900',
        }) as any,
        letterSpacing: 0.5,
    },
    lineHost: {
        height: LINE_H,
        width: '100%',
    },
});

export default FuelBar;