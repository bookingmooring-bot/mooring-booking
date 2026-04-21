import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert, Platform, Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/authContext';

const COUNTRIES = [
  { label: 'Croatia', flag: '🇭🇷' }, { label: 'Greece', flag: '🇬🇷' },
  { label: 'Italy', flag: '🇮🇹' }, { label: 'Spain', flag: '🇪🇸' },
  { label: 'France', flag: '🇫🇷' }, { label: 'Montenegro', flag: '🇲🇪' },
  { label: 'Turkey', flag: '🇹🇷' }, { label: 'Slovenia', flag: '🇸🇮' },
  { label: 'Albania', flag: '🇦🇱' }, { label: 'Cyprus', flag: '🇨🇾' },
  { label: 'Hrvatska', flag: '🇭🇷' },
];

const WIND_OPTIONS = ['excellent', 'good', 'moderate', 'poor'];

const AMENITY_LIST = [
  { key: 'water', icon: '💧', label: 'Water' },
  { key: 'electricity', icon: '⚡', label: 'Electricity' },
  { key: 'wifi', icon: '📶', label: 'WiFi' },
  { key: 'toilet', icon: '🚻', label: 'Toilet' },
  { key: 'shower', icon: '🚿', label: 'Shower' },
  { key: 'fuel', icon: '⛽', label: 'Fuel' },
  { key: 'restaurant', icon: '🍽️', label: 'Restaurant' },
  { key: 'type_bova', icon: '🔴', label: 'Buoy' },
  { key: 'type_dok', icon: '🏗️', label: 'Dock' },
  { key: 'type_sidriste', icon: '⚓', label: 'Anchorage' },
  { key: 'type_vez_u_marini', icon: '🏠', label: 'Marina Berth' },
];

