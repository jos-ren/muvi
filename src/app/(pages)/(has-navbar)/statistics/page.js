'use client'
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Image from "next/image";
import dynamic from 'next/dynamic';

import { useGlobalContext } from '@/context/store.js';
import { formatTime, capitalizeFirstLetter } from "@/utils/utils";
import { calculateStatistics } from '@/api/statistics';
import { refreshMembers, getPrincipalMembers } from "@/api/api"

import Box from "@/components/statistics/Box"
import Chart from "@/components/statistics/Chart"
import Widget from "@/components/statistics/Widget"
import List from "@/components/statistics/List"
import WorldMap from "@/components/statistics/WorldMap"
import HeatMap from "@/components/statistics/HeatMap"
import HeatMapYear from "@/components/statistics/HeatMapYear"
import Carousel from "@/components/statistics/Carousel"

import { Button, message, Select, Progress, Popover, Tooltip } from 'antd';
import { ReloadOutlined, QuestionCircleOutlined, StarTwoTone, DownOutlined, StarFilled, ClockCircleFilled, HourglassFilled, ThunderboltFilled } from '@ant-design/icons'
const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false });

const Spacer = styled.div`
  margin:16px 8px;
`;

let dropdownOptions = [
  {
    value: 'actors',
    label: 'Actors',
  },
  {
    value: 'directors',
    label: 'Directors',
  },
  {
    value: 'producers',
    label: 'Producers',
  },
  {
    value: 'dop',
    label: 'Director of Photography',
  },
  {
    value: 'sound',
    label: 'Composer',
  },
  {
    value: 'editor',
    label: 'Editor',
  },
]

const StatisticsPage = () => {
  const { user, data } = useGlobalContext();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({});
  const [pieValues] = useState([]);
  const [pieLabels] = useState([]);
  const [dropdown, setDropdown] = useState('actors');
  const [pmID, setPMID] = useState(null)
  const [messageApi, contextHolder] = message.useMessage();

  console.log(statistics, "STAT")

  const handleChange = (value) => {
    setDropdown(value)
  };

  const fetchInitData = async () => {
    if (data !== null && user !== null) {
      // get top actors, etc
      const principalMembers = await getPrincipalMembers(user.uid)
      if (principalMembers.length !== 0) {
        setPMID(principalMembers[0].id)
      }
      // generate stats on movies
      const newStatistics = await calculateStatistics(data, user.uid);
      // combine
      newStatistics.principal_members = principalMembers[0];
      setStatistics(newStatistics);
    }
  };

  useEffect(() => {
    fetchInitData();
  }, [data, user]);

  useEffect(() => {
    if (statistics !== null && user !== null) {
      if (statistics.total_minutes !== 0 && statistics.longest_tv && statistics.principal_members) {
        setLoading(false);
      }
    }
  }, [statistics, user]);

  const onMessage = (message, type) => {
    messageApi.open({
      type: type,
      content: message,
      className: "message"
    });
  };

  const apexSeries = pieValues;

  const apexOptions = {
    chart: {
      height: 350,
      type: 'radialBar',
    },
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: {
            fontSize: '22px',
          },
          value: {
            fontSize: '16px',
          },
          total: {
            show: true,
            label: 'Total',
            formatter: function (w) {
              // By default, this function returns the average of all series.
              // The below is just an example to show the use of a custom formatter function
              return formatTime(statistics.total_minutes, "H2") + " Hours"
            },
          },
        },
      },
    },
    labels: pieLabels,
  };

  // add at least 5 items to see some statistics on your watch habits
  // need to figure out how to set principal members ona new users first time clicking here

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "95vh" }}>
        <h1>Loading...</h1>
      </div>
    );
  } else {
    return (
      <div>
        {contextHolder}
        <div style={{ marginTop: "125px" }}></div>
        <div style={{ display: "flex", justifyContent: "space-between", margin: "20px 0px 0px 0px", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <h2>Statistics</h2>
            <Popover trigger="click" content={"Generated from all of the items you've Seen"} >
              <QuestionCircleOutlined style={{ fontSize: "13px", color: "grey", margin: "6px 0px 0px 10px" }} />
            </Popover>
          </div>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={async () => {
              onMessage("Refreshing", "loading");
              await refreshMembers(data, user.uid, pmID);
              fetchInitData();
              onMessage("Refreshed Data", "success");
            }}
          >
            Refresh
          </Button>
        </div>


        {/* <Box width="auto">
          <HeatMap data={statistics.media_dates}/>
        </Box> */}



        <Spacer />

        <div style={{ display: "flex" }}>
          <Widget
            title="Total Watchtime"
            statistic={formatTime(statistics.total_minutes, 'H')}
            icon={<ClockCircleFilled style={{ color: 'white' }} />}
          />
          <Spacer />
          <Widget
            title="Average Rating"
            statistic={statistics.average_rating}
            icon={<StarFilled style={{ color: 'white' }} />}
          // color='#ffcc29'
          />
        </div>
        <Spacer />
        <div style={{ display: "flex" }}>
          <Widget
            title="Oldest Movie"
            statistic={
              // statistics.oldest_media[statistics.oldest_media.length - 1].release_date +
              statistics.oldest_media[statistics.oldest_media.length - 1].title}
            icon={<HourglassFilled style={{ color: 'white' }} />}
          // color='#ff4757'
          />
          <Spacer />
          <Widget
            title="Newest Movie"
            statistic={statistics.oldest_media[0].title}
            icon={<ThunderboltFilled style={{ color: 'white' }} />}
          // color='#4dff4d'
          />
        </div>

        <Spacer />

        {/* <div style={{ display: "flex" }}> */}
          <Box>
            <WorldMap data={statistics.countries} />
          </Box>
          <Spacer />
          <Box>
            {/* <ApexCharts options={apexOptions} series={apexSeries} type="radialBar" height={200} width={200} /> */}
          </Box>
        {/* </div> */}
        <Spacer />
        <Select
          defaultValue="Actors"
          style={{
            width: 120,
          }}
          onChange={handleChange}
          options={dropdownOptions}
        />
        <Spacer />
        <Box width="auto">
          <div style={{ height: '100%', width: "100%" }}>
            <List items={statistics.principal_members[dropdown].slice(0, 10)} />
          </div>
          <div style={{
            // borderLeft: "1px solid black",
            height: "250px", margin: "0px 10px"
          }}></div>
          <div>
            <Chart data={statistics.principal_members[dropdown].slice(0, 10)} />
          </div>
        </Box>

        <Spacer />

        <Box width="auto">
          <HeatMapYear data={statistics.media_dates} />
        </Box>

        {/* <Progress type="dashboard" percent={75} /> */}

        {/* <h2>Top TV</h2>
        <Carousel items={statistics.longest_tv.slice(0, 10)} media_type={"tv"} />

        <h2>Longest Movies</h2>
        <Carousel items={statistics.longest_movie.slice(0, 10)} media_type={"movie"} /> */}

      </div>
    );
  }
};

export default StatisticsPage;