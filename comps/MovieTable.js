import React from 'react';
import styled from "styled-components";
import { Table, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const Container = styled.div`

`;

const MovieTable = ({ header, onRemove, disableRemove, movieColumns, movies, rowSelection }) => {
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
                    <> </>
                    <Button
                        type="primary"
                        danger
                        onClick={onRemove}
                        disabled={disableRemove}
                        icon={<DeleteOutlined />}
                    >
                        Remove Selected
                    </Button>
                </div>
            </div>
            <Table
                // sortDirections={[descend, ascend]}
                style={{ border: '1px solid #ede9e8', borderRadius: "6px" }}
                // bordered
                // onChange={onChange}
                columns={movieColumns}
                dataSource={movies}
                pagination={{ position: ["bottomCenter"], showSizeChanger: true }}
                rowSelection={rowSelection}
            // tableLayout={"auto"}
            />
        </Container>
    );
}

export default MovieTable;