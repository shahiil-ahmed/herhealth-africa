import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../../firebase/firebaseConfig';
import { calculateCyclePhase } from '../../utils/cycleUtils';
import Colors from '../../constants/colors';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';
import AppHeader from '../../components/ui/AppHeader';

// Symptom definitions
const SYMPTOMS = [
  { key: 'pelvicPain', label: 'Pelvic Pain', icon: 'pulse-outline' },
  { key: 'bleeding', label: 'Bleeding', icon: 'water-outline' },
  { key: 'bloating', label: 'Bloating', icon: 'cloud-outline' },
  { key: 'fatigue', label: 'Fatigue', icon: 'battery-dead-outline' },
  { key: 'nausea', label: 'Nausea', icon: 'medical-outline' },
  { key: 'hotFlashes', label: 'Hot Flashes', icon: 'thermometer-outline' },
  { key: 'brainFog', label: 'Brain Fog', icon: 'cloudy-outline' },
  { key: 'backPain', label: 'Back Pain', icon: 'body-outline' },
] as const;

const MOOD_OPTIONS = [
  { emoji: '😫', label: 'Terrible' },
  { emoji: '😔', label: 'Low' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '🙂', label: 'Good' },
  { emoji: '🤩', label: 'Great' },
];

type SymptomKey = typeof SYMPTOMS[number]['key'];
type Ratings = Record<SymptomKey, number>;

interface RatingRowProps {
  label: string;
  iconName: string;
  value: number;
  onChange: (v: number) => void;
}

