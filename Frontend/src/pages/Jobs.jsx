import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import Icon from "../components/Icon";

function Jobs() {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // SEARCH FILTERS
    const [keyword, setKeyword] = useState("");
    const [location, setLocation] = useState("");
    const [jobType, setJobType] = useState("");
    const [experience, setExperience] = useState("");
    const [minSalary, setMinSalary] = useState("");

    const fetchJobs = async () => {
        setLoading(true);
        setError("");
        try {
            const params = {};
            if (keyword.trim()) params.keyword = keyword.trim();
            if (location.trim()) params.location = location.trim();
            if (jobType) params.jobType = jobType;
            if (experience.trim()) params.experience = experience.trim();
            if (minSalary !== "") params.minSalary = Number(minSalary);

            const response = await api.get("/api/jobs/search", { params });
            setJobs(response.data);
        } catch (err) {
            console.error("Error loading jobs:", err);
            setError(err.response?.data || "Unable to load jobs. Please try again.");
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchJobs();
    };

    const clearFilters = () => {
        setKeyword("");
        setLocation("");
        setJobType("");
        setExperience("");
        setMinSalary("");
        api.get("/api/jobs")
            .then(res => setJobs(res.data))
            .catch(() => setError("Unable to load jobs."));
    };

    const formatSalary = (salary) => {
        if (!salary) return null;
        return Number(salary).toLocaleString("en-IN");
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* PAGE HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Icon name="briefcase" size={28} className="text-blue-600" />
                        Explore Job Opportunities
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Find AI-curated job postings matched to your target skills and compensation expectations.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate("/candidate/dashboard")}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                    >
                        <Icon name="left" size={14} />
                        Back to Dashboard
                    </button>
                </div>
            </div>

            {/* SEARCH & FILTER BAR */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm"
            >
                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">
                                Keyword
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="React, Developer, Engineer..."
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                                />
                                <Icon name="search" size={16} className="absolute left-3 top-3 text-slate-400" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">
                                Location
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Bangalore, Remote..."
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                                />
                                <Icon name="pin" size={16} className="absolute left-3 top-3 text-slate-400" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">
                                Job Type
                            </label>
                            <select
                                value={jobType}
                                onChange={(e) => setJobType(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                            >
                                <option value="">All Job Types</option>
                                <option value="FULL_TIME">Full Time</option>
                                <option value="PART_TIME">Part Time</option>
                                <option value="INTERNSHIP">Internship</option>
                                <option value="CONTRACT">Contract</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">
                                Min Salary (₹)
                            </label>
                            <input
                                type="number"
                                placeholder="500000"
                                value={minSalary}
                                onChange={(e) => setMinSalary(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all"
                        >
                            <Icon name="search" size={15} />
                            <span>{loading ? "Searching..." : "Search Jobs"}</span>
                        </button>

                        <button
                            type="button"
                            onClick={clearFilters}
                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                        >
                            <Icon name="close" size={14} />
                            <span>Clear Filters</span>
                        </button>
                    </div>
                </form>
            </motion.div>

            {/* RESULTS STATE */}
            {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-16">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm font-semibold text-slate-600">Searching active opportunities...</p>
                </div>
            ) : jobs.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8">
                    <Icon name="search" size={40} className="mx-auto text-slate-300 mb-3" />
                    <h3 className="text-lg font-bold text-slate-800">No jobs match your search</h3>
                    <p className="text-xs text-slate-500 mt-1">Try broadening your keyword or location filters.</p>
                    <button
                        onClick={clearFilters}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
                    >
                        Show All Jobs
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Found {jobs.length} {jobs.length === 1 ? "Opportunity" : "Opportunities"}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job) => (
                            <motion.div
                                key={job.id}
                                whileHover={{ y: -4 }}
                                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                                            {job.company?.name ? job.company.name.charAt(0) : "C"}
                                        </div>
                                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                            {job.jobType || "Full Time"}
                                        </span>
                                    </div>

                                    <h3 className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1">
                                        {job.title}
                                    </h3>
                                    <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mt-1">
                                        <Icon name="building" size={14} className="text-slate-400" />
                                        <span>{job.company?.name || "Hirely Partner"}</span>
                                    </p>

                                    <div className="flex flex-wrap gap-2 mt-3 text-[11px] text-slate-500">
                                        <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                                            <Icon name="pin" size={12} />
                                            {job.location || "Flexible"}
                                        </span>
                                        {job.experience && (
                                            <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                                                <Icon name="briefcase" size={12} />
                                                {job.experience}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                                        {job.description}
                                    </p>

                                    {(job.salaryMin || job.salaryMax) && (
                                        <p className="text-xs font-bold text-emerald-600 mt-3 flex items-center gap-1">
                                            <Icon name="chart" size={14} />
                                            ₹{formatSalary(job.salaryMin)} - ₹{formatSalary(job.salaryMax)}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                                    <button
                                        onClick={() => navigate(`/jobs/${job.id}`)}
                                        className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs text-center transition-colors"
                                    >
                                        View Job
                                    </button>
                                    <button
                                        onClick={() => navigate(`/resume-analysis/${job.id}`)}
                                        title="Analyze ATS Match"
                                        className="py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                                    >
                                        <Icon name="bot" size={14} />
                                        <span>Scan ATS</span>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Jobs;