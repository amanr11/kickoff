import React, { useState } from 'react';
import BaseLayout from '../components/BaseLayout';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [messages, setMessages] = useState([]);

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        const response = await fetch('/api/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const result = await response.json();
        if (result.success) {
            setMessages([{ category: 'success', message: 'Password reset request sent!' }]);
            setEmail('');
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

            <h2>Forgot Password</h2>

            <form onSubmit={handleForgotPassword}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary">Request Password Reset</button>
            </form>
        </BaseLayout>
    );
};

export default ForgotPassword;