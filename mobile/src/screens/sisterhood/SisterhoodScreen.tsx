import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
  doc,
  arrayUnion,
  limit,
} from 'firebase/firestore';
import { auth, db } from '../../firebase/firebaseConfig';
import Colors from '../../constants/colors';
import Card from '../../components/ui/Card';
import AppHeader from '../../components/ui/AppHeader';

// ─── Tab bar height constant (matches TabNavigator) ──────────────────────────
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 70;

const CIRCLES = [
  { id: 'period-hormone', name: 'Period & hormone health', icon: 'refresh-outline' },
  { id: 'food-gut', name: 'Food & gut health', icon: 'leaf-outline' },
  { id: 'sleep-stress', name: 'Sleep & stress', icon: 'moon-outline' },
  { id: 'fatigue', name: 'Energy & fatigue', icon: 'pulse-outline' },
  { id: 'fertility', name: 'Fertility & conception', icon: 'flower-outline' },
  { id: 'sports-exercise', name: 'Sports & exercise', icon: 'barbell-outline' },
  { id: 'menopause', name: 'Perimenopause & menopause', icon: 'flash-outline' },
];

interface Circle {
  id: string;
  name: string;
  icon: string;
}

interface Win {
  id: string;
  text: string;
  senderInitial: string;
  senderUid: string;
  celebrations: string[];
  createdAt: any;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderInitial: string;
  createdAt: any;
}

function getUserInitial(): string {
  if (auth.currentUser?.displayName) return auth.currentUser.displayName[0].toUpperCase();
  if (auth.currentUser?.email) return auth.currentUser.email[0].toUpperCase();
  return 'U';
}

