import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  onSnapshot,
  orderBy,
  limit,
} from 'firebase/firestore';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { auth, db } from '../../firebase/firebaseConfig';
import Colors from '../../constants/colors';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AppHeader from '../../components/ui/AppHeader';

const WHATSAPP_NUMBER = '+2349029910958';

const PACKAGES = [
  {
    id: 'Navigation Session',
    title: 'Navigation Session',
    price: '₦35,000',
    badge: 'Most popular',
    badgeColor: Colors.rosePink,
    description:
      '60-min deep dive into your symptoms, medical history and concerns. Leaves with a personalised action plan and doctor prep guide.',
    icon: 'clipboard-outline',
  },
  {
    id: 'Care Bundle',
    title: 'Care Bundle',
    price: '₦75,000',
    badge: 'Save ₦30k',
    badgeColor: '#4A6741',
    description:
      '3 sessions over 4 weeks. Includes symptom tracking review, specialist referrals, and ongoing WhatsApp support between sessions.',
    icon: 'heart-outline',
  },
  {
    id: 'Follow-Up Session',
    title: 'Follow-Up Session',
    price: '₦25,000',
    badge: null,
    badgeColor: null,
    description:
      '30-min check-in for existing clients. Review progress, update your health journal, and plan next steps.',
    icon: 'refresh-outline',
  },
];

const TIME_SLOTS = ['Weekday Morning', 'Weekday Afternoon', 'Weekday Evening', 'Saturday Morning'];
const DURATIONS = ['Less than 6 months', '6-12 months', '1-3 years', 'More than 3 years'];
const DOCTOR_OPTIONS = [
  'Yes, and I have a diagnosis',
  'Yes, but no clear answer',
  'No, this is my first step',
];

interface BookingData {
  package: string;
  fullName: string;
  whatsapp: string;
  userConcerns: string;
  preferredTime: string;
  duration: string;
  seenDoctor: string;
  notes: string;
}

interface ExistingBooking {
  id: string;
  package?: string;
  fullName?: string;
  status?: string;
  preferredTime?: string;
  createdAt?: any;
}

// ─── Select Picker ────────────────────────────────────────────────────────────
function SelectPicker({
  label, value, options, onSelect,
}: { label: string; value: string; options: string[]; onSelect: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={pickerStyles.container}>
      <Text style={pickerStyles.label}>{label}</Text>
      <TouchableOpacity style={pickerStyles.trigger} onPress={() => setOpen(true)}>
        <Text style={[pickerStyles.triggerText, !value && pickerStyles.placeholder]}>
          {value || 'Select...'}
        </Text>
        <Ionicons name="chevron-down" size={16} color={Colors.darkPlumMuted} />
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="slide">
        <TouchableOpacity style={pickerStyles.overlay} onPress={() => setOpen(false)} activeOpacity={1}>
          <View style={pickerStyles.sheet}>
            <View style={pickerStyles.handle} />
            <Text style={pickerStyles.sheetTitle}>{label}</Text>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[pickerStyles.option, value === opt && pickerStyles.optionActive]}
                onPress={() => { onSelect(opt); setOpen(false); }}
              >
                <Text style={[pickerStyles.optionText, value === opt && pickerStyles.optionTextActive]}>
                  {opt}
                </Text>
                {value === opt && <Ionicons name="checkmark" size={18} color={Colors.rosePink} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const pickerStyles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: Colors.darkPlumMuted, marginBottom: 8, textTransform: 'uppercase' },
  trigger: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.offWhite, borderWidth: 1.5, borderColor: Colors.borderMedium, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 16 },
  triggerText: { fontSize: 15, color: Colors.darkPlum },
  placeholder: { color: Colors.darkPlumFaint },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  handle: { width: 40, height: 5, backgroundColor: Colors.border, borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 16, fontWeight: '600', color: Colors.darkPlum, marginBottom: 16 },
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  optionActive: { backgroundColor: Colors.rosePinkLight, marginHorizontal: -24, paddingHorizontal: 24 },
  optionText: { fontSize: 15, color: Colors.darkPlum },
  optionTextActive: { color: Colors.rosePink, fontWeight: '600' },
});

