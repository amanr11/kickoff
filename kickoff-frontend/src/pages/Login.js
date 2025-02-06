import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BaseLayout from '../components/BaseLayout';
import TogglePassword from '../components/TogglePassword';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [messages, setMessages] = useState([]);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();
        if (result.success) {
            navigate('/dashboard');
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

            <h2>Login</h2>

            <form onSubmit={handleLogin}>
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

                <div className="mb-3 position-relative">
                    <label htmlFor="password" className="form-label">Password</label>
                    <TogglePassword password={password} setPassword={setPassword} />
                </div>

                <button type="submit" className="btn btn-primary">Login</button>
            </form>

            <p className="mt-3">Don't have an account? <Link to="/register">Register here</Link></p>
            <p className="mt-3"><Link to="/forgot-password">Forgot Password?</Link></p>
        </BaseLayout>
    );
};

export default Login;