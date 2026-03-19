import { BlurView } from 'expo-blur';
import { Flame } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Easing,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import Svg, { Path, Circle as SvgCircle } from 'react-native-svg';
import { Canvas, Circle, BlurMask, Group } from '@shopify/react-native-skia';
import { CardExplosion } from './CardSpecialEffects/CardExplosion';
import { CardGlitch } from './CardSpecialEffects/CardGlitch';
import { CardRipple } from './CardSpecialEffects/CardRipple';
import { CardShieldPulse } from './CardSpecialEffects/CardShieldPulse';

// ---------------------------------------------------------------------------
// Constants & Types
// ---------------------------------------------------------------------------

export interface CardDef {
    id: string;
    name: string;
    description: string;
    fuelCost: number;
    rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
}

interface PlayingCardProps {
    card: CardDef;
    activeEffects: {
        ripple: boolean;
        glow: boolean;
        shimmer: boolean;
        explosion: boolean;
        glitch: boolean;
        shield: boolean;
        burn: boolean;
    };
    onPress?: () => void;
}

const MOCK_THEME = {
    game: {
        tokens: {
            palette: {
                RED: '#ef4444',
                BLUE: '#3b82f6',
                GREEN: '#10b981',
                YELLOW: '#f59e0b',
            }
        }
    },
    palette: {
        accent: '#6366f1',
    }
};

// ---------------------------------------------------------------------------
// Burn Particles
// ---------------------------------------------------------------------------

const BURN_PARTICLE_COUNT = 24;
const burnParticleConfigs = Array.from({ length: BURN_PARTICLE_COUNT }).map((_, i) => ({
    id: i,
    left: 5 + Math.random() * 90,
    size: 16 + Math.random() * 14,
    delay: Math.random() * 0.4,
    duration: 0.4 + Math.random() * 0.5,
    xShift: (Math.random() - 0.5) * 50,
    rotation: (Math.random() - 0.5) * 90,
}));

