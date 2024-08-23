"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  allMetrics,
  Breakdown,
  breakdowns,
  DemographicsData,
  MappedResponse,
  Metric,
  metrics,
  SimpleData,
  ThreadsData,
  ThreadsError,
  ThreadsResponse,
  ViewData,
} from "./config";
import Views from "./components/Views";
import { labelize, mapData, readableNumber } from "./utils";
import Demographics from "./components/Demographics";
import { Spinner } from "./components/Spinner";

const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI as string;

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authCode = searchParams.get("code");
  const [accessToken, setAccessToken] = useState("");
  const [userId, setUserId] = useState("");
  const [stats, setStats] = useState<ThreadsData[] | null>(null);
  const [fetching, setFetching] = useState(false);
  const [breakdown, setBreakdown] = useState<Breakdown>("country");
  const [currentMetrics, setCurrentMetrics] = useState(allMetrics);

  const isLoggedIn = Boolean(authCode) || Boolean(accessToken);
  const hasToken = Boolean(accessToken);
  const hasDemographics = currentMetrics.includes("follower_demographics");

  const onGetAuthToken = async () => {
    await fetch(
      `https://graph.threads.net/oauth/access_token?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&client_secret=${process.env.NEXT_PUBLIC_CLIENT_SECRET}&code=${authCode}&grant_type=authorization_code&redirect_uri=${redirectUri}`
    ).then(async (res) => {
      const data = await res.json();
      if (data.error) {
        onError(data.error);
      } else {
        setAccessToken(data.access_token);
        setUserId(data.user_id);
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

  const onError = (error: ThreadsError): void => {
    switch (error.code) {
      case 190:
        alert("Token has timed out, please log in again");
        setAccessToken("");
        setUserId("");
        break;

      default:
        alert(error.error_user_msg ?? error.message);
        break;
    }
  };

  const onFetchInsights = async () => {
    if (!isLoggedIn) return alert("accessToken missing");
    setFetching(true);
    const url = `https://graph.threads.net/v1.0/${userId}/threads_insights?metric=${currentMetrics}&access_token=${accessToken}&since=1717279200${
      hasDemographics ? `&breakdown=${breakdown}` : ""
    }`;
    const data: ThreadsResponse = await fetch(url).then((data) => data.json());
    setFetching(false);
    if (data.error) {
      onError(data.error);
    } else {
      setStats(data.data);
    }
  };

  const onSelectBreakdown = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setBreakdown(event.target.value);
  };

  const onSelectMetrics = (event: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = event.target.value;
    if (currentMetrics.includes(incoming)) {
      const newMetrics = currentMetrics
        .split(",")
        .filter((metric) => metric !== incoming)
        .join(",");
      setCurrentMetrics(newMetrics);
    } else {
      setCurrentMetrics(`${currentMetrics},${incoming}`);
    }
  };

  const renderStat = (data: ThreadsData) => {
    switch (data.name) {
      case "views":
        return <Views key={data.name} data={data as ViewData} />;
      case "follower_demographics":
        return (
          <Demographics
            key={data.name}
            data={data as DemographicsData}
            breakdown={breakdown}
          />
        );
      default:
        const { title, desc, total, subTitle, subValues } = mapData(data);
        return (
          <div key={title} className="w-1/2">
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
    <main className="flex min-h-screen flex-col items-center md:p-24 gap-8 p-8 md:max-w-4xl max-w-full">
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
      {hasToken && (
        <>
          <div className="flex gap-4 flex-wrap">
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
          <div className="flex flex-row gap-8 flex-start">
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
              className="flex gap-4 flex-center"
              onClick={onFetchInsights}
              disabled={
                !isLoggedIn || !hasToken || fetching || currentMetrics === ""
              }
            >
              Show me my statistics{" "}
              {fetching && <Spinner />}
            </button>
          </div>
          <div className="flex gap-y-8 w-full flex-wrap">
            {!fetching && stats?.map((stat) => renderStat(stat))}
            <div />
            {/* Empty div above fixes chart sizing issue */}
          </div>
        </>
      )}
    </main>
  );
}
