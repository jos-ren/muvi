"use client";
import { message, Button } from 'antd';

const ProfilePage = () => {
    const [messageApi, contextHolder] = message.useMessage();

    return (
        <div>
            {contextHolder}

            <h1 style={{ marginTop: "100px" }}>Profile Page</h1>
            <p>This is the profile page content.</p>
        </div>
    );
};

export default ProfilePage;