import React, {memo} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native';
import {useTheme} from '../../theme';
import type {Task} from '../../types';

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function TaskItem({task, onToggle, onEdit, onDelete}: Props) {
  const {colors} = useTheme();

  const formattedDue = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const isOverdue =
    task.dueDate && !task.completed && new Date(task.dueDate) < new Date();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBg,
          borderColor: colors.border,
          opacity: task.completed ? 0.7 : 1,
        },
      ]}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => onToggle(task.id)}
        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
        <View
          style={[
            styles.checkCircle,
            {
              borderColor: task.completed ? colors.success : colors.border,
              backgroundColor: task.completed ? colors.success : 'transparent',
            },
          ]}>
          {task.completed && <Text style={styles.checkMark}>✓</Text>}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.content}
        onPress={() => onEdit(task.id)}
        activeOpacity={0.7}>
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
              textDecorationLine: task.completed ? 'line-through' : 'none',
            },
          ]}
          numberOfLines={2}>
          {task.title}
        </Text>
        {task.description ? (
          <Text
            style={[styles.description, {color: colors.textSecondary}]}
            numberOfLines={1}>
            {task.description}
          </Text>
        ) : null}
        {formattedDue && (
          <Text
            style={[
              styles.dueDate,
              {color: isOverdue ? colors.error : colors.textMuted},
            ]}>
            {isOverdue ? '⚠ ' : '📅 '}
            {formattedDue}
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.actions}>
        {task.syncStatus === 'pending' && (
          <Text style={[styles.syncBadge, {color: colors.warning}]}>●</Text>
        )}
        <TouchableOpacity
          onPress={() => onDelete(task.id)}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Text style={[styles.deleteBtn, {color: colors.error}]}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default memo(TaskItem);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  checkbox: {
    marginRight: 12,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    alignItems: 'center',
    marginLeft: 8,
    gap: 8,
  },
  syncBadge: {
    fontSize: 10,
  },
  deleteBtn: {
    fontSize: 16,
    fontWeight: '600',
  },
});
