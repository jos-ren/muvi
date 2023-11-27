import { calculateAverage } from "@/api/utils"
import { genreCodes } from "@/data"
import { getMediaCredits } from '@/api/api'
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
    if (!statistics.media_types[mediaKey]) {
        statistics.media_types[mediaKey] = 0;
    }
    statistics.media_types[mediaKey] += minutes;
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


export const calculateStatistics = async (data, user_id) => {
    let statistics = {
        total_minutes: 0,
        media_types: {},
        genres: [],
        longest_medias: [],
        average_rating: 0,

        // // people
        // actors: [],
        // directors: [],
        // producers: [],
        // dop: [],
        // editor: [],
        // sound: [],
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

                if (media_type === "tv") {
                    if (details.last_episode_to_air !== null) {
                        total_watched_eps = getTotalEpisodes(item);
                        minutes = total_watched_eps * details.last_episode_to_air.runtime;
                    } else if (details.episode_run_time.length > 0) {
                        total_watched_eps = getTotalEpisodes(item);
                        minutes = total_watched_eps * details.episode_run_time[0];
                    } else {
                        console.error('Error finding episode run_time: ', title);
                    }
                } else if (media_type === "movie") {
                    total_watched_eps = 1;
                    minutes = details.runtime;
                }

                const mediaKey = is_anime ? 'anime' : media_type;

                updateMediaTypeStatistics(statistics, mediaKey, minutes);

                statistics.longest_medias.push({
                    title: item.title,
                    time: minutes,
                    image: item.details.poster_path,
                    total_watched_eps: total_watched_eps,
                    my_rating: my_rating,
                });

                updateGenreStatistics(statistics, details, minutes);
            }
        }
    }

    statistics.average_rating = calculateAverage(temp_av_rate);

    return statistics;
};