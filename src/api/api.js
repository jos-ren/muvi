import { getDocs, collection, getDoc, setDoc, addDoc, deleteDoc, deleteDocs, updateDoc, doc, where, query, writeBatch } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/config/firebase.js"

const options = {
    method: "GET",
    headers: {
        accept: "application/json",
        Authorization: "Bearer " + process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN,
    },
};


// ----- CREATE -----
// adds to a Users/uid/MediaList/uid
export const createUserMedia = async (o, list_type, user) => {
    // o = movie object data
    const userRef = doc(db, 'Users', user.uid);
    const subCollectionRef = collection(userRef, 'MediaList');

    // check if already in Users' subcollection
    const querySnapshot = await getDocs(query(subCollectionRef, where('tmdb_id', '==', o.id)));
    const notAdded = querySnapshot.empty
    if (notAdded) {
        try {
            const { media_uid, title } = await createMedia(o);

            let obj = {
                media_uid: media_uid,
                tmdb_id: o.id,
                date_added: new Date(),
                list_type: list_type,
                my_season: 1,
                my_episode: 1,
                my_rating: 0,
            };

            await addDoc(subCollectionRef, obj);
            // onMessage("Added " + title + " to " + capitalizeFirstLetter(list_type), "success")
            console.log("Added " + title + " to " + list_type)
        } catch (err) {
            console.error(err)
        }
    } else {
        // warning if already added to your list
        // onMessage("Already Added", "warning")
        console.log("already added")
    }
}

// adds to Media/uid
const createMedia = async (o) => {
    // check if already in media collection 
    const mediaCollectionRef = collection(db, "Media")
    const querySnapshot = await getDocs(query(mediaCollectionRef, where('key', '==', o.id)));
    let title = o.media_type === "movie" ? o.title : o.name;
    //  if movie does not exists in you Media collection yet
    if (querySnapshot.empty) {
        let release_date = o.media_type === "movie" ? o.release_date : o.first_air_date;
        // determine if anime. animation genre + japanese language = true
        let animation = false
        let g_ids = o.genre_ids
        g_ids.forEach((id) => {
            if (id === 16) {
                animation = true
            }
        })
        let is_anime = o.original_language === "ja" && animation === true ? true : false;
        // get details
        const response = await fetch("https://api.themoviedb.org/3/" + o.media_type + "/" + o.id + "?language=en-US", options);
        let details = await response.json();
        let upcoming_release = o.media_type === "movie" ? details.release_date : (details.next_episode_to_air !== null ? details.next_episode_to_air.air_date : details.last_air_date)

        // need to seperate what need to be added to subcollection vs main media collection
        // basically anything unique to the user will go in the sub
        let obj = {
            title: title,
            release_date: release_date,
            media_type: o.media_type,
            is_anime: is_anime,
            upcoming_release: upcoming_release,
            // these details could change: (new episodes etc, is it better to just use a get everytime and not store these? or have a refresh button to get more current data)
            details: details
        }
        try {
            const docRef = await addDoc(mediaCollectionRef, obj)
            const newDocId = docRef.id;
            if (newDocId) {
                return { media_uid: newDocId, title };
            } else {
                throw new Error('Failed to create media.');
            }
        } catch (err) {
            console.error(err)
        }
    } else {
        const oldDocId = querySnapshot.docs[0].id;
        if (oldDocId) {
            return { media_uid: oldDocId, title };
        } else {
            throw new Error('Failed to create media.');
        }
    }
}


// ----- READ -----

export const getUserMedia = async (uid) => {
    try {
        const userDocRef = doc(db, 'Users', uid);
        const mediaListCollectionRef = collection(userDocRef, 'MediaList');
        const mediaListSnapshot = await getDocs(mediaListCollectionRef);
        const userData = mediaListSnapshot.docs.map((doc) => ({ ...doc.data(), key: doc.id }));
        const combinedData = await processFilteredData(userData);
        return combinedData
    } catch (err) {
        console.error(err)
        // onMessage(`${err.name + ": " + err.code}`, "error");
    }
};

