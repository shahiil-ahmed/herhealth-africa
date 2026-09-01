import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/colors';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AppHeader from '../../components/ui/AppHeader';

const CATEGORIES = [
  { name: 'Gynaecology', emoji: '👩‍⚕️' },
  { name: 'Endocrinology', emoji: '🦋' },
  { name: 'Pelvic Physio', emoji: '🧘‍♀️' },
  { name: 'Nutrition', emoji: '🥗' },
  { name: 'Mental Health', emoji: '🧠' },
];

const TESTIMONIALS = [
  {
    quote: '"I was 25 when I was diagnosed. Heavy bleeding, severe pain, constantly bloated. The nurse handed me my results with a look of pity. I just wanted someone to tell me I would be fine."',
    name: 'Amara, 26 — Lagos',
    detail: 'Fibroids diagnosed at 25',
    initial: 'A',
  },
  {
    quote: '"My journey with HerHealth changed everything. From the first consultation to finding a vetted specialist, I felt seen and supported. My health is now a conversation, not a series of dismissive appointments."',
    name: 'Janet, 29 — Lagos',
    detail: 'PCOS management journey',
    initial: 'J',
  },
];

interface Specialist {
  id: string;
  name: string;
  specialty: string;
  location: string;
  category: string;
}

function SpecialistCard({ name, specialty, location }: Specialist) {
  return (
    <Card style={specialistStyles.card}>
      <View style={specialistStyles.iconBox}>
        <Ionicons name="medical-outline" size={22} color={Colors.white} />
      </View>
      <View style={specialistStyles.info}>
        <Text style={specialistStyles.name}>{name}</Text>
        <Text style={specialistStyles.specialty}>{specialty}</Text>
        <View style={specialistStyles.locationRow}>
          <Ionicons name="location-outline" size={12} color={Colors.rosePink} />
          <Text style={specialistStyles.location}>{location}</Text>
        </View>
      </View>
    </Card>
  );
}

const specialistStyles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', marginBottom: 12 },
  iconBox: {
    width: 48, height: 48, borderRadius: 16, backgroundColor: Colors.rosePink,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: Colors.darkPlum, marginBottom: 2 },
  specialty: { fontSize: 12, fontWeight: '700', color: Colors.rosePink, marginBottom: 8, letterSpacing: 0.5 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  location: { fontSize: 10, fontWeight: '700', color: Colors.darkPlumFaint, letterSpacing: 1 },
});

