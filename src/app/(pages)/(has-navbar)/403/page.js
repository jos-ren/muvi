import Link from 'next/link'
import Image from "next/image"

const UnauthorizedPage = () => {

    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", height: "100vh" }}>
        <h1 style={{fontSize:"150pt", margin:"0px"}}>403</h1>
        <div>You need an admin account to access this page </div>
        <Link style={{marginTop:"20px"}} href="/search">Return Home</Link>
    </div>
}

export default UnauthorizedPage;