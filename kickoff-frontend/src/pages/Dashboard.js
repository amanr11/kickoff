import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BaseLayout from '../components/BaseLayout';
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Dashboard = () => {
    const [username, setUsername] = useState('');
    const [userGames, setUserGames] = useState([]);
    const [availableGames, setAvailableGames] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [skillFilter, setSkillFilter] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setUsername(user.username);
        }

        const fetchDashboardData = async () => {
            try {
                const response = await fetch('/api/dashboard', { credentials: 'include' });
                if (!response.ok) {
                    navigate('/login'); // redirect if not logged in
                    return;
                }
                const data = await response.json();
                setUsername(data.username);
                setUserGames(data.userGames);
                setAvailableGames(data.availableGames);
            } catch (error) {
                console.error('Error fetching dashboard:', error);
            }
        };
        fetchDashboardData();
    }, [navigate]);

    const applyFilters = () => {
        const filteredGames = availableGames.filter(game => {
            const matchesSearch = searchText === "" || game.location.toLowerCase().includes(searchText.toLowerCase());
            const matchesSkill = skillFilter === "" || game.quality === skillFilter;
            return matchesSearch && matchesSkill;
        });

        setAvailableGames(filteredGames);
    };

    const handleLeaveGame = async (gameId) => {
        try {
            const response = await fetch(`/api/leave-game/${gameId}`, {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                setUserGames(prevGames => prevGames.filter(game => game._id !== gameId));
            }
        } catch (error) {
            console.error("Error leaving game:", error);
        }
    };

    const showCancelConfirmation = (gameId) => {
        const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
        document.getElementById('confirmationMessage').textContent = "Are you sure you want to cancel this game?";
        document.getElementById('confirmActionButton').onclick = () => {
            document.getElementById(`cancelForm-${gameId}`).submit();
        };
        confirmationModal.show();
    };

    return (
        <BaseLayout>
            <div className="dashboard-container">
                <h1 className="text-center mb-4"><b>Welcome to the Arena, {username || "Player"}!</b></h1>

                <div className="users-games mb-5">
                    <h2 className="text-center mb-3">Your Upcoming Games</h2>
                    <div className="row">
                        {userGames.length > 0 ? (
                            userGames.map((game, index) => (
                                <div key={index} className="col-md-4 mb-3" data-skill={game.quality}>
                                    <div className="card">
                                        <div className="card-body">
                                            <h5 className="card-title"><strong>{game.location}</strong></h5>
                                            <p className="card-text"><strong>Skill Level:</strong> {game.quality}</p>
                                            <p className="card-text"><strong>Time:</strong> {game.time}</p>
                                            <p className="card-text"><strong>Players Needed:</strong> {game.players_needed}</p>
                                            <p><strong>Posted by:</strong> {game.host.username}</p>
                                            
                                            {game.host._id === localStorage.getItem('user_id') ? (
                                                <form method="POST" action={`/api/cancel-game/${game._id}`} id={`cancelForm-${game._id}`}>
                                                    <button type="button" className="btn btn-danger" onClick={() => showCancelConfirmation(game._id)}>Cancel Game</button>
                                                </form>
                                            ) : (
                                                <button className="btn btn-danger" onClick={() => handleLeaveGame(game._id)}>Leave Game</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center">You are not part of any games yet. Host or join a game to get started!</p>
                        )}
                    </div>
                </div>

                <h2 className="text-center mb-3">Available Games</h2>
                <div className="filters-container d-flex justify-content-center mb-4">
                    <input
                        type="text"
                        id="gameSearch"
                        className="form-control w-50 me-2"
                        placeholder="Search games by location"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <select
                        id="skillFilter"
                        className="form-select w-25 me-2"
                        value={skillFilter}
                        onChange={(e) => setSkillFilter(e.target.value)}
                    >
                        <option value="">All Skill Levels</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                    <button className="btn btn-primary" onClick={applyFilters}>Apply Filters</button>
                </div>

                <div id="gameList">
                    <div className="row">
                        {availableGames.length > 0 ? (
                            availableGames.map((game, index) => (
                                <div key={index} className="col-md-4 mb-3" data-skill={game.quality}>
                                    <div className="card">
                                        <div className="card-body">
                                            <h5 className="card-title"><strong>{game.location}</strong></h5>
                                            <p className="card-text"><strong>Skill Level:</strong> {game.quality}</p>
                                            <p className="card-text"><strong>Time:</strong> {game.time}</p>
                                            <p className="card-text"><strong>Players Needed:</strong> {game.players_needed}</p>
                                            <p><strong>Posted by:</strong> {game.host.username}</p>
                                            
                                            {game.players_needed > 0 ? (
                                                <form method="POST" action={`/api/join-game/${game._id}`}>
                                                    <button type="submit" className="btn btn-primary">Join Game</button>
                                                </form>
                                            ) : (
                                                <button className="btn btn-secondary" disabled>Game Full</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center">No games available to join at the moment.</p>
                        )}
                    </div>
                </div>
            </div>
        </BaseLayout>
    );
};

export default Dashboard;
