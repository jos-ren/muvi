import React from 'react';
import { Button, Input } from 'antd';
const { Search } = Input;

const Hero = ({ onSearch, clearSearch, disableClear }) => {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "100px" }}>
            <h1 style={{ fontFamily: "Antebas", fontSize: "70pt", textAlign: "center" }}>Track your Favorite Shows with Ease</h1>
            <div style={{ position: "relative", top: "-45px", fontWeight: "400", fontSize: "14pt", color: "grey" }}>
                Add a Movie or Show to get Started!
            </div>
            <div style={{ width: "100%", alignItems: "center", display: "flex", flexDirection: "column" }}>
                {/* <h1>Muvi</h1> */}
                <div style={{ height: "50px" }}></div>
                <div style={{ display: "flex", alignItems: "center", width: "100%", marginBottom: "50px" }}>
                    <Search
                        size="large"
                        placeholder="Movie Name..."
                        enterButton="Search"
                        onSearch={onSearch}
                    />
                    <Button
                        type="link"
                        onClick={clearSearch}
                        style={{ marginLeft: "10px", height: "40px" }}
                        disabled={disableClear}
                    >
                        Clear Results
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default Hero;