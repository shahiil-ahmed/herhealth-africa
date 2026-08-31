import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { doc, onSnapshot, setDoc, serverTimestamp, Timestamp, collection, query, where, getDocs, writeBatch, deleteDoc } from 'firebase/firestore';
import { updateProfile, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { auth, db } from '../../firebase/firebaseConfig';
import Colors from '../../constants/colors';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

// ─── Edit Profile Modal ───────────────────────────────────────────────────────
function EditProfileModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [fullName, setFullName] = useState('');
  const [healthGoals, setHealthGoals] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible && auth.currentUser) {
      setFullName(auth.currentUser.displayName || '');
    }
  }, [visible]);

  const handleSave = async () => {
    if (!fullName.trim() || !auth.currentUser) return;
    setIsSaving(true);
    try {
      await setDoc(
        doc(db, 'users', auth.currentUser.uid, 'profile', 'data'),
        { fullName: fullName.trim(), healthGoals: healthGoals.trim(), updatedAt: new Date() },
        { merge: true }
      );
      await updateProfile(auth.currentUser, { displayName: fullName.trim() });
      onClose();
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />
          <Text style={modalStyles.title}>
            Edit <Text style={modalStyles.titleAccent}>Profile</Text>
          </Text>

          <Text style={modalStyles.fieldLabel}>Full name</Text>
          <TextInput
            style={modalStyles.input}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            placeholderTextColor={Colors.darkPlumFaint}
          />

          <Text style={modalStyles.fieldLabel}>Email (read-only)</Text>
          <TextInput
            style={[modalStyles.input, modalStyles.inputDisabled]}
            value={auth.currentUser?.email || ''}
            editable={false}
          />

          <Text style={modalStyles.fieldLabel}>Health goals</Text>
          <TextInput
            style={[modalStyles.input, modalStyles.textArea]}
            value={healthGoals}
            onChangeText={setHealthGoals}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            placeholder="What are you working towards?"
            placeholderTextColor={Colors.darkPlumFaint}
          />

          <Button title={isSaving ? 'Saving...' : 'Save changes'} onPress={handleSave} loading={isSaving} style={modalStyles.saveBtn} />
          <Button title="Cancel" onPress={onClose} variant="ghost" />
        </View>
      </View>
    </Modal>
  );
}

