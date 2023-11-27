import { getDocs, collection, getDoc, setDoc, addDoc, updateDoc, doc, where, query, writeBatch, FieldPath, collectionGroup, documentId, deleteField } from "firebase/firestore"
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

export const uploadJSON = async (user_uid) => {
    // Fetch the JSON file
    const response = await fetch('my-data.json');

    // Parse the JSON data
    const data = await response.json();

    // Iterate over each item and log the id
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        createUserMedia(item, "list", user_uid)
    }

    // // replace obj below with this
    // let obj = {
    //     tmdb_id: o.details.id,
    //     // custom fields
    //     date_added: o.date_added,
    //     list_type: o.list_type,
    //     my_season: o.my_season,
    //     my_episode: o.my_episode,
    //     my_rating: o.my_rating,
    //     // data fields
    //     title: o.title,
    //     release_date: o.release_date,
    //     media_type: o.media_type,
    //     is_anime: o.is_anime,
    //     upcoming_release: o.upcoming_release,
    //     details: o.details
    // };
}

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

export const getCredits = async (media_id, user_id) => {
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

// // temp function to give all media credits
// export const updateAll = async (user_uid, data) => {
//     console.log(user_uid, data)

//     // get credits

//     for (let i = 0; i < data.length; i++) {
//         const c_response = await fetch("https://api.themoviedb.org/3/" + data[i].media_type + "/" + data[i].tmdb_id + "/credits", options);
//         let creditData = await c_response.json();

//         await addCreditToMediaList(user_uid, data[i].key, creditData)
//         // await deleteFieldFromDocument(user_uid, data[i].key)

//         console.log(data[i].title)
//         // console.log(user_uid, data[i].key, creditData, data[i].title)
//     }
// }

// async function addCreditToMediaList(user_id, media_id, creditData) {
//     try {
//         // Reference to the user document
//         const userDocRef = doc(db, 'Users', user_id);

//         // Reference to the MediaList subcollection
//         const mediaListCollectionRef = collection(userDocRef, 'MediaList');

//         // Reference to the specific media document
//         const mediaDocRef = doc(mediaListCollectionRef, media_id);

//         // Reference to the Credits subcollection within the media document
//         const creditsCollectionRef = collection(mediaDocRef, 'Credits');

//         // Generate a new document reference for the credit
//         const newCreditDocRef = doc(creditsCollectionRef);

//         // Set the data for the credit in the new document
//         await setDoc(newCreditDocRef, creditData);

//         console.log('Credit added successfully.');
//     } catch (error) {
//         console.error('Error adding credit:', error.message);
//     }
// }

// async function deleteFieldFromDocument(userId, mediaListDocumentId) {
//     try {
//         // Get a reference to the document
//         const documentRef = doc(db, `Users/${userId}/MediaList`, mediaListDocumentId);

//         // Fetch the document
//         const documentSnapshot = await getDoc(documentRef);

//         // Check if the document exists
//         if (documentSnapshot.exists()) {
//             // Update the document by removing the specified field
//             await updateDoc(documentRef, {
//                 'credits': deleteField()
//             });

//             console.log(`Field CREDITS deleted from the document.`);
//         } else {
//             console.log('Document does not exist.');
//         }
//     } catch (error) {
//         console.error('Error deleting field:', error.message);
//     }
// }

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
    const fetchDetails = async (item) => {
        // get details
        const d_response = await fetch("https://api.themoviedb.org/3/" + o.media_type + "/" + o.id + "?language=en-US", options);
        let details = await d_response.json();
        // // get credits
        // const c_response = await fetch("https://api.themoviedb.org/3/" + o.media_type + "/" + o.id + "/credits", options);
        // let credits = await c_response.json();
        // // Create and add the 'Credits' subcollection
        // const creditsSubcollectionRef = collection(mediaDocRef, 'Credits');
        // await addDoc(creditsSubcollectionRef, creditsObj);
        console.log(item.title);

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