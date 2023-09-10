import React from 'react';
import styled from "styled-components";
import { Table, Button } from 'antd';
import { DeleteOutlined, SwapOutlined } from '@ant-design/icons';

const Container = styled.div`

`;

const MovieTable = ({ header, onRemove, disableRemove, movieColumns, movies, rowSelection, onChange, showRemove = true, showMove = false, pagination, moveKeyword }) => {
    return (
        <Container>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h2>{header}</h2>
                <div>
                    {/* <Button
              type="primary"
            // onClick={onRemove}
            // disabled={disableRemove}
            >
              Show Posters
            </Button> */}
                    {showMove ?
                        <Button
                        style={{marginRight:"10px"}}
                            type="primary"
                            onClick={onRemove}
                            disabled={disableRemove}
                            icon={<SwapOutlined />}
                        >
                            Move to {moveKeyword}
                        </Button> : null}
                    {showRemove ?
                        <Button
                            type="primary"
                            danger
                            onClick={onRemove}
                            disabled={disableRemove}
                            icon={<DeleteOutlined />}
                        >
                            Remove Selected
                        </Button> : null}

                </div>
            </div>
            <Table
                // sortDirections={[descend, ascend]}
                style={{ border: '1px solid #ede9e8', borderRadius: "6px" }}
                onChange={onChange}
                columns={movieColumns}
                dataSource={movies}
                pagination={pagination}
                rowSelection={rowSelection}
            // tableLayout={"auto"}
            />
        </Container>
    );
}

export default MovieTable;