'use client'
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Image from "next/image";
import dynamic from 'next/dynamic';

import { useGlobalContext } from '@/context/store.js';
import { formatTime, numDatetoString } from "@/utils/utils";
import { calculateStatistics } from '@/api/statistics';
import { refreshMembers, getPrincipalMembers } from "@/api/api"
import { COLORS } from "@/utils/constants"

import Box from "@/components/statistics/Box"
import Chart from "@/components/statistics/Chart"
import Widget from "@/components/statistics/Widget"
import List from "@/components/statistics/List"
import WorldMap from "@/components/statistics/WorldMap"
import HeatMap from "@/components/statistics/HeatMap"
import Rating from "@/components/statistics/Rating"
import Carousel from "@/components/statistics/Carousel"

import { Button, message, Select, Progress, Popover, Tooltip } from 'antd';
import { ReloadOutlined, QuestionCircleOutlined, StarTwoTone, DownOutlined, StarFilled, ClockCircleFilled, HourglassFilled, ThunderboltFilled } from '@ant-design/icons'
import { FaGlobeAmericas } from "react-icons/fa";
import { AiFillFire } from "react-icons/ai";
const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false });

const Spacer = styled.div`
  margin:16px 8px;
`;

const CustomWrapper = styled.div`
  width: 100%;
  height: 100%;
  svg:nth-child(n+2) {
    display: none;
  }
`;

