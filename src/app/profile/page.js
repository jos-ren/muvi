"use client";
import { useState, useEffect, useRef, cloneElement } from "react";
import { useMediaQuery } from 'react-responsive'
import { message, Button } from 'antd';
import styled from "styled-components";

import Auth from "../components/Auth.js"
import { auth, db } from "../config/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getDocs, collection, getDoc, setDoc, addDoc, deleteDoc, deleteDocs, updateDoc, doc, where, query, writeBatch } from "firebase/firestore"



const ProfilePage = () => {
    const isWide = useMediaQuery({ query: '(max-width: 1300px)' })
    const isVeryWide = useMediaQuery({ query: '(max-width: 1600px)' })
    const [messageApi, contextHolder] = message.useMessage();
    const [active, setActive] = useState(1);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(false);

    const logOut = async () => {
        try {
            await signOut(auth)
        } catch (err) {
            onMessage(`${err.name + ": " + err.code}`, "error")
        }
    };

    const updateUser = async (user) => {
        const userRef = doc(db, 'Users', user.uid); // Reference to the specific user document
        const dataToUpdate = { lastLoginTime: new Date(), email: user.email }
        try {
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                // The document exists, so update it
                await updateDoc(userRef, dataToUpdate);
                console.log('user updated.');
            } else {
                // The document doesn't exist, so create it
                await setDoc(userRef, dataToUpdate);
                console.log('user created.');
            }
        } catch (error) {
            console.error('Error updating/creating user: ', error);
        }
    }

    useEffect(() => {
        // monitors login status
        onAuthStateChanged(auth, (u) => {
            if (u) {
                setUser(u)
                updateUser(u)
                setLoading(false)
            } else {
                setUser(false)
                setLoading(false)
            }
        })
    }, []);

    // console.log(user.photoURL)


    if (loading) {
        return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "95vh" }}>
            <h1>Loading...</h1>
            {/* <ReactLoading type={'spin'} color={'blue'} height={30} width={30} /> */}
        </div>
    } else return (
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