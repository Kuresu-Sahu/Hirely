import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
    Briefcase, 
    MapPin, 
    DollarSign, 
    Clock, 
    FileText, 
    Sparkles, 
    ArrowLeft, 
    CheckCircle2, 
    AlertCircle,
    Layers,
    Save
} from "lucide-react";
import api from "../services/api";

function EditJob() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        jobType: "",
        experience: "",
        salaryMin: "",
        salaryMax: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const loadJob = async () => {
            try {
                const response = await api.get(`/api/jobs/${id}`);
                const job = response.data;
                setFormData({
                    title: job.title || "",
                    description: job.description || "",
                    location: job.location || "",
                    jobType: job.jobType || "FULL_TIME",
                    experience: job.experience || "",
                    salaryMin: job.salaryMin ?? "",
                    salaryMax: job.salaryMax ?? ""
                });
            } catch (err) {
                console.error("Error loading job:", err);
                setError(err.response?.data || "Unable to load job posting details.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadJob();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setSaving(true);

        try {
            const requestData = {
                title: formData.title,
                description: formData.description,
                location: formData.location,
                jobType: formData.jobType,
                experience: formData.experience,
                salaryMin: formData.salaryMin === "" ? null : Number(formData.salaryMin),
                salaryMax: formData.salaryMax === "" ? null : Number(formData.salaryMax)
            };

            await api.put(`/api/jobs/${id}`, requestData);
            setSuccess("Job updated successfully!");
            setTimeout(() => {
                navigate("/recruiter/jobs");
            }, 1000);
        } catch (err) {
            console.error("Update job error:", err);
            setError(err.response?.data || "Unable to update job posting.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-slate-500">Loading job details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Header / Sub-nav */}
            <div className="bg-white border-b border-slate-200/80 sticky top-16 z-30 shadow-xs">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/recruiter/jobs")}
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Back to my jobs"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-blue-600" /> Edit Job Posting
                            </h1>
                            <p className="text-xs text-slate-500">Update position details and requirements</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-sm">
                            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-700 text-sm">
                            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                            <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Section 1: Basic Information */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-blue-600" /> Basic Details
                            </h2>
                            <p className="text-xs text-slate-500 mb-6">Modify position title and description</p>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                        Job Title <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g. Senior Full Stack Engineer"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                        Job Description <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Detail key responsibilities, required skills, technology stack, and expectations..."
                                        rows="6"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Position Attributes */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                                <Layers className="w-5 h-5 text-indigo-600" /> Position Specifications
                            </h2>
                            <p className="text-xs text-slate-500 mb-6">Location, work type, and experience requirements</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                        Location <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            placeholder="e.g. Bangalore, India (or Remote)"
                                            required
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                        Employment Type <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Clock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        <select
                                            name="jobType"
                                            value={formData.jobType}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="FULL_TIME">Full Time</option>
                                            <option value="PART_TIME">Part Time</option>
                                            <option value="INTERNSHIP">Internship</option>
                                            <option value="CONTRACT">Contract</option>
                                            <option value="REMOTE">Remote</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                        Experience Required
                                    </label>
                                    <input
                                        type="text"
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        placeholder="e.g. 2 - 5 years"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Compensation */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-emerald-600" /> Compensation Range (Annual in ₹)
                            </h2>
                            <p className="text-xs text-slate-500 mb-6">Specify min/max salary expectations</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                        Minimum Salary (INR)
                                    </label>
                                    <div className="relative">
                                        <span className="text-slate-400 font-semibold absolute left-4 top-1/2 -translate-y-1/2">₹</span>
                                        <input
                                            type="number"
                                            name="salaryMin"
                                            value={formData.salaryMin}
                                            onChange={handleChange}
                                            placeholder="e.g. 600000"
                                            min="0"
                                            className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                        Maximum Salary (INR)
                                    </label>
                                    <div className="relative">
                                        <span className="text-slate-400 font-semibold absolute left-4 top-1/2 -translate-y-1/2">₹</span>
                                        <input
                                            type="number"
                                            name="salaryMax"
                                            value={formData.salaryMax}
                                            onChange={handleChange}
                                            placeholder="e.g. 1200000"
                                            min="0"
                                            className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Action */}
                        <div className="flex items-center justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate("/recruiter/jobs")}
                                className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-60 flex items-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        <span>Saving Changes...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </main>
        </div>
    );
}

export default EditJob;