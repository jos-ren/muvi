import React, { useState } from 'react';
import { Button, Input, message, Divider } from "antd"
import { auth, googleProvider } from "../config/firebase"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { GoogleOutlined } from '@ant-design/icons';
import CustomButton from "./CustomButton.js"
import { transformErrorMessage } from "../../utils"

const Auth = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isCreate, setIsCreate] = useState(true)
    const [messageApi, contextHolder] = message.useMessage();

    const onMessage = (message, type) => {
        messageApi.open({
            type: type,
            content: message,
            className: "login-message"
        });
    };

    // async because using promises
    const createAccount = async () => {
        try {
            await createUserWithEmailAndPassword(auth, email, password)
        } catch (err) {
            console.error(`${err.name + ": " + err.code}`, "error")
            onMessage(transformErrorMessage(err.code), "error")
        }
    };

    const signIn = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password)
        } catch (err) {
            console.error(`${err.name + ": " + err.code}`, "error")
            onMessage(transformErrorMessage(err.code), "error")
        }
    };

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider)
        } catch (err) {
            console.error(`${err.name + ": " + err.code}`, "error")
            onMessage(transformErrorMessage(err.code), "error")
        }
    };

    return (
        <div style={{
            height: "calc(100vh)",
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            justifyContent: "center"
        }}>
            {contextHolder}
            <div style={{
                border: "1px solid black",
                borderRadius:"10px",
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                justifyContent: "center",
                width: "400px",
                padding: "80px"
            }}>
                <h1>Welcome to Muvi</h1>
                <div style={{ marginBottom: "20px" }}>Login or Sign up to get started</div>
                <CustomButton
                    onClick={signInWithGoogle}
                    icon={true}
                    text={"Continue with Google"}
                />

                <Divider>or</Divider>

                <Input placeholder="Email..." onChange={(e) => setEmail(e.target.value)}
                    style={{
                        height: "40px",
                        margin: "5px 0px",
                        border: "1px solid grey"
                    }}
                />
                {/* needs checks to see how strong, firebase requires at least 6 chars */}
                <Input.Password placeholder="Password..." onChange={(e) => setPassword(e.target.value)}
                    style={{
                        height: "40px",
                        margin: "5px 0px",
                        border: "1px solid grey"
                    }}
                />

                {/* these need to swap depending on a state */}
                <CustomButton
                    background="#1677ff"
                    hoverColor='#004bb5'
                    borderColor="#1677ff"
                    color="white"
                    text={isCreate ? "Create Account" : "Sign In"}
                    onClick={isCreate ? createAccount : signIn}
                    fontSize='11pt'
                />
                {isCreate ?
                    <div style={{ display: "flex", fontSize:"10pt", marginTop:"10px" }}>
                        <div>Already have an account?</div>
                        <div onClick={() => setIsCreate(false)} style={{ color: "#1677ff", marginLeft: "5px", cursor:"pointer" }}>Sign In</div>
                    </div> :
                    <div style={{ display: "flex", fontSize:"10pt", marginTop:"10px" }}>
                        <div>Don't have an account?</div>
                        <div onClick={() => setIsCreate(true)} style={{ color: "#1677ff", marginLeft: "5px", cursor:"pointer"  }}>Register</div>
                    </div>
                }
            </div>
        </div>
    );
};

export default Auth;