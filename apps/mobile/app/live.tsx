import { Redirect } from 'expo-router';
// Voice conversations use the same authenticated, turn-based assistant.
export default function LiveScreen(){return <Redirect href="/assistant"/>;}