// should generate these from statistics.principa...
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
  const [addMoreItems, setAddMoreItems] = useState(false);
  const [statistics, setStatistics] = useState({});
  const [dropdown, setDropdown] = useState('actors');
  const [pmID, setPMID] = useState(null)
  const [noPMs, setNoPMs] = useState(false)
  const [messageApi, contextHolder] = message.useMessage();

  // console.log(statistics, "STAT")

  const handleChange = (value) => {
    setDropdown(value)
  };

  const fetchInitData = async () => {
    if (data !== null && user !== null) {
      // get top actors, etc
      const principalMembers = await getPrincipalMembers(user.uid)

      if (principalMembers.length !== 0) {
        setPMID(principalMembers[0].id)
      } else {
        setNoPMs(true)
      }
      // generate stats on movies
      const newStatistics = await calculateStatistics(data, user.uid);
      // combine
      newStatistics.principal_members = principalMembers[0];
      setStatistics(newStatistics);
      if (principalMembers.length !== 0) {
        setNoPMs(false);
      }
    }
  };

  useEffect(() => {
    fetchInitData();
  }, [data, user]);

  useEffect(() => {
    if (statistics !== null && user !== null) {
      if (statistics.total_minutes !== 0 && statistics.longest_tv && statistics.media_types) {
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

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "95vh" }}>
        <h1>Loading...</h1>
      </div>
    );
    // if no items
  } else if (data.length < 1) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "95vh" }}>
        <h2>Add at Least 1 Item to view Statistics</h2>
      </div>
    );
    // if no principal members
  } else if (noPMs) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "95vh" }}>
        {contextHolder}
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={async () => {
            onMessage("Refreshing", "loading");
            try {
              // Use Promise.all to wait for both refreshMembers and fetchInitData
              await Promise.all([
                refreshMembers(data, user.uid, pmID),
                fetchInitData()
              ]);
              onMessage("Refreshed Data", "success");
            } catch (error) {
              // Handle errors if needed
              console.error("Error during data refresh:", error);
              onMessage("Error during data refresh", "error");
            }
          }}
        >
          Generate Statistics
        </Button>
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
        <div style={{ display: "flex", width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <Widget
              title="Unique Countries"
              statistic={statistics.countries.total_unique}
              icon={<FaGlobeAmericas style={{ color: 'white', fontSize: "16px" }} />}
              color={COLORS.BLUE}
              content={
                <div style={{ height: "300px", width: '375px', alignItems: "center", justifyContent: "center", display: "flex" }}>
                  <WorldMap data={statistics.countries} />
                </div>
              }
            />
            <div style={{ margin: "8px" }}></div>
            <Widget
              title="Total Watchtime"
              statistic={formatTime(statistics.total_minutes, 'H')}
              icon={<ClockCircleFilled style={{ color: 'white' }} />}
              color={COLORS.RED}
              content={
                <div style={{ height: "300px", alignItems: "center", justifyContent: "center", display: "flex" }}>
                  <ApexCharts
                    series={statistics.media_types.map(item => Math.round(item.watchtime / statistics.total_minutes * 100))}
                    type="radialBar"
                    height={300}
                    width={300}
                    options={{
                      series: statistics.media_types.map((item) => Math.round((item.watchtime / statistics.total_minutes) * 100)),
                      labels: statistics.media_types.map((item) => item.name),
                      chart: {
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
                              show: false,
                              label: 'Total',
                              formatter: function (w) {
                                return formatTime(statistics.total_minutes, 'H2') + ' Hours';
                              },
                            },
                          },
                        },
                      },
                      legend: {
                        show: true,
                        position: 'bottom', // You can change the position as needed
                        horizontalAlign: 'center',
                        fontSize: '16px',
                        markers: {
                          width: 12,
                          height: 12,
                        },
                      },
                      responsive: [
                        {
                          breakpoint: undefined,
                          options: {},
                        },
                      ],
                    }}
                  />
                </div>
              }
            />
            {/* <div style={{ margin: "8px" }}></div>
            <Widget
              title="Oldest Movie"
              statistic={
                // statistics.oldest_media[statistics.oldest_media.length - 1].release_date +
                statistics.oldest_media[statistics.oldest_media.length - 1].title}
              icon={<HourglassFilled style={{ color: 'white' }} />}
              color={COLORS.ORANGE}
              date={numDatetoString(statistics.oldest_media[statistics.oldest_media.length - 1].release_date)}
            /> */}
          </div>

          <Spacer />

          <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <Widget
              title="Average Rating"
              statistic={statistics.average_rating}
              icon={<StarFilled style={{ color: 'white' }} />}
              color={COLORS.YELLOW}
              content={
                <div style={{ height: "300px", alignItems: "center", justifyContent: "center", display: "flex" }}>
                  <ApexCharts
                    options={{
                      colors: [COLORS.YELLOW],
                      chart: {
                        type: 'bar',
                        toolbar: {
                          show: false, // Set this to false to hide the toolbar
                        },
                      },
                      plotOptions: {
                        bar: {
                          borderRadius: 4,
                          horizontal: true
                        }
                      },
                      dataLabels: {
                        enabled: false
                      },
                      xaxis: {
                        categories: statistics.star_count.map((item) => item.title),
                        labels: {
                          show: true, // Set this to false to hide Y-axis labels
                        },
                      },
                      tooltip: {
                        enabled: true,
                        y: {
                          formatter: function (value) {
                            return `Count: ${value}`;
                          }
                        }
                      }
                    }}
                    series={[{ data: statistics.star_count.map((item) => item.count), }]}
                    type="bar"
                    height={250}
                    width={350}
                  />
                </div>
              }
            />
            <div style={{ margin: "8px" }}></div>
            <Widget
              title="Favorite Decade"
              statistic={statistics.decades.fav_decade}
              icon={<AiFillFire style={{ color: 'white' }} />}
              color={COLORS.GREEN}
              content={
                <div style={{ height: "300px", width: '100%', alignItems: "center", justifyContent: "center", display: "flex" }}>
                  <CustomWrapper>
                    <HeatMap data={statistics.decades} highestValue={statistics.decades.highest_decade_values} />
                  </CustomWrapper>
                </div>
              }
            />
            {/* <div style={{ margin: "8px" }}></div>
            <Widget
              title="Newest Movie"
              statistic={statistics.oldest_media[0].title}
              icon={<ThunderboltFilled style={{ color: 'white' }} />}
              color={COLORS.PURPLE}
              date={numDatetoString(statistics.oldest_media[0].release_date)}
            /> */}
          </div>
        </div>

        <Spacer />
        {/* MAKE A SPACE HERE where you select a stat, then iot generates the data */}

        {/* <Box width="auto">
          <div style={{ width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2>Top People </h2>
              <Select
                defaultValue="Actors"
                style={{
                  width: 120,
                }}
                onChange={handleChange}
                options={dropdownOptions}
              />
            </div>
            <div style={{ display: "flex" }}>
              <div style={{ height: '100%', width: "100%" }}>
                <List items={statistics.principal_members[dropdown].slice(0, 10)} />
              </div>
              <div style={{ margin: "0px 10px" }}></div>
              <div>
                <Chart data={statistics.principal_members[dropdown].slice(0, 10)} />
              </div>
            </div>
          </div>
        </Box> */}


        {/* <Spacer />
        <Box width="auto">
          <Progress type="dashboard" percent={75} />
          <Progress type="dashboard" percent={75} />
          <Progress type="dashboard" percent={75} />
        </Box> */}


        {/* <HeatMap data={statistics.media_dates} /> */}

        {/* <HeatMapYear data={statistics.media_dates} /> */}



        <h2>Top TV</h2>
        <Carousel items={statistics.longest_tv.slice(0, 10)} media_type={"tv"} />

        <h2>Longest Movies</h2>
        <Carousel items={statistics.longest_movie.slice(0, 10)} media_type={"movie"} />

      </div>
    );
  }
};

export default StatisticsPage;