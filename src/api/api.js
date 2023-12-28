import { getDocs, collection, getDoc, setDoc, addDoc, updateDoc, doc, where, query, writeBatch, FieldPath, collectionGroup, documentId, deleteField } from "firebase/firestore"
import { db, auth } from "@/config/firebase.js"
import { capitalizeFirstLetter } from "@/utils/utils"


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
        const d_response = await fetch("https://api.themoviedb.org/3/" + o.media_type + "/" + o.id + "?language=en-US", options);
        let details = await d_response.json();
        // get credits
        const c_response = await fetch("https://api.themoviedb.org/3/" + o.media_type + "/" + o.id + "/credits", options);
        let creditsObj = await c_response.json();

        let upcoming_release = o.media_type === "movie" ? details.release_date : (details.next_episode_to_air !== null ? details.next_episode_to_air.air_date : details.last_air_date)

        let obj = {
            tmdb_id: o.id,
            // custom fields
            date_added: new Date(),
            list_type: list_type,
            my_season: 1,
            my_episode: 1,
            my_rating: 0,
            last_edited: new Date(),
            // data fields
            title: title,
            release_date: release_date,
            media_type: o.media_type,
            is_anime: is_anime,
            upcoming_release: upcoming_release,
            details: details,
        };

        // Add the main document to the 'MediaList' subcollection
        const mediaDocRef = await addDoc(subCollectionRef, obj);

        // Create and add the 'Credits' subcollection
        const creditsSubcollectionRef = collection(mediaDocRef, 'Credits');
        await addDoc(creditsSubcollectionRef, creditsObj);

        // console.log("added: ", o.title)
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
        // sort data by last_edited
        const sortedMediaList = userMediaList.sort((a, b) => b.last_edited - a.last_edited);
        return sortedMediaList

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

export const getMediaCredits = async (media_id, user_id) => {
    try {
        const userDocRef = doc(db, 'Users', user_id);
        const mediaListCollectionRef = collection(userDocRef, 'MediaList');
        const mediaDocRef = doc(mediaListCollectionRef, media_id);
        const creditsCollectionRef = collection(mediaDocRef, 'Credits');
        const creditsSnapshot = await getDocs(creditsCollectionRef);

        // if no data
        if (creditsSnapshot.empty) {
            return [];
        }

        // Convert the snapshot to an array of credit objects
        const credits = creditsSnapshot.docs.map((doc) => doc.data());

        return credits;
    } catch (err) {
        console.error('Error in get credits:', err);
        // Return an empty array in case of an error
        return [];
    }
};

