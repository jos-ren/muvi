import { getDocs, collection, getDoc, setDoc, addDoc, updateDoc, doc, where, query, writeBatch, FieldPath, collectionGroup, documentId } from "firebase/firestore"
import { db, auth } from "@/config/firebase.js"
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

    // If already added to user's list return a warning
    if (!notAdded) {
        return { message: "Already Added", type: "warning" }
    }

    try {

        // --- ORGANIZING DATA ---
        let title = o.media_type === "movie" ? o.title : o.name;
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

        let obj = {
            tmdb_id: o.id,
            // custom fields
            date_added: new Date(),
            list_type: list_type,
            my_season: 1,
            my_episode: 1,
            my_rating: 0,
            // data fields
            title: title,
            release_date: release_date,
            media_type: o.media_type,
            is_anime: is_anime,
            upcoming_release: upcoming_release,
            details: details
        };

        await addDoc(subCollectionRef, obj);
        return { message: "Added " + title + " to " + capitalizeFirstLetter(list_type), type: "success" };
    } catch (err) {
        console.error(err)
        throw new Error('Failed to add media to the list');
    }
}

// ----- READ -----

export const getUserMedia = async (uid) => {
    try {
        // get a User's MediaList items
        const userDocRef = doc(db, 'Users', uid);
        const mediaListCollectionRef = collection(userDocRef, 'MediaList');
        const mediaListSnapshot = await getDocs(mediaListCollectionRef);

        // if no data
        if (mediaListSnapshot.empty) {
            return [];
        }

        // Extract user data from the MediaList documents
        const userMediaList = mediaListSnapshot.docs.map((doc) => ({ ...doc.data(), key: doc.id }));

        return userMediaList

    } catch (err) {
        console.error('Error in getUserMedia:', err);
        // Return an empty array in case of an error
        return [];
    }
};

export async function getAllUsersData() {
    try {
        const usersCollection = collection(db, 'Users');
        const querySnapshot = await getDocs(usersCollection);

        const usersData = await Promise.all(querySnapshot.docs.map(async (doc) => {
            // Use aggregation to get the count without fetching documents
            const mediaListRef = collection(db, 'Users', doc.id, 'MediaList');
            const count = await getDocs(mediaListRef).then(snapshot => snapshot.size);

            // Fetch only necessary data from the user document
            const { key, ...userData } = doc.data();
            return { key: doc.id, num_items: count, ...userData };
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
        const userData = userDoc.data();

        if (userData) {
            updateUser(user, 'refresh_last_login');
            return userData;
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

export const refreshUpdate = async (userMedia, user_uid) => {
    // UPDATE TV
    let numUpdated = 0;
    // TV shows have a status either "Returning Series" or "Ended" or "Cancelled"
    let returning = userMedia.filter(item => item.details.status === "Returning Series")

    // if series is returning, check details
    const fetchDetails = async (item) => {
        const response = await fetch("https://api.themoviedb.org/3/tv/" + item.details.id + "?language=en-US", options);
        const details = await response.json();
        console.log(item.title);

        if (details.next_episode_to_air !== null) {
            if (details.next_episode_to_air.air_date !== item.upcoming_release) {
                const dataToUpdate = { upcoming_release: details.next_episode_to_air.air_date, details: details };
                await updateUserMedia(item.key, user_uid, dataToUpdate);
                numUpdated += 1;
            }
        } else {
            if (details.last_air_date !== item.upcoming_release || details.status !== item.details.status) {
                const dataToUpdate = { upcoming_release: details.last_air_date, details: details };
                await updateUserMedia(item.key, user_uid, dataToUpdate);
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
        return { message: "Refreshed " + numUpdated + " Items", type: "success" };
    }

    // UPDATE MOVIES
    // need to add logic here...
    // Movies have status either Planned or !== Released
}

// ----- DELETE -----

export const deleteUserMedia = async (selected, user) => {
    const batch = writeBatch(db);

    for (const docId of selected) {
        const docRef = doc(db, 'Users', user.uid, 'MediaList', docId);
        batch.delete(docRef);
    }
    try {
        await batch.commit();
    } catch (err) {
        console.error(err);
    }
};