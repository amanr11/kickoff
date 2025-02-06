import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BaseLayout from '../components/BaseLayout';
import profilePicDefault from '../assets/profile_pics/default_profile.png';

const Profile = () => {
    const [currentUser, setCurrentUser] = useState({});
    const [hostedGames, setHostedGames] = useState([]);
    const [messages, setMessages] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch user data and hosted games
        const fetchUserData = async () => {
            const response = await fetch('/api/profile');
            const result = await response.json();
            setCurrentUser(result.user);
            setHostedGames(result.hostedGames);
        };

        fetchUserData();
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        const form = new FormData(e.target);
        const response = await fetch('/api/profile', {
            method: 'POST',
            body: form,
        });

        const result = await response.json();
        setMessages([{ category: result.success ? 'success' : 'danger', message: result.message }]);
    };

    const handlePictureUpload = async (e) => {
        const form = new FormData();
        form.append('profile_picture', e.target.files[0]);

        const response = await fetch('/api/upload-picture', {
            method: 'POST',
            body: form,
        });

        const result = await response.json();
        setMessages([{ category: result.success ? 'success' : 'danger', message: result.message }]);
        if (result.success) {
            setCurrentUser({ ...currentUser, profile_picture: result.profile_picture });
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

            <div className="container mt-5">
                <div className="d-flex justify-content-center text-center mb-5">
                    <div className="me-4">
                        <img
                            src={currentUser.profile_picture ? `/static/profile_pics/${currentUser.profile_picture}` : profilePicDefault}
                            alt="Profile"
                            className="profile-pic-preview"
                        />
                        <form className="mt-2">
                            <input
                                type="file"
                                name="profile_picture"
                                id="profilePicInput"
                                accept="image/*"
                                onChange={handlePictureUpload}
                            />
                            <button type="submit" className="btn btn-primary mt-2">Upload Picture</button>
                        </form>
                    </div>
                    <div className="mt-5">
                        <h1 style={{ fontFamily: 'Shrikhand', color: '#333333' }}>
                            {currentUser.username}
                        </h1>
                        
                        <p className="text-muted">{currentUser.email}</p>
                        <p>{currentUser.skill_level || "Skill level not specified."} Player</p>
                        <p><strong>Bio:</strong> {currentUser.bio || "No bio yet."}</p>
                    </div>
                </div>
                
                <div className="row justify-content-center">
                    <div className="col-md-8 justify-content-center">
                        <h3>Latest Games</h3>
                        <div className="row">
                            {hostedGames.map((game, index) => (
                                <div key={index} className="col-md-4 mb-3">
                                    <div className="card game-card">
                                        <div className="card-body">
                                            <h5 className="card-title">{game.location}</h5>
                                            <p className="card-text">{game.time}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="col-md-8">
                        <div className="card mb-5" style={{ border: 'none', backgroundColor: '#f0efac' }}>
                            <div className="card-body">
                                <form id="editProfileForm" method="POST" onSubmit={handleProfileUpdate}>
                                    <div className="mb-3">
                                        <label htmlFor="username" className="form-label">Username</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="username"
                                            name="username"
                                            defaultValue={currentUser.username}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            name="email"
                                            defaultValue={currentUser.email}
                                        />
                                    </div>

                                    <div className="mb-3 position-relative">
                                        <label htmlFor="password" className="form-label">Password</label>
                                        <div className="input-group">
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="password"
                                                name="password"
                                                placeholder="Enter password"
                                            />
                                            <button type="button" className="btn btn-outline-secondary" id="togglePassword">
                                                <i className="fas fa-eye" id="eyeIcon"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="bio" className="form-label">Bio</label>
                                        <textarea
                                            className="form-control"
                                            id="bio"
                                            name="bio"
                                            rows="3"
                                            placeholder="Tell us about you!"
                                            defaultValue={currentUser.bio}
                                        ></textarea>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="skill_level" className="form-label">Skill Level</label>
                                        <select
                                            className="form-select"
                                            id="skill_level"
                                            name="skill_level"
                                            defaultValue={currentUser.skill_level}
                                        >
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
                                        </select>
                                    </div>

                                    <button type="submit" className="btn btn-success">Update Profile</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BaseLayout>
    );
};

export default Profile;