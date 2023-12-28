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


// export const uploadJSON = async (user_uid) => {
//     // Fetch the JSON file
//     const response = await fetch('my-data.json');

//     // Parse the JSON data
//     const data = await response.json();

//     // Iterate over each item and log the id
//     for (let i = 0; i < data.length; i++) {
//         const item = data[i];
//         createUserMedia(item, "list", user_uid)
//     }

//     // // replace obj below with this
//     // let obj = {
//     //     tmdb_id: o.details.id,
//     //     // custom fields
//     //     date_added: o.date_added,
//     //     list_type: o.list_type,
//     //     my_season: o.my_season,
//     //     my_episode: o.my_episode,
//     //     my_rating: o.my_rating,
//     //     // data fields
//     //     title: o.title,
//     //     release_date: o.release_date,
//     //     media_type: o.media_type,
//     //     is_anime: o.is_anime,
//     //     upcoming_release: o.upcoming_release,
//     //     details: o.details
//     // };
// }
