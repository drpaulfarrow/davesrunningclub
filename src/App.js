import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  // Contact form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formMessage, setFormMessage] = useState("");

  // Add Your Run state
  const [totalKm, setTotalKm] = useState(20);
  const [runFirstName, setRunFirstName] = useState("");
  const [runLastName, setRunLastName] = useState("");
  const [runLocation, setRunLocation] = useState("");
  const [runDistance, setRunDistance] = useState("");
  const [recentRuns, setRecentRuns] = useState([]);
  const [runError, setRunError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Gallery lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // API base URL
  const API_BASE = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api';

  const galleryImages = [
    '/gallery/WhatsApp Image 2025-07-27 at 11.02.34.jpeg',
    '/gallery/WhatsApp Image 2025-08-03 at 10.33.16.jpeg',
    '/gallery/WhatsApp Image 2025-07-20 at 13.12.34.jpeg',
    '/gallery/WhatsApp Image 2025-07-20 at 13.12.33.jpeg',
    '/gallery/WhatsApp Image 2025-07-20 at 13.00.43.jpeg',
    '/gallery/WhatsApp Image 2025-07-20 at 13.00.32.jpeg',
  ];

  // Load data on component mount
  useEffect(() => {
    const fetchRunsData = async () => {
      try {
        const response = await fetch(`${API_BASE}/runs`);
        if (response.ok) {
          const data = await response.json();
          setTotalKm(data.totalKm);
          setRecentRuns(data.recentRuns);
        } else {
          console.error('Failed to fetch runs data');
        }
      } catch (error) {
        console.error('Error fetching runs data:', error);
      }
    };
    fetchRunsData();
  }, [API_BASE]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;
      
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setLightboxIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setLightboxIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
          break;
        default:
          break;
      }
    };

    if (lightboxOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [lightboxOpen, galleryImages.length]);

  const handleJoinRun = () => {
    setActiveTab('contact');
    setFormMessage("Please add me to the WhatsApp group for run updates!");
  };
  const handleViewGallery = () => setActiveTab('gallery');
  const handleMentalHealth = () => {
    window.open('https://988lifeline.org/', '_blank', 'noopener noreferrer');
  };

  // Contact form submit handler
  const handleContactSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent("Please add me to WhatsApp group");
    const body = encodeURIComponent(
      `Name: ${formName}\nEmail: ${formEmail}\nPhone: ${formPhone}\n\n${formMessage}`
    );
    window.location.href = `mailto:paulandrewfarrow@gmail.com?subject=${subject}&body=${body}`;
  };

  // Add Your Run handler
  const handleAddRun = async (e) => {
    e.preventDefault();
    setRunError("");
    setIsLoading(true);
    
    const distanceNum = parseFloat(runDistance);
    if (!runFirstName.trim()) {
      setRunError("Please enter your first name.");
      setIsLoading(false);
      return;
    }
    if (!runLastName.trim()) {
      setRunError("Please enter your last name.");
      setIsLoading(false);
      return;
    }
    if (!runLocation.trim()) {
      setRunError("Please enter the location.");
      setIsLoading(false);
      return;
    }
    if (isNaN(distanceNum) || distanceNum <= 0) {
      setRunError("Please enter a valid distance in km.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: runFirstName.trim(),
          lastName: runLastName.trim(),
          location: runLocation.trim(),
          distance: distanceNum
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTotalKm(data.totalKm);
        setRecentRuns(data.recentRuns);
        setRunFirstName("");
        setRunLastName("");
        setRunLocation("");
        setRunDistance("");
      } else {
        const errorData = await response.json();
        setRunError(errorData.error || "Failed to add run. Please try again.");
      }
    } catch (error) {
      console.error('Error adding run:', error);
      setRunError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const openLightbox = (idx) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);
  const prevLightbox = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };
  const nextLightbox = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const upcomingRuns = [
    { id: 1, name: 'Weekly Sunday Run', date: 'Every Sunday', time: '9:00 AM', location: 'Varies (see WhatsApp group)', description: 'Join us every Sunday at 9am! Starting location changes weekly—join the WhatsApp group to find out where.' },
  ];

  const members = [
    { id: 1, name: 'Dave Reynolds', role: 'In Loving Memory', runs: 0, isDave: true },
    { id: 2, name: 'Tom Mannion', role: 'Founder', runs: 0 },
    { id: 3, name: 'Jennie Mannion', role: 'Founder', runs: 0 },
    // ...other members can be added here
  ];

  const renderAddRun = () => (
    <div className="add-run-section">
      <h2>Add Your Run</h2>
      <form className="add-run-form" onSubmit={handleAddRun}>
        <input
          type="text"
          placeholder="First Name"
          value={runFirstName}
          onChange={e => setRunFirstName(e.target.value)}
          required
          disabled={isLoading}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={runLastName}
          onChange={e => setRunLastName(e.target.value)}
          required
          disabled={isLoading}
        />
        <input
          type="text"
          placeholder="Location"
          value={runLocation}
          onChange={e => setRunLocation(e.target.value)}
          required
          disabled={isLoading}
        />
        <input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Distance (km)"
          value={runDistance}
          onChange={e => setRunDistance(e.target.value)}
          required
          disabled={isLoading}
        />
        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? 'Adding Run...' : 'Add Run'}
        </button>
      </form>
      {runError && <div className="run-error">{runError}</div>}
      {recentRuns.length > 0 && (
        <div className="recent-runs">
          <h3>Recent Runs</h3>
          <ul>
            {recentRuns.map((run, idx) => (
              <li key={idx}><strong>{run.firstName} {run.lastName}</strong> ({run.location}): {run.distance} km</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderHome = () => (
    <div className="home-section">
      <div className="hero">
        <h1>🏃‍♂️ Dave's Running Club</h1>
        <p className="tagline">Honouring Dave Reynolds' love of running and building community</p>
        <div className="dave-tribute">
          <img src="/gallery/Dave.png" alt="Dave Reynolds" className="dave-photo" />
          <div className="tribute-text">
            <h2>In Memory of Dave Reynolds</h2>
            <p>This running club was founded in July 2025 to honour our dear friend Dave Reynolds, who found joy and peace in running. Founded by Tom Mannion and Jennie Mannion, we run together to remember Dave, support each other, and raise awareness about mental health.</p>
            <p className="mental-health-message">
              💙 <strong>Mental health matters.</strong> If you're struggling, you're not alone. 
              Reach out to friends, family, or call the National Suicide Prevention Lifeline at 988.
            </p>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-number">45</span>
            <span className="stat-label">Members</span>
          </div>
          <div className="stat">
            <span className="stat-number">{totalKm}</span>
            <span className="stat-label">km This Year</span>
          </div>
          <div className="stat">
            <span className="stat-number">Founded July 2025</span>
            <span className="stat-label"></span>
          </div>
        </div>
      </div>
      {renderAddRun()}
      <div className="quick-actions">
        <button className="action-btn primary" onClick={handleJoinRun}>Join Our Next Run</button>
        <button className="action-btn secondary" onClick={handleViewGallery}>View Gallery</button>
        <button className="action-btn mental-health" onClick={handleMentalHealth}>Mental Health Resources</button>
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="schedule-section">
      <h2>Upcoming Runs</h2>
      <p className="section-description">Join us for runs that honour Dave's memory and build our community</p>
      <div className="runs-grid">
        {upcomingRuns.map(run => (
          <div key={run.id} className="run-card">
            <h3>{run.name}</h3>
            <p className="run-description">{run.description}</p>
            <div className="run-details">
              <p><strong>Date:</strong> {run.date}</p>
              <p><strong>Time:</strong> {run.time}</p>
              <p><strong>Location:</strong> {run.location}</p>
            </div>
            <button className="join-btn" onClick={() => {
              setActiveTab('contact');
              setFormMessage("Please add me to the WhatsApp group for run updates!");
            }}>Join Run</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMembers = () => (
    <div className="members-section">
      <h2>Club Members</h2>
      <p className="section-description">Our community of runners who honour Dave's memory with every step</p>
      <div className="members-grid">
        {members.map(member => (
          <div key={member.id} className={`member-card ${member.isDave ? 'dave-card' : ''}`}>
            <div className="member-avatar">
              {member.isDave ? '💙' : member.name.charAt(0)}
            </div>
            <h3>{member.name}</h3>
            <p className="member-role">{member.role}</p>
            {member.isDave && (
              <p className="dave-memory">Forever in our hearts and on our runs</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderGallery = () => (
    <div className="gallery-section">
      <h2>Gallery</h2>
      <p className="section-description">Capturing moments of our running community honouring Dave's memory</p>
      <div className="gallery-grid">
        {galleryImages.map((image, index) => (
          <div key={index} className="gallery-item" onClick={() => openLightbox(index)} style={{cursor: 'pointer'}}>
            <img src={image} alt={`Running club member ${index + 1}`} />
          </div>
        ))}
      </div>
      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-modal" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>&times;</button>
            <button className="lightbox-nav left" onClick={prevLightbox}>&#8592;</button>
            <img src={galleryImages[lightboxIndex]} alt="Enlarged running club" className="lightbox-img" />
            <button className="lightbox-nav right" onClick={nextLightbox}>&#8594;</button>
          </div>
        </div>
      )}
    </div>
  );

  const renderContact = () => (
    <div className="contact-section">
      <h2>Get In Touch</h2>
      <p className="section-description">Join our WhatsApp group to find out the next run location and become part of our community!</p>
      <div className="contact-info">
        <div className="contact-item">
          <h3>📍 Meetup Location</h3>
          <p>Every Sunday at 9:00 AM<br />Location varies—join WhatsApp group for details</p>
        </div>
        <div className="contact-item mental-health-resource">
          <h3>💙 Mental Health Support</h3>
          <p>National Suicide Prevention Lifeline<br />988 - Available 24/7</p>
        </div>
      </div>
      <div className="contact-form">
        <h3>Send us a message</h3>
        <form onSubmit={handleContactSubmit}>
          <input
            type="text"
            placeholder="Your Name"
            value={formName}
            onChange={e => setFormName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            value={formEmail}
            onChange={e => setFormEmail(e.target.value)}
            required
          />
          <input
            type="tel"
            placeholder="Your Phone Number (optional)"
            value={formPhone}
            onChange={e => setFormPhone(e.target.value)}
          />
          <textarea
            placeholder="Your Message"
            value={formMessage}
            onChange={e => setFormMessage(e.target.value)}
            required
          ></textarea>
          <button type="submit" className="submit-btn">Send Message</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-brand" onClick={() => setActiveTab('home')} style={{ cursor: 'pointer' }}>
          <span className="nav-logo">🏃‍♂️</span>
          <span className="nav-title">Dave's Running Club</span>
        </div>
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            Home
          </button>
          <button 
            className={`nav-tab ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            Schedule
          </button>
          <button 
            className={`nav-tab ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            Members
          </button>
          <button 
            className={`nav-tab ${activeTab === 'gallery' ? 'active' : ''}`}
            onClick={() => setActiveTab('gallery')}
          >
            Gallery
          </button>
          <button 
            className={`nav-tab ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            Contact
          </button>
        </div>
      </nav>
      <main className="main-content">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'schedule' && renderSchedule()}
        {activeTab === 'members' && renderMembers()}
        {activeTab === 'gallery' && renderGallery()}
        {activeTab === 'contact' && renderContact()}
      </main>
      <footer className="footer">
        <p>&copy; 2025 Dave's Running Club. In loving memory of Dave Reynolds. 💙</p>
        <p className="footer-mental-health">Mental health matters. You are not alone. Call 988 for support.</p>
      </footer>
    </div>
  );
}

export default App;
