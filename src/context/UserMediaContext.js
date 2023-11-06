// "use client"
// import { createContext, useContext, useState } from 'react';

// const UserMediaContext = createContext();

// export function MovieProvider({ children }) {
//   const [userMedia, setUserMedia] = useState([]);
  
//   return (
//     <UserMediaContext.Provider value={{ userMedia, setUserMedia }}>
//       {children}
//     </UserMediaContext.Provider>
//   );
// }

// export function useUserMedia() {
//   return useContext(UserMediaContext);
// }