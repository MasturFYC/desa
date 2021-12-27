import useSWR from "swr";
import type { iUserLogin } from "@components/interfaces";
import type { Events } from "../pages/api/events";
import { env } from 'process';

export default function useEvents(user: iUserLogin | undefined) {
  // We do a request to /api/events only if the user is logged in
  const { data: events } = useSWR<Events>(
    user?.isLoggedIn ? `${env.apiKey}/events` : null,
  );

  return { events };
}