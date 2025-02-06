import React, { useState } from 'react';
import BaseLayout from '../components/BaseLayout';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [messages, setMessages] = useState([]);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        const response = await fetch('/api/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password }),
        });

        const result = await response.json();
        if (result.success) {
            setMessages([{ category: 'success', message: 'Password reset successfully!' }]);
            setPassword('');
        } else {
            setMessages([{ category: 'danger', message: result.message }]);
        }
    };

    return (
        <BaseLayout>
            {messages.length > 0 && (
                <div className="container mt-3">
                    {messages.map((msg, index) => (
                        <div key={index} className={`alert alert-${msg.category} alert-dismissible fade show`} role="alert" id="flashMessage">
                            {msg.message}
                            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    ))}
                </div>
            )}

            <h2>Reset Password</h2>

            <form onSubmit={handleResetPassword}>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">New Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary">Reset Password</button>
            </form>
        </BaseLayout>
    );
};

export default ResetPassword;