async function processFilteredData(userData) {
    const fetchPromises = userData.map(async (i) => {
        const documentRef = doc(db, 'Media', i.media_uid);
        try {
            const documentSnapshot = await getDoc(documentRef);
            if (documentSnapshot.exists()) {
                const mediaData = documentSnapshot.data();
                return { ...mediaData, ...i };
            } else {
                console.log('Document not found.');
                return null;
            }
        } catch (err) {
            console.error('Error fetching document:', err);
            return null;
        }
    });

    const combinedData = await Promise.all(fetchPromises);
    return combinedData.filter((data) => data !== null);
}

export async function getAllUsersData() {
    try {
        const usersCollection = collection(db, 'Users');
        const querySnapshot = await getDocs(usersCollection);

        const usersData = await Promise.all(querySnapshot.docs.map(async (doc) => {
            // get size of user's MediaList
            const mediaListRef = collection(db, 'Users', doc.id, 'MediaList');
            const snapshot = await getDocs(mediaListRef);
            const count = snapshot.size;

            return { key: doc.id, num_items: count, ...doc.data() };
        }));

        return usersData;
    } catch (err) {
        console.error('Error fetching documents:', err);
        return null;
    }
}

//  ----- UPDATE -----

export const updateUser = async (user, update_type) => {
    const userRef = doc(db, 'Users', user.uid);
    var dataToUpdate = {}
    // to do: need to only set email once, also set role once
    dataToUpdate = { lastLoginTime: new Date(), email: user.email }
    try {
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            // The document exists, so update it
            await updateDoc(userRef, dataToUpdate);
            console.log('user updated.');
        } else {
            // The document doesn't exist, so create it
            await setDoc(userRef, dataToUpdate);
            console.log('user created.');
        }
    } catch (error) {
        console.error('Error updating/creating user: ', error);
    }
}

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

// BUG refresh works but still needs to reload page too, fix this

// update media's upcoming_release date
export const refreshUpdate = (userMedia) => {  
    // tv shows have a status either "Returning Series" or "Ended" or "Cancelled"
    // UPDATE TV
    let returning = userMedia.filter(item => item.details.status === "Returning Series")
    returning.forEach((item) => {
        let details = []
        async function getDetails() {
            const response = await fetch("https://api.themoviedb.org/3/tv/" + item.details.id + "?language=en-US", options);
            details = await response.json();
            // if there is an upcoming episode, update the item's details
            if (details.next_episode_to_air !== null) {
                // check if data is same
                if (details.next_episode_to_air.air_date !== item.upcoming_release) {
                    const dataToUpdate = { upcoming_release: details.next_episode_to_air.air_date, details: details }
                    updateMedia(item.media_uid, dataToUpdate)
                }
            } else {
                // check if it is the correct last_air_date, check if status matches current status
                if (details.last_air_date !== item.upcoming_release || details.status !== item.details.status) {
                    const dataToUpdate = { upcoming_release: details.last_air_date, details: details }
                    updateMedia(item.media_uid, dataToUpdate)
                }
            }
        }
        getDetails()
    })
    if (returning.length === 0) {
        console.log("no updates made")
    }

    // UPDATE MOVIES
        // movies have status either Planned or !== Released

}

// updates Media/uid
export const updateMedia = async (uid, dataToUpdate) => {
    const mediaRef = doc(db, 'Media', uid);
    try {
        const mediaDoc = await getDoc(mediaRef);
        if (mediaDoc.exists()) {
            // The document exists, so update it
            await updateDoc(mediaRef, dataToUpdate);
            console.log('media updated.');
        } else {
            // The document doesn't exist, so create it
            console.log("media doesnt exist...")
        }
    } catch (error) {
        console.error('Error updating media: ', error);
    }
}

// ----- DELETE -----

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
