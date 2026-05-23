import React, {useState} from 'react';
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
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useDispatch, useSelector} from '../../../redux/store';
import {signIn, clearError} from '../../../redux/auth/authSlice';
import {useTheme} from '../../theme';
import type {AuthStackParamList} from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export default function LoginScreen({navigation}: Props) {
  const {colors} = useTheme();
  const dispatch = useDispatch();
  const {isLoading, error} = useSelector(state => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation', 'Please enter email and password.');
      return;
    }
    dispatch(clearError());
    dispatch(signIn({email: email.trim(), password}));
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, {backgroundColor: colors.background}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={[styles.logo, {color: colors.primary}]}>✅</Text>
          <Text style={[styles.title, {color: colors.text}]}>TaskFlow</Text>
          <Text style={[styles.subtitle, {color: colors.textMuted}]}>
            Sign in to your account
          </Text>
        </View>

        {error ? (
          <View style={[styles.errorBox, {backgroundColor: colors.errorBg}]}>
            <Text style={[styles.errorText, {color: colors.error}]}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <Text style={[styles.label, {color: colors.textSecondary}]}>Email</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBg,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="you@example.com"
            placeholderTextColor={colors.placeholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={[styles.label, {color: colors.textSecondary}]}>
            Password
          </Text>
          <View>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBg,
                  color: colors.text,
                  borderColor: colors.border,
                  paddingRight: 48,
                },
              ]}
              placeholder="••••••••"
              placeholderTextColor={colors.placeholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword(v => !v)}>
              <Text style={{color: colors.textMuted}}>
                {showPassword ? '🙈' : '👁'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.primaryBtn,
              {backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1},
            ]}
            onPress={handleLogin}
            disabled={isLoading}>
            <Text style={styles.primaryBtnText}>
              {isLoading ? 'Signing in…' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, {color: colors.textMuted}]}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={[styles.linkText, {color: colors.primary}]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
  container: {flexGrow: 1, justifyContent: 'center', padding: 24},
  header: {alignItems: 'center', marginBottom: 36},
  logo: {fontSize: 56, marginBottom: 8},
  title: {fontSize: 28, fontWeight: '700', marginBottom: 4},
  subtitle: {fontSize: 15},
  errorBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {fontSize: 13, textAlign: 'center'},
  form: {gap: 8},
  label: {fontSize: 13, fontWeight: '500', marginTop: 8},
  input: {
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    marginTop: 4,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 17,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  footerText: {fontSize: 14},
  linkText: {fontSize: 14, fontWeight: '600'},
});
