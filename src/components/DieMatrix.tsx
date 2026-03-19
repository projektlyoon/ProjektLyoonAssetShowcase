import {
    BlurMask,
    Canvas,
    Circle,
    Group,
    Path,
    Skia,
} from '@shopify/react-native-skia';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Easing, useDerivedValue, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

// ---------------------------------------------------------------------------
// Matrix Data
// ---------------------------------------------------------------------------

const DIGIT_DOTS_5X5: Record<number, number[]> = {
    1: [2, 7, 12, 17, 22],
    2: [1, 2, 3, 9, 11, 12, 13, 15, 21, 22, 23],
    3: [1, 2, 3, 9, 12, 13, 19, 21, 22, 23],
    4: [1, 3, 6, 8, 11, 12, 13, 18, 23],
    5: [1, 2, 3, 6, 11, 12, 13, 19, 21, 22, 23],
    6: [1, 2, 3, 6, 11, 12, 13, 16, 18, 21, 22, 23],
};

const getDigitCells7x7 = (digit: number): Set<string> => {
    const cells = new Set<string>();
    const dots = DIGIT_DOTS_5X5[digit] ?? [];
    for (const idx of dots) {
        const r5 = Math.floor(idx / 5);
        const c5 = idx % 5;
        cells.add(`${c5 + 1},${r5 + 1}`);
    }
    return cells;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const DieMatrix: React.FC<{
    value: number;
    rolling: boolean;
    size?: number;
    dotColor?: string;
    highlighted?: boolean;
    highlightColor?: string;
}> = ({
    value,
    rolling,
    size = 150,
    dotColor = '#10b981',
    highlighted = false,
    highlightColor = '#10b981',
}) => {
    const [displayValue, setDisplayValue] = useState(Math.max(1, Math.min(6, value)));
    const [phase, setPhase] = useState<'idle' | 'rolling'>('idle');
    const prevRollingRef = useRef(false);

    const canvasSize = size;
    const dieSize = size * 0.7;

    useEffect(() => {
        const clampedValue = Math.max(1, Math.min(6, value));

        if (rolling) {
            setPhase('rolling');
            const scramble = setInterval(() => setDisplayValue(1 + Math.floor(Math.random() * 6)), 45);
            prevRollingRef.current = true;
            return () => clearInterval(scramble);
        }

        setDisplayValue(clampedValue);
        setPhase('idle');
        prevRollingRef.current = false;
    }, [rolling, value]);

    const activeSet = useMemo(() => getDigitCells7x7(displayValue), [displayValue]);
    const matrixStart = (canvasSize - dieSize) / 2;
    const cell = dieSize / 7;
    const dotRadius = Math.max(1.6, cell * 0.34);

    return (
        <Canvas style={{ width: canvasSize, height: canvasSize }}>
            {Array.from({ length: 49 }).map((_, i) => {
                const row = Math.floor(i / 7);
                const col = i % 7;
                const x = matrixStart + (col + 0.5) * cell;
                const y = matrixStart + (row + 0.5) * cell;
                const inDigit = activeSet.has(`${col},${row}`);
                const sparkle = ((row * 7 + col + displayValue) % 5) === 0;
                
                let opacity = 0.14;
                if (phase === 'rolling') opacity = (inDigit || sparkle) ? 0.95 : 0.1;
                else opacity = inDigit ? 1 : 0.14;

                return (
                    <Circle key={i} cx={x} cy={y} r={dotRadius} color={dotColor} opacity={opacity} />
                );
            })}
        </Canvas>
    );
};