const BurnParticle = ({ config, progress }: { config: typeof burnParticleConfigs[0], progress: Animated.SharedValue<number> }) => {
    const style = useAnimatedStyle(() => {
        const p = progress.value;
        const lifeStart = config.delay;
        const lifeEnd = config.delay + config.duration;
        const localP = Math.max(0, Math.min(1, (p - lifeStart) / (lifeEnd - lifeStart)));

        if (p < lifeStart || p > lifeEnd) return { opacity: 0 };

        return {
            opacity: interpolate(localP, [0, 0.1, 0.7, 1], [0, 1, 1, 0]),
            transform: [
                { translateY: interpolate(localP, [0, 1], [20, -180]) },
                { translateX: interpolate(localP, [0, 1], [0, config.xShift]) },
                { scale: interpolate(localP, [0, 0.15, 1], [0.4, 1.3, 0.5]) },
                { rotate: `${config.rotation + (localP * 40)}deg` }
            ],
            position: 'absolute',
            left: `${config.left}%`,
            bottom: 0,
        };
    });

    return (
        <Animated.View style={style} pointerEvents="none">
            <Svg width={config.size} height={config.size} viewBox="0 0 24 24">
                <Path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" fill="#FF4500" opacity={0.8} />
                <Path d="M12 7q.5 2 2 3.5t1.5 3a.5.5 0 0 1-7 0 2.5 2.5 0 0 1 .5-1.5 0.5 0.5 0 0 0 2.5 0c0-1-.75-1.5-.75-2.5q0-1 1.25-2" fill="#FFD700" />
            </Svg>
        </Animated.View>
    );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export const PlayingCard: React.FC<PlayingCardProps> = ({ card, activeEffects, onPress }) => {
    // 3D Tilt Values (Subtle)
    const rotateX = useSharedValue(0);
    const rotateY = useSharedValue(0);
    
    // Animation Values
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.95);
    const glowOpacity = useSharedValue(0.4);
    const shimmerX = useSharedValue(-1);
    const burnProgress = useSharedValue(0);
    const [isBurning, setIsBurning] = useState(false);
    const [triggerId, setTriggerId] = useState(0);

    useEffect(() => {
        opacity.value = withTiming(1, { duration: 600 });
        scale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1)) });
    }, []);

    // Glow Effect Logic
    useEffect(() => {
        if (activeEffects.glow) {
            glowOpacity.value = withRepeat(
                withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
                -1,
                true
            );
        } else {
            glowOpacity.value = withTiming(0.4);
        }
    }, [activeEffects.glow]);

    // Shimmer Sweep Logic
    useEffect(() => {
        if (activeEffects.shimmer) {
            shimmerX.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 1000, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
                    withDelay(2000, withTiming(-1, { duration: 0 }))
                ),
                -1
            );
        } else {
            shimmerX.value = -1;
        }
    }, [activeEffects.shimmer]);

    const startBurn = () => {
        if (isBurning) return;
        setIsBurning(true);
        burnProgress.value = 0;
        burnProgress.value = withTiming(1, { duration: 1500, easing: Easing.bezier(0.4, 0, 0.2, 1) });
        opacity.value = withDelay(1000, withTiming(0, { duration: 500 }));
        scale.value = withTiming(0.4, { duration: 1500 });
        
        // Reset card after burn
        setTimeout(() => {
            setIsBurning(false);
            burnProgress.value = 0;
            opacity.value = withTiming(1, { duration: 500 });
            scale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1)) });
        }, 2200);
    };

    const handlePress = () => {
        if (activeEffects.burn) {
            startBurn();
        }
        setTriggerId(prev => prev + 1);
        onPress?.();
    };

    const tiltGesture = Gesture.Pan()
        .onUpdate((e) => {
            if (isBurning) return;
            // Subtle Unkind-style tilt (max 6 degrees)
            const x = (e.x - 110) / 110; 
            const y = (e.y - 160) / 160;
            rotateY.value = x * 6;
            rotateX.value = -y * 6;
        })
        .onEnd(() => {
            rotateX.value = withTiming(0, { duration: 500 });
            rotateY.value = withTiming(0, { duration: 500 });
        });

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { perspective: 1000 },
            { scale: scale.value },
            { rotateX: `${rotateX.value}deg` },
            { rotateY: `${rotateY.value}deg` },
        ],
    }));

    const shimmerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: interpolate(shimmerX.value, [-1, 1], [-250, 250]) }],
        opacity: interpolate(shimmerX.value, [-1, -0.8, 0.8, 1], [0, 1, 1, 0]),
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
        shadowOpacity: glowOpacity.value * 0.5,
    }));

    const getRarityColor = () => {
        if (card.rarity === 'LEGENDARY') return '#f59e0b';
        if (card.rarity === 'RARE') return '#6366f1';
        return '#94a3b8';
    };

    const rarityColor = getRarityColor();
    const effectiveTheme = { ...MOCK_THEME, palette: { accent: rarityColor } };

    return (
        <GestureDetector gesture={tiltGesture}>
            <View style={styles.outerContainer}>
                {/* Background Effects Layer (behind card) */}
                <View style={styles.effectLayer}>
                    {activeEffects.explosion && <CardExplosion theme={effectiveTheme} triggerId={`exp-${triggerId}`} isMenuMode />}
                    {activeEffects.ripple && <CardRipple theme={effectiveTheme} triggerId={`rip-${triggerId}`} isMenuMode />}
                    {activeEffects.shield && <CardShieldPulse theme={effectiveTheme} triggerId={`shd-${triggerId}`} isMenuMode />}
                </View>

                <Animated.View style={[styles.card, animatedStyle, { borderColor: rarityColor }, glowStyle]}>
                    {/* Background Layer */}
                    <View style={StyleSheet.absoluteFill}>
                        <BlurView tint="dark" intensity={40} style={StyleSheet.absoluteFill} />
                        <View style={[styles.glassTint, { backgroundColor: `${rarityColor}10` }]} />
                    </View>

                    {/* Shimmer Sweep Overlay */}
                    <Animated.View style={[styles.shimmer, shimmerStyle]} />

                    {/* Foreground Effects Layer */}
                    <View style={StyleSheet.absoluteFill} pointerEvents="none">
                        {activeEffects.glitch && <CardGlitch theme={effectiveTheme} triggerId={`gli-${triggerId}`} isMenuMode />}
                    </View>

                    {/* Content */}
                    <TouchableOpacity activeOpacity={0.95} onPress={handlePress} style={styles.content}>
                        <View style={styles.header}>
                            <Text style={styles.name} numberOfLines={2}>{card.name || 'Card Name'}</Text>
                            <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
                                <Text style={styles.rarityText}>{card.rarity[0]}</Text>
                            </View>
                        </View>

                        <Text style={styles.description}>{card.description || 'Add a description...'}</Text>

                        <View style={styles.footer}>
                            <View style={styles.fuelContainer}>
                                <Flame size={14} color={rarityColor} fill={rarityColor} />
                                <Text style={[styles.costText, { color: rarityColor }]}>{card.fuelCost}F</Text>
                            </View>
                            
                            <View style={[styles.categoryPill, { borderColor: `${rarityColor}40` }]}>
                                <Text style={[styles.categoryText, { color: rarityColor }]}>{card.rarity}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Burn Particles Overlay */}
                    {isBurning && (
                        <View style={StyleSheet.absoluteFill} pointerEvents="none">
                            {burnParticleConfigs.map((config) => (
                                <BurnParticle key={config.id} config={config} progress={burnProgress} />
                            ))}
                        </View>
                    )}

                    {/* Corner Accents */}
                    <View style={[styles.corner, styles.topLeft, { borderColor: rarityColor }]} />
                    <View style={[styles.corner, styles.topRight, { borderColor: rarityColor }]} />
                </Animated.View>
            </View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        width: 220,
        height: 320,
        justifyContent: 'center',
        alignItems: 'center',
    },
    effectLayer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -1,
    },
    card: {
        width: 220,
        height: 320,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        borderRadius: 24,
        borderWidth: 1.5,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowRadius: 20,
        elevation: 15,
    },
    glassTint: {
        ...StyleSheet.absoluteFillObject,
    },
    shimmer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 80,
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        transform: [{ skewX: '-25deg' }],
        zIndex: 5,
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 8,
    },
    name: {
        fontSize: 18,
        fontWeight: '900',
        color: '#f8fafc',
        flex: 1,
        letterSpacing: 0.5,
    },
    rarityBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOpacity: 0.5,
        shadowRadius: 5,
    },
    rarityText: {
        fontSize: 12,
        fontWeight: '900',
        color: '#fff',
    },
    description: {
        fontSize: 14,
        color: '#94a3b8',
        lineHeight: 20,
        marginTop: 12,
        flex: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        paddingTop: 12,
    },
    fuelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    costText: {
        fontSize: 16,
        fontWeight: '900',
    },
    categoryPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        borderWidth: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    categoryText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    corner: {
        position: 'absolute',
        width: 10,
        height: 10,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 3,
        borderLeftWidth: 3,
        borderTopLeftRadius: 24,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 3,
        borderRightWidth: 3,
        borderTopRightRadius: 24,
    },
});
