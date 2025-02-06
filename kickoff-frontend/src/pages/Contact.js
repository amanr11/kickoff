import React, { useState } from 'react';
import BaseLayout from '../components/BaseLayout';
import playWinIcon from '../assets/icons/play-win.svg';

const Contact = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = { name, email, message };

        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const result = await response.json();
        if (result.success) {
            alert('Your message has been sent!');
            setName('');
            setEmail('');
            setMessage('');
        } else {
            alert(`There was an error: ${result.error}`);
        }
    };

    return (
        <BaseLayout>
            <div className="contact-container">
                <div className="row">
                    <div className="col-md-6 d-flex flex-column justify-content-center align-items-center" id="text-container">
                        <h1>We're here to help.</h1>
                        <p className="lead">
                            If you didn't find what you were looking for or need some help, we're just one click away. Our team is here
                            to assist you with any inquiries. Fill in the form and let's <b>kickoff</b> the conversation!
                        </p>
                        <img src={playWinIcon} alt="Infographic" className="contact-infographic" />
                    </div>
                    <div className="col-md-6" id="form-container">
                        <form id="contactForm" onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="name"
                                    name="name"
                                    placeholder="Your Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <input
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    name="email"
                                    placeholder="Your Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <textarea
                                    className="form-control"
                                    id="message"
                                    name="message"
                                    rows="5"
                                    placeholder="Your Message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                ></textarea>
                            </div>
                            <button type="submit" className="btn">Send</button>
                        </form>
                    </div>
                </div>
            </div>
        </BaseLayout>
    );
};

export default Contact;