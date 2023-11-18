"use client";
import { useEffect, useState } from 'react';
import { message, Button } from 'antd';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/config/firebase.js"
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { getDocs, doc, collection } from "firebase/firestore"
import { formatFSTimestamp } from "../../../../../api/utils.js"
import MovieTable from '@/components/MovieTable.js';
import { getAllUsersData } from "@/api/api.js"



const AdminPage = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [user, setUser] = useState('')
    const [usersData, setUsersData] = useState([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    // NEED to turn away unauthed users

    const dashboardColumns = [
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'id',
        },
        {
            title: "Role",
            dataIndex: "role",
        },
        {
            title: "Total Items",
            dataIndex: "num_items",
        },
        {
            title: 'Last Login',
            dataIndex: 'lastLoginTime',
            defaultSortOrder: 'descend',
            sorter: (a, b) => {
                const dateA = new Date(a.lastLoginTime.seconds * 1000 + a.lastLoginTime.nanoseconds / 1e6);
                const dateB = new Date(b.lastLoginTime.seconds * 1000 + b.lastLoginTime.nanoseconds / 1e6);
                // console.log(dateA, dateB)

                // Compare dates
                if (dateA < dateB) {
                    return -1;
                }
                if (dateA > dateB) {
                    return 1;
                }
                return 0;
            },
            render: (lastLoginTime) => { return formatFSTimestamp(lastLoginTime, 3) }
        },
    ];

    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            setSelected(selectedRowKeys)
            selectedRows.length !== 0 ? setDisableButtons(false) : setDisableButtons(true)
        }
    };

    const fetchAllUsersData = async () => {
        const result = await getAllUsersData();
        setUsersData(result);
        setLoading(false);
    }

    useEffect(() => {
        // monitors login status
        onAuthStateChanged(auth, (u) => {
            if (u) {
                setUser(u)
                fetchAllUsersData()
            } else {
                // send user to login if not logged in
                router.push('/auth')
            }
        })
    }, []);

    if (loading) {
        return <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "95vh" }}>
                <h1>Loading...</h1>
            </div>
        </div >
    } else {
        return <div>
            {contextHolder}
            <MovieTable
                pagination={{ position: ["bottomCenter"], showSizeChanger: true, }}
                header={"Users"}
                columns={dashboardColumns}
                data={usersData}
                rowSelection={rowSelection}
            />
        </div>
    }
}

export default AdminPage;