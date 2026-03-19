import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

const GLYPHS: Record<string, string[]> = {
    ' ': ['000', '000', '000', '000', '000'],
    '?': ['11110', '00001', '00110', '00000', '00100'],
    '!': ['00100', '00100', '00100', '00000', '00100'],
    '.': ['00000', '00000', '00000', '00000', '00100'],
    ':': ['00000', '00100', '00000', '00100', '00000'],
    '0': ['01110', '10011', '10101', '11001', '01110'],
    '1': ['00100', '01100', '00100', '00100', '01110'],
    '2': ['01110', '10001', '00110', '01000', '11111'],
    '3': ['11111', '00010', '00110', '00010', '11111'],
    '4': ['10001', '10001', '11111', '00001', '00001'],
    '5': ['11111', '10000', '11110', '00001', '11110'],
    '6': ['01111', '10000', '11110', '10001', '01111'],
    '7': ['11111', '00001', '00010', '00100', '01000'],
    '8': ['01110', '10001', '01110', '10001', '01110'],
    '9': ['01110', '10001', '01111', '00001', '11110'],
    A: ['01110', '10001', '11111', '10001', '10001'],
    B: ['11110', '10001', '11110', '10001', '11110'],
    C: ['01111', '10000', '10000', '10000', '01111'],
    D: ['11110', '10001', '10001', '10001', '11110'],
    E: ['11111', '10000', '11110', '10000', '11111'],
    F: ['11111', '10000', '11110', '10000', '10000'],
    G: ['01111', '10000', '10011', '10001', '01111'],
    H: ['10001', '10001', '11111', '10001', '10001'],
    I: ['11111', '00100', '00100', '00100', '11111'],
    J: ['00111', '00010', '00010', '10010', '01100'],
    K: ['10001', '10010', '11100', '10010', '10001'],
    L: ['10000', '10000', '10000', '10000', '11111'],
    M: ['10001', '11011', '10101', '10001', '10001'],
    N: ['10001', '11001', '10101', '10011', '10001'],
    O: ['01110', '10001', '10001', '10001', '01110'],
    P: ['11110', '10001', '11110', '10000', '10000'],
    Q: ['01110', '10001', '10101', '10011', '01111'],
    R: ['11110', '10001', '11110', '10010', '10001'],
    S: ['01111', '10000', '01110', '00001', '11110'],
    T: ['11111', '00100', '00100', '00100', '00100'],
    U: ['10001', '10001', '10001', '10001', '01110'],
    V: ['10001', '10001', '10001', '01010', '00100'],
    W: ['10001', '10001', '10101', '11011', '10001'],
    X: ['10001', '01010', '00100', '01010', '10001'],
    Y: ['10001', '01010', '00100', '00100', '00100'],
    Z: ['11111', '00010', '00100', '01000', '11111'],
};

export type DotMatrixTextProps = {
    text: string;
    color: string;
    accentColor?: string;
    accentChars?: string[];
    dotSize?: number;
    dotGap?: number;
    charGap?: number;
    inactiveOpacity?: number;
    style?: StyleProp<ViewStyle>;
};

export const DotMatrixText: React.FC<DotMatrixTextProps> = ({
    text,
    color,
    accentColor,
    accentChars,
    dotSize = 2,
    dotGap = 1,
    charGap = 4,
    inactiveOpacity = 0.13,
    style,
}) => {
    const accentSet = new Set((accentChars ?? []).map((char) => char.toUpperCase()));

    return (
        <View accessible={false} style={[{ flexDirection: 'row', alignItems: 'center', gap: charGap, flexWrap: 'wrap' }, style]}>
            {text.toUpperCase().split('').map((char, index) => {
                const glyph = GLYPHS[char] ?? GLYPHS['?'];
                const cellColor = accentSet.has(char) && accentColor ? accentColor : color;
                return (
                    <View key={`${char}-${index}`} style={{ gap: dotGap }}>
                        {glyph.map((row, rowIndex) => (
                            <View key={`${char}-${index}-row-${rowIndex}`} style={{ flexDirection: 'row', gap: dotGap }}>
                                {row.split('').map((cell, cellIndex) => (
                                    <View
                                        key={`${char}-${index}-${rowIndex}-${cellIndex}`}
                                        style={{
                                            width: dotSize,
                                            height: dotSize,
                                            borderRadius: dotSize / 2,
                                            backgroundColor: cellColor,
                                            opacity: cell === '1' ? 1 : inactiveOpacity,
                                        }}
                                    />
                                ))}
                            </View>
                        ))}
                    </View>
                );
            })}
        </View>
    );
};
