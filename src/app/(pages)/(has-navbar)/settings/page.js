"use client";
import { useEffect, useRef, useState } from 'react';
import { message, Button, Popover, Modal, Divider } from 'antd';
import { useGlobalContext } from '@/context/store.js';
import MovieTable from "@/components/MovieTable.js"
import { poster } from "@/columns.js"
import { hideUpcomingItem, getUserMedia, exportUserData, previewImport, importUserData } from "@/api/api.js"
import { QuestionCircleOutlined, ExportOutlined, ImportOutlined } from '@ant-design/icons';

const SettingsPage = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(true);
    const { user, data, setData } = useGlobalContext();

    const [exportLoading, setExportLoading] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const fileInputRef = useRef(null);

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

    const handleExport = async () => {
        setExportLoading(true);
        try {
            const exportData = await exportUserData(user.uid);
            const json = JSON.stringify(exportData, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const date = new Date().toISOString().slice(0, 10);
            const a = document.createElement('a');
            a.href = url;
            a.download = `muvi-export-${date}.json`;
            a.click();
            URL.revokeObjectURL(url);
            onMessage(`Exported ${exportData.mediaList.length} media items and ${exportData.watchHistory.length} watch history entries.`, 'success');
        } catch (err) {
            console.error(err);
            onMessage('Export failed. Please try again.', 'error');
        } finally {
            setExportLoading(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Reset input so the same file can be re-selected if needed
        e.target.value = '';
        setImportLoading(true);
        try {
            const text = await file.text();
            const parsed = JSON.parse(text);
            if (!parsed.mediaList || !parsed.watchHistory) {
                throw new Error('Invalid file format.');
            }
            const preview = await previewImport(user.uid, parsed);
            setPreviewData(preview);
            setModalVisible(true);
        } catch (err) {
            console.error(err);
            onMessage(err.message === 'Invalid file format.' ? 'Invalid file. Please select a valid Muvi export file.' : 'Failed to read file. Please try again.', 'error');
        } finally {
            setImportLoading(false);
        }
    };

    const handleConfirmImport = async () => {
        if (!previewData) return;
        setConfirmLoading(true);
        try {
            const result = await importUserData(user.uid, previewData);
            setModalVisible(false);
            setPreviewData(null);
            const refreshed = await getUserMedia(user.uid);
            setData(refreshed);
            onMessage(`Import complete: ${result.mediaListAdded} media items and ${result.watchHistoryAdded} watch history entries added.`, 'success');
        } catch (err) {
            console.error(err);
            onMessage('Import failed. No data was changed. Please try again.', 'error');
        } finally {
            setConfirmLoading(false);
        }
    };

    const handleCancelImport = () => {
        setModalVisible(false);
        setPreviewData(null);
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
            return <div style={{ display: "flex", justifyContent: "flex-end", marginRight: "10px" }}>
                <Button onClick={async () => {
                    await hideUpcomingItem(user.uid, data.key, false);
                    const result = await getUserMedia(user.uid);
                    setData(result);
                    onMessage('Unhid ' + data.title, 'success');
                }}>Unhide</Button>
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
                hasTopMargin={false}
                pagination={{ placement: "bottomCenter", showSizeChanger: true }}
                header={
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <div>Hidden Items</div>
                        <Popover trigger="hover" content={"These are items which you have hidden from your Upcoming page."} >
                            <QuestionCircleOutlined style={{ fontSize: "13px", color: "grey", margin: "6px 0px 0px 10px" }} />
                        </Popover>
                    </div>
                }
                columns={hiddenItemsColumns}
                data={data.filter(item => item.is_hidden === true)}
                rowSelection={false}
                size="small"
            />

            <Divider />

            {/* Export Section */}
            <div style={{ marginBottom: "32px" }}>
                <h2 style={{ marginBottom: "8px" }}>Export Data</h2>
                <p style={{ color: "grey", marginBottom: "16px" }}>
                    Download a JSON backup of your entire media list and watch history.
                </p>
                <Button
                    icon={<ExportOutlined />}
                    loading={exportLoading}
                    onClick={handleExport}
                >
                    Export as JSON
                </Button>
            </div>

            {/* Import Section */}
            <div style={{ marginBottom: "48px" }}>
                <h2 style={{ marginBottom: "8px" }}>Import Data</h2>
                <p style={{ color: "grey", marginBottom: "4px" }}>
                    Restore from a previously exported Muvi JSON file.
                </p>
                <p style={{ color: "grey", marginBottom: "16px", fontSize: "13px" }}>
                    Only new items will be added. Existing data will never be overwritten or deleted.
                </p>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                />
                <Button
                    icon={<ImportOutlined />}
                    loading={importLoading}
                    onClick={() => fileInputRef.current?.click()}
                >
                    Import from JSON
                </Button>
            </div>

            {/* Import Preview Modal */}
            <Modal
                title="Import Preview"
                open={modalVisible}
                onOk={handleConfirmImport}
                onCancel={handleCancelImport}
                okText="Confirm Import"
                cancelText="Cancel"
                confirmLoading={confirmLoading}
                okButtonProps={{ disabled: previewData?.mediaListToAdd.length === 0 && previewData?.watchHistoryToAdd.length === 0 }}
            >
                {previewData && (
                    <div>
                        <p style={{ marginBottom: "16px" }}>Review what will be imported before proceeding. Nothing will be overwritten.</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "#f5f5f5", borderRadius: "8px" }}>
                                <span><strong>Media List</strong></span>
                                <span>
                                    <span style={{ color: "#25e6a4", fontWeight: 600 }}>{previewData.mediaListToAdd.length} to add</span>
                                    {previewData.mediaListSkipCount > 0 && (
                                        <span style={{ color: "grey", marginLeft: "12px" }}>{previewData.mediaListSkipCount} already exist (skipped)</span>
                                    )}
                                </span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "#f5f5f5", borderRadius: "8px" }}>
                                <span><strong>Watch History</strong></span>
                                <span>
                                    <span style={{ color: "#25e6a4", fontWeight: 600 }}>{previewData.watchHistoryToAdd.length} to add</span>
                                    {previewData.watchHistorySkipCount > 0 && (
                                        <span style={{ color: "grey", marginLeft: "12px" }}>{previewData.watchHistorySkipCount} already exist (skipped)</span>
                                    )}
                                </span>
                            </div>
                        </div>
                        {previewData.mediaListToAdd.length === 0 && previewData.watchHistoryToAdd.length === 0 && (
                            <p style={{ marginTop: "16px", color: "grey", textAlign: "center" }}>
                                Nothing new to import — all items already exist in your account.
                            </p>
                        )}
                    </div>
                )}
            </Modal>

        </div>
    }
}

export default SettingsPage;