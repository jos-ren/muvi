
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

export async function tmdbTrending() {
    const response = await fetch("https://api.themoviedb.org/3/trending/all/day?language=en-US", options);
    const json = await response.json();
    let temp = json.results
    temp.forEach((item, index) => {
        item.key = index + 1;
    })
    return temp
}