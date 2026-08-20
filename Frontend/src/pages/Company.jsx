import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import Icon from "../components/Icon";

function Company() {
    const navigate = useNavigate();

    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        website: "",
        location: ""
    });

    useEffect(() => {
        fetchCompany();
    }, []);

    const fetchCompany = async () => {
        try {
            const response = await api.get("/api/companies/my");
            setCompany(response.data);
        } catch (error) {
            if (
                error.response?.data ===
                "You have not created a company yet"
            ) {
                setCompany(null);
            } else {
                console.error("Company loading error:", error);
                setError("Unable to load company information.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");
        setCreating(true);

        try {
            const response = await api.post(
                "/api/companies",
                formData
            );

            setCompany(response.data);
            setSuccess("Company created successfully!");
        } catch (error) {
            console.error("Company creation error:", error);

            setError(
                error.response?.data ||
                "Unable to create company."
            );
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="page-center">
                <h2>Loading company...</h2>
            </div>
        );
    }

    if (company) {
        return (
            <div>
                <nav className="navbar">
                    <div className="brand">
                        <img
                            src="/logo.png"
                            alt="Hirely"
                            className="brand-logo"
                        />
                    </div>

                    <button
                        className="secondary-button"
                        onClick={() =>
                            navigate("/recruiter/dashboard")
                        }
                    >
                        <Icon name="left" /> Dashboard
                    </button>
                </nav>

                <main className="dashboard company-page">
                    <div className="jobs-header">
                        <h1>
                            <Icon name="building" /> My Company
                        </h1>

                        <p>
                            Manage your company information and
                            continue building your recruitment profile.
                        </p>
                    </div>

                    {success && (
                        <div className="success-message">
                            {success}
                        </div>
                    )}

                    <section className="dashboard-card company-profile-card">
                        <div className="company-profile-icon">
                            <Icon name="building" size={26} />
                        </div>

                        <div className="company-profile-content">
                            <h2>{company.name}</h2>

                            {company.description && (
                                <p className="company-profile-description">
                                    {company.description}
                                </p>
                            )}

                            <div className="company-profile-meta">
                                {company.location && (
                                    <div>
                                        <Icon name="pin" />
                                        <span>{company.location}</span>
                                    </div>
                                )}

                                {company.website && (
                                    <div>
                                        <Icon name="globe" />
                                        <span>{company.website}</span>
                                    </div>
                                )}
                            </div>

                            <div className="job-actions">
                                <button
                                    className="primary-button"
                                    onClick={() =>
                                        navigate("/recruiter/jobs")
                                    }
                                >
                                    <Icon name="briefcase" />
                                    Manage Jobs
                                </button>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        );
    }

    return (
        <div>
            <nav className="navbar">
                <div className="brand">
                    <img
                        src="/logo.png"
                        alt="Hirely"
                        className="brand-logo"
                    />
                </div>

                <button
                    className="secondary-button"
                    onClick={() =>
                        navigate("/recruiter/dashboard")
                    }
                >
                    <Icon name="left" /> Dashboard
                </button>
            </nav>

            <main className="form-page company-create-page">
                <div className="company-create-shell">
                    <div className="company-create-header">
                        <div className="company-create-badge">
                            <Icon name="building" size={24} />
                        </div>

                        <div>
                            <span className="eyebrow">
                                Recruiter setup
                            </span>

                            <h1>Create your company</h1>

                            <p>
                                Set up your company profile once.
                                You can then start creating and
                                managing job postings from Hirely.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form
                        className="company-create-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="form-section">
                            <div className="form-section-heading">
                                <div>
                                    <h2>Company information</h2>
                                    <p>
                                        Add the details candidates
                                        should see on your company profile.
                                    </p>
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="form-group form-group-full">
                                    <label htmlFor="company-name">
                                        Company Name <span>*</span>
                                    </label>

                                    <input
                                        id="company-name"
                                        type="text"
                                        name="name"
                                        placeholder="e.g. Acme Technologies"
                                        value={formData.name}
                                        onChange={handleChange}
                                        autoComplete="organization"
                                        required
                                    />
                                </div>

                                <div className="form-group form-group-full">
                                    <label htmlFor="company-description">
                                        Company Description
                                    </label>

                                    <textarea
                                        id="company-description"
                                        name="description"
                                        placeholder="Tell candidates about your company, products, culture, and what makes your team different..."
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="6"
                                    />

                                    <span className="field-help">
                                        Keep it clear and candidate-friendly.
                                    </span>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="company-website">
                                        Website
                                    </label>

                                    <input
                                        id="company-website"
                                        type="text"
                                        name="website"
                                        placeholder="https://example.com"
                                        value={formData.website}
                                        onChange={handleChange}
                                        autoComplete="url"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="company-location">
                                        Location
                                    </label>

                                    <input
                                        id="company-location"
                                        type="text"
                                        name="location"
                                        placeholder="e.g. Bengaluru, India"
                                        value={formData.location}
                                        onChange={handleChange}
                                        autoComplete="address-level2"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-actions company-form-actions">
                            <button
                                type="submit"
                                className="primary-button"
                                disabled={creating}
                            >
                                <Icon name="building" />

                                {creating
                                    ? "Creating..."
                                    : "Create Company"}
                            </button>

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                    navigate(
                                        "/recruiter/dashboard"
                                    )
                                }
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default Company;
