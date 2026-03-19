import { Canvas, LinearGradient, Path, Skia, vec } from '@shopify/react-native-skia';
import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming
} from 'react-native-reanimated';
import { CardSpecialEffectProps } from './types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_DIM = Math.max(SCREEN_WIDTH, SCREEN_HEIGHT);

interface ShardProps {
    color: string;
    delay: number;
    angle: number;
    magnitude: number;
    points: { x: number; y: number }[];
    fallSpeed: number;
    rotationSpeed: number;
    isMenuMode: boolean;
}

const Shard: React.FC<ShardProps> = ({ color, delay, angle, magnitude, points, fallSpeed, rotationSpeed, isMenuMode }) => {
    const progress = useSharedValue(0);

    const path = useMemo(() => {
        const p = Skia.Path.Make();
        if (points.length > 2) {
            p.moveTo(points[0].x, points[0].y);
            p.lineTo(points[1].x, points[1].y);
            p.lineTo(points[2].x, points[2].y);
            p.close();
        }
        return p;
    }, [points]);

    React.useEffect(() => {
        const duration = isMenuMode ? 1200 : 2100;
        progress.value = withDelay(
            delay,
            withTiming(1, {
                duration: duration - delay,
                easing: Easing.bezier(0.12, 0, 0.39, 0)
            })
        );
    }, [delay, isMenuMode, progress]);

    const animatedStyle = useAnimatedStyle(() => {
        const p = progress.value;
        if (p === 0) return { opacity: 0 };

        const rad = (angle * Math.PI) / 180;
        const travel = p * magnitude;
        const x = Math.cos(rad) * travel;
        const y = Math.sin(rad) * travel;
        const gravityProgress = Math.pow(Math.max(0, p - 0.12), 1.6);
        const fall = gravityProgress * 800 * fallSpeed;

        return {
            opacity: interpolate(p, [0, 0.05, 0.9, 1], [0, 1, 1, 0]),
            transform: [
                { translateX: x },
                { translateY: y + fall },
                { scale: interpolate(p, [0, 0.05, 1], [0, 1, 1.05]) },
                { rotate: `${p * rotationSpeed + angle}deg` },
            ],
        };
    });

    return (
        <Animated.View style={[styles.shardContainer, animatedStyle]}>
            <Canvas style={styles.canvas}>
                <Path path={path}>
                    <LinearGradient
                        start={vec(0, 0)}
                        end={vec(12, 12)}
                        colors={[color, color + 'BB', color]}
                    />
                </Path>
            </Canvas>
        </Animated.View>
    );
};

export const CardExplosion: React.FC<CardSpecialEffectProps> = ({ theme, triggerId, isMenuMode }) => {
    const shardColors = useMemo(() => [
        theme.game.tokens.palette.RED,
        theme.game.tokens.palette.BLUE,
        theme.game.tokens.palette.GREEN,
        theme.game.tokens.palette.YELLOW,
    ], [theme]);

    const shards = useMemo(() => {
        return Array.from({ length: 50 }).map((_, i) => {
            const h = 5 + Math.random() * 10;
            const w = 3 + Math.random() * 5;

            const points = [
                { x: 0, y: 0 },
                { x: -w / 2 - Math.random() * 4, y: h + Math.random() * 4 },
                { x: w / 2 + Math.random() * 4, y: h / 2 + Math.random() * 4 },
            ];

            return {
                id: `${triggerId}-${i}`,
                color: shardColors[i % 4],
                delay: 0,
                angle: Math.random() * 360,
                magnitude: (MAX_DIM * 0.5) + Math.random() * (MAX_DIM * 0.8),
                fallSpeed: 0.2 + Math.random() * 0.8,
                rotationSpeed: (Math.random() - 0.5) * 1200,
                points,
            };
        });
    }, [triggerId, shardColors]);

    return (
        <View style={styles.container}>
            {shards.map((s) => (
                <Shard key={s.id} {...s} isMenuMode={!!isMenuMode} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: 1,
        height: 1,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'visible',
    },
    shardContainer: {
        position: 'absolute',
        width: 1,
        height: 1,
        overflow: 'visible',
    },
    canvas: {
        width: 30,
        height: 30,
        marginLeft: -15,
        marginTop: -15,
    },
});
