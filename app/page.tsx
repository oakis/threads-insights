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
  metrics,
  SimpleResponse,
  ThreadsData,
  ThreadsResponse,
  View,
} from "./config";
import Views from "./components/Views";
import { labelize, readableNumber } from "./utils";

const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI as string;

function getFlagEmoji(countryCode: string) {
  return countryCode
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .reduce((a, b) => `${a}${b}`);
}

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authCode = searchParams.get("code");
  const [accessToken, setAccessToken] = useState("");
  const [userId, setUserId] = useState("");
  const [stats, setStats] = useState<MappedResponse[] | null>(null);
  const [fetching, setFetching] = useState(false);
  const [breakdown, setBreakdown] = useState<Breakdown>("country");
  const [currentMetrics, setCurrentMetrics] = useState(allMetrics);

  const isLoggedIn = Boolean(authCode) || Boolean(accessToken);
  const hasToken = Boolean(accessToken);
  const hasDemographics = currentMetrics.includes("follower_demographics");

  const onGetAuthToken = async () => {
    await fetch(
      `https://graph.threads.net/oauth/access_token?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&client_secret=${process.env.NEXT_PUBLIC_CLIENT_SECRET}&code=${authCode}&grant_type=authorization_code&redirect_uri=${redirectUri}`
    ).then(async (data) => {
      const res = await data.json();
      if (res.error) {
        alert(res.error.error_user_msg ?? res.error.message);
      } else {
        setAccessToken(res.access_token);
        setUserId(res.user_id);
        router.replace(redirectUri);
      }
    });
  };

  const onLogin = () => {
    window.open(
      `https://threads.net/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&redirect_uri=${redirectUri}&scope=threads_basic,threads_manage_insights&response_type=code`,
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
          metric: data.name,
          title: mapTitle(data.name),
          desc: data.description,
          total: (data as View).values.reduce(
            (prev, curr) => prev + curr.value,
            0
          ),
          subValues: (data as View).values.map((v) => ({
            title: v.end_time,
            value: v.value.toString(),
          })),
        };
      }
      case "follower_demographics": {
        const current = (data as Demographics).total_value.breakdowns[0];
        return {
          metric: data.name,
          title: mapTitle(data.name),
          desc: data.description,
          subTitle: current.dimension_keys[0],
          subValues: current.results.map((res) => ({
            title:
              breakdown === "country"
                ? getFlagEmoji(res.dimension_values[0])
                : res.dimension_values[0],
            value: res.value.toString(),
          })),
        };
      }
      default:
        return {
          metric: data.name,
          title: mapTitle(data.name),
          desc: data.description,
          total: (data as SimpleResponse).total_value.value,
        };
    }
  };

  const onFetchInsights = async () => {
    if (!accessToken) return console.error("accessToken missing");
    setFetching(true);
    const url = `https://graph.threads.net/v1.0/${userId}/threads_insights?metric=${currentMetrics}&access_token=${accessToken}&since=1717279200${
      hasDemographics ? `&breakdown=${breakdown}` : ""
    }`;
    const data: ThreadsResponse = await fetch(url)
      .then((data) => data.json())
      .finally(() => {
        setFetching(false);
      });
    if (data.error) {
      alert(data.error.error_user_msg ?? data.error.message);
    } else {
      setStats(data.data.map((x) => mapData(x)));
    }
  };

  const onSelectBreakdown = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setBreakdown(event.target.value);
  };

  const onSelectMetrics = (event: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = event.target.value;
    if (currentMetrics.includes(incoming)) {
      setCurrentMetrics(currentMetrics.replace(`,${incoming}`, ""));
    } else {
      setCurrentMetrics(`${currentMetrics},${incoming}`);
    }
  };

  const renderStat = ({
    title,
    desc,
    total,
    subTitle,
    subValues,
    metric,
  }: MappedResponse) => {
    switch (metric) {
      case "views":
        return (
          <Views
            key={title}
            metric={metric}
            title={title}
            desc={desc}
            total={total}
            subValues={subValues}
          />
        );

      default:
        return (
          <div key={title}>
            <h1>{labelize(title)}</h1>
            <p>{desc}</p>
            {total && <p className="font-bold">{readableNumber(total)}</p>}
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
        );
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center md:p-24 gap-8 p-8">
      <p>
        Start by logging in with your Threads connected Instagram account. Then
        press <b>Get Auth Token</b>. Now you are free to choose what metrics you
        want to see. Keep in mind that <b>Follower demographics</b> requires at
        least 100 followers.
      </p>
      <div className="flex gap-4">
        <button onClick={onLogin} disabled={isLoggedIn}>{`Login${
          isLoggedIn ? " ✔️" : ""
        }`}</button>
        <button
          onClick={onGetAuthToken}
          disabled={hasToken || !isLoggedIn}
        >{`Get Auth Token${hasToken ? " ✔️" : ""}`}</button>
      </div>
      <div className="flex gap-4">
        {metrics.map((metric) => (
          <span key={metric} className="flex gap-1">
            <input
              id={metric}
              type="checkbox"
              value={metric}
              onChange={onSelectMetrics}
              checked={currentMetrics.includes(metric)}
            />
            <label htmlFor={metric}>{labelize(metric)}</label>
          </span>
        ))}
      </div>
      <div className="flex flex-row gap-8">
        {hasDemographics && (
          <div>
            <label htmlFor="breakdown">Select Demographic: </label>
            <select onChange={onSelectBreakdown} id="breakdown">
              {breakdowns.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>
        )}
        <button
          onClick={onFetchInsights}
          disabled={
            !isLoggedIn || !hasToken || fetching || currentMetrics === ""
          }
        >
          {`${fetching ? "Loading..." : "Show me my statistics"}`}
        </button>
      </div>
      <div className="flex flex-col gap-8 w-full">
        {stats?.map((stat) => renderStat(stat))}
        <div />
        {/* Empty div above fixes chart sizing issue */}
      </div>
    </main>
  );
}
