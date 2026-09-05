import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import Icon from "../components/Icon";

function Resume() {
    const navigate = useNavigate();
    const [resume, setResume] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchResume = async () => {
            try {
                const response = await api.get("/api/resumes/my");
                setResume(response.data);
            } catch (err) {
                if (err.response?.status !== 400) {
                    console.error("Error loading resume:", err);
                    setError("Unable to load your resume.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchResume();
    }, []);

    const handleFileChange = (e) => {
        setError("");
        setSuccess("");
        const file = e.target.files[0];
        if (!file) {
            setSelectedFile(null);
            return;
        }

        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
            setError("Only PDF files are allowed.");
            setSelectedFile(null);
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Resume file must be smaller than 5 MB.");
            setSelectedFile(null);
            return;
        }

        setSelectedFile(file);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (!selectedFile) {
            setError("Please select a PDF resume.");
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("file", selectedFile);

            const response = await api.post("/api/resumes/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setResume(response.data);
            setSelectedFile(null);
            setSuccess("Resume uploaded successfully!");
        } catch (err) {
            console.error("Error uploading resume:", err);
            setError(err.response?.data || "Failed to upload resume.");
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-16 text-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm font-semibold text-slate-600">Retrieving master resume...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                        <Icon name="fileSearch" size={26} className="text-blue-600" />
                        My Resume Profile
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Manage your standard PDF CV for instant 1-click applications and AI ATS scans.
                    </p>
                </div>

                <button
                    onClick={() => navigate("/candidate/dashboard")}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                >
                    <Icon name="left" size={14} />
                    <span>Dashboard</span>
                </button>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                    <Icon name="check" size={16} />
                    <span>{success}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* UPLOAD BOX */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between"
                >
                    <div>
                        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                            <Icon name="upload" size={18} className="text-blue-600" />
                            Upload / Replace PDF Resume
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            PDF format only (Max 5 MB).
                        </p>

                        <form onSubmit={handleUpload} className="mt-6 space-y-4">
                            <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 rounded-2xl p-6 text-center cursor-pointer block transition-all">
                                <Icon name="upload" size={32} className="mx-auto text-blue-600 mb-2" />
                                <span className="text-xs font-bold text-slate-800 block">Click to select PDF resume</span>
                                <span className="text-[11px] text-slate-400 block mt-1">Drag and drop or browse file</span>
                                <input
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>

                            {selectedFile && (
                                <div className="p-3 bg-blue-50 rounded-xl text-xs font-bold text-blue-700 flex items-center justify-between border border-blue-200">
                                    <span className="line-clamp-1">{selectedFile.name}</span>
                                    <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={uploading || !selectedFile}
                                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all"
                            >
                                {uploading ? "Uploading PDF..." : "Save Resume PDF"}
                            </button>
                        </form>
                    </div>
                </motion.div>

                {/* CURRENT RESUME VIEW */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 flex flex-col justify-between"
                >
                    {resume ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                                    <Icon name="file" size={18} className="text-emerald-600" />
                                    Active Master Resume
                                </h2>
                                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Uploaded
                                </span>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[10px] font-extrabold uppercase text-slate-400">File Name</p>
                                    <p className="font-bold text-slate-800 mt-0.5">{resume.fileName}</p>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[10px] font-extrabold uppercase text-slate-400">Upload Date</p>
                                    <p className="font-semibold text-slate-700 mt-0.5">
                                        {resume.uploadedAt ? new Date(resume.uploadedAt).toLocaleString() : "Recently"}
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200/80 space-y-2">
                                <h3 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                                    <Icon name="bot" size={16} />
                                    Ready for AI ATS Match
                                </h3>
                                <p className="text-[11px] text-blue-700 leading-relaxed">
                                    Your resume is primed for AI evaluation against target job descriptions.
                                </p>
                                <button
                                    onClick={() => navigate("/jobs")}
                                    className="mt-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
                                >
                                    Select Job to Scan
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 space-y-2">
                            <Icon name="file" size={40} className="mx-auto text-slate-300" />
                            <h3 className="text-base font-bold text-slate-800">No Resume Saved</h3>
                            <p className="text-xs text-slate-500">Upload your PDF resume on the left to activate AI analysis.</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

export default Resume;