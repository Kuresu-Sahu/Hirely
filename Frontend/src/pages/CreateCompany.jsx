import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import Icon from "../components/Icon";

function CreateCompany() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        website: "",
        location: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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
        setLoading(true);

        try {
            await api.post(
                "/api/companies",
                formData
            );

            alert("Company created successfully!");
            navigate("/recruiter/dashboard");
        } catch (error) {
            console.error(
                "Company creation error:",
                error
            );

            setError(
                error.response?.data ||
                "Unable to create company."
            );
        } finally {
            setLoading(false);
        }
    };

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
                                disabled={loading}
                            >
                                <Icon name="building" />

                                {loading
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

export default CreateCompany;
