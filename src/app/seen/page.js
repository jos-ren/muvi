"use client"
import React from 'react';
import MovieTable from "../../../comps/MovieTable.js"

function Seen() {
  return (
    <div>seen</div>
      // <MovieTable
      //   pagination={{ position: ["bottomCenter"], showSizeChanger: true, }}
      //   header={"Seen | " + seen.length + " Items"}
      //   onRemove={() => onRemove("seen", 1)}
      //   onMove={() => onMove("watchlist")}
      //   disableButtons={disableButtons}
      //   movieColumns={seenColumns}
      //   movies={seen.reverse()}
      //   rowSelection={rowSelection}
      //   showMove={true}
      //   moveKeyword={"Watchlist"}
      //   showRemove={true}
      // />
  );
}

// {active === 2 ?
//   <MovieTable
//     pagination={{ position: ["bottomCenter"], showSizeChanger: true }}
//     header={"Watchlist | " + watchlist.length + " Items"}
//     onRemove={() => onRemove("watchlist", 1)}
//     onMove={() => onMove("seen")}
//     disableButtons={disableButtons}
//     movieColumns={watchlistColumns}
//     movies={watchlist.reverse()}
//     rowSelection={rowSelection}
//     showMove={true}
//     moveKeyword={"Seen"}
//     showRemove={true}
//   />
//   : <></>}
// {active === 3 ?
//   <div>
//     {/* sort by this for movie (new Date(o.release_date) > new Date()) */}
//     {/* for tv: details.next_episode_to_air !== null */}
//     <MovieTable
//       showRefresh
//       onRefresh={() => {
//         refreshUpdate();
//       }}
//       pagination={{ position: ["bottomCenter"], showSizeChanger: true }}
//       header={
//         <div style={{ display: "flex", alignItems: "center" }}>
//           <div>Your Upcoming Shows</div>
//           <Popover trigger="click" content={"Generated from items you have added to your Seen & Watchlists. Displays items which are coming out soon."} >
//             <QuestionCircleOutlined style={{ fontSize: "13px", color: "grey", margin: "6px 0px 0px 10px" }} />
//           </Popover>
//         </div>
//       }
//       disableButtons={disableButtons}
//       movieColumns={upcomingColumns}
//       movies={upcoming}
//       rowSelection={false}
//     />
//   </div >
//   : <></>}
// {active === 4 ?
//   <div style={{}}>
//     Stats
//   </div >
//   : <></>}

export default Seen;
