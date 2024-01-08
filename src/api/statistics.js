import { calculateAverage, timestampToDateString } from "@/utils/utils"
import { genreCodes } from "@/data"
import { countryCodes } from "../../public/countries_data"

// ------ DATA MANIPULATION ------

const getTotalEpisodes = (data) => {
    let accumulator = 0;
    const seasons = data?.details?.seasons;
    let i;

    if (seasons) {
        let incrementI = true;

        for (i = 0; i < seasons.length; i++) {
            const season = seasons[i];

            if (season.name !== "Specials") {
                if (i !== data.my_season) {
                    accumulator += season.episode_count;
                } else {
                    accumulator += data.my_episode;
                    incrementI = false; // Don't increment i for the next iteration
                    break; // Break the loop once it reaches your current season
                }
            }
        }

        if (incrementI) {
            // Increment i for the next iteration if not done in the loop
            i++;
        }
    }

    return accumulator;
};

// Helper function to update media type statistics
const updateMediaTypeStatistics = (statistics, mediaKey, minutes) => {
    const typeIndex = statistics.media_types.findIndex((g) => g.name === mediaKey);

    if (typeIndex === -1) {
        // Type not found, add it to the array
        statistics.media_types.push({
            name: mediaKey,
            watchtime: minutes,
        });
    } else {
        // Type found, update watchtime
        statistics.media_types[typeIndex].watchtime += minutes;
    }
    statistics.total_minutes += minutes;
};

// Helper function to update genre statistics
const updateGenreStatistics = (statistics, details, minutes) => {
    if (details.genres && details.genres.length > 0) {
        details.genres.forEach((genre) => {
            const genreIndex = statistics.genres.findIndex((g) => g.id === genre.id);

            if (genreIndex === -1) {
                // find the corresponding emoji
                let emoji = "";
                for (const item of genreCodes) {
                    if (item.value === genre.id) {
                        emoji = item.emoji;
                    }
                }

                // Genre not found, add it to the array
                statistics.genres.push({
                    id: genre.id,
                    name: genre.name,
                    emoji: emoji,
                    watchtime: minutes,
                });
            } else {
                // Genre found, update watchtime
                statistics.genres[genreIndex].watchtime += minutes;
            }
        });
    }
};

// need to decide between date added and date released
// Helper function to update media date statistics
const updateMediaDateStatistics = (statistics, item) => {
    const dateIndex = statistics.media_dates.findIndex((i) => i.date === item.release_date);

    if (dateIndex === -1) {
        // Date not found, add it to the array
        statistics.media_dates.push({
            date: item.release_date,
            value: 1,
            title: item.title
        });
    } else {
        // Date found, update value += 1
        statistics.media_dates[dateIndex].value += 1;
    }
};

const updateMediaDateDecades = (statistics, item) => {
    // const splitDate = item.release_date.split('-');
    // const year = splitDate.slice(0, 2).join('-');
    // const dateIndex = statistics.media_date_years.findIndex((i) => i.date === year);

    // if (dateIndex === -1) {
    //     // Date not found, add it to the array
    //     statistics.media_date_years.push({
    //         date: year,
    //         value: 1,
    //     });
    // } else {
    //     // Date found, update value += 1
    //     statistics.media_date_years[dateIndex].value += 1;
    // }
};

// Helper function to update country statistics
const updateCountriesStatistics = (statistics, details) => {
    if (details.production_countries && details.production_countries.length > 0) {
        details.production_countries.forEach((country) => {
            const countryIndex = statistics.countries.findIndex((i) => i.ISO2 === country.iso_3166_1);

            if (countryIndex === -1) {
                // change iso2  => iso3 code
                let iso3 = "";
                for (const item of countryCodes) {
                    if (item.iso2 === country.iso_3166_1) {
                        iso3 = item.iso3;
                    }
                }
                // country not found, add it to the array
                statistics.countries.push({
                    ISO2: country.iso_3166_1,
                    ISO3: iso3,
                    name: country.name,
                    amount: 1
                });
            } else {
                // country found, update amount + 1
                statistics.countries[countryIndex].amount += 1;
            }
        });
    }
};

