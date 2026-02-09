import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { COLORS } from '../constants/colors';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, ...props }) => {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[styles.input, error ? styles.inputError : null, style]}
                placeholderTextColor={COLORS.gray}
                {...props}
            />
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: COLORS.black,
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        height: 48,
        backgroundColor: COLORS.inputBackground,
        borderRadius: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        fontSize: 16,
        color: COLORS.black,
    },
    inputError: {
        borderColor: COLORS.danger,
    },
    error: {
        fontSize: 12,
        color: COLORS.danger,
        marginTop: 4,
    },
});
