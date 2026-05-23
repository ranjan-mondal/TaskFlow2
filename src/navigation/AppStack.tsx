import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {AppStackParamList} from '../types';

const TaskListScreen = React.lazy(
  () => import('../screen/tasks/TaskListScreen'),
);
const AddEditTaskScreen = React.lazy(
  () => import('../screen/tasks/AddEditTaskScreen'),
);

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="TaskList" component={TaskListScreen as any} />
      <Stack.Screen name="AddEditTask" component={AddEditTaskScreen as any} />
    </Stack.Navigator>
  );
}
