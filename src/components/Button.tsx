import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { COLORS } from '../constants/colors';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({ title, loading, variant = 'primary', style, ...props }) => {
    const getBackgroundColor = () => {
        if (props.disabled) return COLORS.gray;
        switch (variant) {
            case 'secondary': return COLORS.secondary;
            case 'outline': return 'transparent';
            default: return COLORS.primary;
        }
    };

    const getTextColor = () => {
        if (variant === 'outline') return COLORS.primary;
        return COLORS.white;
    };

    return (
        <TouchableOpacity
            style={[
                styles.container,
                { backgroundColor: getBackgroundColor() },
                variant === 'outline' && styles.outlineButton,
                style,
            ]}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    outlineButton: {
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
    },
});
