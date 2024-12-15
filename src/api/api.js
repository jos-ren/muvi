import { getDocs, collection, getDoc, setDoc, addDoc, updateDoc, doc, where, query, writeBatch, deleteDoc, FieldPath, collectionGroup, documentId, deleteField, increment } from "firebase/firestore"
import { db, auth } from "@/config/firebase.js"
import { capitalizeFirstLetter } from "@/utils/utils"
import { getMyTotalEpisodes, getAllCurrentTotalEpisodes } from "@/api/statistics.js"

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
        if (querySnapshot.docs.length > 0) {
            const docData = querySnapshot.docs[0].data();
            if (docData.list_type === list_type) {
                return { message: "Already Added", type: "warning" }
            } else {
                // if they want to switch list type
                const dataToUpdate = { list_type: list_type, last_edited: new Date() };
                await updateDoc(doc(subCollectionRef, querySnapshot.docs[0].id), dataToUpdate);
                // update watch history
                if (list_type === "seen") {
                    if (o.media_type === "movie") {
                        watchHistory(user_uid, o.media_type, o.id, o.name, null, null, null, null, null);
                    } else {
                        watchHistory(user_uid, o.media_type, o.id, o.name, 1, 1, 1, 1, null);
                    }
                }
                return { message: "Moved to " + capitalizeFirstLetter(list_type), type: "success" };
            }
        }
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

        // update watch history
        if (list_type === "seen") {
            if (obj.media_type === "movie") {
                watchHistory(user_uid, o.media_type, o.id, title, null, null, null, null, details);
            } else {
                watchHistory(user_uid, o.media_type, o.id, title, 1, 1, 1, 1, details);
            }
        }

        // Add the main document to the 'MediaList' subcollection
        const mediaDocRef = await addDoc(subCollectionRef, obj);

        // Create and add the 'Credits' subcollection
        const creditsSubcollectionRef = collection(mediaDocRef, 'Credits');
        await addDoc(creditsSubcollectionRef, creditsObj);

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
export const updateUserMedia = async (mediaID, userID, updatedData, mediaData = null) => {
    try {
        // update watch history
        if (mediaData !== null) {
            if (mediaData.media_type !== "movie") {
                let endSeason = updatedData.my_season ? updatedData.my_season : mediaData.my_season;
                let endEpisode = updatedData.my_episode ? updatedData.my_episode : mediaData.my_episode;
                let startSeason = mediaData.my_season;
                let startEpisode = mediaData.my_episode;

                // // grab the date from lastupdated date YYYY-MM-DD
                // const timestamp = new Date(mediaData.last_edited.seconds * 1000 + mediaData.last_edited.nanoseconds / 1000000);
                // const formattedDate = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(timestamp.getDate()).padStart(2, '0')}`; // Format the date as YYYY-MM-DD

                // Call watchHistory after processing the data
                watchHistory(userID, mediaData.media_type, mediaData.tmdb_id, mediaData.title, startSeason, endSeason, startEpisode, endEpisode, mediaData.details);
            }
        }
        await updateDoc(doc(db, 'Users', userID, 'MediaList', mediaID), updatedData)
    } catch (err) {
        console.error(err);
    }
}

