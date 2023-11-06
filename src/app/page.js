import { redirect } from 'next/navigation';

// vcheck if user is logged in, if so gpo to search
// if not go to login
export default async function Home({}) {
    redirect('/search');
}