import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import heroImage from '../public/assets/img/hero.png';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import WeeklyPlanner from "../components/features/calender/WeeklyCalendar";

type WeatherInfo = {
    temperatureC: number
    summary: string
    location: string
};

const weatherLabelFromCode = (code: number): string => {
    // https://open-meteo.com/en/docs
    if ([0].includes(code)) return "Clear";
    if ([1, 2, 3].includes(code)) return "Partly cloudy";
    if ([45, 48].includes(code)) return "Fog";
    if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
    if ([95, 96, 99].includes(code)) return "Thunderstorm";
    return "Weather";
};

export default function HomePage() {
    const { theme } = useTheme();
    const { getToken, user } = useAuth();
    const [weather, setWeather] = useState<WeatherInfo | null>(null);
    const [weatherLoading, setWeatherLoading] = useState(false);

    const token = getToken();

    useEffect(() => {
        if (!token) return;
        let cancelled = false;

        const fetchWeather = async () => {
            setWeatherLoading(true);
            try {
                // Fixed to Pisa, Italy
                const latitude = 43.716;
                const longitude = 10.401;

                const wxResp = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
                );
                const wxJson = await wxResp.json();
                const cw = wxJson?.current_weather;
                if (!cw) throw new Error("No weather data");

                const next: WeatherInfo = {
                    temperatureC: Math.round(cw.temperature),
                    summary: weatherLabelFromCode(Number(cw.weathercode)),
                    location: "Pisa, Italy"
                };
                if (!cancelled) setWeather(next);
            } catch (e) {
                if (!cancelled) setWeather(null);
            } finally {
                if (!cancelled) setWeatherLoading(false);
            }
        };

        void fetchWeather();
        return () => {
            cancelled = true;
        };
    }, [token]);

    const todayLabel = useMemo(
        () => new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }),
        []
    );

    // When authenticated, show dashboard-style home
    if (token) {
        return (
            <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark'
                ? 'bg-transparent'
                : 'bg-gray-50'
            }`}>
                {/* Top Welcome + Weather */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-3">
                        <div className="rounded-2xl border bg-white/80 dark:bg-white/5 border-black/10 dark:border-white/10 p-8 shadow-lg">
                            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-500 dark:text-white/60">Welcome Back,</p>
                                    <small className='text-4xl font-bold pb-4'>{user?.username}</small>
                                    <p className="text-lg text-gray-600 dark:text-white/70">Let's make some style choices today.</p>
                                </div>
                                <div className="flex items-center justify-between gap-6 w-full md:w-auto">
                                    <div>
                                        <div className="text-3xl font-bold text-indigo-600 dark:text-purple-300">
                                            {weather ? `${weather.temperatureC}°C` : weatherLoading ? '...' : '—'}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-white/70">
                                            {weather ? weather.summary : weatherLoading ? 'Loading weather...' : 'Weather unavailable'}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-white/60 mt-1">
                                            {weather?.location || ''}
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500 dark:text-white/50">{todayLabel}</div>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-yellow-400/20 flex items-center justify-center">
                                        <span className="text-yellow-400 text-xl">☀️</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link to="/wardrobe" className="group rounded-2xl border bg-white/80 dark:bg-white/5 border-black/10 dark:border-white/10 p-6 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center mb-4">+
                            </div>
                            <div className="font-semibold text-gray-900 dark:text-white">Add Item</div>
                            <div className="text-sm text-gray-600 dark:text-white/70">Add a new clothing item to your wardrobe.</div>
                        </Link>

                        <Link to="/create-outfit" className="group rounded-2xl border bg-white/80 dark:bg-white/5 border-black/10 dark:border-white/10 p-6 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-10 h-10 rounded-xl bg-pink-500/15 text-pink-500 flex items-center justify-center mb-4">👗
                            </div>
                            <div className="font-semibold text-gray-900 dark:text-white">Create Outfit</div>
                            <div className="text-sm text-gray-600 dark:text-white/70">Mix, match, and craft your next standout look.</div>
                        </Link>

                        <Link to="/ai-recommendations" className="group rounded-2xl border bg-white/80 dark:bg-white/5 border-black/10 dark:border-white/10 p-6 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center mb-4">🤖
                            </div>
                            <div className="font-semibold text-gray-900 dark:text-white">AI Stylist</div>
                            <div className="text-sm text-gray-600 dark:text-white/70">Get smart outfit suggestions curated just for you.</div>
                        </Link>
                    </div>
                </div>

                {/* Weekly Planner */}
         <div className="mt-8">
    <WeeklyPlanner />
</div>

            </div>
        );
    }

    // Public hero (kept intact)
    return (
        <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark'
                ? 'bg-gradient-to-b from-[rgba(6,19,45,1)] to-[#1A0F2E]'
                : 'bg-gradient-to-b from-slate-50 to-purple-50'
            }`}>
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Background Pattern - only in dark mode */}
                {theme === 'dark' && (
                    <div className="absolute inset-0 opacity-10">
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                            }}
                        ></div>
                    </div>
                )}

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="space-y-8">
                            {/* Main Heading */}
                            <div className="space-y-6">
                                <h1 className={`text-4xl md:text-6xl font-bold leading-tight ${theme === 'dark'
                                        ? 'text-white'
                                        : 'text-gray-800'
                                    }`}>
                                    <span className="inline-block mr-4">CAPTURE.</span>
                                    <span className="inline-block mr-4">CREATE.</span>
                                    <span className="inline-block">WEAR.</span>
                                </h1>
                                <p className={`text-xl md:text-2xl max-w-2xl leading-relaxed ${theme === 'dark'
                                        ? 'text-gray-300'
                                        : 'text-gray-600'
                                    }`}>
                                    Say goodbye to wardrobe chaos and hello to effortless style with Outfitory — your digital closet for smarter, stress-free dressing.
                                </p>
                            </div>

                            {/* CTA Buttons */}
                            {!token && (
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link
                                        to="/register"
                                        className="group relative px-8 py-4 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold rounded-full hover:from-pink-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/25"
                                    >
                                        <span className="relative z-10">SIGN UP</span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </Link>
                                    <Link
                                        to="/login"
                                        className={`px-8 py-4 border-2 font-semibold rounded-full transition-all duration-300 transform hover:scale-105 ${theme === 'dark'
                                                ? 'border-gray-400 text-gray-300 hover:bg-gray-400/20 hover:text-white'
                                                : 'border-purple-300 text-purple-600 hover:bg-purple-100'
                                            }`}
                                    >
                                        LOGIN
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Right Content - Hero Image */}
                        <div className="flex justify-center lg:justify-end">
                            <div className="relative">
                                <img
                                    src={heroImage}
                                    alt="Outfitory App Interface"
                                    className="w-full max-w-lg h-auto"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Elements - only in dark mode */}
                {theme === 'dark' && (
                    <>
                        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
                        <div className="absolute bottom-20 right-10 w-32 h-32 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
                        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-500"></div>
                    </>
                )}
            </section>        
        </div>
    );
    
}
