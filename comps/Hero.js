import React from 'react';
import styled from "styled-components";
import Image from "next/image";
import { Button, Input } from 'antd';
const { Search } = Input;
import { StarTwoTone, StarOutlined, EyeOutlined, SearchOutlined, CheckOutlined, RiseOutlined, EditOutlined, CheckCircleTwoTone } from '@ant-design/icons';
import { FaRegBookmark } from "react-icons/fa6";
const Hero = ({ onSearch, clearSearch, disableClear }) => {
    return (
        <div>
            <h1>Search</h1>
            <div style={{ display: "flex", alignItems: "center" }}>
                <Search
                    size="large"
                    placeholder="movie name"
                    enterButton="Search"
                    onSearch={onSearch}
                />
                <Button
                    type="link"
                    onClick={clearSearch}
                    style={{ marginLeft: "10px", height: "40px" }}
                    disabled={disableClear}
                >
                    Clear Results
                </Button>
            </div>
        </div>
    );
}

export default Hero;