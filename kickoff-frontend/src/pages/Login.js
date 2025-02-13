import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import BaseLayout from '../components/BaseLayout';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [messages, setMessages] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('verified')) {
            setMessages([{ category: 'success', message: 'Email verified successfully' }]);
        }
    }, [location]);

    // In Login.js, modify handleLogin:
    const handleLogin = async (e) => {
        e.preventDefault();
        setMessages([]); // clear previous messages

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();
            console.log("Login response:", result);

            if (response.ok && result.success) {
                // Store user info
                localStorage.setItem('user', JSON.stringify(result.user));
                
                setMessages([{ 
                    category: 'success', 
                    message: 'Login successful! Redirecting...' 
                }]);

                // Navigate after a short delay
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000);
            } else {
                setMessages([{ 
                    category: 'danger', 
                    message: result.message || 'Login failed. Please check your credentials.' 
                }]);
            }
        } catch (error) {
            console.error("Login error:", error);
            setMessages([{ 
                category: 'danger', 
                message: 'Server error. Please try again.' 
            }]);
        }
    };

    return (
        <BaseLayout>
            {messages.length > 0 && (
                <div className="container mt-3">
                    {messages.map((msg, index) => (
                        <div key={index} className={`alert ${msg.category === 'success' ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`} role="alert" id="flashMessage">
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

                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary">Login</button>
            </form>

            <p className="mt-3">Don't have an account? <Link to="/register">Register here</Link></p>
        </BaseLayout>
    );
};

export default Login;
