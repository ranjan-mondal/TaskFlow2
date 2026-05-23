import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../../theme';

interface Props {
  title?: string;
  message?: string;
}

export default function EmptyState({
  title = 'No tasks yet',
  message = 'Tap the + button to add your first task.',
}: Props) {
  const {colors} = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.emoji]}>📋</Text>
      <Text style={[styles.title, {color: colors.text}]}>{title}</Text>
      <Text style={[styles.message, {color: colors.textMuted}]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
