"use client";
import { useEffect, useState } from 'react';
import { message, Button } from 'antd';
import Image from 'next/image'
import { formatFSTimestamp } from "../../../../api/utils.js"
import { useGlobalContext } from '@/context/store.js';
import { uploadJSON } from '@/api/api.js'

const SettingsPage = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(true);
    const { user } = useGlobalContext();

    useEffect(() => {
        if (user !== null) {
            setLoading(false)
        }
    }, [user]);

    // run a function on first login to grab email, name, photourl
    // lastlogintime might not be needed, it might already be in firestore

    if (loading) {
        return <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "95vh" }}>
                <h1>Loading...</h1>
            </div>
        </div >
    } else {
        return <div>
            {contextHolder}

            <h1 style={{ marginTop: "100px" }}>Settings</h1>
            {user.photoURL ?
                <Image unoptimized height={150} width={150} quality="100" src={user.photoURL} alt={"profile_pic"} /> :
                <Image unoptimized height={150} width={150} quality="100" src={"default_avatar.jpg"} alt={"profile_pic"} />
            }
            <div style={{ display: "flex" }}>
                <div>Email: </div>
                <div>{user.email}</div>
            </div>
            <div style={{ display: "flex" }}>
                <div>Name: </div>
                <div>{user.displayName}</div>
            </div>
            <div style={{ display: "flex" }}>
                <div>Last Login: </div>
                <div>{formatFSTimestamp(user.lastLoginTime, 2)}</div>
            </div>
            <div style={{ display: "flex" }}>
                <div>Role: </div>
                <div>{user.role}</div>
            </div>
            <br />
            <div>Delete Account</div>
            <div>Export Data</div>
            <br/>
            {/* <Button type='primary' onClick={()=>uploadJSON(user.uid)}>Upload Data</Button> */}
        </div>
    }
}

export default SettingsPage;