import React from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/images/5aside.jpg';
import findGamesIcon from '../assets/icons/find-games.svg';
import connectPlayersIcon from '../assets/icons/connect-players.svg';
import playWinIcon from '../assets/icons/play-win.svg';
import BaseLayout from '../components/BaseLayout';

const Home = () => {
    return (
        <BaseLayout>
            <div className="hero-container">
                <img src={heroImage} alt="Background Image" className="hero-image" />
                <div className="content">
                    <h1 className="display-3 fw-bold">KickOff: Play. Connect. Win.</h1>
                    <p className="lead">Your ultimate platform to find football games and meet players in your area.</p>
                    <Link to="/register" className="btn btn-lg">Get Started</Link>
                </div>
            </div>

            <section className="about-section py-5">
                <div className="container">
                    <h1 className="text-center mb-4">Why Choose KickOff?</h1>
                    <div className="row">
                        <div className="col-md-3 text-center">
                            <img src={findGamesIcon} alt="Find Games" className="mb-3" id="infoimg" style={{ width: '140px' }} />
                            <h5>Find Games Near You</h5>
                            <p>Quickly browse games in your area and join with ease.</p>
                        </div>
                        <div className="col-md-3 text-center">
                            <img src={connectPlayersIcon} alt="Connect with Players" className="mb-3" id="infoimg" style={{ width: '140px' }} />
                            <h5>Connect with Footballers</h5>
                            <p>Build your network and play with like-minded players.</p>
                        </div>
                        <div className="col-md-3 text-center">
                            <img src={playWinIcon} alt="Play and Win" className="mb-3" id="infoimg" style={{ width: '140px' }} />
                            <h5>Play and Win</h5>
                            <p>Join games, compete, and become a star in your local football community.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="stats-section py-5">
                <div className="container">
                    <h1 className="text-center mb-4">KickOff by the Numbers</h1>
                    <div className="row text-center">
                        <div className="col-md-4">
                            <h1 className="display-4">10k+</h1>
                            <p className="text-white">Active Players</p>
                        </div>
                        <div className="col-md-4">
                            <h1 className="display-4">2k+</h1>
                            <p className="text-white">Games Hosted</p>
                        </div>
                        <div className="col-md-4">
                            <h1 className="display-4">15+</h1>
                            <p className="text-white">Regions Covered</p>
                        </div>
                        <div className="col-md-4">
                            <h1 className="display-4">95%</h1>
                            <p className="text-white">User Satisfaction</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="infographics-section py-5 text-light">
                <div className="container text-center">
                    <h1>Football Made Easy</h1>
                    <p className="mb-4">Join games, connect with players, and make every match count.</p>
                    <div className="row">
                        <div className="col-md-3">
                            <img src={findGamesIcon} alt="Infographic 1" className="mb-3" id="infoimg" style={{ width: '140px' }} />
                            <p>Easy Matchmaking</p>
                        </div>
                        <div className="col-md-3">
                            <img src={connectPlayersIcon} alt="Infographic 2" className="mb-3" id="infoimg" style={{ width: '140px' }} />
                            <p>Real-Time Updates</p>
                        </div>
                        <div className="col-md-3">
                            <img src={playWinIcon} alt="Infographic 3" className="mb-3" id="infoimg" style={{ width: '140px' }} />
                            <p>Secure Payments</p>
                        </div>
                    </div>
                </div>
            </section>
        </BaseLayout>
    );
};

export default Home;