// ─── Existing Booking Card ────────────────────────────────────────────────────
function ExistingBookingCard({
  booking, onBookAnother,
}: { booking: ExistingBooking; onBookAnother: () => void }) {
  const isConfirmed = booking.status?.toLowerCase() === 'confirmed';
  return (
    <View style={ebStyles.container}>
      <View style={ebStyles.iconWrap}>
        <Text style={ebStyles.iconEmoji}>🌸</Text>
      </View>
      <Text style={ebStyles.title}>
        You're <Text style={ebStyles.titleAccent}>booked!</Text>
      </Text>
      <Text style={ebStyles.subtitle}>
        Your session request has been received. Your HerHealth Navigator will reach out on WhatsApp within 24 hours to confirm your time.
      </Text>

      <Card style={ebStyles.card}>
        <View style={ebStyles.cardHeader}>
          <View>
            <Text style={ebStyles.packageLabel}>{booking.package || 'Navigation Session'}</Text>
            <Text style={ebStyles.name}>{booking.fullName || 'Your booking'}</Text>
          </View>
          <View style={[ebStyles.statusBadge, isConfirmed ? ebStyles.statusConfirmed : ebStyles.statusPending]}>
            <Text style={[ebStyles.statusText, isConfirmed ? ebStyles.statusTextConfirmed : ebStyles.statusTextPending]}>
              {isConfirmed ? 'Confirmed' : 'Pending'}
            </Text>
          </View>
        </View>
        {booking.preferredTime ? (
          <View style={ebStyles.timeRow}>
            <Ionicons name="time-outline" size={14} color={Colors.rosePink} />
            <Text style={ebStyles.timeText}>{booking.preferredTime}</Text>
          </View>
        ) : null}
        <TouchableOpacity
          style={ebStyles.whatsappBtn}
          onPress={() => Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi HerHealth, I have a question about my booking.')}`)}
          activeOpacity={0.8}
        >
          <Ionicons name="logo-whatsapp" size={16} color={Colors.rosePink} />
          <Text style={ebStyles.whatsappText}>Reach out on WhatsApp</Text>
        </TouchableOpacity>
      </Card>

      <TouchableOpacity style={ebStyles.anotherBtn} onPress={onBookAnother} activeOpacity={0.8}>
        <Text style={ebStyles.anotherBtnText}>Book another session</Text>
      </TouchableOpacity>
    </View>
  );
}

const ebStyles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 4 },
  iconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.rosePinkLight, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  iconEmoji: { fontSize: 36 },
  title: { fontSize: 30, fontWeight: '500', color: Colors.darkPlum, marginBottom: 12, textAlign: 'center' },
  titleAccent: { color: Colors.rosePink, fontStyle: 'italic' },
  subtitle: { fontSize: 14, color: Colors.darkPlumMuted, lineHeight: 22, textAlign: 'center', marginBottom: 28, maxWidth: 300 },
  card: { width: '100%', marginBottom: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  packageLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: Colors.darkPlumFaint, marginBottom: 4, textTransform: 'uppercase' },
  name: { fontSize: 17, fontWeight: '600', color: Colors.darkPlum },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100, borderWidth: 1 },
  statusConfirmed: { backgroundColor: 'rgba(212,104,138,0.1)', borderColor: 'rgba(212,104,138,0.2)' },
  statusPending: { backgroundColor: 'rgba(90,138,106,0.1)', borderColor: 'rgba(90,138,106,0.2)' },
  statusText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  statusTextConfirmed: { color: Colors.rosePink },
  statusTextPending: { color: Colors.pending },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  timeText: { fontSize: 13, color: Colors.darkPlumMuted, fontWeight: '500' },
  whatsappBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.rosePinkLight, borderRadius: 12, padding: 12, gap: 10, borderWidth: 1, borderColor: 'rgba(212,104,138,0.1)' },
  whatsappText: { fontSize: 12, fontWeight: '700', color: Colors.rosePink, letterSpacing: 0.5 },
  anotherBtn: { marginTop: 8, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(212,104,138,0.3)' },
  anotherBtnText: { fontSize: 14, fontWeight: '600', color: Colors.rosePink },
});

