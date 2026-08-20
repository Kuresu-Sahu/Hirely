import { useTheme } from "../context/ThemeContext";
import Icon from "./Icon";

function ThemeToggle() {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            title={isDark ? "Switch to light theme" : "Switch to dark theme"}
        >
            <span className="theme-toggle-icon" aria-hidden="true">
                <Icon name={isDark ? "sun" : "moon"} />
            </span>

            <span className="theme-toggle-text">
                {isDark ? "Light" : "Dark"}
            </span>
        </button>
    );
}

export default ThemeToggle;
