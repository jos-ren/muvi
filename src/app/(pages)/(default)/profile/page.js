"use client";
import { useEffect, useState } from 'react';
import { message, Button } from 'antd';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/config/firebase.js"
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { getDoc, doc } from "firebase/firestore"
import { formatFSTimestamp } from "../../../utils.js"

const ProfilePage = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [user, setUser] = useState('')
    const [profileData, setProfileData] = useState([])
    const [loading, setLoading] = useState(true);
    const router = useRouter()

    async function getUserData(u) {
        const documentRef = doc(db, 'Users', u.uid);
        try {
            const documentSnapshot = await getDoc(documentRef);
            if (documentSnapshot.exists()) {
                const profileData = documentSnapshot.data();
                setProfileData(profileData)
                setLoading(false)
            } else {
                console.log('Document not found.');
                return null;
            }
        } catch (err) {
            console.error('Error fetching document:', err);
            return null;
        }
    }

    useEffect(() => {
        // monitors login status
        onAuthStateChanged(auth, (u) => {
            if (u) {
                setUser(u)
                getUserData(u)
            } else {
                // send user to login if not logged in
                router.push('/auth')
            }
        })
    }, []);


    // run a function on first login to grab email, name, photourl
    // lastlogintime might not be needed, it might already be in firestore
    console.log(user, user.displayName, user.email, user.photoURL)
    console.log(profileData)

    if (loading) {
        return <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "95vh" }}>
                <h1>Loading...</h1>
            </div>
        </div >
    } else {
        return <div>
            {contextHolder}

            <h1 style={{ marginTop: "100px" }}>Profile</h1>
            {user.photoURL ?
                <Image unoptimized height={150} width={150} quality="100" src={user.photoURL} alt={"profile_pic"} style={{ borderRadius: "50%", marginRight: "10px" }} /> :
                <Image unoptimized height={150} width={150} quality="100" src={"default_avatar.jpg"} alt={"profile_pic"} style={{ borderRadius: "50%", marginRight: "10px" }} />
            }

            <div style={{ display: "flex" }}>
                <div>Email: </div>
                <div>{user.email}</div>
            </div>
            <div>{user.displayName}</div>
            <div>{formatFSTimestamp(profileData.lastLoginTime, 1)}</div>
        </div>
    }
}

export default ProfilePage;