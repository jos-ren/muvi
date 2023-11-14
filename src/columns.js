import Image from "next/image";
// import {getColumnSearchProps} from "./src/app/page"
import { StarTwoTone } from '@ant-design/icons';
import { Button, Tag, Tooltip } from 'antd';
const dayjs = require('dayjs')
import styled from "styled-components";
import { genreCodes } from "./data.js"
import {formatFSTimestamp} from "./api/utils.js"

const Block = styled.div`
  margin-right: 3px;
  cursor: default;
  border: 1px solid #d9d9d9;
  height: 22px;
  min-width: 22px; 
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border-radius: 5px;
`;

export const poster = {
    title: 'Poster',
    render: (data) => <Image
        unoptimized
        src={"https://image.tmdb.org/t/p/original/" + data.details.poster_path}
        alt={data.title}
        width={50}
        height={75}
        style={{ objectFit: "cover" }}
    />
}

export const date_added = {
    title: 'Date Added',
    dataIndex: 'date_added',
    // defaultSortOrder: 'ascend',
    sorter: (a, b) => b.date_added - a.date_added,
    render: (date_added) => {
        return formatFSTimestamp(date_added, 2)
    }
}

export const release_date = {
    title: 'Release Date',
    dataIndex: 'release_date',
    // defaultSortOrder: 'descend',
    sorter: (a, b) => new Date(b.release_date) - new Date(a.release_date),
    render: (release_date) => {
        const date = new Date(release_date)
        return <div>{date.toLocaleDateString('en-US', { dateStyle: "medium", })}</div>
    }
}

export const audience_rating = {
    title: 'Audience Rating',
    // dataIndex: 'data.details.vote_average',
    // sorter: (a, b) => a.data.details.vote_average - b.data.details.vote_average,
    render: (data) =>
        <>
            <StarTwoTone twoToneColor="#fadb14" />
            <> </>
            <Tooltip title={data.details.vote_count + " Ratings"}>
                {Number.parseFloat(data.details.vote_average).toFixed(1)}
            </Tooltip>
        </>
}

const filterType = (value, record) => {
    console.log(value, record)
    if (value === "anime") {
        if (record.is_anime === true) {
            return true
        }
    }
    if (value === record.media_type && record.is_anime === false) {
        return true
    }
    return false;
};

export const type = {
    title: 'Type',
    filters: [
        {
            text: 'Movie',
            value: 'movie',
        },
        {
            text: 'TV',
            value: 'tv',
        },
        {
            text: 'Anime',
            value: 'anime',
        },
    ],
    onFilter: (value, record) => filterType(value, record),
    render: (data) => {
        let color = ""
        let text = ""
        if (data.is_anime === true && data.media_type !== "movie") {
            color = "geekblue"
            text = "anime"
        } else if (data.media_type === "tv") {
            color = "green"
            text = "tv"
        } else {
            color = "volcano"
            text = "movie"
        }
        return (
            <Tag color={color}>
                {text.toUpperCase()}
            </Tag>
        )
    }
}

export const upcoming_release = {
    title: 'Date',
    dataIndex: 'upcoming_release',
    defaultSortOrder: 'descend',
    sorter: (a, b) => new Date(b.upcoming_release) - new Date(a.upcoming_release),
    render: (upcoming_release) => {
        return <div>{dayjs(upcoming_release).format('ddd D MMM YYYY')}</div >
    }
}

export const episode = {
    title: 'Episode',
    render: (data) => {
        let text = ""
        let episode = ""
        let season = ""
        if (data.details.next_episode_to_air !== undefined && data.details.next_episode_to_air !== null) {
            season = data.details.next_episode_to_air.season_number
            episode = data.details.next_episode_to_air.episode_number
            text = data.details.next_episode_to_air.name
        } else if (data.details.next_episode_to_air === null) {
            season = data.details.last_episode_to_air.season_number
            episode = data.details.last_episode_to_air.episode_number
            text = data.details.last_episode_to_air.name
        }
        return <>
            {
                data.media_type === "movie" ? "" :
                    <div style={{ display: "flex" }}>
                        {!data.is_anime ? <Block style={{ padding: "0px 5px", fontSize: "9pt" }}>S : {season}</Block> : <></>}
                        <Block style={{ padding: "0px 5px", fontSize: "9pt" }}>E : {episode}</Block>
                        <div style={{ marginLeft: "2px" }}>{text.slice(0, 7) === "Episode" ? "" : text}</div>
                    </div>
            }
        </>
    }
}

const filterGenres = (value, record) => {
    for (let i = 0; i < record.details.genres.length; i++) {
        if (record.details.genres[i].id === value) {
            return true;
        }
    }
    return false;
};

export const genres = {
    title: 'Genres',
    filters: genreCodes,
    onFilter: (value, record) => filterGenres(value, record),
    render: (data) => {
        let nameArr = []
        let emojiArr = []
        data.details.genres.map((i) => {
            genreCodes.forEach(myFunction)
            function myFunction(i2) {
                if (i.id === i2.value) {
                    nameArr.push(i2.text)
                    emojiArr.push(i2.emoji)
                }
            }
        })
        return <div style={{ display: "flex" }}>
            {nameArr.map((i, index) =>
                <Block key={index}>
                    <Tooltip title={i}>
                        {emojiArr[index]}
                    </Tooltip>
                </Block>
            )}
        </div>
    }
}

export const view = {
    title: 'Details',
    // dataIndex: 'data.details.vote_average',
    // sorter: (a, b) => a.data.details.vote_average - b.data.details.vote_average,
    render: (data) => {
        let link = data.media_type === "movie" ? "https://www.imdb.com/title/" + data.details.imdb_id : "https://www.themoviedb.org/tv/" + data.details.id
        return <Button type="link" href={link} target="_blank">View</Button>
    }
}