import { getDocs, collection, getDoc, setDoc, addDoc, deleteDoc, deleteDocs, updateDoc, doc, where, query, writeBatch } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/config/firebase.js"

export const deleteUserMedia = async (selected, user) => {
    const userID = user.uid;
    const batch = writeBatch(db);

    for (const docId of selected) {
        const docRef = doc(db, 'Users', userID, 'MediaList', docId);
        batch.delete(docRef);
    }
    try {
        await batch.commit();
    } catch (err) {
        console.error(err);
    }
};

// to change rating, progress, etc
export const updateUserMedia = async (mediaID, userID, updatedData) => {
    try {
        await updateDoc(doc(db, 'Users', userID, 'MediaList', mediaID), updatedData)
    } catch (err) {
        console.error(err);
    }
}

// to change list type
export const moveItemList = async (location, userID, selected) => {
    const updatedData = {
        list_type: location,
    };
    const batch = writeBatch(db);

    for (const docId of selected) {
        const docRef = doc(db, 'Users', userID, 'MediaList', docId);
        batch.update(docRef, updatedData);
    }

    try {
        await batch.commit();
    } catch (err) {
        console.error(err);
    }
};