export default function AddMooringScreen() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('Croatia');
  const [countryFlag, setCountryFlag] = useState('🇭🇷');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [pricePerNight, setPricePerNight] = useState('');
  const [discountPercent, setDiscountPercent] = useState('0');
  const [maxBoatLength, setMaxBoatLength] = useState('');
  const [maxDraft, setMaxDraft] = useState('');
  const [mooringUnits, setMooringUnits] = useState('1');
  const [windProtection, setWindProtection] = useState('good');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isLastMinute, setIsLastMinute] = useState(false);
  const [isNow4Today, setIsNow4Today] = useState(false);
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');

  const toggleAmenity = (key: string) => {
    setSelectedAmenities(prev =>
      prev.includes(key) ? prev.filter(a => a !== key) : [...prev, key]
    );
  };

  const selectCountry = (c: { label: string; flag: string }) => {
    setCountry(c.label);
    setCountryFlag(c.flag);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return Alert.alert('Error', 'Please enter mooring name');
    if (!location.trim()) return Alert.alert('Error', 'Please enter location');
    if (!pricePerNight || parseFloat(pricePerNight) <= 0) return Alert.alert('Error', 'Please enter valid price');
    if (!lat || !lng) return Alert.alert('Error', 'Please enter coordinates (latitude & longitude)');

    setSaving(true);
    try {
      const { data, error } = await supabase.from('moorings').insert({
        owner_id: user?.id,
        name: name.trim(),
        location: location.trim(),
        country,
        country_flag: countryFlag,
        description: description.trim() || null,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        price_per_night: parseFloat(pricePerNight),
        discount_percent: parseInt(discountPercent) || 0,
        max_boat_length: maxBoatLength ? parseFloat(maxBoatLength) : null,
        max_draft: maxDraft ? parseFloat(maxDraft) : null,
        mooring_units: parseInt(mooringUnits) || 1,
        wind_protection: windProtection,
        amenities: selectedAmenities,
        is_last_minute: isLastMinute,
        is_now4today: isNow4Today,
        owner_name: ownerName.trim() || null,
        owner_phone: ownerPhone.trim() || null,
        status: 'pending',
      }).select().single();

      if (error) throw error;

      // Update user role to provider if not already
      await supabase.from('profiles').update({ role: 'provider' }).eq('id', user!.id);

      Alert.alert(
        '✅ Mooring Submitted!',
        `"${name}" has been submitted for review.\n\nIt will appear in the listing once approved by our team.`,
        [{ text: 'Go to Dashboard', onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create mooring');
    }
    setSaving(false);
  };

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>⚓ List Your Mooring</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Basic Info */}
        <Text style={s.secTitle}>📋 Basic Information</Text>

        <Text style={s.label}>Mooring Name *</Text>
        <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Golden Bay Marina" placeholderTextColor={COLORS.textDim} />

        <Text style={s.label}>Location / City *</Text>
        <TextInput style={s.input} value={location} onChangeText={setLocation} placeholder="Split" placeholderTextColor={COLORS.textDim} />

        <Text style={s.label}>Country *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }}>
          <View style={s.chipRow}>
            {COUNTRIES.map(c => (
              <TouchableOpacity key={c.label} style={[s.chip, country === c.label && s.chipActive]} onPress={() => selectCountry(c)} activeOpacity={0.85}>
                <Text style={s.chipFlag}>{c.flag}</Text>
                <Text style={[s.chipLabel, country === c.label && s.chipLabelActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={s.label}>Description</Text>
        <TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]} value={description} onChangeText={setDescription}
          placeholder="Premium mooring with stunning views..." placeholderTextColor={COLORS.textDim} multiline />

        {/* Coordinates */}
        <Text style={s.secTitle}>📍 Location Coordinates</Text>
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Latitude *</Text>
            <TextInput style={s.input} value={lat} onChangeText={setLat} placeholder="43.5081" placeholderTextColor={COLORS.textDim} keyboardType="decimal-pad" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Longitude *</Text>
            <TextInput style={s.input} value={lng} onChangeText={setLng} placeholder="16.4402" placeholderTextColor={COLORS.textDim} keyboardType="decimal-pad" />
          </View>
        </View>

        {/* Pricing */}
        <Text style={s.secTitle}>💰 Pricing</Text>
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Price per Night (€) *</Text>
            <TextInput style={s.input} value={pricePerNight} onChangeText={setPricePerNight} placeholder="100" placeholderTextColor={COLORS.textDim} keyboardType="decimal-pad" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Discount %</Text>
            <TextInput style={s.input} value={discountPercent} onChangeText={setDiscountPercent} placeholder="0" placeholderTextColor={COLORS.textDim} keyboardType="number-pad" />
          </View>
        </View>

        {/* Specs */}
        <Text style={s.secTitle}>📏 Specifications</Text>
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Max Length (m)</Text>
            <TextInput style={s.input} value={maxBoatLength} onChangeText={setMaxBoatLength} placeholder="20" placeholderTextColor={COLORS.textDim} keyboardType="decimal-pad" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Max Draft (m)</Text>
            <TextInput style={s.input} value={maxDraft} onChangeText={setMaxDraft} placeholder="3.5" placeholderTextColor={COLORS.textDim} keyboardType="decimal-pad" />
          </View>
        </View>
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Number of Berths</Text>
            <TextInput style={s.input} value={mooringUnits} onChangeText={setMooringUnits} placeholder="1" placeholderTextColor={COLORS.textDim} keyboardType="number-pad" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Wind Protection</Text>
            <View style={s.windRow}>
              {WIND_OPTIONS.map(w => (
                <TouchableOpacity key={w} style={[s.windChip, windProtection === w && s.windActive]} onPress={() => setWindProtection(w)} activeOpacity={0.85}>
                  <Text style={[s.windText, windProtection === w && s.windTextActive]}>{w.charAt(0).toUpperCase() + w.slice(1, 3)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Amenities */}
        <Text style={s.secTitle}>🛠️ Amenities & Type</Text>
        <View style={s.amenGrid}>
          {AMENITY_LIST.map(a => {
            const sel = selectedAmenities.includes(a.key);
            return (
              <TouchableOpacity key={a.key} style={[s.amenItem, sel && s.amenItemActive]} onPress={() => toggleAmenity(a.key)} activeOpacity={0.85}>
                <Text style={{ fontSize: 20 }}>{a.icon}</Text>
                <Text style={[s.amenLabel, sel && s.amenLabelActive]}>{a.label}</Text>
                {sel && <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} style={{ position: 'absolute', top: 4, right: 4 }} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Toggles */}
        <Text style={s.secTitle}>⚡ Special Features</Text>
        <View style={s.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={FONTS.body}>Last Minute Deal</Text>
            <Text style={FONTS.caption}>Show as discounted</Text>
          </View>
          <Switch value={isLastMinute} onValueChange={setIsLastMinute} trackColor={{ true: COLORS.primary, false: COLORS.cardBorder }} thumbColor={COLORS.text} />
        </View>
        <View style={s.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={FONTS.body}>Now4Today</Text>
            <Text style={FONTS.caption}>Available for same-day booking</Text>
          </View>
          <Switch value={isNow4Today} onValueChange={setIsNow4Today} trackColor={{ true: COLORS.green, false: COLORS.cardBorder }} thumbColor={COLORS.text} />
        </View>

        {/* Owner Contact */}
        <Text style={s.secTitle}>👤 Contact Information</Text>
        <Text style={s.label}>Your Name</Text>
        <TextInput style={s.input} value={ownerName} onChangeText={setOwnerName} placeholder="Alessandro Rossi" placeholderTextColor={COLORS.textDim} />
        <Text style={s.label}>Phone Number</Text>
        <TextInput style={s.input} value={ownerPhone} onChangeText={setOwnerPhone} placeholder="+385 91 234 5678" placeholderTextColor={COLORS.textDim} keyboardType="phone-pad" />

        {/* Submit */}
        <TouchableOpacity style={[s.submitBtn, saving && { opacity: 0.5 }]} onPress={handleSubmit} disabled={saving} activeOpacity={0.85}>
          {saving ? <ActivityIndicator color={COLORS.bg} /> : (
            <>
              <Ionicons name="add-circle" size={20} color={COLORS.bg} />
              <Text style={s.submitText}>Submit Mooring for Review</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={s.disclaimer}>
          Your mooring will be reviewed by our team before it appears in the marketplace. This usually takes 24-48 hours.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.card, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...FONTS.h2 },
  scroll: { padding: SPACING.md, paddingBottom: 100 },
  secTitle: { ...FONTS.h3, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  label: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: SPACING.xs },
  input: {
    backgroundColor: COLORS.bgSecondary, borderWidth: 1, borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.sm,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10, color: COLORS.text, fontSize: 15, marginBottom: 4,
  },
  row: { flexDirection: 'row', gap: SPACING.sm },
  chipRow: { flexDirection: 'row', gap: SPACING.xs },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.card, borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  chipActive: { backgroundColor: COLORS.primaryGlowStrong, borderColor: COLORS.primary },
  chipFlag: { fontSize: 14 },
  chipLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  chipLabelActive: { color: COLORS.primary, fontWeight: '700' },
  windRow: { flexDirection: 'row', gap: 4, marginTop: 6 },
  windChip: { backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.cardBorder },
  windActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryGlow },
  windText: { fontSize: 10, fontWeight: '600', color: COLORS.textMuted },
  windTextActive: { color: COLORS.primary },
  amenGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  amenItem: {
    width: '30%', alignItems: 'center', gap: 4, padding: SPACING.sm,
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.cardBorder, position: 'relative',
    flexGrow: 1, flexBasis: '28%',
  },
  amenItemActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryGlow },
  amenLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600', textAlign: 'center' },
  amenLabelActive: { color: COLORS.primary },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    padding: SPACING.md, marginBottom: SPACING.sm,
  },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    paddingVertical: 16, marginTop: SPACING.xl,
    ...SHADOWS.glow(COLORS.primary),
  },
  submitText: { color: COLORS.bg, fontWeight: '800', fontSize: 16 },
  disclaimer: { color: COLORS.textDim, fontSize: 11, textAlign: 'center', marginTop: SPACING.md, lineHeight: 16 },
});
