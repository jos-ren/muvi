import { getDocs, collection, getDoc, setDoc, addDoc, updateDoc, doc, where, query, writeBatch, documentId } from "firebase/firestore"
import { db } from "@/config/firebase.js"
import { capitalizeFirstLetter } from "@/api/utils"

const options = {
    method: "GET",
    headers: {
        accept: "application/json",
        Authorization: "Bearer " + process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN,
    },
};

// ----- CREATE -----
// adds to a Users/uid/MediaList/uid
export const createUserMedia = async (o, list_type, user_uid) => {
    // o = movie object data
    const userRef = doc(db, 'Users', user_uid);
    const subCollectionRef = collection(userRef, 'MediaList');

    // check if already in Users' subcollection
    const querySnapshot = await getDocs(query(subCollectionRef, where('tmdb_id', '==', o.id)));
    const notAdded = querySnapshot.empty

    if (notAdded) {
        try {
            const { media_uid, title } = await createMedia(o);
            console.log(media_uid, title)

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
            return { message: "Added " + title + " to " + capitalizeFirstLetter(list_type), type: "success" };
        } catch (err) {
            console.error(err)
        }
    } else {
        // warning if already added to your list
        return { message: "Already Added", type: "warning" }
    }
}

// adds to Media/uid
const createMedia = async (o) => {
    // check if already in media collection 
    const mediaCollectionRef = collection(db, "Media")
    const querySnapshot = await getDocs(query(mediaCollectionRef, where('details.id', '==', o.id)));

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
        // get more details
        const response = await fetch("https://api.themoviedb.org/3/" + o.media_type + "/" + o.id + "?language=en-US", options);
        let details = await response.json();
        let upcoming_release = o.media_type === "movie" ? details.release_date : (details.next_episode_to_air !== null ? details.next_episode_to_air.air_date : details.last_air_date)

        // basically anything unique to the user will go in the sub
        let obj = {
            title: title,
            release_date: release_date,
            media_type: o.media_type,
            is_anime: is_anime,
            upcoming_release: upcoming_release,
            details: details
        }

        const docRef = await addDoc(mediaCollectionRef, obj)
        const newDocId = docRef.id;
        return { media_uid: newDocId, title };

    } else {
        const oldDocId = querySnapshot.docs[0].id;
        return { media_uid: oldDocId, title };
    }
}

export const uploadJSON = async (user_uid) => {
    const response = await fetch('my-data.json');
    const data = await response.json();
    for (let i = 0; i < 1; i++) {
        const item = data[i];
        console.log(item.details.id, item.title, item.list_type, user_uid, item);
    }
}

// ----- READ -----

export const getUserMedia = async (uid) => {
    try {
        const userDocRef = doc(db, 'Users', uid);
        const mediaListCollectionRef = collection(userDocRef, 'MediaList');
        const mediaListSnapshot = await getDocs(mediaListCollectionRef);
        const userData = mediaListSnapshot.docs.map((doc) => ({ ...doc.data(), key: doc.id }));
        if (userData.length === 0) {
            return []
        }

        // Get the document IDs directly from the MediaList collection
        const media_ids = mediaListSnapshot.docs.map((doc) => doc.data().media_uid);

        const mediaRef = collection(db, 'Media');
        // Use where-in query to fetch only documents with specified document IDs
        const mediaQuery = query(mediaRef, where(documentId(), 'in', media_ids));
        const mediaSnapshots = await getDocs(mediaQuery);

        const combinedData = mediaSnapshots.docs.map((docSnapshot, index) => {
            const mediaData = docSnapshot.exists() ? docSnapshot.data() : null;
            return mediaData ? { ...mediaData, ...userData[index] } : null;
        });

        // await Promise.all(docIds.map(id => getDoc(doc(parentColRef, id))) 

        return combinedData.filter((data) => data !== null);
    } catch (err) {
        console.error('Error in getUserMedia:', err);
    }
};

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

export const getUserData = async (user) => {
    const userRef = doc(db, 'Users', user.uid);

    try {
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            updateUser(user, 'refresh_last_login')
            return userDoc.data();
        } else {
            return null; // User not found
        }
    } catch (error) {
        console.error('Error getting user data:', error);
        throw error;
    }
};

//  ----- UPDATE -----

export const updateUser = async (user, update_type) => {
    // update_type can be update_time, or first_login
    const userRef = doc(db, 'Users', user.uid);
    var dataToUpdate = {}
    // to do: need to only set email once, also set role once
    if (update_type === 'first_login') {
        dataToUpdate = { lastLoginTime: new Date(), email: user.email, role: "user" }
    } else if (update_type === 'refresh_last_login') {
        dataToUpdate = { lastLoginTime: new Date() }
    }

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

export const refreshUpdate = async (userMedia) => {
    // TV shows have a status either "Returning Series" or "Ended" or "Cancelled"
    // UPDATE TV
    let numUpdated = 0;
    let returning = userMedia.filter(item => item.details.status === "Returning Series")

    const fetchDetails = async (item) => {
        const response = await fetch("https://api.themoviedb.org/3/tv/" + item.details.id + "?language=en-US", options);
        const details = await response.json();
        console.log(item.title);

        if (details.next_episode_to_air !== null) {
            if (details.next_episode_to_air.air_date !== item.upcoming_release) {
                const dataToUpdate = { upcoming_release: details.next_episode_to_air.air_date, details: details };
                await updateMedia(item.media_uid, dataToUpdate);
                numUpdated += 1;
            }
        } else {
            if (details.last_air_date !== item.upcoming_release || details.status !== item.details.status) {
                const dataToUpdate = { upcoming_release: details.last_air_date, details: details };
                await updateMedia(item.media_uid, dataToUpdate);
                numUpdated += 1;
            }
        }
    };

    const fetchDetailsPromises = returning.map(fetchDetails);

    // Wait for all asynchronous operations to complete
    await Promise.all(fetchDetailsPromises);

    console.log("updated " + numUpdated + " items");

    if (numUpdated === 0) {
        return { message: "List is up to date", type: "info" };
    } else {
        return { message: "Refreshed List", type: "success" };
    }

    // UPDATE MOVIES
    // Movies have status either Planned or !== Released
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
    const batch = writeBatch(db);

    console.log(selected)
    for (const docId of selected) {

        // Fetch document from 'Users' collection
        const docRef = doc(db, 'Users', user.uid, 'MediaList', docId);
        const docSnapshot = await getDoc(docRef);

        // Retrieve data from the fetched document
        const docData = docSnapshot.data();
        console.log(docData.media_uid, "docData", docId);

        // Fetch document from 'Media' collection based on 'media_uid'
        const mediaDocRef = doc(db, 'Media', docData.media_uid);
        const mediaDocSnapshot = await getDoc(mediaDocRef);

        // Retrieve data from the fetched 'Media' document
        const mediaDocData = mediaDocSnapshot.data();
        console.log(mediaDocData.title);



        batch.delete(docRef);
    }
    try {
        await batch.commit();
    } catch (err) {
        console.error(err);
    }
};

export const moveItemList2 = async (location, userID, selected) => {
    const updatedData = { list_type: location };
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
