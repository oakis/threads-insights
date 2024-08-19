"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  allMetrics,
  Breakdown,
  breakdowns,
  Demographics,
  MappedResponse,
  Metric,
  SimpleResponse,
  ThreadsData,
  ThreadsResponse,
  View,
} from "./config";

const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI as string;

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authCode = searchParams.get("code");
  const [accessToken, setAccessToken] = useState("");
  const [userId, setUserId] = useState("");
  const [stats, setStats] = useState<MappedResponse[] | null>(null);
  const [fetching, setFetching] = useState(false);
  const [breakdown, setBreakdown] = useState<Breakdown>("country");

  const isLoggedIn = Boolean(authCode) || Boolean(accessToken);
  const hasToken = Boolean(accessToken);

  const onGetAuthToken = async () => {
    await fetch(
      `https://graph.threads.net/oauth/access_token?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&client_secret=${process.env.NEXT_PUBLIC_CLIENT_SECRET}&code=${authCode}&grant_type=authorization_code&redirect_uri=${redirectUri}`
    )
      .then(async (data) => {
        const res = await data.json();
        setAccessToken(res.access_token);
        setUserId(res.user_id);
        router.replace(redirectUri);
      })
      .catch((e) => console.error(e));
  };

  const onLogin = () => {
    window.open(
      `https://threads.net/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&redirect_uri=${redirectUri}&scope=threads_basic&response_type=code`,
      "_parent"
    );
  };

  const mapTitle = (str: Metric): string => {
    switch (str) {
      case "views":
        return `${str} 👀`;
      case "likes":
        return `${str} ❤️`;
      case "replies":
        return `${str} ↩️`;
      case "reposts":
        return `${str} 🔁`;
      case "quotes":
        return `${str} 📃`;
      case "followers_count":
        return `${str} 🧮`;
      case "follower_demographics":
        return `${str} 🏠👨👩`;
      default:
        return str;
    }
  };

  const mapData = (data: ThreadsData): MappedResponse => {
    switch (data.name) {
      case "views": {
        return {
          title: mapTitle(data.name),
          desc: data.description,
          total: (data as View).values.reduce(
            (prev, curr) => prev + curr.value,
            0
          ),
        };
      }
      case "follower_demographics": {
        const breakdown = (data as Demographics).total_value.breakdowns[0];
        return {
          title: mapTitle(data.name),
          desc: data.description,
          subTitle: breakdown.dimension_keys[0],
          subValues: breakdown.results.map((res) => ({
            title: res.dimension_values[0],
            value: res.value.toString(),
          })),
        };
      }
      default:
        return {
          title: mapTitle(data.name),
          desc: data.description,
          total: (data as SimpleResponse).total_value.value,
        };
    }
  };

  const onFetchInsights = async () => {
    if (!accessToken) return console.error("accessToken missing");
    setFetching(true);
    const url = `https://graph.threads.net/v1.0/${userId}/threads_insights?metric=${allMetrics}&access_token=${accessToken}&since=1717279200&breakdown=${breakdown}`;
    const data: ThreadsResponse = await fetch(url)
      .then((data) => data.json())
      .catch((e) => console.error(e))
      .finally(() => {
        setFetching(false);
      });
    setStats(data.data.map((x) => mapData(x)));
  };

  const onSelectBreakdown = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setBreakdown(event.target.value);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-8">
      <div className="flex gap-4">
        <button onClick={onLogin}>{`Login${isLoggedIn ? " ✔️" : ""}`}</button>
        <button onClick={onGetAuthToken}>{`Get Auth Token${
          hasToken ? " ✔️" : ""
        }`}</button>
        <button onClick={onFetchInsights} disabled={fetching}>
          {`${fetching ? "Loading..." : "Fetch insights"}`}
        </button>
      </div>
      <div>
        <label htmlFor="breakdown">Select breakdown: </label>
        <select onChange={onSelectBreakdown} id="breakdown">
          {breakdowns.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-left flex-col gap-8">
        {stats?.map(({ title, desc, total, subTitle, subValues }) => (
          <div key={title}>
            <h1>{title.replace("_", " ")}</h1>
            <p>{desc}</p>
            {total && (
              <p className="font-bold">
                {total.toLocaleString("sv-SE", {
                  unitDisplay: "long",
                  style: "decimal",
                })}
              </p>
            )}
            {subTitle && subValues && (
              <div>
                <h3 className="font-bold">{subTitle}</h3>
                {subValues.map((sv) => (
                  <div key={sv.title} className="flex">
                    <h4 className="italic basis-1/2">{sv.title}: </h4>
                    <span className="font-bold basis-1/2">{sv.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
