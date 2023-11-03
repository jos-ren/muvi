export default (req, res) => {
    // Fetch user data on the server
    const userData = fetchUserData(); // Replace with your actual data fetching logic
    res.status(200).json(userData);
  };