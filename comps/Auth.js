import React, { useState } from 'react';
import { Button, Input, message } from "antd"
import { auth, googleProvider } from "../src/app/config/firebase"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth'

const Auth = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [messageApi, contextHolder] = message.useMessage();

    const onMessage = (message, type) => {
        messageApi.open({
            type: type,
            content: message,
            className: "message"
        });
    };

    // async because using promises
    const createAccount = async () => {
        try {
            await createUserWithEmailAndPassword(auth, email, password)
        } catch (err) {
            console.error(err)
        }
    };

    const signIn = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password)
            onMessage("Logged In", "success")
        } catch (err) {
            onMessage(`${err.name + ": " + err.code}`, "error")
        } 
    };

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider)
        } catch (err) {
            console.error(err)
        }
    };

    const logOut = async () => {
        try {
            await signOut(auth)
        } catch (err) {
            console.error(err)
        } finally {
            onMessage("Logged Out", "success")
        }
    };



    console.log(auth?.currentUser?.email)

    return (<div>
        {contextHolder}
        <div style={{ display: "flex", justifyContent: "center", border: "1px solid red" }}>
            <div style={{ display: "flex", alignItems: "center", flexDirection: "column", width: "500px" }}>
                <Input placeholder="Email..." onChange={(e) => setEmail(e.target.value)} />
                {/* needs checks to see how strong, firebase requires at least 6 chars */}
                <Input.Password placeholder="Password..." onChange={(e) => setPassword(e.target.value)} />
                <Button type="primary" onClick={createAccount}>Create Account</Button>
                <Button onClick={signIn}>Sign In</Button>

                <div>
                    <Button onClick={signInWithGoogle}>Sign in with google</Button>
                </div>

                <div>
                    <Button onClick={logOut}>Logout</Button>
                </div>

                <div>current user:  {auth?.currentUser?.email}</div>
            </div>
        </div>
    </div>
    );
};

export default Auth;