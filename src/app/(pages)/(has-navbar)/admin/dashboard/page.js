"use client";
import { useEffect, useState } from 'react';
import { message, Button } from 'antd';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/config/firebase.js"
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { getDocs, doc, collection } from "firebase/firestore"
import { formatFSTimestamp } from "../../../../utils.js"

const AdminPage = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [user, setUser] = useState('')
    const [usersData, setUsersData] = useState([])
    const [loading, setLoading] = useState(true);
    const router = useRouter()

    async function getAllUsersData() {
        try {
            const usersCollection = collection(db, 'Users');
            const querySnapshot = await getDocs(usersCollection);

            const usersData = [];
            querySnapshot.forEach((doc) => {
                usersData.push({ id: doc.id, ...doc.data() });
            });

            setUsersData(usersData);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching documents:', err);
            return null;
        }
    }

    useEffect(() => {
        // monitors login status
        onAuthStateChanged(auth, (u) => {
            if (u) {
                setUser(u)
                getAllUsersData()
                setLoading(false)
            } else {
                // send user to login if not logged in
                router.push('/auth')
            }
        })
    }, []);

    // NEED to turn away unauthed users
    console.log(usersData)

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

            {usersData.map((o) => {
                return <div key={o.id}>
                    <p>Name: {o.role}</p>
                    <p>Email: {o.email}</p>
                </div>
            })}

        </div>
    }
}

export default AdminPage;