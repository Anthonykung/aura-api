import { redirect } from 'next/navigation';

export default async function Home() {
  // Redirect to hackathon submission page
  redirect('https://devpost.com/software/aura-advanced-universal-recreational-activities');
}