export default function DiscoverScreen() {
  const { currentUser } = useAuth();
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [showTestimonials, setShowTestimonials] = useState(false);
  const [nomination, setNomination] = useState({ doctorName: '', details: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nominationSuccess, setNominationSuccess] = useState(false);
  const [nominationError, setNominationError] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'specialists'),
      (snap) => {
        setSpecialists(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Specialist)));
      },
      (error) => {
        console.error('Error fetching specialists:', error);
        Alert.alert('Error', 'Unable to load the directory. Please check your connection.');
      }
    );
    return () => unsubscribe();
  }, []);

  const handleNominate = async () => {
    if (!nomination.doctorName || !nomination.details) return;
    setIsSubmitting(true);
    setNominationError('');
    try {
      await addDoc(collection(db, 'nominations'), {
        doctorName: nomination.doctorName,
        details: nomination.details,
        submittedBy: currentUser?.uid || 'anonymous',
        createdAt: serverTimestamp(),
      });
      setNominationSuccess(true);
      setNomination({ doctorName: '', details: '' });
      setTimeout(() => setNominationSuccess(false), 5000);
    } catch {
      setNominationError('Failed to submit nomination. Please try again. 🌸');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <Text style={styles.title}>
            Dis<Text style={styles.titleAccent}>cover</Text>
          </Text>
          <Text style={styles.subtitle}>Directory and resources in one safe place.</Text>
        </View>

        {/* Specialist Directory */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Specialist directory</Text>

          {CATEGORIES.map((cat) => {
            const matched = specialists.filter((s) => s.category === cat.name);
            if (matched.length > 0) {
              return matched.map((spec) => (
                <SpecialistCard key={spec.id} {...spec} />
              ));
            }
            return (
              <Card key={cat.name} style={styles.pendingCard}>
                <View style={styles.pendingIconBox}>
                  <Ionicons name="medical-outline" size={22} color={Colors.white} />
                </View>
                <View style={styles.pendingInfo}>
                  <Text style={styles.pendingName}>{cat.name}</Text>
                  <Text style={styles.pendingDesc}>
                    We are personally vetting every specialist before they appear here.
                  </Text>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>⏳ Vetting in progress</Text>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>

        {/* Testimonials Accordion */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setShowTestimonials(!showTestimonials)}
            activeOpacity={0.8}
          >
            <View style={styles.accordionLeft}>
              <View style={styles.accordionIcon}>
                <Ionicons name="heart-outline" size={18} color={Colors.rosePink} />
              </View>
              <View>
                <Text style={styles.accordionTitle}>Sister Testimonials</Text>
                <Text style={styles.accordionSubtitle}>Read real stories from our community</Text>
              </View>
            </View>
            <Ionicons
              name={showTestimonials ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={Colors.darkPlumMuted}
            />
          </TouchableOpacity>

          {showTestimonials && (
            <View style={styles.testimonialList}>
              {TESTIMONIALS.map((t, i) => (
                <Card key={i} variant="dark" style={styles.testimonialCard}>
                  <Text style={styles.testimonialQuote}>{t.quote}</Text>
                  <View style={styles.testimonialAuthorRow}>
                    <View style={styles.testimonialAvatar}>
                      <Text style={styles.testimonialAvatarText}>{t.initial}</Text>
                    </View>
                    <View>
                      <Text style={styles.testimonialName}>{t.name}</Text>
                      <Text style={styles.testimonialDetail}>{t.detail}</Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>

        {/* Nomination Form */}
        <View style={styles.section}>
          <Card style={styles.nominationCard}>
            <Text style={styles.nominationTitle}>Know a specialist we should vet?</Text>
            <Text style={styles.nominationSubtitle}>
              HerHealth is built on trust. If you've had a great experience with a doctor, nominate them to join our curated directory.
            </Text>

            {nominationSuccess && (
              <View style={styles.successBanner}>
                <Text style={styles.successBannerText}>
                  Thank you! We will look into this specialist. 🌸
                </Text>
              </View>
            )}
            {nominationError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{nominationError}</Text>
              </View>
            ) : null}

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Doctor's Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={nomination.doctorName}
                onChangeText={(v) => setNomination({ ...nomination, doctorName: v })}
                placeholder="e.g. Dr. Sarah Chen"
                placeholderTextColor={Colors.darkPlumFaint}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Reason or details</Text>
              <TextInput
                style={styles.textInput}
                value={nomination.details}
                onChangeText={(v) => setNomination({ ...nomination, details: v })}
                placeholder="e.g. Clinic name, specialty"
                placeholderTextColor={Colors.darkPlumFaint}
              />
            </View>

            <Button
              title={isSubmitting ? 'Submitting...' : 'Nominate Specialist →'}
              onPress={handleNominate}
              loading={isSubmitting}
              disabled={!nomination.doctorName || !nomination.details}
            />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.petal },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '500', color: Colors.darkPlum, marginBottom: 8 },
  titleAccent: { color: Colors.rosePink, fontStyle: 'italic' },
  subtitle: { fontSize: 14, color: Colors.darkPlumMuted },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 2,
    color: Colors.darkPlumMuted, marginBottom: 16, textTransform: 'uppercase',
  },
  // Pending card
  pendingCard: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', marginBottom: 12, opacity: 0.7 },
  pendingIconBox: {
    width: 48, height: 48, borderRadius: 16, backgroundColor: Colors.rosePink,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  pendingInfo: { flex: 1 },
  pendingName: { fontSize: 15, fontWeight: '600', color: Colors.darkPlum, marginBottom: 4 },
  pendingDesc: { fontSize: 11, color: Colors.darkPlumMuted, lineHeight: 16, marginBottom: 8 },
  pendingBadge: {
    backgroundColor: 'rgba(212, 104, 138, 0.05)', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(212, 104, 138, 0.1)',
  },
  pendingBadgeText: { fontSize: 9, fontWeight: '700', color: Colors.rosePink, letterSpacing: 1 },
  // Accordion
  accordionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: 24, padding: 16,
    borderWidth: 1, borderColor: '#FFE8EF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  accordionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  accordionIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(212, 104, 138, 0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  accordionTitle: { fontSize: 14, fontWeight: '600', color: Colors.darkPlum },
  accordionSubtitle: { fontSize: 12, color: Colors.darkPlumMuted, marginTop: 2 },
  testimonialList: { marginTop: 12, gap: 12 },
  testimonialCard: { marginBottom: 0 },
  testimonialQuote: {
    fontSize: 14, fontStyle: 'italic', color: Colors.white,
    lineHeight: 22, marginBottom: 20,
  },
  testimonialAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  testimonialAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.rosePink,
    alignItems: 'center', justifyContent: 'center',
  },
  testimonialAvatarText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  testimonialName: { fontSize: 12, fontWeight: '600', color: Colors.white },
  testimonialDetail: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  // Nomination
  nominationCard: {},
  nominationTitle: { fontSize: 20, fontWeight: '500', color: Colors.darkPlum, marginBottom: 8 },
  nominationSubtitle: { fontSize: 13, color: Colors.darkPlumMuted, lineHeight: 20, marginBottom: 20 },
  successBanner: {
    backgroundColor: '#ecfdf5', borderRadius: 12, padding: 12, marginBottom: 16,
  },
  successBannerText: { fontSize: 13, fontWeight: '600', color: Colors.success },
  errorBanner: {
    backgroundColor: Colors.errorBg, borderRadius: 12, padding: 12, marginBottom: 16,
  },
  errorBannerText: { fontSize: 13, fontWeight: '600', color: Colors.error },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.2,
    color: Colors.darkPlumMuted, marginBottom: 8, textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: Colors.offWhite, borderWidth: 1, borderColor: Colors.borderMedium,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 14, color: Colors.darkPlum,
  },
});
