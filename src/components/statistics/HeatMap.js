import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { COLORS } from "@/utils/constants"
import { Tooltip } from 'antd';


const HeatMap = ({ data, highestValue }) => {
  const chartRef = useRef(null);
  const [tooltipText, setTooltipText] = useState('')

  useEffect(() => {
    const margin = { top: 0, right: 30, bottom: 0, left: 50 };
    const yearsInDecade = 10;
    const decades = ["1950s", "1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"]; // Example decades

    // // Get the parent container's size
    // const parentWidth = d3.select(chartRef.current).node().getBoundingClientRect().width;
    // const parentHeight = d3.select(chartRef.current).node().getBoundingClientRect().height;

    // // Calculate the cell size based on the parent container's size
    // const cellSize = Math.min((parentWidth - margin.left - margin.right) / yearsInDecade, (parentHeight - margin.top - margin.bottom) / decades.length);

    const cellSize = 28;

    const width = yearsInDecade * cellSize;
    const height = decades.length * cellSize;

    const x = d3.scaleBand()
      .range([0, width])
      .domain(d3.range(1, yearsInDecade + 1))
      .padding(0.1);

    const y = d3.scaleBand()
      .range([height, 0])
      .domain(decades)
      .padding(0.1);

    const myColor = d3.scaleLinear()
      .range(["#f0f6fc", COLORS.GREEN])
      .domain([0, highestValue]);

    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("overflow-y", "auto")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
      .call(d3.axisLeft(y));

    svg.selectAll()
      .data(data, function (d) { return d.group + ':' + d.variable; })
      .enter()
      .append("rect")
      .attr("x", function (d) { return x(d.variable); })
      .attr("y", function (d) { return y(d.group); })
      .attr("width", x.bandwidth()) // use bandwidth for width
      .attr("height", y.bandwidth()) // use bandwidth for height
      .attr("rx", 4)
      .attr("ry", 4)
      .style("fill", function (d) {
        return d.value === 0 ? "#F5F4F6" : myColor(d.value);
      })
      .on("mouseover", function (event, d) {
        d3.select(this)
          .style("stroke", "black")
          .style("opacity", 1)
        var year = d.group.slice(0, -2) + (d.variable - 1) % 10;
        // console.log(d)
        setTooltipText("Watched " + d.value + " items from " + year)
      })
      .on("mouseleave", function () {
        d3.select(this)
        .style("stroke", "none")
        .style("opacity", 0.8)
        setTooltipText("")
      })

  }, [data, highestValue]);

  return (
    <div style={{width:"100%", height:"100%", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center"}}>
      <div ref={chartRef} data={data}></div>
      <div style={{height:"14px"}}>{tooltipText}</div>
    </div>
  );
};

export default HeatMap;