function RatingRow({ label, iconName, value, onChange }: RatingRowProps) {
  return (
    <View style={ratingStyles.row}>
      <View style={ratingStyles.labelRow}>
        <Ionicons name={iconName as any} size={18} color={Colors.rosePink} />
        <Text style={ratingStyles.label}>{label}</Text>
      </View>
      <View style={ratingStyles.dots}>
        {[1, 2, 3, 4, 5].map((level) => (
          <TouchableOpacity
            key={level}
            onPress={() => onChange(value === level ? 0 : level)}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <View
              style={[
                ratingStyles.dot,
                level <= value && ratingStyles.dotActive,
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const ratingStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE8EF',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.darkPlum,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(212, 104, 138, 0.2)',
  },
  dotActive: {
    backgroundColor: Colors.rosePink,
  },
});

export default function TrackerScreen() {
  const initialRatings: Ratings = {
    pelvicPain: 0, bleeding: 0, bloating: 0, fatigue: 0,
    nausea: 0, hotFlashes: 0, brainFog: 0, backPain: 0,
  };

  const [ratings, setRatings] = useState<Ratings>(initialRatings);
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [energy, setEnergy] = useState(5);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [weeklyLogs, setWeeklyLogs] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSavedToday, setHasSavedToday] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  const [periodLength, setPeriodLength] = useState('5');

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const cycleInfo = calculateCyclePhase(
    userProfile?.lastPeriodStart,
    userProfile?.cycleLength || 28
  );

  // Fetch user profile
  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubscribe = onSnapshot(
      doc(db, 'users', auth.currentUser.uid, 'profile', 'data'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setUserProfile(data);
          if (data.cycleLength) setCycleLength(String(data.cycleLength));
          if (data.periodLength) setPeriodLength(String(data.periodLength));
          if (data.lastPeriodStart) {
            const date = data.lastPeriodStart instanceof Timestamp
              ? data.lastPeriodStart.toDate()
              : new Date(data.lastPeriodStart);
            setLastPeriodDate(date.toISOString().split('T')[0]);
          }
        }
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch weekly logs
  useEffect(() => {
    if (!auth.currentUser) return;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const dateStr = oneWeekAgo.toISOString().split('T')[0];

    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'dailyLogs'),
      where('date', '>=', dateStr),
      orderBy('date', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setWeeklyLogs(snap.docs.map((d) => d.data()));
    });
    return () => unsubscribe();
  }, []);

  const updateRating = async (symptom: SymptomKey, value: number) => {
    setRatings((prev) => ({ ...prev, [symptom]: value }));
    if (!auth.currentUser) return;
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      await setDoc(
        doc(db, 'users', auth.currentUser.uid, 'dailyLogs', todayStr),
        { ratings: { [symptom]: value }, updatedAt: serverTimestamp() },
        { merge: true }
      );
    } catch (e) {
      console.error('Error updating rating:', e);
      Alert.alert('Error', 'Failed to update symptom rating. Please check your connection.');
    }
  };

  const saveLog = async () => {
    if (!auth.currentUser) return;
    setIsSubmitting(true);
    const todayStr = new Date().toISOString().split('T')[0];
    const activeRatings = Object.values(ratings).filter((v) => v > 0);
    const avgIntensity = activeRatings.length > 0
      ? activeRatings.reduce((a, b) => a + b, 0) / activeRatings.length
      : 0;

    try {
      await setDoc(
        doc(db, 'users', auth.currentUser.uid, 'dailyLogs', todayStr),
        {
          userId: auth.currentUser.uid,
          date: todayStr,
          mood,
          energy: Number(energy),
          ratings,
          notes,
          cycleDay: cycleInfo?.day ?? null,
          avgIntensity,
          createdAt: serverTimestamp(),
        }
      );
      setHasSavedToday(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (e) {
      console.error('Error saving log:', e);
      Alert.alert('Error', "Failed to save today's log. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveCycle = async () => {
    if (!auth.currentUser || !lastPeriodDate) return;
    setIsSubmitting(true);
    try {
      const localDateStr = lastPeriodDate.includes('T') ? lastPeriodDate : `${lastPeriodDate}T00:00:00`;
      await setDoc(
        doc(db, 'users', auth.currentUser.uid, 'profile', 'data'),
        {
          lastPeriodStart: Timestamp.fromDate(new Date(localDateStr)),
          cycleLength: Number(cycleLength),
          periodLength: Number(periodLength),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setShowCycleModal(false);
    } catch (e) {
      console.error('Error saving cycle:', e);
      Alert.alert('Error', 'Failed to save cycle settings. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Weekly chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const maxBarHeight = 80;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.dateText}>{today}</Text>
          <Text style={styles.subtitle}>
            Track daily. Your body is telling a story — this is where you write it down. 🌸
          </Text>
        </View>

        {/* Cycle Overview */}
        <Card style={styles.card}>
          <Text style={styles.cardLabel}>Cycle overview</Text>
          <View style={styles.cycleRow}>
            <View style={styles.cycleDayBadge}>
              <Text style={styles.cycleDayLabel}>Day</Text>
              <Text style={styles.cycleDayNumber}>
                {typeof cycleInfo?.day === 'number' ? cycleInfo.day : '-'}
              </Text>
            </View>
            <View style={styles.cycleInfo}>
              <Text style={styles.cyclePhaseText}>
                {cycleInfo?.phase === 'Late'
                  ? 'Cycle Late'
                  : cycleInfo?.day
                  ? `Day ${cycleInfo.day} — ${cycleInfo.phase}`
                  : 'Set your cycle'}
              </Text>
              <Text style={styles.cyclePhaseDesc}>
                {cycleInfo?.phase === 'Late'
                  ? 'Your cycle is longer than expected.'
                  : cycleInfo?.day
                  ? 'Your cycle is being tracked in real-time.'
                  : 'Log your last period to track your cycle phases'}
              </Text>
            </View>
          </View>
          <View style={styles.cycleButtons}>
            <TouchableOpacity
              style={styles.cycleBtn}
              onPress={() => setShowCycleModal(true)}
            >
              <Text style={styles.cycleBtnText}>📅 Log period start</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cycleBtn}
              onPress={() => setShowCycleModal(true)}
            >
              <Text style={styles.cycleBtnText}>⚙️ Edit cycle</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Symptoms */}
        <Card style={styles.card}>
          <Text style={styles.cardLabel}>Today's symptoms</Text>
          {SYMPTOMS.map((s) => (
            <RatingRow
              key={s.key}
              label={s.label}
              iconName={s.icon}
              value={ratings[s.key]}
              onChange={(v) => updateRating(s.key, v)}
            />
          ))}
        </Card>

        {/* Mood */}
        <Card style={styles.card}>
          <Text style={styles.cardLabel}>How are you feeling today?</Text>
          <View style={styles.moodGrid}>
            {MOOD_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.label}
                style={[
                  styles.moodOption,
                  mood === option.label && styles.moodOptionActive,
                ]}
                onPress={() => setMood(option.label)}
              >
                <Text style={styles.moodEmoji}>{option.emoji}</Text>
                <Text
                  style={[
                    styles.moodLabel,
                    mood === option.label && styles.moodLabelActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Energy */}
        <Card style={styles.card}>
          <View style={styles.energyHeader}>
            <Text style={styles.cardLabel}>How is your energy today?</Text>
            <View style={styles.energyBadge}>
              <Text style={styles.energyBadgeText}>{energy}/10</Text>
            </View>
          </View>
          <View style={styles.energySliderRow}>
            {Array.from({ length: 11 }, (_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setEnergy(i)}
                style={[
                  styles.energySegment,
                  i <= energy && styles.energySegmentActive,
                ]}
              />
            ))}
          </View>
          <View style={styles.energyLabels}>
            <Text style={styles.energyLabelText}>Exhausted</Text>
            <Text style={styles.energyLabelText}>Energized</Text>
          </View>
        </Card>

        {/* Notes */}
        <Card style={styles.card}>
          <Text style={styles.cardLabel}>Today's notes</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="What you ate, how you slept, stress levels, medications..."
            placeholderTextColor={Colors.darkPlumFaint}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Card>

        {/* Save Button */}
        <View style={styles.saveContainer}>
          <Button
            title={
              isSubmitting
                ? 'Saving...'
                : hasSavedToday
                ? '✓ Logged for Today'
                : "Save Today's Log ✓"
            }
            onPress={saveLog}
            loading={isSubmitting}
            style={hasSavedToday ? styles.savedButton : undefined}
          />
        </View>

        {/* Weekly Chart */}
        <Card style={styles.card}>
          <Text style={styles.weekTitle}>
            This <Text style={styles.weekAccent}>Week</Text>
          </Text>
          <Text style={styles.cardLabel}>Symptom intensity — last 7 days</Text>
          {weeklyLogs.length === 0 ? (
            <Text style={styles.noDataText}>No data tracked yet this week</Text>
          ) : (
            <View style={styles.chartContainer}>
              {last7Days.map((date, idx) => {
                const dateStr = date.toISOString().split('T')[0];
                const log = weeklyLogs.find((l) => l.date === dateStr);
                const intensity = log ? (log.avgIntensity / 5) * maxBarHeight : 2;
                const isToday = idx === 6;
                return (
                  <View key={dateStr} style={styles.chartBar}>
                    <View
                      style={[
                        styles.bar,
                        { height: intensity },
                        log ? styles.barActive : styles.barEmpty,
                      ]}
                    />
                    <Text style={styles.barLabel}>
                      {isToday ? 'Today' : dayLabels[date.getDay()]}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
          <Text style={styles.chartNote}>
            Based on your saved logs. Save daily for better insights.
          </Text>
        </Card>
      </ScrollView>

      {/* Toast */}
      <Toast
        visible={showToast}
        message="Today's log saved. Keep showing up for yourself. 🌸"
      />

      {/* Cycle Modal */}
      <Modal
        visible={showCycleModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCycleModal(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.sheet}>
            <View style={modalStyles.handle} />
            <Text style={modalStyles.title}>
              Log your <Text style={modalStyles.titleAccent}>Period</Text>
            </Text>
            <Text style={modalStyles.subtitle}>
              When did your last period start? This helps us track your cycle phases accurately.
            </Text>

            <Text style={modalStyles.fieldLabel}>Last period start date</Text>
            <TextInput
              style={modalStyles.input}
              value={lastPeriodDate}
              onChangeText={setLastPeriodDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.darkPlumFaint}
              keyboardType="numeric"
            />

            <View style={modalStyles.row}>
              <View style={modalStyles.halfField}>
                <Text style={modalStyles.fieldLabel}>Avg cycle (days)</Text>
                <TextInput
                  style={modalStyles.input}
                  value={cycleLength}
                  onChangeText={setCycleLength}
                  keyboardType="numeric"
                  placeholder="28"
                  placeholderTextColor={Colors.darkPlumFaint}
                />
              </View>
              <View style={modalStyles.halfField}>
                <Text style={modalStyles.fieldLabel}>Avg period (days)</Text>
                <TextInput
                  style={modalStyles.input}
                  value={periodLength}
                  onChangeText={setPeriodLength}
                  keyboardType="numeric"
                  placeholder="5"
                  placeholderTextColor={Colors.darkPlumFaint}
                />
              </View>
            </View>

            <Button
              title="Save Info →"
              onPress={handleSaveCycle}
              loading={isSubmitting}
              disabled={!lastPeriodDate}
              style={modalStyles.saveBtn}
            />
            <Button
              title="Cancel"
              onPress={() => setShowCycleModal(false)}
              variant="ghost"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.petal },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },
  dateText: { fontSize: 26, fontWeight: '300', color: Colors.darkPlum, marginBottom: 8 },
  subtitle: { fontSize: 13, color: Colors.darkPlumMuted, lineHeight: 20 },
  card: { marginHorizontal: 16, marginBottom: 16 },
  cardLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 2,
    color: Colors.darkPlumMuted, marginBottom: 16, textTransform: 'uppercase',
  },
  // Cycle
  cycleRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  cycleDayBadge: {
    width: 56, height: 56, backgroundColor: Colors.rosePink, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  cycleDayLabel: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.9)', letterSpacing: 1 },
  cycleDayNumber: { fontSize: 22, fontWeight: '700', color: Colors.white, lineHeight: 26 },
  cycleInfo: { flex: 1 },
  cyclePhaseText: { fontSize: 15, fontWeight: '600', color: Colors.darkPlum, marginBottom: 4 },
  cyclePhaseDesc: { fontSize: 12, color: Colors.darkPlumMuted, lineHeight: 18 },
  cycleButtons: { flexDirection: 'row', gap: 10 },
  cycleBtn: {
    flex: 1, backgroundColor: Colors.rosePinkLight, borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(212, 104, 138, 0.1)',
  },
  cycleBtnText: { fontSize: 12, fontWeight: '600', color: Colors.rosePink },
  // Mood
  moodGrid: { flexDirection: 'row', gap: 8 },
  moodOption: {
    flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12,
    backgroundColor: Colors.offWhite, borderWidth: 1, borderColor: 'transparent',
  },
  moodOptionActive: { backgroundColor: Colors.rosePink, borderColor: Colors.rosePink },
  moodEmoji: { fontSize: 22, marginBottom: 6 },
  moodLabel: { fontSize: 10, fontWeight: '600', color: Colors.darkPlumMuted },
  moodLabelActive: { color: Colors.white },
  // Energy
  energyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  energyBadge: {
    backgroundColor: Colors.rosePinkLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  energyBadgeText: { fontSize: 12, fontWeight: '700', color: Colors.rosePink },
  energySliderRow: { flexDirection: 'row', gap: 4, marginBottom: 8 },
  energySegment: {
    flex: 1, height: 6, borderRadius: 3, backgroundColor: '#FFE8EF',
  },
  energySegmentActive: { backgroundColor: Colors.rosePink },
  energyLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  energyLabelText: { fontSize: 11, color: Colors.darkPlumFaint, fontWeight: '500' },
  // Notes
  notesInput: {
    backgroundColor: Colors.offWhite, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 14, color: Colors.darkPlum, minHeight: 100, lineHeight: 22,
  },
  // Save
  saveContainer: { paddingHorizontal: 16, marginBottom: 16 },
  savedButton: { backgroundColor: Colors.success },
  // Chart
  weekTitle: { fontSize: 20, fontWeight: '300', color: Colors.darkPlum, marginBottom: 4 },
  weekAccent: { color: Colors.rosePink, fontStyle: 'italic' },
  noDataText: { fontSize: 13, color: Colors.darkPlumFaint, fontStyle: 'italic', textAlign: 'center', paddingVertical: 24 },
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 6, marginBottom: 12 },
  chartBar: { flex: 1, alignItems: 'center', gap: 6 },
  bar: { width: '100%', borderRadius: 4, minHeight: 2 },
  barActive: { backgroundColor: Colors.rosePink },
  barEmpty: { backgroundColor: '#E8DCE5', opacity: 0.5 },
  barLabel: { fontSize: 9, color: Colors.darkPlumMuted, fontWeight: '600' },
  chartNote: { fontSize: 12, color: Colors.darkPlumFaint, fontStyle: 'italic', textAlign: 'center' },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(45, 27, 46, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFF9FA', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 28, paddingBottom: 40,
  },
  handle: {
    width: 48, height: 6, backgroundColor: '#E8DCE5', borderRadius: 3,
    alignSelf: 'center', marginBottom: 24,
  },
  title: { fontSize: 24, fontWeight: '500', color: Colors.darkPlum, marginBottom: 8 },
  titleAccent: { color: Colors.rosePink, fontStyle: 'italic' },
  subtitle: { fontSize: 14, color: Colors.darkPlumMuted, lineHeight: 22, marginBottom: 24 },
  fieldLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.2,
    color: Colors.darkPlumMuted, marginBottom: 8, textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: 'rgba(212, 104, 138, 0.3)',
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: Colors.darkPlum, marginBottom: 16,
  },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  saveBtn: { marginBottom: 8 },
});
