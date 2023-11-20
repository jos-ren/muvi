'use client'
import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth'; // Adjust as per your authentication library
import { auth} from "@/config/firebase.js"
import { getUserData, getUserMedia } from '@/api/api'
import { useRouter } from 'next/navigation'
const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
    const router = useRouter()
    const [user, setUser] = useState(null);
    const [data, setData] = useState([]);

    useEffect(() => {
        // Subscribe to authentication state changes
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            try {
                if (authUser) {
                    // get data from firestore users collection
                    const FSUserData = await getUserData(authUser.uid);
                    const userMediaList = await getUserMedia(authUser.uid);
                    let userData = {
                        uid: authUser.uid,
                        email: authUser.email,
                        displayName: authUser.displayName,
                        photoURL: authUser.photoURL,
                        role: FSUserData.role, 
                        lastLoginTime: FSUserData.lastLoginTime,
                    };
                    setUser(userData);
                    setData(userMediaList)
                } else {
                    setUser(null);
                    router.push('/auth')
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                // Handle error as needed
            }
        });

        // Clean up subscription on unmount
        return () => unsubscribe();
    }, []);

    return (
        <GlobalContext.Provider value={{ user, data, setData }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);