import React, {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import {useDispatch, useSelector} from '../../../redux/store';
import {addTask, updateTask} from '../../../redux/tasks/tasksSlice';
import {useTheme} from '../../theme';
import type {AppStackParamList} from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'AddEditTask'>;
  route: RouteProp<AppStackParamList, 'AddEditTask'>;
};

export default function AddEditTaskScreen({navigation, route}: Props) {
  const {colors} = useTheme();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const tasks = useSelector(state => state.tasks.tasks);

  const taskId = route.params?.taskId;
  const existingTask = useMemo(
    () => (taskId ? tasks.find(t => t.id === taskId) : undefined),
    [taskId, tasks],
  );

  const [title, setTitle] = useState(existingTask?.title ?? '');
  const [description, setDescription] = useState(
    existingTask?.description ?? '',
  );
  const [dueDate, setDueDate] = useState<Date | null>(
    existingTask?.dueDate ? new Date(existingTask.dueDate) : null,
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = Boolean(existingTask);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Task title is required.');
      return;
    }
    if (!user) {return;}

    setIsSaving(true);
    try {
      if (isEditing && existingTask) {
        await dispatch(
          updateTask({
            id: existingTask.id,
            title: title.trim(),
            description: description.trim(),
            dueDate: dueDate ? dueDate.toISOString() : null,
          }),
        );
      } else {
        await dispatch(
          addTask({
            userId: user.uid,
            title: title.trim(),
            description: description.trim(),
            dueDate: dueDate ? dueDate.toISOString() : null,
          }),
        );
      }
      navigation.goBack();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, {backgroundColor: colors.background}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar
        barStyle={colors.statusBar}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View style={[styles.header, {borderBottomColor: colors.divider}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, {color: colors.primary}]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: colors.text}]}>
          {isEditing ? 'Edit Task' : 'New Task'}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          style={[styles.saveBtn, {opacity: isSaving ? 0.6 : 1}]}>
          <Text style={[styles.saveText, {color: colors.primary}]}>
            {isSaving ? 'Saving…' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        {/* Title */}
        <Text style={[styles.label, {color: colors.textSecondary}]}>
          Title *
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBg,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Task title"
          placeholderTextColor={colors.placeholder}
          value={title}
          onChangeText={setTitle}
          autoFocus={!isEditing}
          returnKeyType="next"
        />

        {/* Description */}
        <Text style={[styles.label, {color: colors.textSecondary}]}>
          Description
        </Text>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            {
              backgroundColor: colors.inputBg,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Optional description…"
          placeholderTextColor={colors.placeholder}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Due Date */}
        <Text style={[styles.label, {color: colors.textSecondary}]}>
          Due Date
        </Text>
        <TouchableOpacity
          style={[
            styles.dateBtn,
            {
              backgroundColor: colors.inputBg,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setShowDatePicker(true)}>
          <Text
            style={[
              styles.dateBtnText,
              {color: dueDate ? colors.text : colors.placeholder},
            ]}>
            {dueDate
              ? dueDate.toLocaleDateString(undefined, {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'No due date'}
          </Text>
          <Text style={{color: colors.primary}}>📅</Text>
        </TouchableOpacity>

        {dueDate && (
          <TouchableOpacity
            onPress={() => setDueDate(null)}
            style={styles.clearDate}>
            <Text style={[styles.clearDateText, {color: colors.error}]}>
              Clear due date
            </Text>
          </TouchableOpacity>
        )}

        {showDatePicker && (
          <DateTimePicker
            value={dueDate ?? new Date()}
            mode="date"
            minimumDate={new Date()}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, selected) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selected) {setDueDate(selected);}
            }}
          />
        )}

        {/* Save button */}
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            {backgroundColor: colors.primary, opacity: isSaving ? 0.7 : 1},
          ]}
          onPress={handleSave}
          disabled={isSaving}>
          <Text style={styles.primaryBtnText}>
            {isSaving ? 'Saving…' : isEditing ? 'Update Task' : 'Add Task'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {padding: 4},
  backText: {fontSize: 15},
  headerTitle: {fontSize: 17, fontWeight: '600'},
  saveBtn: {padding: 4},
  saveText: {fontSize: 15, fontWeight: '600'},
  content: {padding: 16, gap: 8},
  label: {fontSize: 13, fontWeight: '500', marginTop: 12},
  input: {
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    marginTop: 4,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  dateBtn: {
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dateBtnText: {fontSize: 15},
  clearDate: {alignSelf: 'flex-end', marginTop: 4},
  clearDateText: {fontSize: 12},
  primaryBtn: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  primaryBtnText: {color: '#fff', fontSize: 16, fontWeight: '600'},
});
