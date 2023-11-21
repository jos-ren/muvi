"use client";
import { useEffect, useState } from 'react';
import MovieTable from '@/components/MovieTable.js';
import { message } from 'antd';
import { useRouter } from 'next/navigation'
import { formatFSTimestamp } from "../../../../../api/utils.js"
import { getAllUsersData } from "@/api/api.js"
import { useGlobalContext } from '@/context/store.js';


const AdminPage = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [usersData, setUsersData] = useState([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const { user } = useGlobalContext();

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
        if (user !== null && user.role === "admin") {
            fetchAllUsersData();
        } else if (user !== null && user.role === "user") {
            router.push('/403')
        }
    }, [user]);

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