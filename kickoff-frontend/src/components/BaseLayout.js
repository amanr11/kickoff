import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/images/kickofflogo(2).png'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../assets/css/main.css';

const BaseLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/check-auth', {
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                });
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                
                const data = await response.json();
                console.log('Auth check response:', data);  // Debug log
                
                setIsAuthenticated(data.isAuthenticated);
                if (data.user) {
                    setUser(data.user);
                }
                
                // Debug logs
                console.log('Setting isAuthenticated to:', data.isAuthenticated);
                console.log('Setting user to:', data.user);
            } catch (error) {
                console.error('Error checking auth:', error);
                setIsAuthenticated(false);
                setUser(null);
            }
        };

        checkAuth();
    }, [location.pathname]);

    // Debug log for render
    console.log('Current auth state:', isAuthenticated);
    console.log('Current user:', user);

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                setIsAuthenticated(false);
                setUser(null);
                navigate('/login');
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Extract the authentication buttons into a separate component for clarity
    const AuthButtons = () => {
        console.log('Rendering AuthButtons with isAuthenticated:', isAuthenticated); // Debug log
        
        if (!isAuthenticated) {
            return (
                <div className="d-flex">
                    <Link to="/register" className="btn btn-outline-success mx-2">Register</Link>
                    <Link to="/login" className="btn btn-outline-success mx-2" id="login1">Login</Link>
                </div>
            );
        }
        
        return (
            <div className="d-flex">
                <Link to="/profile" className="btn btn-outline-success mx-2">Profile</Link>
                <button onClick={handleLogout} className="btn btn-outline-success mx-2">Logout</button>
            </div>
        );
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container-fluid px-4">
                    <Link className="navbar-brand" to="/">
                        <img id="logo" src={logo} alt="Kickoff Logo" />
                    </Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarNav" aria-controls="navbarNav"
                        aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <Link className="nav-link" to="/">Home</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/dashboard">Arena</Link>
                            </li>
                            <li className="nav-item dropdown">
                                <Link className="nav-link" to="/my-hosted-games"
                                    id="gameDropdown" role="button" aria-expanded="false">
                                    Game Hub
                                </Link>
                                <ul className="dropdown-menu" aria-labelledby="gameDropdown">
                                    <li><Link className="dropdown-item" to="/post-game">Create New Game</Link></li>
                                    <li><Link className="dropdown-item" to="/my-hosted-games">Your Hosted Games</Link></li>
                                </ul>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/contact">Contact</Link>
                            </li>
                        </ul>
                    </div>
                    <AuthButtons />
                </div>
            </nav>

            <main className="container my-5">
                {children}
            </main>

            <footer className="bg-dark text-light py-5">
                <div className="container">
                    <div className="row">
                        <div className="col-md-6 mb-4 mb-md-0">
                            <h5 className="text-uppercase fw-bold mb-3">Quick Links</h5>
                            <ul className="list-unstyled">
                                <li><Link to="/contact" className="text-light text-decoration-none hover-link">Contact Us</Link></li>
                                <li><Link to="/profile" className="text-light text-decoration-none hover-link">Profile</Link></li>
                                <li><Link to="#" className="text-light text-decoration-none hover-link">FAQs</Link></li>
                            </ul>
                        </div>

                        <div className="col-md-6">
                            <h5 className="text-uppercase fw-bold mb-3">Stay Connected</h5>
                            <p>Follow us on social media for updates and promotions!</p>
                            <div className="social-icons">
                                <Link to="#" className="text-light me-3 hover-icon"><i className="fab fa-facebook"></i></Link>
                                <Link to="#" className="text-light me-3 hover-icon"><i className="fab fa-twitter"></i></Link>
                                <Link to="#" className="text-light hover-icon"><i className="fab fa-instagram"></i></Link>
                            </div>
                        </div>
                    </div>

                    <hr className="border-light mt-4" />

                    <div className="row mt-4">
                        <div className="col text-left">
                            <p id="grey">&copy; 2025 KickOff. All rights reserved.</p>
                        </div>
                        <div className="col text-right">
                            <p><Link to="#" id="grey" className="text-light text-decoration-none hover-link">Terms and Conditions</Link></p>
                        </div>
                    </div>
                </div>
            </footer>

            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
            <script src="https://code.jquery.com/jquery-3.6.4.min.js"
                integrity="sha384-UG8ao2jwOWB7/oDdObZc6ItJmwUkR/PfMyt9Qs5AwX7PsnYn1CRKCTWyncPTWvaS"
                crossOrigin="anonymous"></script>
        </>
    );
};

export default BaseLayout;