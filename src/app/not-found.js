import Link from 'next/link'
import Image from "next/image"

export default function NotFound() {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", height: "100vh" }}>
            {/* <h2>404</h2> */}
            {/* <p>Could not find requested resource</p> */}
            <Image unoptimized height={600} width={800} quality="100" src={"https://media.giphy.com/avatars/404academy/kGwR3uDrUKPI.gif"} alt={"profile_pic"} />
            <Link href="/search">Return Home</Link>
        </div>
    )
}