import React, { useEffect, useState, useRef } from "react";
import { scaleLinear } from "d3-scale";
import {
  ComposableMap,
  Geographies,
  Geography,
  Sphere,
  Graticule,
  ZoomableGroup
} from "react-simple-maps";
import { Tooltip } from 'antd';
import ReactTooltip from 'react-tooltip';
const geoUrl = "/features.json";

const colorScale = scaleLinear()
  .domain([0.29, 0.68])
  .range(["#f0f6fc", "#2389ff"]);

const MapChart = ({ data }) => {
  const [tooltipText, setTooltipText] = useState('')



  const [position, setPosition] = useState([0, 0]);
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => {
    setZoom(zoom * 1.2);
  };

  const handleZoomOut = () => {
    setZoom(zoom / 1.2);
  };

  console.log(zoom)

  const [moveEnd, setMoveEnd] = useState(null);

  useEffect(() => {
    if (moveEnd) {
      setZoom(moveEnd.zoom);
      setPosition(moveEnd.coordinates);
    }
  }, [moveEnd]);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", border: "1px solid red" }}>
      {/* <button onClick={handleZoomIn}>Zoom In</button>
      <button onClick={handleZoomOut}>Zoom Out</button> */}
      <ComposableMap
        projectionConfig={{
          rotate: [-10, 0, 0],
          scale: 147
        }}
      >
        <ZoomableGroup zoom={zoom} center={position} onMoveEnd={setMoveEnd}>
          <Sphere stroke="#E4E5E6" strokeWidth={0.5} />
          <Graticule stroke="#E4E5E6" strokeWidth={0.5} />
          {data.length > 0 && (
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const d = data.find((s) => s.ISO3 === geo.id);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={d ? colorScale(d["scale"]) : "#F5F4F6"}
                      style={{
                        hover: {
                          fill: "#ff5252",
                          outline: "none"
                        },
                        pressed: {
                          fill: "#E42",
                          outline: "none"
                        }
                      }}
                      onMouseEnter={() => setTooltipText(d ? geo.properties.name + ": " + d.amount + " movies" : geo.properties.name + ": 0 movies")}
                      onMouseLeave={() => setTooltipText("")}
                    />
                  );
                })
              }
            </Geographies>
          )}
        </ZoomableGroup>
      </ComposableMap>
      <div style={{ height: "14px" }}>{tooltipText}</div>
    </div>
  );
};

export default MapChart;