// to change list type
export const moveItemList = async (location, userID, selected, data = null) => {
    const updatedData = {
        list_type: location,
        last_edited: new Date()
    };
    const batch = writeBatch(db);

    for (const docId of selected) {
        // update watch history
        if (location === "seen") {
            if (data.media_type === "movie") {
                watchHistory(userID, data.media_type, data.tmdb_id, data.title, null, null, null, null, null);
            } else {
                watchHistory(userID, data.media_type, data.tmdb_id, data.title, 1, 1, 1, 1, null);
            }
        } else if (location === "watchlist") {
            deleteWatchHistory(userID, data.tmdb_id);
        }
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
    let numUpdated = 0;

    // UPDATE TV
    // TV shows have a status either "Returning Series" or "Ended" or "Cancelled"
    let returning = userMedia.filter(item => item.details.status === "Returning Series")

    // there could be a future bug related to relying on "Returning Series" status

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
    // checks for movies that have a release_date greater than 1 month before today
    let movie = userMedia.filter(item => item.media_type === 'movie' && new Date(item.upcoming_release) > new Date().setMonth(new Date().getMonth() - 1))
    // check for changes in title, release_date, status
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

export const deleteUserMedia = async (selected, user, data = null) => {
    const batch = writeBatch(db);

    for (const docId of selected) {
        // delete watch history
        deleteWatchHistory(user.uid, data.tmdb_id);
        const docRef = doc(db, 'Users', user.uid, 'MediaList', docId);
        batch.delete(docRef);
    }
    try {
        await batch.commit();
    } catch (err) {
        console.error(err);
    }
};

// ---

export const hideUpcomingItem = async (userID, mediaID, isHidden) => {
    try {
        // set is_hidden to true of the media item
        await updateDoc(doc(db, 'Users', userID, 'MediaList', mediaID), { is_hidden: isHidden });
    } catch (err) {
        console.error(err);
    }
}

// TODO: fix bug here!!!
export const getBacklogData = (data) => {
    let unfinishedShows = []
    let tvData = data.filter(item => item.media_type === "tv")
    tvData.forEach(element => {
        // check if they are hidden
        if (element.is_hidden === true) return;

        let details = element.details;
        let my_current_episode;
        let most_recent_episode = details.number_of_episodes;

        let dateSevenDaysAgo = new Date();
        dateSevenDaysAgo.setDate(dateSevenDaysAgo.getDate() - 7);

        if (element.list_type === "watchlist") {
            my_current_episode = 0;
        } else if (element.is_anime === true && element.is_seasonal_anime === false) {
            my_current_episode = element.my_episode;
        } else {
            my_current_episode = getMyTotalEpisodes(element);
        }

        // if the show is currently airing
        if (element.details.next_episode_to_air !== null && new Date(element.details.next_episode_to_air.air_date) >= dateSevenDaysAgo) {
            most_recent_episode = getAllCurrentTotalEpisodes(element)
        }

        if (my_current_episode < most_recent_episode) {
            let episode_difference = most_recent_episode - my_current_episode;
            unfinishedShows.push({
                key: element.key,
                title: element.title,
                episode_difference: episode_difference,
                my_episode: element.my_episode,
                my_season: element.my_season,
                date_added_muvi: element.date_added,
                is_currently_airing: details.next_episode_to_air !== null ? true : false,
                latest_episode_date: details.next_episode_to_air !== null ?
                    details.next_episode_to_air.air_date : (details.last_episode_to_air !== null ?
                        details.last_episode_to_air.air_date : null),
                details: details,
                list_type: element.list_type
            })
        }
    });
    return unfinishedShows;
}

// watch history
const watchHistory = async (userId, type, showId, showName, startSeason, endSeason, startEpisode, endEpisode, details) => {
    let episodesWatched = 0;
    if (type !== "movie") {
        episodesWatched = getEpisodesWatched(details, startSeason, endSeason, startEpisode, endEpisode);
    }

    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; // Format the date as YYYY-MM-DD
    const docRef = doc(db, 'Users', userId, 'WatchHistory', `${formattedDate}_${showId}`);

    getDoc(docRef).then(docSnapshot => {
        if (docSnapshot.exists()) {
            if (type === "movie") {
                // For movies, no updates are needed if already logged.
                console.log("Movie already logged.");
            } else if (type === "anime" || type === "tv") {
                // For TV shows and anime, update season, start, and end episodes.

                updateDoc(docRef, {
                    startEpisode: startEpisode,
                    startSeason: startSeason,
                    endEpisode: endEpisode,
                    endSeason: endSeason,
                    episodesWatched
                });
                console.log("TV show/anime watch history updated.");
            }
        } else {
            // Create a new document for movie or TV show.
            if (type === "movie") {
                setDoc(docRef, {
                    date: formattedDate,
                    type,
                    showId,
                    showName
                });
                console.log("Movie watch history logged.");
            } else if (type === "anime" || type === "tv") {
                setDoc(docRef, {
                    date: formattedDate,
                    type,
                    showId,
                    showName,
                    startSeason,
                    endSeason,
                    startEpisode,
                    endEpisode,
                    episodesWatched
                });
                console.log("TV show/anime watch history logged.");
            }
        }
    }).catch(error => {
        console.error("Error accessing document: ", error);
    });
};


const getEpisodesWatched = (details, startSeason, endSeason, startEpisode, endEpisode) => {
    if (!details) {
        // potential bug?
        return 1;
    }

    let accumulator = 0;
    const seasons = details?.seasons;

    if (!seasons) {
        return accumulator;
    }

    for (let i = 0; i < seasons.length; i++) {
        const season = seasons[i];
        const seasonNumber = season.season_number;

        if (seasonNumber < startSeason || seasonNumber > endSeason) {
            continue;
        }

        if (seasonNumber === startSeason && seasonNumber === endSeason) {
            // If the start and end season are the same, calculate the difference in episodes
            accumulator += endEpisode - startEpisode;
        } else if (seasonNumber === startSeason) {
            // If it's the start season, count episodes from startEpisode to the end of the season
            accumulator += season.episode_count - startEpisode;
        } else if (seasonNumber === endSeason) {
            // If it's the end season, count episodes from the beginning of the season to endEpisode
            accumulator += endEpisode;
        } else {
            // If it's a season in between, count all episodes in the season
            accumulator += season.episode_count;
        }
    }

    console.log(accumulator, "ACCUMULATOR");
    return accumulator;
};

const deleteWatchHistory = async (userId, showId) => {
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; // Format the date as YYYY-MM-DD
    const docRef = doc(db, 'Users', userId, 'WatchHistory', `${formattedDate}_${showId}`);

    try {
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error deleting document: ", error);
    }
}

export const getWatchHistory = async (userId) => {
    const watchHistoryCollectionRef = collection(db, 'Users', userId, 'WatchHistory');
    const watchHistorySnapshot = await getDocs(watchHistoryCollectionRef);

    if (watchHistorySnapshot.empty) {
        return [];
    }

    const watchHistory = watchHistorySnapshot.docs.map(doc => doc.data());
    return watchHistory;
}

export const getWatchHistoryEarliestYear = async (userId) => {
    const userRef = doc(db, 'Users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        console.error("User document does not exist.");
        return new Date().getFullYear();
    }

    const userData = userDoc.data();

    if (userData.earliestWatchYear !== undefined) {
        return userData.earliestWatchYear;
    }

    const watchHistoryCollectionRef = collection(db, 'Users', userId, 'WatchHistory');
    const watchHistorySnapshot = await getDocs(watchHistoryCollectionRef);

    let earliestYear;

    if (watchHistorySnapshot.empty) {
        // Default to the current year if no watch history exists
        earliestYear = new Date().getFullYear();
    } else {
        // Find the earliest year in the watch history
        const watchHistory = watchHistorySnapshot.docs.map(doc => doc.data());
        earliestYear = Math.min(...watchHistory.map(item => new Date(item.date).getFullYear()));
    }

    // Update the user document with the earliest year
    await updateDoc(userRef, { earliestWatchYear: earliestYear });
    return earliestYear;
};
