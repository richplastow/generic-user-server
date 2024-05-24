import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import serviceAccount from './generic-user-server-b1e5cdda35e0.json' assert { type: 'json' };

initializeApp(serviceAccount);

const db = getFirestore();

const adminUserRef = db.collection('users').doc('admin');
const doc = await adminUserRef.get();
if (!doc.exists) {
  console.log('No such document!');
} else {
  console.log('Document data:', doc.data());
}
