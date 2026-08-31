import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { doc, onSnapshot, collection, query, limit } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/firebaseConfig';
import { calculateCyclePhase } from '../../utils/cycleUtils';
import Colors from '../../constants/colors';
import Card from '../../components/ui/Card';
import AppHeader from '../../components/ui/AppHeader';

const WHATSAPP_NUMBER = '+2349029910958';

interface Booking {
  id: string;
  package?: string;
  fullName?: string;
  status?: string;
  preferredTime?: string;
  createdAt?: any;
}

export default function DashboardScreen() {
  const { currentUser } = useAuth();
  const navigation = useNavigation<any>();

  const [cycleData, setCycleData] = useState<{ day: number; phase: string } | null>(null);
  const [isCycleLoading, setIsCycleLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const userName = currentUser?.displayName
    ? currentUser.displayName.split(' ')[0]
    : 'Sister';

  // Real-time cycle data listener
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = onSnapshot(
      doc(db, 'users', currentUser.uid, 'profile', 'data'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.lastPeriodStart) {
            const result = calculateCyclePhase(data.lastPeriodStart, data.cycleLength || 28);
            setCycleData(result);
          }
        }
        setIsCycleLoading(false);
      },
      (error) => {
        console.error('Error fetching cycle data:', error);
        setIsCycleLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Real-time bookings listener
  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, 'users', currentUser.uid, 'bookings'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Booking))
        .filter((b) => ['pending', 'confirmed'].includes(b.status?.toLowerCase() || ''))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setBookings(data);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const quickActions = [
    {
      icon: 'calendar-outline' as const,
      label: 'Book session',
      sublabel: 'Start your navigation journey',
      route: 'Booking',
      variant: 'pink' as const,
    },
    {
      icon: 'pulse-outline' as const,
      label: 'Track today',
      sublabel: 'Log symptoms & cycle',
      route: 'Tracker',
      variant: 'white' as const,
    },
    {
      icon: 'search-outline' as const,
      label: 'Find specialist',
      sublabel: 'Connect with experts',
      route: 'Discover',
      variant: 'white' as const,
    },
    {
      icon: 'heart-outline' as const,
      label: 'Sisterhood',
      sublabel: 'Heal together',
      route: 'Sisterhood',
      variant: 'pink' as const,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
        <View style={styles.hero}>
          <Text style={styles.heroWelcome}>Welcome back, {userName} ✦</Text>
          <Text style={styles.heroTitle}>
            Your body,{'\n'}
            <Text style={styles.heroAccent}>finally</Text> understood.
          </Text>

          {/* Cycle Phase Pill */}
          <View style={styles.cyclePill}>
            <View style={[styles.cycleDot, isCycleLoading && styles.cycleDotLoading]} />
            <Text style={styles.cyclePillText}>
              {isCycleLoading
                ? 'Syncing cycle...'
                : cycleData
                ? `Currently in: ${cycleData.phase} • Day ${cycleData.day}`
                : 'Set your cycle →'}
            </Text>
          </View>
        </View>

        {/* Today's Check-in Banner */}
        <TouchableOpacity
          style={styles.checkinBanner}
          onPress={() => navigation.navigate('Tracker')}
          activeOpacity={0.8}
        >
          <Ionicons name="bar-chart-outline" size={22} color={Colors.rosePink} />
          <Text style={styles.checkinText}>
            Log your symptoms today to build your health picture.{' '}
            <Text style={styles.checkinCta}>Tap to track →</Text>
          </Text>
        </TouchableOpacity>

        {/* Active Bookings */}
        {bookings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Your <Text style={styles.sectionAccent}>Bookings</Text>
            </Text>
            {bookings.slice(0, 2).map((booking) => (
              <Card key={booking.id} style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                  <View>
                    <Text style={styles.bookingPackageLabel}>
                      {booking.package || 'Navigation session'}
                    </Text>
                    <Text style={styles.bookingName}>
                      {booking.fullName || userName}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      booking.status === 'confirmed'
                        ? styles.statusConfirmed
                        : styles.statusPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        booking.status === 'confirmed'
                          ? styles.statusTextConfirmed
                          : styles.statusTextPending,
                      ]}
                    >
                      {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                    </Text>
                  </View>
                </View>
                {booking.preferredTime && (
                  <View style={styles.bookingMeta}>
                    <Ionicons name="time-outline" size={14} color={Colors.rosePink} />
                    <Text style={styles.bookingMetaText}>{booking.preferredTime}</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.whatsappButton}
                  onPress={() =>
                    Linking.openURL(
                      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                        'Hi HerHealth, I have a question about my booking.'
                      )}`
                    )
                  }
                >
                  <Ionicons name="logo-whatsapp" size={16} color={Colors.rosePink} />
                  <Text style={styles.whatsappText}>Reach out on WhatsApp</Text>
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        )}

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.actionCard,
                  action.variant === 'pink' && styles.actionCardPink,
                ]}
                onPress={() => navigation.navigate(action.route)}
                activeOpacity={0.85}
              >
                <View style={styles.actionDecoration} />
                <Ionicons
                  name={action.icon}
                  size={30}
                  color={action.variant === 'pink' ? Colors.white : Colors.rosePink}
                  style={styles.actionIcon}
                />
                <Text
                  style={[
                    styles.actionLabel,
                    action.variant === 'pink' && styles.actionLabelPink,
                  ]}
                >
                  {action.label}
                </Text>
                <Text
                  style={[
                    styles.actionSublabel,
                    action.variant === 'pink' && styles.actionSublabelPink,
                  ]}
                >
                  {action.sublabel}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.petal,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  // Hero
  hero: {
    backgroundColor: Colors.darkPlum,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  heroWelcome: {
    fontSize: 11,
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.35)',
    marginBottom: 12,
    fontWeight: '500',
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '300',
    color: Colors.white,
    lineHeight: 42,
    marginBottom: 20,
  },
  heroAccent: {
    color: Colors.rosePink,
    fontStyle: 'italic',
  },
  cyclePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    gap: 8,
  },
  cycleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.rosePink,
  },
  cycleDotLoading: {
    opacity: 0.5,
  },
  cyclePillText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.3,
  },
  // Check-in banner
  checkinBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: -16,
    borderRadius: 20,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkinText: {
    flex: 1,
    fontSize: 13,
    color: Colors.darkPlum,
    lineHeight: 20,
  },
  checkinCta: {
    color: Colors.rosePink,
    fontWeight: '600',
  },
  // Sections
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '300',
    color: Colors.darkPlum,
    marginBottom: 16,
  },
  sectionAccent: {
    color: Colors.rosePink,
    fontStyle: 'italic',
  },
  // Booking card
  bookingCard: {
    marginBottom: 12,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingPackageLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: Colors.darkPlumFaint,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  bookingName: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.darkPlum,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
  },
  statusConfirmed: {
    backgroundColor: 'rgba(212, 104, 138, 0.1)',
    borderColor: 'rgba(212, 104, 138, 0.2)',
  },
  statusPending: {
    backgroundColor: 'rgba(90, 138, 106, 0.1)',
    borderColor: 'rgba(90, 138, 106, 0.2)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusTextConfirmed: {
    color: Colors.rosePink,
  },
  statusTextPending: {
    color: Colors.pending,
  },
  bookingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  bookingMetaText: {
    fontSize: 13,
    color: Colors.darkPlumMuted,
    fontWeight: '500',
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.rosePinkLight,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 104, 138, 0.1)',
  },
  whatsappText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.rosePink,
    letterSpacing: 0.5,
  },
  // Quick actions grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    minHeight: 120,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  actionCardPink: {
    backgroundColor: Colors.rosePink,
    borderColor: 'transparent',
    shadowColor: Colors.rosePink,
    shadowOpacity: 0.3,
  },
  actionDecoration: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  actionIcon: {
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.darkPlum,
    lineHeight: 18,
  },
  actionLabelPink: {
    color: Colors.white,
  },
  actionSublabel: {
    fontSize: 11,
    color: Colors.darkPlumMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  actionSublabelPink: {
    color: 'rgba(255,255,255,0.7)',
  },
});
