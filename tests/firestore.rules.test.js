import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, query, collectionGroup, getDocs } from 'firebase/firestore';

let testEnv;

beforeAll(async () => {
  const rules = readFileSync('firestore.rules', 'utf8');
  
  testEnv = await initializeTestEnvironment({
    projectId: "herhealth-africa-test",
    firestore: {
      rules,
      host: '127.0.0.1',
      port: 8080,
    }
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

const unauthed = () => testEnv.unauthenticatedContext().firestore();
const authed = (uid) => testEnv.authenticatedContext(uid).firestore();
const admin = (uid) => testEnv.authenticatedContext(uid, { admin: true }).firestore();

describe('Firestore Security Rules', () => {

  describe('Unauthenticated access', () => {
    it('denies read to users base collection', async () => {
      const db = unauthed();
      await assertFails(getDoc(doc(db, 'users/userA')));
    });
    
    it('denies read to profile data', async () => {
      const db = unauthed();
      await assertFails(getDoc(doc(db, 'users/userA/profile/data')));
    });

    it('denies read to dailyLogs', async () => {
      const db = unauthed();
      await assertFails(getDoc(doc(db, 'users/userA/dailyLogs/log1')));
    });

    it('denies read to bookings', async () => {
      const db = unauthed();
      await assertFails(getDoc(doc(db, 'users/userA/bookings/bk1')));
    });

    it('denies read to specialists', async () => {
      const db = unauthed();
      await assertFails(getDoc(doc(db, 'specialists/spec1')));
    });

    it('denies create to nominations', async () => {
      const db = unauthed();
      await assertFails(setDoc(doc(db, 'nominations/nom1'), { submittedBy: 'anon' }));
    });
  });

  describe('Users collection', () => {
    it('allows normal user to read/write own users doc', async () => {
      const db = authed('userA');
      await assertSucceeds(setDoc(doc(db, 'users/userA'), { name: 'A' }));
      await assertSucceeds(getDoc(doc(db, 'users/userA')));
    });
    
    it('denies normal user reading another users doc', async () => {
      const db = authed('userA');
      await assertFails(getDoc(doc(db, 'users/userB')));
      await assertFails(setDoc(doc(db, 'users/userB'), { name: 'B' }));
    });

    it('allows admin to read base users doc', async () => {
      const dbAdmin = admin('adminA');
      await assertSucceeds(getDoc(doc(dbAdmin, 'users/userB')));
    });

    it('denies admin from reading profile/data and dailyLogs', async () => {
      const dbAdmin = admin('adminA');
      await assertFails(getDoc(doc(dbAdmin, 'users/userB/profile/data')));
      await assertFails(getDoc(doc(dbAdmin, 'users/userB/dailyLogs/log1')));
    });
  });

  describe('Profile & Daily Logs', () => {
    it('allows reading/writing own profile/data and dailyLogs', async () => {
      const db = authed('userA');
      await assertSucceeds(setDoc(doc(db, 'users/userA/profile/data'), { info: 'secret' }));
      await assertSucceeds(setDoc(doc(db, 'users/userA/dailyLogs/log1'), { health: 'good' }));
    });
    
    it('denies reading another user profile/data', async () => {
      const db = authed('userA');
      await assertFails(getDoc(doc(db, 'users/userB/profile/data')));
    });
  });

  describe('Bookings', () => {
    it('allows user to read/write own booking', async () => {
      const db = authed('userA');
      await assertSucceeds(setDoc(doc(db, 'users/userA/bookings/bk1'), { status: 'pending' }));
      await assertSucceeds(getDoc(doc(db, 'users/userA/bookings/bk1')));
    });
    
    it('denies user reading another user booking', async () => {
      const db = authed('userA');
      await assertFails(getDoc(doc(db, 'users/userB/bookings/bk1')));
    });

    it('denies user collectionGroup read', async () => {
      const db = authed('userA');
      const q = query(collectionGroup(db, 'bookings'));
      await assertFails(getDocs(q));
    });

    it('allows admin collectionGroup read and update', async () => {
      const dbAdmin = admin('adminA');
      const q = query(collectionGroup(dbAdmin, 'bookings'));
      await assertSucceeds(getDocs(q));
      
      const dbB = authed('userB');
      await assertSucceeds(setDoc(doc(dbB, 'users/userB/bookings/bk1'), { status: 'pending' }));
      
      await assertSucceeds(updateDoc(doc(dbAdmin, 'users/userB/bookings/bk1'), { status: 'confirmed' }));
    });
  });

  describe('Specialists', () => {
    it('allows normal user to read, denies CRUD', async () => {
      const db = authed('userA');
      await assertSucceeds(getDoc(doc(db, 'specialists/sp1')));
      await assertFails(setDoc(doc(db, 'specialists/sp1'), { name: 'Dr. A' }));
      await assertFails(deleteDoc(doc(db, 'specialists/sp1')));
    });

    it('allows admin to CRUD', async () => {
      const dbAdmin = admin('adminA');
      await assertSucceeds(setDoc(doc(dbAdmin, 'specialists/sp1'), { name: 'Dr. A' }));
      await assertSucceeds(deleteDoc(doc(dbAdmin, 'specialists/sp1')));
    });
  });

  describe('Nominations', () => {
    it('allows user to create own nomination, denies read/delete', async () => {
      const db = authed('userA');
      await assertSucceeds(setDoc(doc(db, 'nominations/nom1'), { submittedBy: 'userA' }));
      await assertFails(setDoc(doc(db, 'nominations/nom2'), { submittedBy: 'userB' })); // spoofing UID
      
      await assertFails(getDoc(doc(db, 'nominations/nom1')));
      await assertFails(deleteDoc(doc(db, 'nominations/nom1')));
    });

    it('allows admin to read and delete', async () => {
      const dbAdmin = admin('adminA');
      await assertSucceeds(getDoc(doc(dbAdmin, 'nominations/nom1')));
      await assertSucceeds(deleteDoc(doc(dbAdmin, 'nominations/nom1')));
      await assertFails(updateDoc(doc(dbAdmin, 'nominations/nom1'), { submittedBy: 'adminA' })); // update is false
    });
  });

  describe('Wins', () => {
    it('allows user to create and delete own win', async () => {
      const db = authed('userA');
      await assertSucceeds(setDoc(doc(db, 'wins/win1'), { senderUid: 'userA', text: 'Yay', celebrations: [] }));
      await assertFails(setDoc(doc(db, 'wins/win2'), { senderUid: 'userB', text: 'Yay', celebrations: [] })); // spoof
      await assertSucceeds(deleteDoc(doc(db, 'wins/win1')));
    });

    it('allows users to update celebrations array only', async () => {
      const db = authed('userA');
      const dbB = authed('userB');
      
      await assertSucceeds(setDoc(doc(dbB, 'wins/win3'), { senderUid: 'userB', text: 'Yay B', celebrations: [] }));

      // Add celebration
      await assertSucceeds(updateDoc(doc(db, 'wins/win3'), { 
        senderUid: 'userB', 
        text: 'Yay B', 
        celebrations: ['userA'] 
      }));

      // Try to change text
      await assertFails(updateDoc(doc(db, 'wins/win3'), { 
        senderUid: 'userB', 
        text: 'Hacked', 
        celebrations: ['userA'] 
      }));
    });
  });

  describe('Chats', () => {
    it('allows read and authorized create', async () => {
      const db = authed('userA');
      await assertSucceeds(getDoc(doc(db, 'chats/circle1/messages/msg1')));
      
      await assertSucceeds(setDoc(doc(db, 'chats/circle1/messages/msg1'), { senderId: 'userA', text: 'Hello' }));
      await assertFails(setDoc(doc(db, 'chats/circle1/messages/msg2'), { senderId: 'userB', text: 'Hello' })); // Spoof
      
      await assertFails(updateDoc(doc(db, 'chats/circle1/messages/msg1'), { text: 'Edited' }));
      await assertSucceeds(deleteDoc(doc(db, 'chats/circle1/messages/msg1')));
    });
  });

  describe('Admin Escalation', () => {
    it('prevents normal user from becoming admin by writing to database', async () => {
      const db = authed('userA');
      
      // Attempt to escalate via own user doc
      await assertSucceeds(setDoc(doc(db, 'users/userA'), { role: 'admin', isAdmin: true }));
      
      // Even with role: admin in the DB, they still cannot access a protected route
      const q = query(collectionGroup(db, 'bookings'));
      await assertFails(getDocs(q));
      
      // They also cannot modify specialists
      await assertFails(setDoc(doc(db, 'specialists/sp2'), { name: 'hacked' }));
    });
  });
});