// TODO: rework logic here, it not working with smaller amounts of countries
// need to make it so that countries with same amounts have same scale...
const setCountriesScale = (countries) => {
    if (countries.length === 0) {
        return;
    }

    // Sort countries by amount in ascending order
    countries.sort((a, b) => a.amount - b.amount);

    // Calculate the scale for each country
    const totalCountries = countries.length;
    const maxScale = 1.0;
    const minScale = 0.4;
    const scaleDifferenceFactor = .75; // Adjust this factor to control the scale difference

    for (let i = 0; i < totalCountries; i++) {
        const rawScale = i * (maxScale - minScale) / (totalCountries - 1);
        const scale = minScale + rawScale * Math.pow((i + 1) / totalCountries, scaleDifferenceFactor);
        countries[i].scale = scale;
    }
};

function getRatingRange(rating) {
    const roundedRating = Math.round(rating);
    // const ranges = ['1-2', '3-4', '5-6', '7-8', '9-10'];
    // const ranges = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
    const ranges = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    if (roundedRating >= 1 && roundedRating <= 10) {
        // const index = Math.floor((roundedRating - 1) / 2);
        const index = Math.floor(roundedRating - 1);
        return ranges[index];
    }
    return null;
}

const updateStarCount = (statistics, item) => {
    const ratingRange = getRatingRange(item.my_rating);

    if (ratingRange !== null) {
        const foundObject = statistics.star_count.find((obj) => obj.title === ratingRange);

        if (foundObject) {
            foundObject.count += 1;
        } else {
            statistics.star_count.push({ title: ratingRange, count: 1 });
        }
    } else {
        // console.log('Invalid rating value:', item.my_rating);
    }
};

export const calculateStatistics = async (data) => {
    let statistics = {
        total_minutes: 0,
        media_types: [],
        genres: [],
        longest_tv: [],
        longest_movie: [],
        average_rating: 0,
        star_count: [],
        oldest_media: [],
        countries: [],
        media_dates: [],
        media_date_decades: []
    };

    let temp_av_rate = [];

    if (data.length > 0) {
        for (let i = 0; i < data.length; i++) {
            let item = data[i];
            let minutes = 0;
            let total_watched_eps = 0;

            if (item.list_type === "seen") {
                const { media_type, details, is_anime, my_rating, title, key } = item;

                if (my_rating !== 0) {
                    temp_av_rate.push(my_rating);
                }

                // longest_tv and longest_movie
                if (media_type === "tv") {
                    if (details.last_episode_to_air !== null && details.last_episode_to_air.runtime !== null) {
                        total_watched_eps = getTotalEpisodes(item);
                        minutes = total_watched_eps * details.last_episode_to_air.runtime;
                    } else if (details.episode_run_time.length > 0) {
                        total_watched_eps = getTotalEpisodes(item);
                        minutes = total_watched_eps * details.episode_run_time[0];
                    } else {
                        console.error('Error finding episode run_time: ', title);
                    }

                    statistics.longest_tv.push({
                        title: item.title,
                        time: minutes,
                        image: item.details.poster_path,
                        total_watched_eps: total_watched_eps,
                        my_rating: my_rating,
                    });
                } else if (media_type === "movie") {
                    minutes = details.runtime;

                    statistics.longest_movie.push({
                        title: item.title,
                        time: minutes,
                        image: item.details.poster_path,
                        my_rating: my_rating,
                    });
                }

                const mediaKey = is_anime ? 'anime' : media_type;

                updateMediaTypeStatistics(statistics, mediaKey, minutes);
                updateGenreStatistics(statistics, details, minutes);
                updateCountriesStatistics(statistics, details);
                updateMediaDateStatistics(statistics, item);
                updateMediaDateDecades(statistics, item);
                updateStarCount(statistics, item);

                statistics.oldest_media.push({
                    title: item.title,
                    release_date: item.release_date,
                });
            }
        }
    }

    // sort the stats
    statistics.average_rating = calculateAverage(temp_av_rate);
    statistics.longest_tv.sort((a, b) => b.time - a.time);
    statistics.longest_movie.sort((a, b) => b.time - a.time);
    statistics.oldest_media.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
    statistics.media_types.sort((a, b) => b.watchtime - a.watchtime);
    statistics.star_count.sort((a, b) => b.title - a.title);
    // statistics.star_count.sort((a, b) => {
    //     // Use localeCompare to compare string values
    //     return b.title.localeCompare(a.title);
    // });
    // set the scale for countries...
    setCountriesScale(statistics.countries)


    return statistics;
};