function formatTime(createdAt: any): string {
  if (!createdAt) return '';
  try {
    const date = createdAt.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

// ─── Chat Room ────────────────────────────────────────────────────────────────
function ChatRoom({ circle, onBack }: { circle: Circle; onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, `chats/${circle.id}/messages`),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message)).reverse();
        setMessages(msgs);
        setLoading(false);
        // Scroll to bottom after messages load
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 150);
      },
      (error) => {
        console.error('Chat listener error:', error);
        Alert.alert('Error', 'Failed to load messages.');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [circle.id]);

  const handleSend = async () => {
    const text = newMessage.trim();
    if (!text || !auth.currentUser || sending) return;
    setNewMessage('');
    setSending(true);
    try {
      await addDoc(collection(db, `chats/${circle.id}/messages`), {
        text,
        senderId: auth.currentUser.uid,
        senderInitial: getUserInitial(),
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error('Error sending message:', e);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.senderId === auth.currentUser?.uid;
    const prevSender = index > 0 ? messages[index - 1].senderId : null;
    const nextSender = index < messages.length - 1 ? messages[index + 1].senderId : null;
    const isFirst = prevSender !== item.senderId;
    const isLast = nextSender !== item.senderId;

    return (
      <View
        style={[
          chatStyles.msgRow,
          isMe ? chatStyles.msgRowMe : chatStyles.msgRowOther,
          isFirst && chatStyles.msgFirstInGroup,
        ]}
      >
        {/* Avatar slot for other users */}
        {!isMe && (
          <View style={chatStyles.avatarSlot}>
            {isFirst ? (
              <View style={chatStyles.avatar}>
                <Text style={chatStyles.avatarText}>{item.senderInitial}</Text>
              </View>
            ) : (
              <View style={chatStyles.avatarPlaceholder} />
            )}
          </View>
        )}

        <View style={[chatStyles.msgContent, isMe ? chatStyles.msgContentMe : chatStyles.msgContentOther]}>
          <View style={[chatStyles.bubble, isMe ? chatStyles.bubbleMe : chatStyles.bubbleOther]}>
            <Text style={[chatStyles.bubbleText, isMe && chatStyles.bubbleTextMe]}>
              {item.text}
            </Text>
          </View>
          {isLast && (
            <Text style={chatStyles.timestamp}>{formatTime(item.createdAt)}</Text>
          )}
        </View>
      </View>
    );
  };

  // Bottom padding = tab bar height so input sits above the tab bar
  const inputBottomPadding = TAB_BAR_HEIGHT + (Platform.OS === 'ios' ? 0 : 8);

  return (
    <View style={chatStyles.container}>
      {/* Header — sits below status bar (SafeAreaView handles top inset) */}
      <View style={chatStyles.header}>
        <TouchableOpacity onPress={onBack} style={chatStyles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={22} color={Colors.darkPlum} />
        </TouchableOpacity>
        <View style={chatStyles.headerText}>
          <Text style={chatStyles.headerTitle}>{circle.name}</Text>
          <Text style={chatStyles.headerSub}>Live community</Text>
        </View>
      </View>

      {/* Message list */}
      <KeyboardAvoidingView
        style={chatStyles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 56 : 0}
      >
        {loading ? (
          <View style={chatStyles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.rosePink} />
            <Text style={chatStyles.loadingText}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={[
              chatStyles.messageList,
              { paddingBottom: inputBottomPadding + 72 }, // 72 = input row height
            ]}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            ListEmptyComponent={
              <View style={chatStyles.emptyContainer}>
                <Text style={chatStyles.emptyEmoji}>🌸</Text>
                <Text style={chatStyles.emptyText}>
                  Be the first to post in this circle
                </Text>
                <Text style={chatStyles.emptySubtext}>
                  This is a safe, anonymous space.
                </Text>
              </View>
            }
          />
        )}

        {/* Input bar — positioned above the tab bar */}
        <View style={[chatStyles.inputRow, { paddingBottom: inputBottomPadding }]}>
          <TextInput
            style={chatStyles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Write anonymously..."
            placeholderTextColor={Colors.darkPlumFaint}
            multiline
            maxLength={500}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[chatStyles.sendBtn, (!newMessage.trim() || sending) && chatStyles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!newMessage.trim() || sending}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Ionicons name="send" size={18} color={Colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const chatStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.petal,
  },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.petal,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(45,27,46,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 15, fontWeight: '700', color: Colors.darkPlum },
  headerSub: { fontSize: 10, fontWeight: '700', color: '#059669', letterSpacing: 1, marginTop: 1 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { fontSize: 13, color: Colors.darkPlumMuted },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  msgRowMe: { justifyContent: 'flex-end' },
  msgRowOther: { justifyContent: 'flex-start' },
  msgFirstInGroup: { marginTop: 16 },
  avatarSlot: { width: 36, marginRight: 8, justifyContent: 'flex-end' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.rosePink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 12, fontWeight: '700', color: Colors.white },
  avatarPlaceholder: { width: 32 },
  msgContent: { maxWidth: '80%' },
  msgContentMe: { alignItems: 'flex-end' },
  msgContentOther: { alignItems: 'flex-start' },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMe: {
    backgroundColor: Colors.rosePink,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bubbleText: { fontSize: 14, color: Colors.darkPlum, lineHeight: 20 },
  bubbleTextMe: { color: Colors.white },
  timestamp: {
    fontSize: 10,
    color: 'rgba(156,163,175,0.7)',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyEmoji: { fontSize: 36, marginBottom: 8 },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.darkPlum,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.darkPlumMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Input bar
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.petal,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.darkPlum,
    maxHeight: 100,
    minHeight: 44,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.rosePink,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.rosePink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendBtnDisabled: { opacity: 0.45, shadowOpacity: 0 },
});

// ─── Main Sisterhood Screen ───────────────────────────────────────────────────
export default function SisterhoodScreen() {
  const [activeCircle, setActiveCircle] = useState<Circle | null>(null);
  const [wins, setWins] = useState<Win[]>([]);
  const [newWin, setNewWin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'wins'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setWins(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Win)));
      },
      (error) => {
        console.error('Wins listener error:', error);
        Alert.alert('Error', 'Failed to load community wins.');
      }
    );
    return () => unsubscribe();
  }, []);

  const handleShareWin = async () => {
    if (!newWin.trim() || !auth.currentUser) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'wins'), {
        text: newWin.trim(),
        senderUid: auth.currentUser.uid,
        senderInitial: getUserInitial(),
        celebrations: [],
        createdAt: serverTimestamp(),
      });
      setNewWin('');
    } catch (e) {
      console.error('Error sharing win:', e);
      Alert.alert('Error', 'Failed to share win. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCelebrate = async (winId: string) => {
    if (!auth.currentUser) return;
    try {
      await updateDoc(doc(db, 'wins', winId), {
        celebrations: arrayUnion(auth.currentUser.uid),
      });
    } catch (e) {
      console.error('Error celebrating:', e);
      Alert.alert('Error', 'Failed to celebrate. Please try again.');
    }
  };

  // ── Chat room view ──────────────────────────────────────────────────────────
  if (activeCircle) {
    return (
      // Only top safe area — bottom is handled manually to sit above tab bar
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ChatRoom circle={activeCircle} onBack={() => setActiveCircle(null)} />
      </SafeAreaView>
    );
  }

  // ── Main list view ──────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            The <Text style={styles.titleAccent}>Sisterhood</Text>
          </Text>
          <Text style={styles.subtitle}>A safe, anonymous space to heal together.</Text>
        </View>

        {/* Circles Grid */}
        <View style={styles.circlesGrid}>
          {CIRCLES.map((circle, index) => {
            const isLastOdd = index === CIRCLES.length - 1 && CIRCLES.length % 2 !== 0;
            return (
              <TouchableOpacity
                key={circle.id}
                style={[styles.circleCard, isLastOdd && styles.circleCardFull]}
                onPress={() => setActiveCircle(circle)}
                activeOpacity={0.8}
              >
                <View style={styles.circleIconBox}>
                  <Ionicons name={circle.icon as any} size={26} color={Colors.rosePink} />
                </View>
                <Text style={styles.circleName}>{circle.name}</Text>
                <Text style={styles.circleHint}>Tap to join the conversation</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Wins Board */}
        <View style={styles.winsSection}>
          <View style={styles.winsSectionHeader}>
            <Ionicons name="trophy-outline" size={14} color={Colors.rosePink} />
            <Text style={styles.winsSectionTitle}>Community wins 🏆</Text>
          </View>

          {/* Share Win Input */}
          <Card style={styles.shareWinCard}>
            <TextInput
              style={styles.winInput}
              value={newWin}
              onChangeText={setNewWin}
              placeholder="What are we celebrating today?"
              placeholderTextColor={Colors.darkPlumFaint}
              multiline
              maxLength={280}
            />
            <View style={styles.winInputFooter}>
              <Text style={styles.winCharCount}>{newWin.length}/280</Text>
              <TouchableOpacity
                style={[
                  styles.shareWinBtn,
                  (!newWin.trim() || isSubmitting) && styles.shareWinBtnDisabled,
                ]}
                onPress={handleShareWin}
                disabled={!newWin.trim() || isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.shareWinBtnText}>Share My Win</Text>
                )}
              </TouchableOpacity>
            </View>
          </Card>

          {/* Wins List */}
          {wins.length === 0 && (
            <Text style={styles.noWinsText}>
              No wins shared yet. Be the first! 🌸
            </Text>
          )}
          {wins.map((win) => {
            const hasCelebrated = win.celebrations?.includes(auth.currentUser?.uid || '');
            return (
              <Card key={win.id} style={styles.winCard}>
                <View style={styles.winRow}>
                  <View style={styles.winAvatar}>
                    <Text style={styles.winAvatarText}>{win.senderInitial}</Text>
                  </View>
                  <View style={styles.winContent}>
                    <Text style={styles.winText}>{win.text}</Text>
                    <TouchableOpacity
                      style={[styles.celebrateBtn, hasCelebrated && styles.celebrateBtnActive]}
                      onPress={() => handleCelebrate(win.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={hasCelebrated ? 'heart' : 'heart-outline'}
                        size={12}
                        color={hasCelebrated ? Colors.white : Colors.rosePink}
                      />
                      <Text
                        style={[
                          styles.celebrateBtnText,
                          hasCelebrated && styles.celebrateBtnTextActive,
                        ]}
                      >
                        {win.celebrations?.length || 0} Celebrations
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.petal },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: TAB_BAR_HEIGHT + 24 },
  header: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '500', color: Colors.darkPlum, marginBottom: 8 },
  titleAccent: { color: Colors.rosePink, fontStyle: 'italic' },
  subtitle: { fontSize: 14, color: Colors.darkPlumMuted },
  // Circles
  circlesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 32,
  },
  circleCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 28,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  circleCardFull: { width: '100%' },
  circleIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.rosePinkLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  circleName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.darkPlum,
    textAlign: 'center',
    lineHeight: 18,
  },
  circleHint: { fontSize: 10, color: Colors.darkPlumFaint, marginTop: 4, textAlign: 'center' },
  // Wins
  winsSection: { paddingHorizontal: 16 },
  winsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  winsSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: Colors.darkPlumFaint,
    textTransform: 'uppercase',
  },
  shareWinCard: { marginBottom: 16 },
  winInput: {
    fontSize: 14,
    color: Colors.darkPlum,
    minHeight: 80,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  winInputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    marginTop: 8,
  },
  winCharCount: { fontSize: 10, color: Colors.darkPlumFaint, fontWeight: '500' },
  shareWinBtn: {
    backgroundColor: Colors.rosePink,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    minWidth: 100,
    alignItems: 'center',
  },
  shareWinBtnDisabled: { opacity: 0.5 },
  shareWinBtnText: { fontSize: 11, fontWeight: '700', color: Colors.white },
  noWinsText: {
    fontSize: 13,
    color: Colors.darkPlumFaint,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 24,
  },
  winCard: { marginBottom: 12 },
  winRow: { flexDirection: 'row', gap: 14 },
  winAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.rosePink,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  winAvatarText: { fontSize: 16, fontWeight: '700', color: Colors.white },
  winContent: { flex: 1 },
  winText: { fontSize: 14, color: Colors.darkPlum, lineHeight: 22, marginBottom: 10 },
  celebrateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(212, 104, 138, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  celebrateBtnActive: { backgroundColor: Colors.rosePink },
  celebrateBtnText: { fontSize: 10, fontWeight: '700', color: Colors.rosePink },
  celebrateBtnTextActive: { color: Colors.white },
});