// ─── Main Booking Screen ──────────────────────────────────────────────────────
export default function BookingScreen() {
  const navigation = useNavigation<any>();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingBookings, setCheckingBookings] = useState(true);
  const [existingBooking, setExistingBooking] = useState<ExistingBooking | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>({
    package: '', fullName: '', whatsapp: '', userConcerns: '',
    preferredTime: '', duration: '', seenDoctor: '', notes: '',
  });

  const resetWizard = () => {
    setStep(1);
    setError('');
    setBookingData({ package: '', fullName: '', whatsapp: '', userConcerns: '', preferredTime: '', duration: '', seenDoctor: '', notes: '' });
  };

  // Reset wizard step every time this tab comes into focus
  useFocusEffect(
    useCallback(() => {
      // Only reset if we're not mid-booking (step 2 or 3)
      if (step === 4) resetWizard();
    }, [step])
  );

  // Real-time listener for existing active bookings
  useEffect(() => {
    if (!auth.currentUser) { setCheckingBookings(false); return; }
    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'bookings'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const active = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as ExistingBooking))
        .find((b) => ['pending', 'confirmed'].includes(b.status?.toLowerCase() || ''));
      setExistingBooking(active || null);
      setCheckingBookings(false);
    }, () => setCheckingBookings(false));
    return () => unsubscribe();
  }, []);

  const update = (key: keyof BookingData, value: string) =>
    setBookingData((prev) => ({ ...prev, [key]: value }));

  const handleContinue = () => {
    if (!bookingData.fullName.trim() || !bookingData.whatsapp.trim() || !bookingData.preferredTime) {
      setError('Please fill in your name, WhatsApp number and preferred time. 🌸');
      return;
    }
    setError('');
    setStep(3);
  };

  const handleFinalSubmit = async () => {
    if (!auth.currentUser) { setError('You must be logged in to book a session.'); return; }
    setLoading(true);
    setError('');
    try {
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'bookings'), {
        ...bookingData,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setStep(4);
      setShowWizard(false);
    } catch {
      setError('Failed to book session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const progressWidth = step === 1 ? '33%' : step === 2 ? '66%' : '100%';

  // ── Loading state ───────────────────────────────────────────────────────────
  if (checkingBookings) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.rosePink} />
          <Text style={styles.loadingText}>Loading your bookings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Has active booking AND not in wizard mode ───────────────────────────────
  if (existingBooking && !showWizard) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppHeader />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <ExistingBookingCard
            booking={existingBooking}
            onBookAnother={() => { resetWizard(); setShowWizard(true); }}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Booking wizard ──────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Success State — just submitted */}
        {step === 4 ? (
          <View style={styles.successContainer}>
            <View style={styles.successIcon}><Text style={styles.successEmoji}>🌸</Text></View>
            <Text style={styles.successTitle}>You're <Text style={styles.successAccent}>booked!</Text></Text>
            <Text style={styles.successDesc}>
              Your session request has been received. Your HerHealth Navigator will reach out on WhatsApp within 24 hours to confirm your time. You deserve this. 🌸
            </Text>
            <Button title="Back to Home" onPress={() => { resetWizard(); navigation.navigate('Dashboard'); }} style={styles.successBtn} />
            <Button title="Visit the Sisterhood" onPress={() => { resetWizard(); navigation.navigate('Sisterhood'); }} variant="secondary" />
          </View>
        ) : (
          <>
            <View style={styles.disclaimer}>
              <Ionicons name="shield-checkmark-outline" size={16} color={Colors.rosePink} />
              <Text style={styles.disclaimerText}>HerHealth provides health navigation and advocacy support only. We do not diagnose, prescribe or treat.</Text>
            </View>

            <View style={styles.header}>
              {step > 1 ? (
                <TouchableOpacity onPress={() => setStep(step - 1)} style={styles.backButton}>
                  <Ionicons name="chevron-back" size={20} color={Colors.rosePink} />
                </TouchableOpacity>
              ) : showWizard ? (
                <TouchableOpacity onPress={() => setShowWizard(false)} style={styles.backButton}>
                  <Ionicons name="chevron-back" size={20} color={Colors.rosePink} />
                </TouchableOpacity>
              ) : null}
              <Text style={styles.pageTitle}>Book a <Text style={styles.pageTitleAccent}>Session</Text></Text>
            </View>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: progressWidth as any }]} />
            </View>
            <Text style={styles.stepLabel}>Step {step} of 3</Text>

            {/* STEP 1 — Package selection */}
            {step === 1 && (
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Choose your <Text style={styles.stepAccent}>package</Text></Text>
                <Text style={styles.stepSubtitle}>Every session is with a trained HerHealth Navigator — not a bot.</Text>
                {PACKAGES.map((pkg) => (
                  <TouchableOpacity key={pkg.id} style={styles.packageCard} onPress={() => { update('package', pkg.id); setStep(2); }} activeOpacity={0.8}>
                    <View style={styles.packageIconBox}>
                      <Ionicons name={pkg.icon as any} size={24} color={Colors.rosePink} />
                    </View>
                    <View style={styles.packageInfo}>
                      <View style={styles.packageTitleRow}>
                        <Text style={styles.packageTitle}>{pkg.title}</Text>
                        <View style={styles.packagePriceRow}>
                          <Text style={styles.packagePrice}>{pkg.price}</Text>
                          {pkg.badge && (
                            <View style={[styles.packageBadge, { backgroundColor: pkg.badgeColor! }]}>
                              <Text style={styles.packageBadgeText}>{pkg.badge}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <Text style={styles.packageDesc}>{pkg.description}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* STEP 2 — Details */}
            {step === 2 && (
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Your <Text style={styles.stepAccent}>details</Text></Text>
                <Text style={styles.stepSubtitle}>So your navigator can prepare properly for your session.</Text>
                <TouchableOpacity style={styles.selectedPackageChip} onPress={() => setStep(1)}>
                  <View>
                    <Text style={styles.selectedPackageLabel}>Selected package</Text>
                    <Text style={styles.selectedPackageName}>{bookingData.package}</Text>
                  </View>
                  <View style={styles.changeButton}><Text style={styles.changeButtonText}>Change</Text></View>
                </TouchableOpacity>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Full name *</Text>
                  <TextInput style={styles.textInput} value={bookingData.fullName} onChangeText={(v) => update('fullName', v)} autoCapitalize="words" placeholderTextColor={Colors.darkPlumFaint} />
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>WhatsApp number *</Text>
                  <TextInput style={styles.textInput} value={bookingData.whatsapp} onChangeText={(v) => update('whatsapp', v)} keyboardType="phone-pad" placeholderTextColor={Colors.darkPlumFaint} />
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Is there anything you would like to share?</Text>
                  <TextInput style={[styles.textInput, styles.textArea]} value={bookingData.userConcerns} onChangeText={(v) => update('userConcerns', v)} multiline numberOfLines={4} textAlignVertical="top" placeholder="Feel free to share any symptoms, concerns, or goals..." placeholderTextColor={Colors.darkPlumFaint} />
                </View>
                <SelectPicker label="Preferred session time *" value={bookingData.preferredTime} options={TIME_SLOTS} onSelect={(v) => update('preferredTime', v)} />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <Button title="Continue →" onPress={handleContinue} />
              </View>
            )}

            {/* STEP 3 — Final details */}
            {step === 3 && (
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Almost <Text style={styles.stepAccent}>there</Text></Text>
                <Text style={styles.stepSubtitle}>Tell your navigator a little more so they can truly show up for you.</Text>
                <SelectPicker label="How long have you had these symptoms?" value={bookingData.duration} options={DURATIONS} onSelect={(v) => update('duration', v)} />
                <SelectPicker label="Have you seen a doctor about this before?" value={bookingData.seenDoctor} options={DOCTOR_OPTIONS} onSelect={(v) => update('seenDoctor', v)} />
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Anything else you want your navigator to know?</Text>
                  <TextInput style={[styles.textInput, styles.textArea]} value={bookingData.notes} onChangeText={(v) => update('notes', v)} multiline numberOfLines={4} textAlignVertical="top" placeholder="Share as much or as little as you like. This is a safe space." placeholderTextColor={Colors.darkPlumFaint} />
                </View>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <Button title={loading ? 'Processing...' : 'Confirm & Book Session →'} onPress={handleFinalSubmit} loading={loading} />
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.petal },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { fontSize: 14, color: Colors.darkPlumMuted, fontWeight: '500' },
  disclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: Colors.rosePinkLight, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.rosePinkBorder, marginBottom: 20 },
  disclaimerText: { flex: 1, fontSize: 12, color: Colors.rosePink, lineHeight: 18, fontWeight: '500' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  backButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: Colors.rosePink, alignItems: 'center', justifyContent: 'center' },
  pageTitle: { fontSize: 28, fontWeight: '500', color: Colors.darkPlum },
  pageTitleAccent: { color: Colors.rosePink, fontStyle: 'italic' },
  progressTrack: { height: 6, backgroundColor: Colors.rosePinkLight, borderRadius: 3, marginBottom: 8, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.rosePink, borderRadius: 3 },
  stepLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: Colors.darkPlumMuted, marginBottom: 20, textTransform: 'uppercase' },
  stepContent: { gap: 0 },
  stepTitle: { fontSize: 26, fontWeight: '700', color: Colors.darkPlum, marginBottom: 8 },
  stepAccent: { color: Colors.rosePink, fontStyle: 'italic' },
  stepSubtitle: { fontSize: 14, color: Colors.darkPlumMuted, marginBottom: 24, lineHeight: 22 },
  packageCard: { flexDirection: 'row', gap: 16, backgroundColor: Colors.white, borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: Colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  packageIconBox: { width: 56, height: 56, borderRadius: 16, backgroundColor: Colors.rosePinkLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  packageInfo: { flex: 1 },
  packageTitleRow: { marginBottom: 8 },
  packageTitle: { fontSize: 17, fontWeight: '600', color: Colors.darkPlum, marginBottom: 4 },
  packagePriceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  packagePrice: { fontSize: 16, fontWeight: '700', color: Colors.rosePink },
  packageBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  packageBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.white },
  packageDesc: { fontSize: 13, color: Colors.darkPlumMuted, lineHeight: 20 },
  selectedPackageChip: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.rosePinkLight, borderRadius: 20, padding: 16, borderWidth: 1.5, borderColor: 'rgba(212,104,138,0.2)', marginBottom: 24 },
  selectedPackageLabel: { fontSize: 10, fontWeight: '700', color: Colors.rosePink, marginBottom: 4 },
  selectedPackageName: { fontSize: 15, fontWeight: '600', color: Colors.darkPlum },
  changeButton: { backgroundColor: Colors.white, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  changeButtonText: { fontSize: 13, fontWeight: '600', color: Colors.rosePink },
  fieldGroup: { marginBottom: 20 },
  fieldLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: Colors.darkPlumMuted, marginBottom: 8, textTransform: 'uppercase' },
  textInput: { backgroundColor: Colors.offWhite, borderWidth: 1.5, borderColor: Colors.borderMedium, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 16, fontSize: 15, color: Colors.darkPlum },
  textArea: { minHeight: 100, paddingTop: 16 },
  errorText: { fontSize: 13, color: Colors.error, marginBottom: 16, textAlign: 'center' },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.rosePinkLight, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  successEmoji: { fontSize: 36 },
  successTitle: { fontSize: 32, fontWeight: '500', color: Colors.darkPlum, marginBottom: 16, textAlign: 'center' },
  successAccent: { color: Colors.rosePink, fontStyle: 'italic' },
  successDesc: { fontSize: 14, color: Colors.darkPlumMuted, lineHeight: 22, textAlign: 'center', maxWidth: 300, marginBottom: 40 },
  successBtn: { width: '100%', marginBottom: 12 },
});
