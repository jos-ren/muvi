import React from 'react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import { RightOutlined, LeftOutlined } from '@ant-design/icons'
import MovieCard from "@/components/statistics/MovieCard"

const CustomNextArrow = (props) => {
    const { onClick } = props;
    return (
        <RightOutlined
            className={'arrow-right'}
            onClick={onClick}
        />
    );
};

const CustomPrevArrow = (props) => {
    const { onClick } = props;
    return (
        <LeftOutlined
            className={'arrow-left'}
            onClick={onClick}
        />
    );
};

const Carousel = ({ items, media_type }) => {
    const settings = {
        dots: false,
        infinite: false,
        speed: 1000,
        slidesToShow: 3.5,
        slidesToScroll: 3,
        // centerMode: true,
        // centerPadding: '16px', // Adjust the spacing between items
        nextArrow: <CustomNextArrow />,
        prevArrow: <CustomPrevArrow />,
        // autoplay: true,
        autoplaySpeed: 7500,
    };

    return (
        <Slider {...settings}>
            {items.map((item, index) => (
                <MovieCard
                    key={index}
                    title={item.title}
                    time={item.time}
                    poster_path={item.image}
                    episodes={item.total_watched_eps}
                    my_rating={item.my_rating}
                    index={index + 1}
                    media_type={media_type}
                />
            ))}
        </Slider>
    );
};

export default Carousel;