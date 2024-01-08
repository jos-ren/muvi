import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { COLORS } from "@/utils/constants"

const generateFakeData = () => {
    const data = [];
    const decades = ["50s", "60s", "70s", "80s", "90s", "00s", "10s", "20s"]; // Example decades
    const yearsInDecade = 10;

    decades.forEach((decade, index) => {
        for (let year = 1; year <= yearsInDecade; year++) {
            data.push({
                group: decade,
                variable: year,
                value: Math.floor(Math.random() * 100) + 1,
            });
        }
    });

    return data;
};

const HeatMap = () => {
    const chartRef = useRef(null);

    useEffect(() => {
        const margin = { top: 0, right: 30, bottom: 0, left: 30 };
        const cellSize = 20;
        const yearsInDecade = 10;
        const decades = ["50s", "60s", "70s", "80s", "90s", "00s", "10s", "20s"]; // Example decades

        const width = yearsInDecade * cellSize;
        const height = decades.length * cellSize * 2;

        const x = d3.scaleBand()
            .range([0, width])
            .domain(d3.range(1, yearsInDecade + 1))
            .padding(0);

        const y = d3.scaleBand()
            .range([height, 0])
            .domain(decades)
            .padding(0);

        const myColor = d3.scaleLinear()
            .range(["white", COLORS.RED])
            .domain([1, 100]);

        const svg = d3.select(chartRef.current)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .style("overflow-y", "auto")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // svg.append("g")
        //   .attr("transform", "translate(0," + height + ")")
        //   .call(d3.axisBottom(x));

        svg.append("g")
            .call(d3.axisLeft(y));

        const data = generateFakeData();
        console.log(data, "data")

        svg.selectAll()
            .data(data, function (d) { return d.group + ':' + d.variable; })
            .enter()
            .append("rect")
            .attr("x", function (d) { return x(d.variable); })
            .attr("y", function (d) { return y(d.group); })
            .attr("width", cellSize)
            .attr("height", cellSize)
            .style("fill", function (d) { return myColor(d.value); });
    }, []);

    return (
        <div ref={chartRef}></div>
    );
};

export default HeatMap;
