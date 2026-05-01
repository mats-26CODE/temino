"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/** Passenger details were merged into the seat step; this route keeps old links working. */
const PassengerLegacyRedirectPage = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const tripId = params?.id;

  useEffect(() => {
    if (tripId) router.replace(`/trips/${tripId}/seat`);
  }, [tripId, router]);

  return null;
};

export default PassengerLegacyRedirectPage;
