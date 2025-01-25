import { calculateAverage, timestampToDateString } from "@/utils/utils"
import { genreCodes } from "@/data"
import { countryCodes } from "../../public/countries_data"

// ------ DATA MANIPULATION ------

// need to get total episodes here as well

export const getMyTotalEpisodes = (data) => {
    let accumulator = 0;
    const seasons = data?.details?.seasons;
    let i;

    if (seasons) {
        let incrementI = true;

        if (seasons.length === 1) {
            return data.my_episode
        }

        for (i = 0; i < seasons.length; i++) {
            const season = seasons[i];

            if (season.name !== "Specials") {
                if (i + 1 <= data.my_season) {
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

// for getting all total episodes for a show. doesn't stop where you left off
export const getAllTotalEpisodes = (data) => {
    let accumulator = 0;
    const seasons = data?.details?.seasons;
    let i;

    if (seasons) {
        let incrementI = true;

        for (i = 0; i < seasons.length; i++) {
            const season = seasons[i];

            if (season.name !== "Specials") {
                accumulator += season.episode_count;
            }
        }

        if (incrementI) {
            // Increment i for the next iteration if not done in the loop
            i++;
        }
    }
    return accumulator;
};

// for getting all total episodes for a show. doesn't take into account yet to be released episodes
export const getAllCurrentTotalEpisodes = (data) => {
    let accumulator = 0;
    const seasons = data?.details?.seasons;
    let i;

    if (data.is_anime && !data.is_seasonal_anime) {
        return data.details.next_episode_to_air.episode_number
    }

    if (seasons) {
        let incrementI = true;

        for (i = 0; i < seasons.length; i++) {
            const season = seasons[i];
            if (season.name !== "Specials") {
                //if not the last season in the array
                if (i + 1 !== seasons.length) {
                    accumulator += season.episode_count;
                } else {
                    //check the current date and see whether the next episode is in the future or not
                    const today = new Date();
                    const next_episode_date = new Date(data.details.next_episode_to_air.air_date);
                    if (today < next_episode_date) {
                        if (data.details.last_episode_to_air === null) {
                            accumulator += 0;
                        } else {
                            accumulator += data.details.last_episode_to_air.episode_number;
                        }
                    } else {
                        accumulator += data.details.next_episode_to_air.episode_number;
                    }
                    incrementI = false; // Don't increment i for the next iteration
                    break; // Break the loop once it reaches the last season
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
                    count: 1
                });
            } else {
                // Genre found, update watchtime
                statistics.genres[genreIndex].watchtime += minutes;
                statistics.genres[genreIndex].count += 1;
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

function translateYearToNumber(year) {
    // Check if the year is the start of a decade
    if (year % 10 === 0) {
        return 1;
    }

    // Calculate the decade start year
    const decadeStart = Math.floor(year / 10) * 10;

    // Calculate the difference between the input year and the decade start year
    const difference = year - decadeStart;

    // Map the difference to a number between 2 and 10
    const translatedNumber = Math.min(9, difference) + 1;

    return translatedNumber;
}

const updateMediaDateDecades = (statistics, item) => {
    const splitDate = item.release_date.split('-');
    const year = parseInt(splitDate[0]);  // Convert the year to a number

    const variable = translateYearToNumber(year)

    // Determine the decade based on the year
    const decade = (Math.floor(year / 10) * 10).toString().slice(-2);

    const group = `${year.toString().substring(0, 2) + decade}s`;

    // Find the index of the decade in the array
    const decadeIndex = statistics.decades.findIndex((entry) => entry.group === group && entry.variable === variable);

    if (decadeIndex !== -1) {
        // Decade found, update value += 1
        statistics.decades[decadeIndex].value += 1;
    } else {
        // Decade not found, add it to the array
        statistics.decades.push({
            group: group,
            variable: variable,
            value: 1  // Start with 1 since it's the first occurrence
        });
    }
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

const setInitialStarCount = (statistics) => {
    for (let i = 0; i < 10; i++) {
        statistics.star_count.push({ title: i + 1, count: 0 });
    }
};

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

// todo: make it 1950s not 50s
const setInitialDecades = (statistics) => {
    // Loop through the years from 1950 to 1960
    for (let year = 1950; year <= 2020; year += 10) {
        // Create an array to store objects for each decade
        let decadeArray = [];

        // Generate 8 arrays with variables ranging from 1 to 10 for each decade
        for (let variable = 1; variable <= 10; variable++) {
            let groupObject = {
                group: year + "s",
                variable: variable,
                value: 0
            };

            // Push the object to the decade array
            decadeArray.push(groupObject);
        }

        // Concatenate the decade array to the main array
        statistics.decades = statistics.decades.concat(decadeArray);
    }
}

function findHighestValue(data) {
    let highestValue = Number.MIN_VALUE; // Initialize with the smallest possible number

    for (const entry of data) {
        if (entry.value > highestValue) {
            highestValue = entry.value;
        }
    }

    return highestValue;
}

function findFavDecade(data) {
    let groupTotals = {};

    data.forEach(array => {
        if (!groupTotals[array.group]) {
            groupTotals[array.group] = 0; // Initialize the total for this group if it doesn't exist
        }
        groupTotals[array.group] += array.value; // Add the value to the total for this group
    });

    let maxGroup = null;
    let maxValue = 0;

    for (let group in groupTotals) {
        if (groupTotals[group] > maxValue) {
            maxValue = groupTotals[group];
            maxGroup = group;
        }
    }

    return maxGroup;
}

const setTVCompletionPercentage = (statistics) => {
    let accumulator = 0;

    for (let i = 0; i < statistics.longest_tv.length; i++) {
        if (statistics.longest_tv[i].total_watched_eps === statistics.longest_tv[i].total_eps) {
            accumulator += 1;
        }
    }

    statistics.tv_completed = {
        percent: Math.round(accumulator / statistics.longest_tv.length * 100),
        watched: accumulator,
        total: statistics.longest_tv.length
    }
}

export const calculateStatistics = async (data) => {
    // TODO: find which of these stats is useless and remove it
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
        decades: [],
        tv_completed: []
    };

    let temp_av_rate = [];

    setInitialDecades(statistics)
    setInitialStarCount(statistics)

    // Generate the stats
    if (data.length > 0) {
        for (let i = 0; i < data.length; i++) {
            let item = data[i];
            let minutes = 0;
            let total_watched_eps = 0;
            let total_eps = 0;

            if (item.list_type === "seen") {
                const { media_type, details, is_anime, my_rating, title, key } = item;

                if (my_rating !== 0) {
                    temp_av_rate.push(my_rating);
                }


                // longest_tv and longest_movie
                if (media_type === "tv") {
                    if (details.last_episode_to_air !== null && details.last_episode_to_air.runtime !== null) {
                        total_watched_eps = getMyTotalEpisodes(item);
                        total_eps = item.details.number_of_episodes;
                        minutes = total_watched_eps * details.last_episode_to_air.runtime;
                    } else if (details.episode_run_time.length > 0) {
                        total_watched_eps = getMyTotalEpisodes(item);
                        total_eps = item.details.number_of_episodes;
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
                        total_eps: total_eps
                    });
                } else if (media_type === "movie") {
                    minutes = details.runtime;

                    statistics.longest_movie.push({
                        title: item.title,
                        time: minutes,
                        image: item.details.poster_path,
                        my_rating: my_rating,
                        total_episodes: 0
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
    statistics.genres.sort((a, b) => b.count - a.count);

    setTVCompletionPercentage(statistics);
    // set the scale for countries...
    setCountriesScale(statistics.countries)
    statistics.decades.highest_decade_values = findHighestValue(statistics.decades);
    statistics.decades.fav_decade = findFavDecade(statistics.decades);
    statistics.countries.total_unique = statistics.countries.length;


    return statistics;
};