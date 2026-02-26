"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "./components/Navbar";
import heroBackground from "../../public/weather-hero.jpg";

export default function Home() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [aiSummary, setAiSummary] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [favWeatherData, setFavWeatherData] = useState([]);

  const performSearch = useCallback(async (targetCity) => {
    if (!targetCity) return;
    setLoading(true);
    setError("");
    setWeather(null);
    setAiSummary("");
    setComments([]);

    try {
      const wRes = await fetch(`/api/weather?city=${targetCity}`);
      const wData = await wRes.json();
      if (!wRes.ok) throw new Error("City not found");

      setWeather(wData);

      const [aiRes, cRes] = await Promise.all([
        fetch("/api/weather/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weatherData: wData, city: targetCity }),
        }),
        fetch(`/api/comments?city=${targetCity}`),
      ]);

      const aiData = await aiRes.json();
      const cData = await cRes.json();

      setAiSummary(aiData.summary);
      setComments(cData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(true);
          setUser(data.user);
          setFavorites(data.user.favorites);
          const userFavs = data.user.favorites || [];

          if (userFavs.length > 0) {
            const firstCity = userFavs[0];
            console.log(firstCity);

            setCity(firstCity);
            performSearch(firstCity);
          }
        }
      } catch (err) {
        setIsLoggedIn(false);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const fetchFavWeather = async () => {
        const res = await fetch("/api/user/favorites");
        if (res.ok) {
          const data = await res.json();
          setFavWeatherData(data);
        }
      };
      fetchFavWeather();
    } else {
      setFavWeatherData([]);
    }
  }, [isLoggedIn, favorites]);

  // const performSearch = async (targetCity) => {
  //   if (!targetCity) return;
  //   setLoading(true);
  //   setError("");
  //   setWeather(null);
  //   setAiSummary("");
  //   setComments([]);

  //   try {
  //     const wRes = await fetch(`/api/weather?city=${targetCity}`);
  //     const wData = await wRes.json();
  //     if (!wRes.ok) throw new Error("City not found");

  //     setWeather(wData);

  //     const [aiRes, cRes] = await Promise.all([
  //       fetch("/api/weather/summary", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ weatherData: wData, city: targetCity }),
  //       }),
  //       fetch(`/api/comments?city=${targetCity}`),
  //     ]);

  //     const aiData = await aiRes.json();
  //     const cData = await cRes.json();

  //     setAiSummary(aiData.summary);
  //     setComments(cData);
  //   } catch (err) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city) return;
    setLoading(true);
    setError("");
    setWeather(null);
    setAiSummary("");
    setComments([]);

    try {
      const wRes = await fetch(`/api/weather?city=${city}`);
      const wData = await wRes.json();
      if (!wRes.ok) {
        if (wRes.status === 404) {
          throw new Error("We couldn't find that city. Check the spelling?");
        } else {
          throw new Error("Something went wrong. Please try again later.");
        }
      }
      setWeather(wData);

      const [aiRes, cRes] = await Promise.all([
        fetch("/api/weather/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weatherData: wData, city }),
        }),
        fetch(`/api/comments?city=${city}`),
      ]);

      const aiData = await aiRes.json();
      const cData = await cRes.json();

      setAiSummary(aiData.summary);
      setComments(cData);
    } catch (err) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: weather.name, text: newComment }),
      });
      if (res.ok) {
        const posted = await res.json();
        setComments([posted, ...comments]);
        setNewComment("");
      }
    } catch (err) {
      console.error("Failed to post:", err);
    }
  };
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#121212] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) return router.push("/login");

    try {
      const res = await fetch("/api/user/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: weather.name }),
      });

      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favorites);
      }
    } catch (err) {
      console.error("Favorite toggle failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] text-[#222222] dark:text-gray-100 font-sans transition-colors duration-300">
      <Navbar isLoggedIn={isLoggedIn} user={user} />
      {isLoggedIn && favWeatherData.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 py-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-4">
            {favWeatherData.map((fav, i) => (
              <div
                key={i}
                onClick={() => {
                  setCity(fav.name);
                  performSearch(fav.name);
                }}
                className="flex-shrink-0 flex items-center gap-3 bg-white dark:bg-[#1e1e1e] border border-gray-100 dark:border-gray-800 rounded-2xl p-3 px-5 shadow-sm hover:shadow-md transition cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#FF385C] uppercase tracking-tighter">
                    {fav.name}
                  </span>
                  <span className="text-lg font-bold dark:text-white">
                    {Math.round(fav.main.temp)}°C
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 capitalize">
                    {fav.weather[0].description}
                  </p>
                  <span className="text-xl">
                    {fav.weather[0].main === "Clear" ? "☀️" : "☁️"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <header className="py-10 px-4 border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-white dark:bg-[#1e1e1e] border border-gray-300 dark:border-gray-700 rounded-full p-2 shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <input
              type="text"
              placeholder="Where are you going?"
              className="flex-grow px-6 py-2 bg-transparent outline-none text-sm font-medium text-[#222222] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <button className="bg-[#FF385C] p-3 rounded-full text-white hover:bg-[#E31C5F] transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-12 px-6">
        {error && (
          <div className="max-w-xl mx-auto mb-10 animate-vibe">
            <div className="bg-[#FF385C]/5 border border-[#FF385C]/20 rounded-2xl p-6 flex items-center gap-4">
              <div className="bg-[#FF385C] text-white p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-[#222222] dark:text-white">
                  Something went wrong
                </h4>
                <p className="text-sm text-[#717171] dark:text-gray-400">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {weather ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="md:col-span-2 space-y-6">
                <div className="relative h-80 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800 group">
                  <div
                    className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                    style={{
                      backgroundImage: `url(${heroBackground.src})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent p-8 flex flex-col justify-end text-white">
                    <div className="animate-vibe">
                      <h2 className="text-6xl font-extrabold tracking-tight mb-2">
                        {weather.name}
                      </h2>
                      <p className="text-xl font-medium opacity-90 flex items-center gap-2">
                        <span className="capitalize">
                          {weather.weather[0].description}
                        </span>
                        <span>•</span>
                        <span>
                          Local Time:{" "}
                          {new Date().toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="py-6 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="text-2xl font-semibold mb-4 dark:text-white">
                    What this weather feels like
                  </h3>
                  <div className="flex gap-4 items-start">
                    <div className="bg-gray-100 dark:bg-[#1e1e1e] p-3 rounded-full">
                      ✨
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic">
                      "
                      {aiSummary || "The AI is preparing your local insight..."}
                      "
                    </p>
                  </div>
                </div>
              </div>

              <div className="airbnb-card p-6 h-fit top-10">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-3xl font-bold dark:text-white">
                    {Math.round(weather.main.temp)}°C
                  </span>
                </div>
                <div className="space-y-4 text-sm border-t border-gray-100 dark:border-gray-800 pt-4">
                  <div className="flex justify-between">
                    <span>Humidity</span>{" "}
                    <span className="dark:text-gray-300">
                      {weather.main.humidity}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wind Speed</span>{" "}
                    <span className="dark:text-gray-300">
                      {weather.wind.speed} m/s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Feels Like</span>{" "}
                    <span className="dark:text-gray-300">
                      {Math.round(weather.main.feels_like)}°C
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleToggleFavorite}
                  className={`w-full mt-6 py-3 rounded-xl font-bold transition-all ${
                    favorites.includes(weather.name.toLowerCase())
                      ? "bg-gray-100 text-[#222222] border border-gray-300 dark:bg-gray-800 dark:text-white"
                      : "bg-[#FF385C] text-white hover:bg-[#E31C5F]"
                  }`}
                >
                  {favorites.includes(weather.name.toLowerCase())
                    ? "❤️ Saved"
                    : "🤍 Save to Favorites"}
                </button>
              </div>
            </div>

            <div className="mb-16">
              {isLoggedIn ? (
                <div className="p-8 bg-[#f7f7f7] dark:bg-[#1e1e1e] rounded-3xl border border-gray-200 dark:border-gray-800 animate-vibe">
                  <h4 className="text-2xl font-semibold mb-2 text-[#222222] dark:text-white">
                    How's the vibe in {weather.name}?
                  </h4>
                  <p className="text-[#717171] dark:text-gray-400 mb-6 text-sm font-light">
                    Share your local insight (max 100 words).
                  </p>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="The air is crisp and perfect for a walk..."
                    className="airbnb-input h-32 text-[15px] bg-white dark:bg-[#121212] dark:text-white"
                  />
                  <div className="flex justify-between items-center mt-4">
                    <span
                      className={`text-xs ${newComment.length > 450 ? "text-red-500" : "text-gray-400"}`}
                    >
                      {newComment.length} / 500 characters
                    </span>
                    <button
                      onClick={handlePostComment}
                      disabled={!newComment.trim()}
                      className="btn-primary"
                    >
                      Post Vibe
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative overflow-hidden p-10 rounded-3xl border border-gray-200 dark:border-gray-800 text-center bg-white dark:bg-[#1e1e1e] shadow-sm">
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#FF385C]/10 rounded-full blur-3xl" />
                  <h4 className="text-2xl font-semibold mb-3 text-[#222222] dark:text-white">
                    Join the conversation
                  </h4>
                  <p className="text-[#717171] dark:text-gray-400 mb-8 max-w-sm mx-auto leading-relaxed">
                    Log in to share what the weather feels like and help fellow
                    travelers.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href="/login" className="btn-primary px-10">
                      Log In
                    </Link>
                    <Link
                      href="/register"
                      className="text-sm font-semibold underline text-[#222222] dark:text-gray-300 hover:text-gray-600 transition"
                    >
                      Create an account
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-12">
              <h3 className="text-2xl font-semibold mb-8 dark:text-white">
                Public Vibe Check
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12">
                {comments.length > 0 ? (
                  comments.map((c, i) => (
                    <div key={i} className="flex flex-col gap-3 animate-vibe">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#222222] dark:bg-gray-700 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
                          {c.userName[0].toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#222222] dark:text-white text-base">
                            {c.userName}
                          </h4>
                          <p className="text-sm text-[#717171] dark:text-gray-400">
                            {new Date(c.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <p className="text-[#222222] dark:text-gray-300 leading-relaxed text-[15px] font-light">
                        {c.text}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-[#717171] italic col-span-2">
                    No vibes shared for this city yet.
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-3xl font-semibold text-gray-400">
              Search a city to start your journey.
            </h2>
          </div>
        )}
      </main>
    </div>
  );
}
