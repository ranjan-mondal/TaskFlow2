import React, {useCallback, useEffect, useMemo} from 'react';
import {
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useDispatch, useSelector} from '../../../redux/store';
import {
  loadTasks,
  deleteTask,
  toggleTask,
  setFilter,
} from '../../../redux/tasks/tasksSlice';
import {signOut} from '../../../redux/auth/authSlice';
import {
  startNetworkListener,
  stopNetworkListener,
  checkNetworkAndSync,
} from '../../../utils/syncService';
import {useTheme} from '../../theme';
import TaskItem from '../../Assets/Component/TaskItem';
import EmptyState from '../../Assets/Component/EmptyState';
import LoadingSpinner from '../../Assets/Component/LoadingSpinner';
import type {AppStackParamList, Task, TaskFilter} from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'TaskList'>;
};

const FILTER_OPTIONS: TaskFilter[] = ['all', 'active', 'completed'];

export default function TaskListScreen({navigation}: Props) {
  const {colors, isDark, setThemeMode, themeMode} = useTheme();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const {tasks, filter, isLoading, isSyncing} = useSelector(
    state => state.tasks,
  );

  useEffect(() => {
    if (!user) {return;}
    dispatch(loadTasks(user.uid));
    checkNetworkAndSync(user.uid, dispatch);
    startNetworkListener(user.uid, dispatch);
    return () => stopNetworkListener();
  }, [user, dispatch]);

  const filteredTasks = useMemo(() => {
    switch (filter) {
      case 'active':
        return tasks.filter(t => !t.completed);
      case 'completed':
        return tasks.filter(t => t.completed);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteTask(id)),
        },
      ]);
    },
    [dispatch],
  );

  const handleToggle = useCallback(
    (id: string) => {
      dispatch(toggleTask(id));
    },
    [dispatch],
  );

  const handleEdit = useCallback(
    (id: string) => {
      navigation.navigate('AddEditTask', {taskId: id});
    },
    [navigation],
  );

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => dispatch(signOut()),
      },
    ]);
  };

  const renderItem = useCallback(
    ({item}: {item: Task}) => (
      <TaskItem
        task={item}
        onToggle={handleToggle}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ),
    [handleToggle, handleEdit, handleDelete],
  );

  const keyExtractor = useCallback((item: Task) => item.id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({length: 84, offset: 84 * index, index}),
    [],
  );

  return (
    <View style={[styles.root, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={colors.statusBar}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View style={[styles.header, {borderBottomColor: colors.divider}]}>
        <View>
          <Text style={[styles.appTitle, {color: colors.primary}]}>
            TaskFlow
          </Text>
          <Text style={[styles.userEmail, {color: colors.textMuted}]}>
            {user?.email}
          </Text>
        </View>
        <View style={styles.headerActions}>
          {isSyncing && (
            <Text style={[styles.syncIndicator, {color: colors.warning}]}>
              ↻ Syncing
            </Text>
          )}
          <TouchableOpacity
            onPress={() =>
              setThemeMode(
                themeMode === 'dark'
                  ? 'light'
                  : themeMode === 'light'
                  ? 'system'
                  : 'dark',
              )
            }
            style={styles.iconBtn}>
            <Text style={{fontSize: 20}}>{isDark ? '🌙' : '☀️'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSignOut} style={styles.iconBtn}>
            <Text style={[styles.signOutText, {color: colors.error}]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter tabs */}
      <View style={[styles.filterRow, {backgroundColor: colors.surface}]}>
        {FILTER_OPTIONS.map(f => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterTab,
              filter === f && {
                borderBottomColor: colors.primary,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => dispatch(setFilter(f))}>
            <Text
              style={[
                styles.filterLabel,
                {color: filter === f ? colors.primary : colors.textMuted},
              ]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Task count */}
      <View style={styles.countRow}>
        <Text style={[styles.countText, {color: colors.textSecondary}]}>
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          contentContainerStyle={
            filteredTasks.length === 0 ? styles.emptyContainer : styles.listContent
          }
          ListEmptyComponent={<EmptyState />}
          removeClippedSubviews
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={10}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, {backgroundColor: colors.primary}]}
        onPress={() => navigation.navigate('AddEditTask', undefined)}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  appTitle: {fontSize: 22, fontWeight: '700'},
  userEmail: {fontSize: 12, marginTop: 2},
  headerActions: {flexDirection: 'row', alignItems: 'center', gap: 8},
  syncIndicator: {fontSize: 12, fontWeight: '500'},
  iconBtn: {padding: 4},
  signOutText: {fontSize: 13, fontWeight: '500'},
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  filterTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  filterLabel: {fontSize: 14, fontWeight: '500'},
  countRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  countText: {fontSize: 12},
  listContent: {paddingBottom: 100},
  emptyContainer: {flex: 1},
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: {color: '#fff', fontSize: 28, lineHeight: 32},
});
