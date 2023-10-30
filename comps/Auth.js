import React, { useState } from 'react';
import { Button, Input, message, Divider } from "antd"
import { auth, googleProvider } from "../src/app/config/firebase"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import {GoogleOutlined } from '@ant-design/icons';

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
            onMessage("Successfully Created New Account!", "success")
        } catch (err) {
            onMessage(`${err.name + ": " + err.code}`, "error")
        }
    };

    const signIn = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password)
            // onMessage("Logged In", "success")
        } catch (err) {
            onMessage(`${err.name + ": " + err.code}`, "error")
        }
    };

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider)
            // onMessage("Logged In Google Account", "success")
        } catch (err) {
            onMessage(`${err.name + ": " + err.code}`, "error")
        }
    };

    return (<div style={{ height: "calc(100vh)", display: "flex", alignItems: "center", flexDirection: "column", justifyContent: "center" }}>
        {contextHolder}
        <div style={{ border: "1px solid green", display: "flex", alignItems: "center", flexDirection: "column", justifyContent: "center", width: "400px" }}>
            <h1>Welcome</h1>
            <Button icon={<GoogleOutlined />}onClick={signInWithGoogle} style={{width:"400px", height:"40px"}}>Continue with Google</Button>

            <Divider />

            <Input placeholder="Email..." onChange={(e) => setEmail(e.target.value)} />
            {/* needs checks to see how strong, firebase requires at least 6 chars */}
            <Input.Password placeholder="Password..." onChange={(e) => setPassword(e.target.value)} />

            {/* these need to swap depending on a state */}
            <Button type="primary" onClick={createAccount}>Create Account</Button>
            <Button onClick={signIn}>Sign In</Button>


            <div>current user:  {auth?.currentUser?.email}</div>
        </div>
    </div>
    );
};

export default Auth;