// ─── Cycle Settings Modal ─────────────────────────────────────────────────────
function CycleSettingsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  const [periodLength, setPeriodLength] = useState('5');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!auth.currentUser || !lastPeriodDate) return;
    setIsSaving(true);
    try {
      await setDoc(
        doc(db, 'users', auth.currentUser.uid, 'profile', 'data'),
        {
          lastPeriodStart: Timestamp.fromDate(new Date(lastPeriodDate)),
          cycleLength: Number(cycleLength),
          periodLength: Number(periodLength),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      onClose();
    } catch (e) {
      Alert.alert('Error', 'Failed to save cycle settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />
          <Text style={modalStyles.title}>
            Cycle <Text style={modalStyles.titleAccent}>Settings</Text>
          </Text>

          <Text style={modalStyles.fieldLabel}>Last period start date (YYYY-MM-DD)</Text>
          <TextInput
            style={modalStyles.input}
            value={lastPeriodDate}
            onChangeText={setLastPeriodDate}
            placeholder="e.g. 2024-01-15"
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

          <Button title="Save Settings →" onPress={handleSave} loading={isSaving} disabled={!lastPeriodDate} style={modalStyles.saveBtn} />
          <Button title="Cancel" onPress={onClose} variant="ghost" />
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(45, 27, 46, 0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFF9FA', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 28, paddingBottom: 40,
  },
  handle: {
    width: 48, height: 6, backgroundColor: '#E8DCE5', borderRadius: 3,
    alignSelf: 'center', marginBottom: 24,
  },
  title: { fontSize: 24, fontWeight: '500', color: Colors.darkPlum, marginBottom: 20 },
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
  inputDisabled: { opacity: 0.5, borderColor: Colors.borderMedium },
  textArea: { minHeight: 80, paddingTop: 14 },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  saveBtn: { marginBottom: 8 },
});

// ─── Delete Account Modal ─────────────────────────────────────────────────────
function DeleteAccountModal({ visible, onClose, onLogout }: { visible: boolean; onClose: () => void; onLogout: () => void }) {
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!password || !auth.currentUser) {
      Alert.alert('Error', 'Please enter your password.');
      return;
    }
    Alert.alert(
      'Final Warning',
      'This will permanently delete your account, health data, and community posts. This cannot be undone. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              const user = auth.currentUser!;
              const uid = user.uid;

              // 1. Re-authenticate
              const credential = EmailAuthProvider.credential(user.email!, password);
              await reauthenticateWithCredential(user, credential);

              // 2. Delete user-owned Firestore data (dailyLogs, bookings)
              const deleteSubcollection = async (colPath: string) => {
                const q = query(collection(db, colPath));
                const snap = await getDocs(q);
                const batch = writeBatch(db);
                let count = 0;
                snap.docs.forEach((d) => {
                  batch.delete(d.ref);
                  count++;
                });
                if (count > 0) await batch.commit();
              };
              
              await deleteSubcollection(`users/${uid}/dailyLogs`);
              await deleteSubcollection(`users/${uid}/bookings`);

              // 3. Delete community messages
              const CIRCLES = ['period-hormone', 'food-gut', 'sleep-stress', 'fatigue', 'fertility', 'sports-exercise', 'menopause'];
              for (const circleId of CIRCLES) {
                const msgQ = query(collection(db, `chats/${circleId}/messages`), where('senderId', '==', uid));
                const msgSnap = await getDocs(msgQ);
                if (!msgSnap.empty) {
                  // If there are more than 500 messages, we need multiple batches. For now, assuming < 500 for a single circle.
                  // Firebase batch limit is 500. A simple chunking could be added if needed, but 500 per circle is high for this app.
                  const batch = writeBatch(db);
                  msgSnap.docs.forEach((d) => batch.delete(d.ref));
                  await batch.commit();
                }
              }

              // 4. Delete profile data & user doc
              await deleteDoc(doc(db, 'users', uid, 'profile', 'data'));
              await deleteDoc(doc(db, 'users', uid));

              // 5. Delete Firebase Auth account
              await deleteUser(user);

              // 6. Clear local state and navigate to Login
              await onLogout();
              
            } catch (e: any) {
              console.error('Deletion failure:', e.code);
              let msg = 'Failed to delete account. Please try again or contact support.';
              if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
                msg = 'Incorrect password.';
              } else if (e.code === 'auth/too-many-requests') {
                msg = 'Too many attempts. Please try again later.';
              }
              Alert.alert('Error', msg);
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />
          <Text style={modalStyles.title}>
            Delete <Text style={[modalStyles.titleAccent, { color: '#E53935' }]}>Account</Text>
          </Text>
          <Text style={modalStyles.subtitle}>
            This action is permanent and will delete all your health data, bookings, and community messages.
          </Text>

          <Text style={modalStyles.fieldLabel}>Enter Password to Confirm</Text>
          <TextInput
            style={modalStyles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Your password"
            placeholderTextColor={Colors.darkPlumFaint}
          />

          <Button
            title={isDeleting ? 'Deleting...' : 'Delete Account Forever'}
            onPress={handleDelete}
            loading={isDeleting}
            disabled={!password || isDeleting}
            style={Object.assign({}, StyleSheet.flatten(modalStyles.saveBtn), { backgroundColor: '#E53935' })}
          />
          <Button title="Cancel" onPress={onClose} variant="ghost" disabled={isDeleting} />
        </View>
      </View>
    </Modal>
  );
}


// ─── Main Profile Screen ──────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { currentUser, logout } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [cycleModalOpen, setCycleModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = onSnapshot(
      doc(db, 'users', currentUser.uid, 'profile', 'data'),
      (snap) => { if (snap.exists()) setProfileData(snap.data()); }
    );
    return () => unsubscribe();
  }, [currentUser]);

  const userName = profileData?.fullName || currentUser?.displayName || 'Sister';
  const userInitial = userName[0]?.toUpperCase() || 'S';
  const userEmail = currentUser?.email || '';

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try { await logout(); } catch (e) { console.error(e); }
        },
      },
    ]);
  };

  const settingsItems = [
    { icon: 'person-outline', title: 'Edit Profile', desc: 'Name, photo, health goals', onPress: () => setEditModalOpen(true) },
    { icon: 'notifications-outline', title: 'Notifications', desc: 'Daily reminders & updates', onPress: () => {} },
    { icon: 'calendar-outline', title: 'Cycle Settings', desc: 'Period length, cycle length', onPress: () => setCycleModalOpen(true) },
    { icon: 'lock-closed-outline', title: 'Privacy & Data', desc: 'Your health data is yours', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>
            Your <Text style={styles.pageTitleAccent}>Profile</Text>
          </Text>
        </View>

        {/* Profile Card */}
        <Card variant="dark" style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userInitial}</Text>
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.profileNameRow}>
                <Text style={styles.profileName}>{userName}</Text>
                <Ionicons name="sparkles" size={16} color={Colors.rosePink} />
              </View>
              <Text style={styles.profileEmail}>{userEmail}</Text>
            </View>
          </View>
        </Card>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { value: '0', label: 'Days Logged' },
            { value: '0', label: 'Day Streak' },
            { value: '1', label: 'Member Since' },
          ].map((stat, i) => (
            <Card key={i} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Card>
          ))}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Account <Text style={styles.sectionAccent}>Settings</Text>
          </Text>
          <View style={styles.settingsList}>
            {settingsItems.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.settingsItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.settingsIconBox}>
                  <Ionicons name={item.icon as any} size={18} color={Colors.darkPlum} />
                </View>
                <View style={styles.settingsText}>
                  <Text style={styles.settingsTitle}>{item.title}</Text>
                  <Text style={styles.settingsDesc}>{item.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.darkPlumFaint} />
              </TouchableOpacity>
            ))}

            {/* Logout */}
            <TouchableOpacity
              style={styles.settingsItem}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={[styles.settingsIconBox, styles.logoutIconBox]}>
                <Ionicons name="log-out-outline" size={18} color={Colors.rosePink} />
              </View>
              <View style={styles.settingsText}>
                <Text style={[styles.settingsTitle, styles.logoutTitle]}>Sign Out</Text>
                <Text style={styles.settingsDesc}>See you soon 🌸</Text>
              </View>
            </TouchableOpacity>
            {/* Delete Account */}
            <TouchableOpacity
              style={styles.settingsItem}
              onPress={() => setDeleteModalOpen(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.settingsIconBox, styles.logoutIconBox, { backgroundColor: '#FFEBEE' }]}>
                <Ionicons name="trash-outline" size={18} color="#E53935" />
              </View>
              <View style={styles.settingsText}>
                <Text style={[styles.settingsTitle, { color: '#E53935' }]}>Delete Account</Text>
                <Text style={styles.settingsDesc}>Permanently remove all data</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <EditProfileModal visible={editModalOpen} onClose={() => setEditModalOpen(false)} />
      <CycleSettingsModal visible={cycleModalOpen} onClose={() => setCycleModalOpen(false)} />
      <DeleteAccountModal visible={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onLogout={async () => {
        setDeleteModalOpen(false);
        try { await logout(); } catch (e) { console.error(e); }
      }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.petal },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },
  pageTitle: { fontSize: 24, fontWeight: '500', color: Colors.darkPlum },
  pageTitleAccent: { color: Colors.rosePink, fontStyle: 'italic' },
  // Profile card
  profileCard: { marginHorizontal: 16, marginBottom: 16 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.rosePink,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarText: { fontSize: 26, fontWeight: '600', color: Colors.white },
  profileInfo: { flex: 1 },
  profileNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  profileName: { fontSize: 20, fontWeight: '600', color: Colors.white },
  profileEmail: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  // Stats
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 24 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statValue: { fontSize: 24, fontWeight: '700', color: Colors.rosePink, marginBottom: 4 },
  statLabel: { fontSize: 10, fontWeight: '600', color: Colors.darkPlum, textAlign: 'center', lineHeight: 14 },
  // Settings
  section: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '500', color: Colors.darkPlum, marginBottom: 16 },
  sectionAccent: { color: Colors.rosePink, fontStyle: 'italic' },
  settingsList: { gap: 10 },
  settingsItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.white, borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  settingsIconBox: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.offWhite,
    alignItems: 'center', justifyContent: 'center',
  },
  logoutIconBox: { backgroundColor: Colors.rosePinkLight },
  settingsText: { flex: 1 },
  settingsTitle: { fontSize: 14, fontWeight: '600', color: Colors.darkPlum },
  settingsDesc: { fontSize: 12, color: Colors.darkPlumMuted, marginTop: 2 },
  logoutTitle: { color: Colors.rosePink },
});
