import Link from 'next/link'

export default function NotFound() {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", height: "100vh" }}>
            <h1 style={{fontSize:"150pt", margin:"0px"}}>404</h1>
            <div>Sorry, the page you tried cannot be found</div>
            <Link style={{marginTop:"20px"}} href="/search">Return Home</Link>
        </div>
    )
}