"use client";
import { useState, useEffect } from "react";
import { useMediaQuery } from 'react-responsive'
import { message, Button } from 'antd';
import styled from "styled-components";

const ProfilePage = () => {
    const isWide = useMediaQuery({ query: '(max-width: 1300px)' })
    const isVeryWide = useMediaQuery({ query: '(max-width: 1600px)' })
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(false);

    return (
        <div>
            {contextHolder}

            <h1 style={{ marginTop: "100px" }}>Profile Page</h1>
            <p>This is the profile page content.</p>
        </div>
    );
};

export default ProfilePage;