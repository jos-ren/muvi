import React, { useEffect, useState } from "react";
import { csv } from "d3-fetch";
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

const geoUrl = "/features.json";

const colorScale = scaleLinear()
  .domain([0.29, 0.68])
  .range(["#f0f6fc", "#2389ff"]);

const MapChart = ({ data, setTooltipContent }) => {

  return (
    <ComposableMap
      projectionConfig={{
        rotate: [-10, 0, 0],
        scale: 147
      }}
    >
      <ZoomableGroup center={[0, 0]} zoom={1}>
        <Sphere stroke="#E4E5E6" strokeWidth={0.5} />
        <Graticule stroke="#E4E5E6" strokeWidth={0.5} />
        {data.length > 0 && (
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const d = data.find((s) => s.ISO3 === geo.id);
                return (
                  <Tooltip
                    key={geo.rsmKey}
                    title={d ? geo.properties.name + ": " + d.amount + "x" : ""}
                  >
                    <Geography
                      geography={geo}
                      fill={d ? colorScale(d["scale"]) : "#F5F4F6"}
                      style={{
                        hover: {
                          fill: "#ff5252",
                          // outline: "1px solid red",
                          // cursor:"pointer"
                        },
                        pressed: {
                          fill: "#E42",
                          outline: "none"
                        }
                      }}
                    />
                  </Tooltip>
                );
              })
            }
          </Geographies>
        )}
      </ZoomableGroup>
    </ComposableMap>
  );
};

export default MapChart;
