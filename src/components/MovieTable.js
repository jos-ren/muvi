import React from 'react';
import styled from "styled-components";
import { Table, Button, Checkbox } from 'antd';
import { DeleteOutlined, SwapOutlined, ReloadOutlined } from '@ant-design/icons';


const MovieTable = ({
    header,
    onRemove,
    disableButtons,
    columns,
    data,
    rowSelection,
    onChange,
    showCurrentlyAiring = false,
    showRemove = false,
    showMove = false,
    showRefresh = false,
    onRefresh,
    pagination,
    moveKeyword,
    onMove,
    size = "medium",
    checkboxOnChange,
    hasTopMargin = true
}) => {
    return (
        <div style={{ marginTop: hasTopMargin ? "125px" : "40px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: "20px", alignItems: 'center' }}>
                    <h2>{header}</h2>
                    {showCurrentlyAiring ?
                        <div style={{ marginTop: "3px" }}>
                            <Checkbox defaultChecked onChange={checkboxOnChange}>Currently Airing</Checkbox>
                        </div> : null}
                </div>
                <div>
                    {showMove ?
                        <Button
                            style={{ marginRight: "10px" }}
                            type="primary"
                            onClick={onMove}
                            disabled={disableButtons}
                            icon={<SwapOutlined />}
                        >
                            Move to {moveKeyword}
                        </Button> : null}
                    {showRemove ?
                        <Button
                            type="primary"
                            danger
                            onClick={onRemove}
                            disabled={disableButtons}
                            icon={<DeleteOutlined />}
                        >
                            Remove
                        </Button> : null}
                    {showRefresh ?
                        <Button
                            type="primary"
                            onClick={onRefresh}
                            icon={<ReloadOutlined />}
                        >
                            Refresh
                        </Button> : null}

                </div>
            </div>
            <Table
                // sortDirections={[descend, ascend]}
                style={{ border: '1px solid #ede9e8', borderRadius: "6px" }}
                onChange={onChange}
                columns={columns}
                dataSource={data}
                pagination={pagination}
                rowSelection={rowSelection}
                size={size}
            // tableLayout={"auto"}
            />
        </div>
    );
}

export default MovieTable;