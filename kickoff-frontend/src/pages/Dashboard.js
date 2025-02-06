import React, { useState, useEffect } from 'react';
import BaseLayout from '../components/BaseLayout';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Dashboard = () => {
    const [userGames, setUserGames] = useState([]);
    const [availableGames, setAvailableGames] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [skillFilter, setSkillFilter] = useState('');

    useEffect(() => {
        // Fetch user games and available games
        const fetchGames = async () => {
            const response = await fetch('/api/dashboard');
            const result = await response.json();
            setUserGames(result.userGames);
            setAvailableGames(result.availableGames);
        };

        fetchGames();
    }, []);

    const applyFilters = () => {
        const filteredGames = availableGames.filter(game => {
            const matchesSearch = searchText === "" || game.location.toLowerCase().includes(searchText.toLowerCase());
            const matchesSkill = skillFilter === "" || game.quality === skillFilter;
            return matchesSearch && matchesSkill;
        });

        setAvailableGames(filteredGames);
    };

    const showCancelConfirmation = (gameId) => {
        // Show confirmation modal
        const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
        const confirmationMessage = document.getElementById('confirmationMessage');
        const confirmActionButton = document.getElementById('confirmActionButton');
        
        confirmationMessage.textContent = "Are you sure you want to cancel this game?";
        confirmActionButton.onclick = () => {
            document.getElementById(`cancelForm-${gameId}`).submit();
        };
        
        confirmationModal.show();
    };

    return (
        <BaseLayout>
            <div className="dashboard-container">
                <h1 className="text-center mb-4"><b>Welcome to the Arena!</b></h1>

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
                                            <form method="POST" action={`/api/cancel-game/${game.id}`} id={`cancelForm-${game.id}`}>
                                                <button type="button" className="btn btn-danger" onClick={() => showCancelConfirmation(game.id)}>Cancel Game</button>
                                            </form>
                                            <div className="modal fade" id="confirmationModal" tabIndex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true">
                                                <div className="modal-dialog">
                                                    <div className="modal-content">
                                                        <div className="modal-header">
                                                            <h5 className="modal-title" id="confirmationModalLabel">Confirm Action</h5>
                                                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                        </div>
                                                        <div className="modal-body">
                                                            <p id="confirmationMessage"></p>
                                                        </div>
                                                        <div className="modal-footer">
                                                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                                            <button type="button" className="btn btn-danger" id="confirmActionButton">Confirm</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
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
                                                <form method="POST" action={`/api/join-game/${game.id}`}>
                                                    <button type="submit" className="btn btn-primary">Join Game</button>
                                                </form>
                                            ) : (
                                                <button type="button" className="btn btn-secondary" disabled>Game Full</button>
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