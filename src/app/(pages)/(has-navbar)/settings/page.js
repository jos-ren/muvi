"use client";
import { useEffect, useState } from 'react';
import { message, Button, Popover } from 'antd';
import { useGlobalContext } from '@/context/store.js';
import MovieTable from "@/components/MovieTable.js"
import { poster } from "@/columns.js"
import { hideUpcomingItem } from "@/api/api.js"
import { QuestionCircleOutlined } from '@ant-design/icons';

const SettingsPage = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(true);
    const { user, data, setData } = useGlobalContext();

    useEffect(() => {
        if (user !== null) {
            setLoading(false)
        }
    }, [user]);

    const onMessage = (content, type) => {
        // Generate a unique key for each message to force removal of the previous message
        const key = `${type}-${Date.now()}`;
        return messageApi[type]({
            content,
            key,
            className: 'message',
        });
    };


    const title = {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        // ...getColumnSearchProps('title'),
    }

    const unhide_items = {
        title: '',
        render: (data) => {
            return <div style={{display:"flex", justifyContent:"flex-end", marginRight:"10px"}}>
                <Button onClick={() => { hideUpcomingItem(user.uid, data.key, false), onMessage('Unhid ' + data.title, 'success') }}>Unhide</Button>
            </div> 
        }
    }

    const hiddenItemsColumns = [
        poster,
        title,
        unhide_items
    ];

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
            <MovieTable
                // showRefresh
                // onRefresh={handleRefreshClick}
                pagination={{ position: ["bottomCenter"], showSizeChanger: true }}
                header={
                    <div style={{ display: "flex", alignItems: "center" }}>
                    <div>Hidden Items</div>
                    <Popover trigger="hover" content={"These are items which you have hidden from your upcoming list."} >
                        <QuestionCircleOutlined style={{ fontSize: "13px", color: "grey", margin: "6px 0px 0px 10px" }} />
                    </Popover>
                </div>
                }
                columns={hiddenItemsColumns}
                // filters data to be at the most a week old and not hidden
                data={data.filter(item => item.is_hidden === true)}
                rowSelection={false}
                size="small"
            />

        </div>
    }
}

export default SettingsPage;