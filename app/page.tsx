"use client";
import { clientId, clientSecret } from "@/secrets";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const breakdowns = ["country", "city", "age", "gender"];

const metrics = [
  "views",
  "likes",
  "replies",
  "reposts",
  "quotes",
  "followers_count",
  "follower_demographics",
] as const;

type Breakdown = (typeof breakdowns)[number];
type Metric = (typeof metrics)[number];

const redirectUri = "https://localhost:3000/";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authCode = searchParams.get("code");
  const [accessToken, setAccessToken] = useState("");
  const [userId, setUserId] = useState("");
  const [metric, setMetric] = useState<Metric>("views");
  const [breakdown, setBreakdown] = useState<Breakdown>("country");

  const isAuthenticated = Boolean(accessToken);

  console.log({ isAuthenticated, accessToken, userId });

  const onGetAuthToken = async () => {
    await fetch(
      `https://graph.threads.net/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${authCode}&grant_type=authorization_code&redirect_uri=${redirectUri}`
    )
      .then(async (data) => {
        const res = await data.json();
        setAccessToken(res.access_token);
        setUserId(res.user_id);
        router.replace(redirectUri);
      })
      .catch((e) => console.error(e))
      .finally(() => {
      });
  };

  const onLogin = () => {
    window.open(
      `https://threads.net/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=threads_basic&response_type=code`,
      "_parent"
    );
  };

  const onGetProfileInfo = async () => {
    const data = await fetch(
      `https://graph.threads.net/v1.0/me?fields=id,name&access_token=${accessToken}&scope=threads_basic`
    )
      .then((data) => data.json())
      .catch((e) => console.error(e));
    console.log(data);
    if (data) {
      setUserId(data.id);
    }
  };

  const onFetchInsights = async () => {
    if (!accessToken) return console.error("accessToken missing");
    const url =
      metric === "follower_demographics"
        ? `https://graph.threads.net/v1.0/${userId}/threads_insights?metric=${metric}&access_token=${accessToken}&since=1717279200&breakdown=${breakdown}`
        : `https://graph.threads.net/v1.0/${userId}/threads_insights?metric=${metric}&access_token=${accessToken}&since=1717279200`;
    const data = await fetch(url)
      .then((data) => data.json())
      .catch((e) => console.error(e));
    console.log(data);
  };

  const onSelectMetric = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMetric(event.target.value as Metric);
  };

  const onSelectBreakdown = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setBreakdown(event.target.value);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-8">
      <button onClick={onLogin}>Login</button>
      <button onClick={onGetAuthToken}>Get Auth Token</button>
      <button onClick={onGetProfileInfo}>Fetch profile info</button>
      <div>
        <label htmlFor="metrics">Select metrics: </label>
        <select onChange={onSelectMetric} id="metrics">
          {metrics.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
      </div>
      {metric === "follower_demographics" && (
        <div>
          <label htmlFor="breakdown">Select breakdown: </label>
          <select onChange={onSelectBreakdown} id="breakdown">
            {breakdowns.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </div>
      )}
      <button onClick={onFetchInsights}>Fetch insights</button>
    </main>
  );
}
