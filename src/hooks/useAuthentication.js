// hooks/useAuthentication.js
import { useState } from 'react';

export function useAuthentication() {
  const [user, setUser] = useState(null);

  // Authentication logic here

  return { user, setUser };
}

// // pages/profile.js
// import React from 'react';
// import { useAuthentication } from '../hooks/useAuthentication';

// function UserProfile() {
//   const { user, setUser } = useAuthentication();

//   return (
//     <div>
//       {user ? <p>Welcome, {user.name}!</p> : <p>Please sign in.</p>}
//       {/* Handle user authentication here */}
//     </div>
//   );
// }