// gets the top actors, directors, etc from your movies, basically who shows up the most throughout your MediaList items
export const getPrincipalMembers = async (uid) => {
    try {
        // get a User's PrincipalMembers items
        const userDocRef = doc(db, 'Users', uid);
        const PrincipalMembersCollectionRef = collection(userDocRef, 'PrincipalMembers');
        const PrincipalMembersSnapshot = await getDocs(PrincipalMembersCollectionRef);

        // if no data
        if (PrincipalMembersSnapshot.empty) {
            return [];
        }

        // Extract user data from the PrincipalMembers documents
        const userPrincipalMembers = PrincipalMembersSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        return userPrincipalMembers

    } catch (err) {
        console.error('Error in getUserMedia:', err);
        // Return an empty array in case of an error
        return [];
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
        last_edited: new Date()
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
    const fetchTVDetails = async (item) => {
        // get details
        const d_response = await fetch("https://api.themoviedb.org/3/" + item.media_type + "/" + item.tmdb_id + "?language=en-US", options);
        let details = await d_response.json();

        if (details.next_episode_to_air !== null) {
            if (details.next_episode_to_air.air_date !== item.upcoming_release) {
                const dataToUpdate = { upcoming_release: details.next_episode_to_air.air_date, details: details, last_edited: new Date() };
                await updateUserMedia(item.key, user_uid, dataToUpdate);
                numUpdated += 1;
            }
        } else {
            if (details.last_air_date !== item.upcoming_release || details.status !== item.details.status) {
                const dataToUpdate = { upcoming_release: details.last_air_date, details: details, last_edited: new Date() };
                await updateUserMedia(item.key, user_uid, dataToUpdate);
                numUpdated += 1;
            }
        }
    };

    const fetchTVDetailsPromises = returning.map(fetchTVDetails);
    await Promise.all(fetchTVDetailsPromises);

    // UPDATE MOVIES
    let movie = userMedia.filter(item => item.title === 'title')
    // if movie is still unreleased, check if release date changes, status changes, etc
    const fetchMovieDetails = async (item) => {
        // get details
        const d_response = await fetch("https://api.themoviedb.org/3/" + item.media_type + "/" + item.tmdb_id + "?language=en-US", options);
        let details = await d_response.json();
        // check differences in title, release_date, status
        if (details.title !== item.title || details.release_date !== item.upcoming_release || details.status !== item.details.status) {
            const dataToUpdate = {
                title: details.title,
                upcoming_release: details.release_date,
                release_date: details.release_date,
                details: details,
                last_edited: new Date()
            };
            await updateUserMedia(item.key, user_uid, dataToUpdate);
            numUpdated += 1;
        }
    };

    const fetchMovieDetailsPromises = movie.map(fetchMovieDetails);
    await Promise.all(fetchMovieDetailsPromises);

    if (numUpdated === 0) {
        return { message: "List is up to date", type: "info" };
    } else {
        return { message: "Refreshed " + numUpdated + " Items", type: "success" };
    }
}

export const refreshMembers = async (data, user_id, pmID) => {
    // get all the credits from each document in medialist
    const promises = data.map(item => {
        return getMediaCredits(item.key, user_id)
            .then(credits => ({ mediaData: item, credits }));
    });

    const allCredits = await Promise.all(promises);

    // make an array with all the credits and the role, sorted by most to least
    let principal_members = {
        actors: [],
        directors: [],
        producers: [],
        dop: [],
        editor: [],
        sound: [],
    }

    for (let i = 0; i < allCredits.length; i++) {
        const credits = allCredits[i].credits;
        const mediaData = allCredits[i].mediaData;

        // filter out items which are not SEEN (takes out watchlist items)
        if (credits.length > 0 && mediaData.list_type === "seen") {
            updateMemberCounts(principal_members, credits[0].cast, mediaData, 'actors');
            updateMemberCounts(principal_members, credits[0].crew.filter(item => item.job === "Director"), mediaData, 'directors');
            updateMemberCounts(principal_members, credits[0].crew.filter(item => item.job === "Producer"), mediaData, 'producers');
            updateMemberCounts(principal_members, credits[0].crew.filter(item => item.job === "Director of Photography"), mediaData, 'dop');
            updateMemberCounts(principal_members, credits[0].crew.filter(item => item.job === "Editor"), mediaData, 'editor');
            updateMemberCounts(principal_members, credits[0].crew.filter(item => item.department === "Sound"), mediaData, 'sound');
        }
    }
    // // Executive Music Producer
    // // Original Music Composer

    // Sort each array based on the "count" property in descending order
    for (const key in principal_members) {
        if (principal_members[key].length > 0) {
            // Sort the array in descending order based on the "count" property
            principal_members[key].sort((a, b) => b.count - a.count);

            // Keep only the top 20 items
            principal_members[key] = principal_members[key].slice(0, 20);
        }
    }

    // upload this array to User/id/PrincipalMembers, replacing the old one
    updatePrincipalMembers(pmID, user_id, principal_members)
};

// update counts of directors, and actors
const updateMemberCounts = (principal_members, items, mediaData, field) => {
    let keyCount = 0;
    items.forEach((item) => {
        const itemIndex = principal_members[field].findIndex((o) => o.name === item.name);
        if (itemIndex === -1) {
            keyCount += 1;
            // Item not found, add it to the array
            principal_members[field].push({
                name: item.name,
                count: 1,
                profile_path: item.profile_path,
                media: [
                    {
                        title: mediaData.title,
                        poster_path: mediaData.details.poster_path,
                        my_rating: mediaData.my_rating,
                        release_date: mediaData.release_date,
                        link: mediaData.media_type === "movie" ? mediaData.details.imdb_id : mediaData.tmdb_id,
                        media_type: mediaData.media_type
                    }
                ]
            });
        } else {
            // Item found, update count && add the mediaData to array
            principal_members[field][itemIndex].count += 1;
            principal_members[field][itemIndex].media.push({
                title: mediaData.title,
                poster_path: mediaData.details.poster_path,
                my_rating: mediaData.my_rating,
                release_date: mediaData.release_date,
                link: mediaData.media_type === "movie" ? mediaData.details.imdb_id : mediaData.tmdb_id,
                media_type: mediaData.media_type
            })
            // Sort the media array by release_date in descending order
            principal_members[field][itemIndex].media.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
        }
    });
};

export const updatePrincipalMembers = async (pmID, user_uid, updatedData) => {
    try {
        if (pmID === null) {
            // Create a new document
            const userRef = doc(db, 'Users', user_uid);
            const subCollectionRef = collection(userRef, 'PrincipalMembers');
            await addDoc(subCollectionRef, updatedData);
        } else {
            // Update an existing document
            const principalMembersRef = doc(db, 'Users', user_uid, 'PrincipalMembers', pmID);
            await setDoc(principalMembersRef, updatedData);
        }
    } catch (err) {
        console.error(err);
    }
};


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