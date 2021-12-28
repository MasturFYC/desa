import useSWR from "swr";
import { iUserLogin } from "@components/interfaces";

export default function useEvents(user: iUserLogin | undefined) {
  // We do a request to /api/events only if the user is logged in
  const { data: events } = useSWR<iUserLogin>(
    user?.isLoggedIn ? `${process.env.apiKey}/events` : null,
  );

  return { events };
}