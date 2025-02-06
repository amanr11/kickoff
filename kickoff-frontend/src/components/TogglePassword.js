import React, { useState } from 'react';

const TogglePassword = ({ password, setPassword }) => {
    const [passwordVisible, setPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <div className="input-group">
            <input
                type={passwordVisible ? "text" : "password"}
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
            />
            <button
                type="button"
                className="btn btn-outline-secondary"
                id="togglePassword"
                onClick={togglePasswordVisibility}
            >
                <i className={`fas ${passwordVisible ? "fa-eye-slash" : "fa-eye"}`} id="eyeIcon"></i>
            </button>
        </div>
    );
};

export default TogglePassword;