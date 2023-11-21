import React, { useState } from 'react';
import Image from "next/image"

const CustomButton = ({
    onClick,
    text = "Button Text",
    background = "white",
    hoverColor = "#f9f8f8",
    color = "black",
    borderColor = "grey",
    icon = false,
    iconSrc = '/google.svg',
    fontSize = '12pt',
    width = '100%'
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };


    return (<div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        style={{
            cursor: "pointer",
            border: `1px solid ${borderColor}`,
            borderRadius: "8px",
            width: width,
            height: icon ? "50px" : "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isHovered ? hoverColor : background,
            color: color,
            fontSize: fontSize,
            margin: '10px 0px'
        }}>
        {icon ? <div style={{ position: "relative", top: "2px", left: "-80px" }}>
            <Image unoptimized height={20} width={20} quality="100" src={iconSrc} alt={"icon"} />
        </div> : <></>}
        <div style={icon ? { position: "relative", left: "-10px" } : {}}>
            {text}
        </div>
    </div>
    );
};

export default CustomButton;