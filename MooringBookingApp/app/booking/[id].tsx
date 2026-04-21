import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, ActivityIndicator, Image,
  Alert, Platform, Modal, Animated,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/authContext';

interface BookingDetail {
  id: string;
  mooring_id: string;
  user_id: string;
  provider_id: string;
  check_in: string;
  check_out: string;
  boat_name: string | null;
  boat_length: number | null;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  nights: number;
  price_per_night: number;
  total_price: number;
  commission_amount: number;
  booking_status: string;
  payment_status: string;
  payment_method: string;
  confirmation_code: string;
  is_now4today: boolean;
  created_at: string;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  moorings?: {
    id: string;
    name: string;
    location: string;
    country: string;
    country_flag: string;
    image_urls?: string[];
    price_per_night: number;
  };
}

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&q=80';

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  pending:   { color: COLORS.yellow, bg: COLORS.yellowGlow, icon: 'time-outline',            label: 'Pending' },
  confirmed: { color: COLORS.green,  bg: COLORS.greenGlow,  icon: 'checkmark-circle-outline', label: 'Confirmed' },
  completed: { color: COLORS.blue,   bg: COLORS.blueGlow,   icon: 'flag-outline',             label: 'Completed' },
  cancelled: { color: COLORS.red,    bg: COLORS.redGlow,    icon: 'close-circle-outline',     label: 'Cancelled' },
};

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editMode, setEditMode] = useState(false);
  const [editCheckIn, setEditCheckIn] = useState<Date | null>(null);
  const [editCheckOut, setEditCheckOut] = useState<Date | null>(null);
  const [editBoatName, setEditBoatName] = useState('');
  const [editBoatLength, setEditBoatLength] = useState('');
  const [editGuestPhone, setEditGuestPhone] = useState('');
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  // Cancel modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const fetchBooking = useCallback(async () => {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, moorings (id, name, location, country, country_flag, image_urls, price_per_night)')
        .eq('id', id)
        .single();
      if (error) throw error;
      setBooking(data as BookingDetail);
    } catch (err) {
      console.error('Failed to fetch booking:', err);
    }
  }, [id]);

  useEffect(() => {
    fetchBooking().finally(() => setLoading(false));
  }, [fetchBooking]);

  // Populate edit fields when entering edit mode
  const enterEditMode = () => {
    if (!booking) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditCheckIn(new Date(booking.check_in + 'T00:00:00'));
    setEditCheckOut(new Date(booking.check_out + 'T00:00:00'));
    setEditBoatName(booking.boat_name || '');
    setEditBoatLength(booking.boat_length?.toString() || '');
    setEditGuestPhone(booking.guest_phone || '');
    setEditMode(true);
  };

  const cancelEditMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditMode(false);
  };

  const formatDate = (d: string | Date) => {
    const date = typeof d === 'string' ? new Date(d + 'T00:00:00') : d;
    return date.toISOString().split('T')[0];
  };

  const formatDateDisplay = (d: string) => {
    const [y, m, day] = d.split('-');
    return `${day}.${m}.${y}`;
  };

  const formatDateTime = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // ── SAVE EDITS ──
  const handleSave = async () => {
    if (!booking || !editCheckIn || !editCheckOut) return;

    const newCheckIn = formatDate(editCheckIn);
    const newCheckOut = formatDate(editCheckOut);
    const diffMs = editCheckOut.getTime() - editCheckIn.getTime();
    const newNights = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (newNights <= 0) {
      return Alert.alert('Error', 'Check-out must be after check-in');
    }

    const pricePerNight = Number(booking.moorings?.price_per_night || booking.price_per_night);
    const newTotal = newNights * pricePerNight;
    const newCommission = newTotal * 0.15;

    Alert.alert(
      'Confirm Changes',
      `New dates: ${formatDateDisplay(newCheckIn)} – ${formatDateDisplay(newCheckOut)}\n${newNights} night${newNights > 1 ? 's' : ''}\nNew total: €${newTotal.toFixed(2)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save', onPress: async () => {
            setSaving(true);
            try {
              const { error } = await supabase
                .from('bookings')
                .update({
                  check_in: newCheckIn,
                  check_out: newCheckOut,
                  nights: newNights,
                  price_per_night: pricePerNight,
                  total_price: newTotal,
                  commission_amount: newCommission,
                  boat_name: editBoatName || null,
                  boat_length: editBoatLength ? parseFloat(editBoatLength) : null,
                  guest_phone: editGuestPhone || null,
                })
                .eq('id', booking.id);

              if (error) throw error;
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setEditMode(false);
              await fetchBooking();
              Alert.alert('✅ Updated', 'Your booking has been updated successfully.');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to update booking');
            }
            setSaving(false);
          }
        },
      ]
    );
  };

  // ── CANCEL BOOKING ──
  const handleCancel = async () => {
    if (!booking) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          booking_status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancelled_by: 'guest',
          cancellation_reason: cancelReason || 'Guest cancelled',
        })
        .eq('id', booking.id);

      if (error) throw error;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowCancelModal(false);
      setCancelReason('');
      await fetchBooking();
      Alert.alert('Booking Cancelled', 'Your booking has been cancelled.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to cancel booking');
    }
    setSaving(false);
  };

  // ── DELETE BOOKING ──
  const handleDelete = () => {
    if (!booking) return;
    Alert.alert(
      '⚠️ Delete Booking',
      'Are you sure you want to permanently delete this booking? This cannot be undone.',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            setSaving(true);
            try {
              const { error } = await supabase
                .from('bookings')
                .delete()
                .eq('id', booking.id);

              if (error) throw error;
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Deleted', 'Booking has been deleted.', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete booking');
            }
            setSaving(false);
          }
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <ActivityIndicator color={COLORS.primary} size="large" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={s.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={FONTS.h2}>Booking not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const status = STATUS_CONFIG[booking.booking_status] || STATUS_CONFIG.pending;
  const images = booking.moorings?.image_urls?.filter(u => u?.startsWith('http')) || [];
  const heroImage = images[0] || FALLBACK_IMG;
  const canEdit = ['pending', 'confirmed'].includes(booking.booking_status);
  const canCancel = ['pending', 'confirmed'].includes(booking.booking_status);
  const canDelete = ['cancelled'].includes(booking.booking_status);

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.85}>
          <Ionicons name="chevron-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Trip Details</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero Image + Status */}
        <View style={s.heroWrap}>
          <Image source={{ uri: heroImage }} style={s.heroImage} resizeMode="cover" />
          <View style={s.heroOverlay} />
          <View style={s.heroContent}>
            <View style={[s.statusPill, { backgroundColor: status.bg, borderColor: status.color + '50' }]}>
              <Ionicons name={status.icon as any} size={14} color={status.color} />
              <Text style={[s.statusPillText, { color: status.color }]}>{status.label}</Text>
            </View>
            <Text style={s.heroTitle} numberOfLines={2}>{booking.moorings?.name || 'Mooring'}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="location" size={14} color={COLORS.primary} />
              <Text style={s.heroLoc}>
                {booking.moorings?.location}, {booking.moorings?.country} {booking.moorings?.country_flag}
              </Text>
            </View>
          </View>
        </View>

        {/* Confirmation Code */}
        <View style={s.codeCard}>
          <Ionicons name="qr-code-outline" size={20} color={COLORS.primary} />
          <View>
            <Text style={s.codeLabel}>Confirmation Code</Text>
            <Text style={s.codeValue}>#{booking.confirmation_code}</Text>
          </View>
          <Text style={s.codePrice}>€{Number(booking.total_price).toFixed(2)}</Text>
        </View>

        {/* Dates Section */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>📅 Dates</Text>
          {editMode ? (
            <View style={s.editGroup}>
              <Text style={s.editLabel}>Check-in</Text>
              <TouchableOpacity style={s.editInput} onPress={() => setShowCheckInPicker(true)}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
                <Text style={s.editInputText}>
                  {editCheckIn ? formatDateDisplay(formatDate(editCheckIn)) : 'Select'}
                </Text>
              </TouchableOpacity>
              {showCheckInPicker && (
                <DateTimePicker
                  value={editCheckIn || new Date()}
                  mode="date" display="default" minimumDate={new Date()}
                  onChange={(_, d) => { setShowCheckInPicker(Platform.OS === 'ios'); if (d) setEditCheckIn(d); }}
                />
              )}

              <Text style={[s.editLabel, { marginTop: 12 }]}>Check-out</Text>
              <TouchableOpacity style={s.editInput} onPress={() => setShowCheckOutPicker(true)}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
                <Text style={s.editInputText}>
                  {editCheckOut ? formatDateDisplay(formatDate(editCheckOut)) : 'Select'}
                </Text>
              </TouchableOpacity>
              {showCheckOutPicker && (
                <DateTimePicker
                  value={editCheckOut || new Date()}
                  mode="date" display="default" minimumDate={editCheckIn || new Date()}
                  onChange={(_, d) => { setShowCheckOutPicker(Platform.OS === 'ios'); if (d) setEditCheckOut(d); }}
                />
              )}
            </View>
          ) : (
            <View style={s.infoGrid}>
              <InfoItem icon="log-in-outline" label="Check-in" value={formatDateDisplay(booking.check_in)} />
              <InfoItem icon="log-out-outline" label="Check-out" value={formatDateDisplay(booking.check_out)} />
              <InfoItem icon="moon-outline" label="Nights" value={booking.nights.toString()} />
            </View>
          )}
        </View>

        {/* Guest & Boat Info */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>👤 Guest & Boat</Text>
          {editMode ? (
            <View style={s.editGroup}>
              <Text style={s.editLabel}>Phone</Text>
              <TextInput
                style={s.editTextInput} value={editGuestPhone} onChangeText={setEditGuestPhone}
                placeholder="+385 91 000 0000" placeholderTextColor={COLORS.textDim} keyboardType="phone-pad"
              />
              <Text style={[s.editLabel, { marginTop: 12 }]}>Boat Name</Text>
              <TextInput
                style={s.editTextInput} value={editBoatName} onChangeText={setEditBoatName}
                placeholder="Sea Breeze" placeholderTextColor={COLORS.textDim}
              />
              <Text style={[s.editLabel, { marginTop: 12 }]}>Boat Length (m)</Text>
              <TextInput
                style={s.editTextInput} value={editBoatLength} onChangeText={setEditBoatLength}
                placeholder="12.5" placeholderTextColor={COLORS.textDim} keyboardType="decimal-pad"
              />
            </View>
          ) : (
            <View style={s.infoGrid}>
              <InfoItem icon="person-outline" label="Guest" value={booking.guest_name} />
              <InfoItem icon="mail-outline" label="Email" value={booking.guest_email} />
              {booking.guest_phone && <InfoItem icon="call-outline" label="Phone" value={booking.guest_phone} />}
              {booking.boat_name && <InfoItem icon="boat-outline" label="Boat" value={`${booking.boat_name}${booking.boat_length ? ` (${booking.boat_length}m)` : ''}`} />}
            </View>
          )}
        </View>

        {/* Price Breakdown */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>💰 Price Breakdown</Text>
          <View style={s.priceCard}>
            <View style={s.priceRow}>
              <Text style={s.priceLabel}>€{Number(booking.price_per_night).toFixed(2)} × {booking.nights} nights</Text>
              <Text style={s.priceVal}>€{Number(booking.total_price).toFixed(2)}</Text>
            </View>
            <View style={s.priceRow}>
              <Text style={s.priceLabel}>Payment</Text>
              <Text style={[s.priceVal, { fontSize: 13 }]}>
                {booking.payment_method === 'cash' ? '💵 Cash' : '💳 Card'} — {booking.payment_status}
              </Text>
            </View>
            <View style={[s.priceRow, s.priceTotalRow]}>
              <Text style={s.priceTotalLabel}>Total</Text>
              <Text style={s.priceTotalVal}>€{Number(booking.total_price).toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Booking Meta */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>ℹ️ Booking Info</Text>
          <View style={s.infoGrid}>
            <InfoItem icon="time-outline" label="Booked on" value={formatDateTime(booking.created_at)} />
            {booking.cancelled_at && <InfoItem icon="close-circle-outline" label="Cancelled on" value={formatDateTime(booking.cancelled_at)} />}
            {booking.cancellation_reason && <InfoItem icon="chatbox-ellipses-outline" label="Reason" value={booking.cancellation_reason} />}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={s.actionsSection}>
          {editMode ? (
            <View style={{ gap: 10 }}>
              <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
                {saving ? <ActivityIndicator color={COLORS.bg} size="small" /> : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.bg} />
                    <Text style={s.saveBtnText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={s.cancelEditBtn} onPress={cancelEditMode} activeOpacity={0.85}>
                <Text style={s.cancelEditBtnText}>Discard Changes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {canEdit && (
                <TouchableOpacity style={s.editBtn} onPress={enterEditMode} activeOpacity={0.85}>
                  <Ionicons name="create-outline" size={20} color={COLORS.primary} />
                  <Text style={s.editBtnText}>Edit Booking</Text>
                </TouchableOpacity>
              )}
              {canCancel && (
                <TouchableOpacity
                  style={s.cancelBtn}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowCancelModal(true); }}
                  activeOpacity={0.85}
                >
                  <Ionicons name="close-circle-outline" size={20} color={COLORS.orange} />
                  <Text style={s.cancelBtnText}>Cancel Booking</Text>
                </TouchableOpacity>
              )}
              {canDelete && (
                <TouchableOpacity
                  style={s.deleteBtn}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); handleDelete(); }}
                  activeOpacity={0.85}
                >
                  <Ionicons name="trash-outline" size={20} color={COLORS.red} />
                  <Text style={s.deleteBtnText}>Delete Booking</Text>
                </TouchableOpacity>
              )}
              {/* View mooring */}
              <TouchableOpacity
                style={s.viewMooringBtn}
                onPress={() => router.push(`/mooring/${booking.mooring_id}` as any)}
                activeOpacity={0.85}
              >
                <Ionicons name="navigate-outline" size={18} color={COLORS.textSecondary} />
                <Text style={s.viewMooringBtnText}>View Mooring</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Cancel Modal */}
      <Modal visible={showCancelModal} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Ionicons name="warning-outline" size={28} color={COLORS.orange} />
              <Text style={s.modalTitle}>Cancel Booking</Text>
            </View>
            <Text style={s.modalSubtitle}>
              Are you sure you want to cancel your booking at{'\n'}
              <Text style={{ fontWeight: '700', color: COLORS.text }}>{booking.moorings?.name}</Text>?
            </Text>

            <Text style={s.modalLabel}>Reason (optional)</Text>
            <TextInput
              style={s.modalInput}
              value={cancelReason}
              onChangeText={setCancelReason}
              placeholder="Plans changed, found another spot..."
              placeholderTextColor={COLORS.textDim}
              multiline
              numberOfLines={3}
            />

            <View style={s.modalBtnRow}>
              <TouchableOpacity
                style={s.modalKeepBtn}
                onPress={() => { setShowCancelModal(false); setCancelReason(''); }}
                activeOpacity={0.85}
              >
                <Text style={s.modalKeepBtnText}>Keep Booking</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalCancelBtn} onPress={handleCancel} disabled={saving} activeOpacity={0.85}>
                {saving ? <ActivityIndicator color="#FFF" size="small" /> : (
                  <Text style={s.modalCancelBtnText}>Cancel It</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function InfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={s.infoItem}>
      <Ionicons name={icon as any} size={16} color={COLORS.primary} />
      <View style={{ flex: 1 }}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue} numberOfLines={2}>{value}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.card,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { ...FONTS.h2, letterSpacing: -0.3 },

  // Hero
  heroWrap: { height: 200, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,14,23,0.55)',
  },
  heroContent: {
    position: 'absolute', bottom: SPACING.md, left: SPACING.md, right: SPACING.md,
  },
  heroTitle: { color: COLORS.text, fontWeight: '900', fontSize: 22, marginTop: 8, letterSpacing: -0.5 },
  heroLoc: { color: COLORS.textSecondary, fontSize: 13 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: RADIUS.full, borderWidth: 1,
  },
  statusPillText: { fontSize: 12, fontWeight: '700' },

  // Code Card
  codeCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.primary + '30',
    margin: SPACING.md, padding: SPACING.md, ...SHADOWS.sm,
  },
  codeLabel: { ...FONTS.caption, fontSize: 10 },
  codeValue: { color: COLORS.text, fontWeight: '800', fontSize: 15, letterSpacing: 0.5 },
  codePrice: { color: COLORS.primary, fontWeight: '900', fontSize: 22, marginLeft: 'auto' },

  // Sections
  section: { paddingHorizontal: SPACING.md, paddingTop: SPACING.lg },
  sectionTitle: { ...FONTS.h3, marginBottom: SPACING.sm },

  // Info Grid
  infoGrid: { gap: SPACING.sm },
  infoItem: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm,
    backgroundColor: COLORS.card, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    padding: SPACING.sm + 4,
  },
  infoLabel: { ...FONTS.caption, fontSize: 10, marginBottom: 1 },
  infoValue: { color: COLORS.text, fontWeight: '600', fontSize: 14 },

  // Edit Mode
  editGroup: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.primary + '30',
    padding: SPACING.md,
  },
  editLabel: { ...FONTS.caption, fontSize: 11, marginBottom: 4 },
  editInput: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    paddingHorizontal: SPACING.sm, paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
  editInputText: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  editTextInput: {
    backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    paddingHorizontal: SPACING.sm, paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    color: COLORS.text, fontSize: 15,
  },

  // Price Card
  priceCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    padding: SPACING.md, ...SHADOWS.sm,
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { color: COLORS.textSecondary, fontSize: 14 },
  priceVal: { color: COLORS.text, fontWeight: '600', fontSize: 14 },
  priceTotalRow: {
    borderTopWidth: 1, borderTopColor: COLORS.cardBorder,
    paddingTop: 10, marginTop: 4, marginBottom: 0,
  },
  priceTotalLabel: { color: COLORS.text, fontWeight: '800', fontSize: 16 },
  priceTotalVal: { color: COLORS.primary, fontWeight: '900', fontSize: 22 },

  // Actions
  actionsSection: { padding: SPACING.md, paddingTop: SPACING.lg },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.primary + '40',
    paddingVertical: 15, ...SHADOWS.sm,
  },
  editBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },
  cancelBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.orange + '40',
    paddingVertical: 15,
  },
  cancelBtnText: { color: COLORS.orange, fontWeight: '700', fontSize: 15 },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.redGlow, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.red + '40',
    paddingVertical: 15,
  },
  deleteBtnText: { color: COLORS.red, fontWeight: '700', fontSize: 15 },
  viewMooringBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12,
  },
  viewMooringBtnText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 14 },

  // Save / Discard
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    paddingVertical: 16, ...SHADOWS.glow(COLORS.primary),
  },
  saveBtnText: { color: COLORS.bg, fontWeight: '800', fontSize: 16 },
  cancelEditBtn: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14,
  },
  cancelEditBtnText: { color: COLORS.textMuted, fontWeight: '600', fontSize: 14 },

  // Cancel Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center', padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    padding: SPACING.lg, width: '100%', maxWidth: 400, ...SHADOWS.lg,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: SPACING.sm },
  modalTitle: { ...FONTS.h2, color: COLORS.orange },
  modalSubtitle: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: SPACING.md },
  modalLabel: { ...FONTS.caption, fontSize: 11, marginBottom: 6 },
  modalInput: {
    backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    padding: SPACING.sm, color: COLORS.text, fontSize: 14,
    minHeight: 80, textAlignVertical: 'top',
  },
  modalBtnRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.lg },
  modalKeepBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.lg,
    paddingVertical: 14, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  modalKeepBtnText: { color: COLORS.text, fontWeight: '700', fontSize: 14 },
  modalCancelBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.orange, borderRadius: RADIUS.lg, paddingVertical: 14,
  },
  modalCancelBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
