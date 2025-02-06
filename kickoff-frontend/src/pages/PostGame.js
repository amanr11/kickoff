import React, { useState } from 'react';
import BaseLayout from '../components/BaseLayout';

const PostGame = () => {
    const [location, setLocation] = useState('');
    const [time, setTime] = useState('');
    const [playersNeeded, setPlayersNeeded] = useState('');
    const [skillLevel, setSkillLevel] = useState('');
    const [messages, setMessages] = useState([]);

    const handlePostGame = async (e) => {
        e.preventDefault();
        const response = await fetch('/api/post-game', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ location, time, playersNeeded, skillLevel }),
        });

        const result = await response.json();
        if (result.success) {
            setMessages([{ category: 'success', message: 'Game posted successfully!' }]);
            setLocation('');
            setTime('');
            setPlayersNeeded('');
            setSkillLevel('');
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

            <h2>Post a New Game</h2>

            <form onSubmit={handlePostGame}>
                <div className="mb-3">
                    <label htmlFor="location" className="form-label">Location</label>
                    <input
                        type="text"
                        className="form-control"
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="time" className="form-label">Time</label>
                    <input
                        type="text"
                        className="form-control"
                        id="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="playersNeeded" className="form-label">Players Needed</label>
                    <input
                        type="number"
                        className="form-control"
                        id="playersNeeded"
                        value={playersNeeded}
                        onChange={(e) => setPlayersNeeded(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="skillLevel" className="form-label">Skill Level</label>
                    <select
                        className="form-select"
                        id="skillLevel"
                        value={skillLevel}
                        onChange={(e) => setSkillLevel(e.target.value)}
                        required
                    >
                        <option value="">Select Skill Level</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                </div>

                <button type="submit" className="btn btn-primary">Post Game</button>
            </form>
        </BaseLayout>
    );
};

export default PostGame;