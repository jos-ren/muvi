
const onAdd = async (o, method, lType, changes) => {
    // method 1 = creating, method 2 = swapping list_type
    let key = method === 1 ? o.id : o.key;
    let title = method === 1 ? (o.media_type === "movie" ? o.title : o.name) : o.title;
    let date_added = method === 1 ? getTodaysDate() : o.date_added;
    let release_date = method === 1 ? (o.media_type === "movie" ? o.release_date : o.first_air_date) : o.release_date;

    // determine if anime. animation genre + japanese language = true
    let animation = false
    let g_ids = method === 1 ? o.genre_ids : o.details.genres
    g_ids.forEach((id) => {
        if (id === 16) {
            animation = true
        }
    })
    let is_anime = method === 1 ? (o.original_language === "ja" && animation === true ? true : false) : o.is_anime;

    let list_type = lType;

    // get details
    let details = []
    if (method === 1) {
        const response = await fetch("https://api.themoviedb.org/3/" + o.media_type + "/" + key + "?language=en-US", options);
        details = await response.json();
    } else {
        details = o.details
    }

    // these values change when editing
    let my_season = 1;
    let my_episode = 1;
    let my_rating = 0;
    let upcoming_release = (o.media_type === "movie" ? details.release_date : (details.next_episode_to_air !== null ? details.next_episode_to_air.air_date : details.last_air_date))
    if (method === 2) {
        my_season = o.my_season;
        my_episode = o.my_episode;
        my_rating = o.my_rating;
        upcoming_release = o.upcoming_release;
    } else if (method === 3) {
        my_season = changes.my_season !== null ? changes.my_season : o.my_season;
        my_episode = changes.my_episode !== null ? changes.my_episode : o.my_episode;
        my_rating = changes.my_rating !== null ? changes.my_rating : o.my_rating;
        upcoming_release = changes.upcoming_release !== undefined ? changes.upcoming_release : o.upcoming_release;
    }

    let obj = {
        key: key,
        title: title,
        date_added: date_added,
        release_date: release_date,
        media_type: o.media_type,
        list_type: list_type,
        is_anime: is_anime,
        my_season: my_season,
        my_episode: my_episode,
        my_rating: my_rating,
        upcoming_release: upcoming_release,
        details: details
    }

    let localMedia = ""
    let localSeen = ""
    let localWatchlist = ""
    let localUpcoming = ""
    if (JSON.parse(localStorage.getItem("media")) !== null) {
        localMedia = JSON.parse(localStorage.getItem("media"))
        localSeen = localMedia.filter((o) => checkType(o, 1))
        localWatchlist = localMedia.filter((o) => checkType(o, 2))
        localUpcoming = localMedia.filter((o) => new Date(o.upcoming_release) > new Date(new Date().setDate(new Date().getDate() - 7)))
    }
    if (method === 1) {
        lType === "seen" ? setSeen(localMedia !== "" ? [...localSeen, obj] : [obj]) : setWatchlist(localMedia !== "" ? [...localWatchlist, obj] : [obj])
        setMedia(localMedia !== "" ? [...localMedia, obj] : [obj])
        localStorage.setItem("media", JSON.stringify([...localMedia, obj]))
        if (new Date(upcoming_release) > new Date(new Date().setDate(new Date().getDate() - 7))) {
            setUpcoming(localUpcoming !== "" ? [...localUpcoming, obj] : [obj]);
        }
        onMessage("Added " + title + ' to ' + lType, 'success')
    } else {
        lType === "seen" ? setSeen([...localSeen, obj]) : setWatchlist([...localWatchlist, obj])
        setMedia([...localMedia, obj]);
        localStorage.setItem("media", JSON.stringify([...localMedia, obj]))
        if (changes) {
            if (changes.new_upcoming !== undefined) {
                setUpcoming([localUpcoming, obj]);
            }
        }
    }
}
