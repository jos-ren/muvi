
const options = {
    method: "GET",
    headers: {
        accept: "application/json",
        Authorization: "Bearer " + process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN,
    },
};

export const tmdbSearch = async (value) => {
    const response = await fetch("https://api.themoviedb.org/3/search/multi?&language=en-US&query=" + value + "&page=1&include_adult=false", options);
    let json = await response.json();
    // if items are people or dont include a poster, remove from search results
    let passed = json.results.filter((e) => e.poster_path !== null && e.media_type !== "person")
    return passed
};

async function fetchMovieData(url) {
    const response = await fetch(url, options);
    const json = await response.json();
    let temp = json.results;
    temp.forEach((item, index) => {
        item.key = index + 1;
    });
    return temp;
}

export async function tmdbFetchMovies(endpoint) {
    const baseUrl = "https://api.themoviedb.org/3/";
    const fullUrl = `${baseUrl}${endpoint}?language=en-US&page=1`;
    return fetchMovieData(fullUrl);
}