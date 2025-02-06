import React, { useState, useEffect } from 'react';
import BaseLayout from '../components/BaseLayout';

const MyHostedGames = () => {
    const [hostedGames, setHostedGames] = useState([]);

    useEffect(() => {
        // Fetch hosted games
        const fetchHostedGames = async () => {
            const response = await fetch('/api/my-hosted-games');
            const result = await response.json();
            setHostedGames(result.hostedGames);
        };

        fetchHostedGames();
    }, []);

    return (
        <BaseLayout>
            <div className="container mt-5">
                <h1 className="text-center mb-4">Your Hosted Games</h1>
                <div className="row">
                    {hostedGames.length > 0 ? (
                        hostedGames.map((game, index) => (
                            <div key={index} className="col-md-4 mb-3">
                                <div className="card game-card">
                                    <div className="card-body">
                                        <h5 className="card-title">{game.location}</h5>
                                        <p className="card-text">{game.time}</p>
                                        <p className="card-text"><strong>Players Needed:</strong> {game.players_needed}</p>
                                        <p className="card-text"><strong>Skill Level:</strong> {game.quality}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center">You have not hosted any games yet.</p>
                    )}
                </div>
            </div>
        </BaseLayout>
    );
};

export default MyHostedGames;