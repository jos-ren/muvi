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
            <div style={isWide ? { margin: "0px 50px", flex: 1 } : isVeryWide ? { margin: "0px 10vw", flex: 1 } : { margin: "0px 15vw", flex: 1 }}>
                <h1 style={{ marginTop: "100px" }}>Profile Page</h1>
                <p>This is the profile page content.</p>
            </div>
        </div>
    );
};

export default ProfilePage;