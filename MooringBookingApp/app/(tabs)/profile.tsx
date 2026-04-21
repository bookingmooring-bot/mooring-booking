import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert, Platform, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/authContext';

interface Profile {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  preferred_language: string | null;
  role: string;
  subscription_tier: string;
  boat_name: string | null;
  boat_length: number | null;
  avatar_url: string | null;
  guest_rating: number | null;
  guest_rating_count: number | null;
  created_at: string | null;
}

interface FormState {
  full_name: string;
  phone: string;
  whatsapp: string;
  address: string;
  preferred_language: string;
  boat_name: string;
  boat_length: string;
}

const LANGUAGES = [
  { code: 'en', label: '🇬🇧 English' },
  { code: 'hr', label: '🇭🇷 Hrvatski' },
  { code: 'de', label: '🇩🇪 Deutsch' },
  { code: 'it', label: '🇮🇹 Italiano' },
  { code: 'fr', label: '🇫🇷 Français' },
  { code: 'es', label: '🇪🇸 Español' },
  { code: 'sl', label: '🇸🇮 Slovenščina' },
  { code: 'sr', label: '🇷🇸 Srpski' },
];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [form, setForm] = useState<FormState>({
    full_name: '', phone: '', whatsapp: '', address: '',
    preferred_language: 'en', boat_name: '', boat_length: '',
  });

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) {
      setProfile(data as Profile);
      setForm({
        full_name: data.full_name || '',
        phone: data.phone || '',
        whatsapp: data.whatsapp || '',
        address: data.address || '',
        preferred_language: data.preferred_language || 'en',
        boat_name: data.boat_name || '',
        boat_length: data.boat_length?.toString() || '',
      });
    }
  }, [user]);

  useEffect(() => { fetchProfile().finally(() => setLoading(false)); }, [fetchProfile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({
        full_name: form.full_name || null,
        phone: form.phone || null,
        whatsapp: form.whatsapp || null,
        address: form.address || null,
        preferred_language: form.preferred_language || 'en',
        boat_name: form.boat_name || null,
        boat_length: form.boat_length ? parseFloat(form.boat_length) : null,
      }).eq('id', user.id);
      if (error) throw error;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('✅ Saved', 'Profile updated successfully!');
      setEditMode(false);
      fetchProfile();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
    setSaving(false);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await signOut(); router.replace('/auth'); } },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Delete Account',
      'This will permanently delete your account and all data. This cannot be undone.\n\nAre you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete My Account', style: 'destructive', onPress: () => {
            Alert.alert('Contact Support', 'Please email support@mooringbooking.com to request account deletion.');
          }
        },
      ]
    );
  };

  if (loading) return <SafeAreaView style={s.container}><ActivityIndicator color={COLORS.primary} size="large" style={{ flex: 1 }} /></SafeAreaView>;

  const initial = profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?';
  const roleBadge = profile?.role?.toUpperCase() || 'SAILOR';
  const tierBadge = profile?.subscription_tier?.toUpperCase() || 'BASIC';
  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '';
  const langLabel = LANGUAGES.find(l => l.code === form.preferred_language)?.label || '🇬🇧 English';

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Profile Header ── */}
        <View style={s.headerCard}>
          <View style={s.brandLogoWrap}>
            <Image source={require('../../assets/logo.jpg')} style={s.brandLogo} resizeMode="cover" />
          </View>

          <View style={s.avatarCircle}>
            <Text style={s.avatarText}>{initial}</Text>
          </View>
          <Text style={s.userName}>{profile?.full_name || 'Set your name'}</Text>
          <Text style={s.userEmail}>{user?.email}</Text>

          <View style={s.badgeRow}>
            <View style={[s.badge, { backgroundColor: COLORS.primaryGlow }]}>
              <Ionicons name="boat-outline" size={11} color={COLORS.primary} />
              <Text style={[s.badgeText, { color: COLORS.primary }]}>{roleBadge}</Text>
            </View>
            <View style={[s.badge, { backgroundColor: COLORS.goldGlow }]}>
              <Ionicons name="diamond-outline" size={11} color={COLORS.gold} />
              <Text style={[s.badgeText, { color: COLORS.gold }]}>{tierBadge}</Text>
            </View>
          </View>

          {/* Stats row */}
          <View style={s.statsRow}>
            {profile?.guest_rating && Number(profile.guest_rating) > 0 ? (
              <View style={s.statItem}>
                <Text style={s.statVal}>⭐ {Number(profile.guest_rating).toFixed(1)}</Text>
                <Text style={s.statLabel}>Rating ({profile.guest_rating_count || 0})</Text>
              </View>
            ) : null}
            {memberSince ? (
              <View style={s.statItem}>
                <Text style={s.statVal}>📅 {memberSince}</Text>
                <Text style={s.statLabel}>Member Since</Text>
              </View>
            ) : null}
          </View>

          {/* Edit / Cancel toggle */}
          {!editMode ? (
            <TouchableOpacity
              style={s.editToggleBtn}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setEditMode(true); }}
              activeOpacity={0.85}
            >
              <Ionicons name="create-outline" size={16} color={COLORS.primary} />
              <Text style={s.editToggleText}>Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[s.editToggleBtn, { borderColor: COLORS.textDim }]}
              onPress={() => { setEditMode(false); fetchProfile(); }}
              activeOpacity={0.85}
            >
              <Ionicons name="close-outline" size={16} color={COLORS.textMuted} />
              <Text style={[s.editToggleText, { color: COLORS.textMuted }]}>Cancel Editing</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Personal Information ── */}
        <View style={s.sectionCard}>
          <View style={s.sectionHeader}>
            <Ionicons name="person-circle-outline" size={20} color={COLORS.primary} />
            <Text style={s.sectionTitle}>Personal Information</Text>
          </View>

          <Field
            icon="person-outline" label="Full Name" value={form.full_name}
            editable={editMode} placeholder="John Doe"
            onChange={v => setForm({ ...form, full_name: v })}
          />
          <Field
            icon="mail-outline" label="Email" value={user?.email || ''}
            editable={false} placeholder="" onChange={() => {}}
            hint="Email cannot be changed"
          />
          <Field
            icon="call-outline" label="Phone" value={form.phone}
            editable={editMode} placeholder="+385 91 234 5678"
            onChange={v => setForm({ ...form, phone: v })}
            keyboardType="phone-pad"
          />
          <Field
            icon="logo-whatsapp" label="WhatsApp" value={form.whatsapp}
            editable={editMode} placeholder="+385 91 234 5678"
            onChange={v => setForm({ ...form, whatsapp: v })}
            keyboardType="phone-pad"
          />
          <Field
            icon="location-outline" label="Address" value={form.address}
            editable={editMode} placeholder="Marina Village 12, Split, Croatia"
            onChange={v => setForm({ ...form, address: v })}
          />

          {/* Language Picker */}
          <View style={s.fieldRow}>
            <View style={s.fieldIconWrap}>
              <Ionicons name="language-outline" size={16} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>Preferred Language</Text>
              {editMode ? (
                <TouchableOpacity
                  style={s.langPickerBtn}
                  onPress={() => setShowLangPicker(!showLangPicker)}
                  activeOpacity={0.85}
                >
                  <Text style={s.langPickerText}>{langLabel}</Text>
                  <Ionicons name={showLangPicker ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              ) : (
                <Text style={s.fieldValue}>{langLabel}</Text>
              )}
            </View>
          </View>

          {showLangPicker && editMode && (
            <View style={s.langGrid}>
              {LANGUAGES.map(lang => (
                <TouchableOpacity
                  key={lang.code}
                  style={[s.langOption, form.preferred_language === lang.code && s.langOptionActive]}
                  onPress={() => { setForm({ ...form, preferred_language: lang.code }); setShowLangPicker(false); }}
                  activeOpacity={0.85}
                >
                  <Text style={[
                    s.langOptionText,
                    form.preferred_language === lang.code && { color: COLORS.primary, fontWeight: '700' }
                  ]}>{lang.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ── Boat Information ── */}
        <View style={s.sectionCard}>
          <View style={s.sectionHeader}>
            <Ionicons name="boat-outline" size={20} color={COLORS.primary} />
            <Text style={s.sectionTitle}>Boat Information</Text>
          </View>

          <Field
            icon="flag-outline" label="Boat Name" value={form.boat_name}
            editable={editMode} placeholder="Sea Breeze"
            onChange={v => setForm({ ...form, boat_name: v })}
          />
          <Field
            icon="resize-outline" label="Boat Length (m)" value={form.boat_length}
            editable={editMode} placeholder="12.5"
            onChange={v => setForm({ ...form, boat_length: v })}
            keyboardType="decimal-pad"
          />
        </View>

        {/* ── Save Button ── */}
        {editMode && (
          <TouchableOpacity
            style={[s.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave} disabled={saving} activeOpacity={0.85}
          >
            {saving ? <ActivityIndicator color={COLORS.bg} /> : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.bg} />
                <Text style={s.saveBtnText}>Save All Changes</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* ── Quick Links ── */}
        <View style={s.sectionCard}>
          <View style={s.sectionHeader}>
            <Ionicons name="rocket-outline" size={20} color={COLORS.primary} />
            <Text style={s.sectionTitle}>Growth & Navigation</Text>
          </View>

          {profile?.role !== 'provider' && (
            <LinkItem icon="storefront-outline" label="Become a Provider"
              color={COLORS.primary} onPress={() => router.push('/become-provider')} accent />
          )}
          {profile?.role === 'provider' && profile?.subscription_tier !== 'premium' && (
            <LinkItem icon="star-outline" label="Upgrade to PRO Host"
              color={COLORS.gold} onPress={() => router.push('/pricing')} accent />
          )}
          <LinkItem icon="notifications-outline" label="Notifications & Alerts"
            onPress={() => router.push('/(tabs)/notifications')} />
          {profile?.role === 'provider' && (
            <LinkItem icon="bar-chart-outline" label="Provider Dashboard"
              onPress={() => router.push('/(tabs)/dashboard')} />
          )}
          <LinkItem icon="book-outline" label="Sailing Handbook & Guide"
            onPress={() => router.push('/handbook')} />
        </View>

        {/* ── Legal ── */}
        <View style={s.sectionCard}>
          <View style={s.sectionHeader}>
            <Ionicons name="document-text-outline" size={20} color={COLORS.textMuted} />
            <Text style={s.sectionTitle}>Legal</Text>
          </View>
          <LinkItem icon="shield-checkmark-outline" label="Terms of Service"
            onPress={() => router.push('/legal/terms')} />
          <LinkItem icon="lock-closed-outline" label="Privacy Policy"
            onPress={() => router.push('/legal/privacy')} />
          <LinkItem icon="chatbubble-ellipses-outline" label="Contact Support"
            onPress={() => Alert.alert('Contact', 'support@mooringbooking.com')} />
        </View>

        {/* ── Sign Out & Danger Zone ── */}
        <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={18} color={COLORS.red} />
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.deleteBtn} onPress={handleDeleteAccount} activeOpacity={0.85}>
          <Ionicons name="trash-outline" size={16} color={COLORS.textDim} />
          <Text style={s.deleteText}>Delete Account</Text>
        </TouchableOpacity>

        <Text style={s.version}>Mooring Booking v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── Reusable Field Component ── */
function Field({ icon, label, value, editable, placeholder, onChange, keyboardType, hint }: {
  icon: string; label: string; value: string; editable: boolean;
  placeholder: string; onChange: (v: string) => void;
  keyboardType?: 'default' | 'phone-pad' | 'decimal-pad' | 'email-address';
  hint?: string;
}) {
  return (
    <View style={s.fieldRow}>
      <View style={s.fieldIconWrap}>
        <Ionicons name={icon as any} size={16} color={COLORS.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.fieldLabel}>{label}</Text>
        {editable ? (
          <TextInput
            style={s.fieldInput}
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textDim}
            keyboardType={keyboardType || 'default'}
            autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
          />
        ) : (
          <View>
            <Text style={s.fieldValue}>{value || '—'}</Text>
            {hint && <Text style={s.fieldHint}>{hint}</Text>}
          </View>
        )}
      </View>
    </View>
  );
}

/* ── Reusable LinkItem ── */
function LinkItem({ icon, label, onPress, color, accent }: {
  icon: string; label: string; onPress: () => void;
  color?: string; accent?: boolean;
}) {
  const c = color || COLORS.textSecondary;
  return (
    <TouchableOpacity
      style={[s.linkItem, accent && { backgroundColor: (color || COLORS.primary) + '12', borderColor: (color || COLORS.primary) + '30' }]}
      onPress={onPress} activeOpacity={0.85}
    >
      <Ionicons name={icon as any} size={16} color={accent ? c : COLORS.textDim} style={{ marginRight: 10 }} />
      <Text style={[s.linkText, accent && { color: c, fontWeight: '700' }]} numberOfLines={1}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={accent ? c : COLORS.textDim} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.md, paddingBottom: 120 },

  // Header card
  headerCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    padding: SPACING.lg, alignItems: 'center',
    marginBottom: SPACING.md, ...SHADOWS.md,
  },
  brandLogoWrap: {
    width: 70, height: 70, borderRadius: 14, overflow: 'hidden',
    marginBottom: SPACING.md, ...SHADOWS.glow(COLORS.primary),
  },
  brandLogo: { width: '100%', height: '100%' },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm,
    ...SHADOWS.glow(COLORS.primary),
  },
  avatarText: { color: COLORS.bg, fontSize: 28, fontWeight: '900' },
  userName: { ...FONTS.h1, marginBottom: 2 },
  userEmail: { ...FONTS.caption, marginBottom: SPACING.sm },
  badgeRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full,
  },
  badgeText: { fontSize: 10, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: SPACING.lg, marginTop: SPACING.sm, marginBottom: SPACING.sm },
  statItem: { alignItems: 'center' },
  statVal: { color: COLORS.text, fontWeight: '700', fontSize: 14 },
  statLabel: { color: COLORS.textMuted, fontSize: 10, marginTop: 2 },
  editToggleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: COLORS.primary + '50',
    marginTop: SPACING.xs,
  },
  editToggleText: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },

  // Section cards
  sectionCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    padding: SPACING.md, marginBottom: SPACING.md, ...SHADOWS.sm,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.md },
  sectionTitle: { ...FONTS.h3 },

  // Fields
  fieldRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder + '60',
  },
  fieldIconWrap: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: COLORS.primaryGlow,
    justifyContent: 'center', alignItems: 'center', marginTop: 2,
  },
  fieldLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600', marginBottom: 2 },
  fieldValue: { color: COLORS.text, fontSize: 15, fontWeight: '500' },
  fieldHint: { color: COLORS.textDim, fontSize: 10, marginTop: 2, fontStyle: 'italic' },
  fieldInput: {
    backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: COLORS.primary + '30',
    paddingHorizontal: SPACING.sm,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    color: COLORS.text, fontSize: 15, marginTop: 2,
  },

  // Language picker
  langPickerBtn: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: COLORS.primary + '30',
    paddingHorizontal: SPACING.sm, paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    marginTop: 2,
  },
  langPickerText: { color: COLORS.text, fontSize: 15 },
  langGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs,
    paddingVertical: SPACING.sm, paddingLeft: 40,
  },
  langOption: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgSecondary, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  langOptionActive: {
    backgroundColor: COLORS.primaryGlow, borderColor: COLORS.primary + '50',
  },
  langOptionText: { color: COLORS.textSecondary, fontSize: 13 },

  // Save
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: 16,
    marginBottom: SPACING.md, ...SHADOWS.glow(COLORS.primary),
  },
  saveBtnText: { color: COLORS.bg, fontWeight: '800', fontSize: 16 },

  // Links
  linkItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder + '60',
    borderRadius: RADIUS.sm, paddingHorizontal: 4, marginBottom: 2,
  },
  linkText: { color: COLORS.textSecondary, fontSize: 14, flex: 1 },

  // Sign Out / Delete
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.redGlow, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.red + '30',
    paddingVertical: 14, marginTop: SPACING.sm,
  },
  signOutText: { color: COLORS.red, fontWeight: '700', fontSize: 15 },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, marginTop: SPACING.sm,
  },
  deleteText: { color: COLORS.textDim, fontSize: 13 },
  version: { ...FONTS.tiny, textAlign: 'center', marginTop: SPACING.md },
});
