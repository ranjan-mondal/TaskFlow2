import React, {useEffect} from 'react';
import {Provider} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {store} from './redux/store';
import {ThemeProvider} from './src/theme';
import Navigation from './src/navigation';
import {setupNotifications} from './utils/notifications';

function AppContent() {
  useEffect(() => {
    setupNotifications();
  }, []);

  return <Navigation />;
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </ThemeProvider>
    </Provider>
  );
}
