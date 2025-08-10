import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [totalKm, setTotalKm] = useState(20);
  const [runFirstName, setRunFirstName] = useState('');
  const [runLastName, setRunLastName] = useState('');
  const [runLocation, setRunLocation] = useState('');
  const [runDistance, setRunDistance] = useState('');
  const [recentRuns, setRecentRuns] = useState([]);
  const [runError, setRunError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState('');
  const [contactSuccess, setContactSuccess] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [adminLightboxOpen, setAdminLightboxOpen] = useState(false);
  const [adminLightboxIndex, setAdminLightboxIndex] = useState(0);
  const [isGatePassed, setIsGatePassed] = useState(false);
  const [gatePassword, setGatePassword] = useState('');
  const [gateError, setGateError] = useState('');
  
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [registerFirstName, setRegisterFirstName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [userId, setUserId] = useState(localStorage.getItem("userId") || "");
  const [userStats, setUserStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [photoFirstName, setPhotoFirstName] = useState("");
  const [photoLastName, setPhotoLastName] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoUploadLoading, setPhotoUploadLoading] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState("");
  
  // Verification state
  const [showResendDialog, setShowResendDialog] = useState(false);
  const [pendingResendEmail, setPendingResendEmail] = useState("");
  
  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [pendingPhotos, setPendingPhotos] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);

  const API_BASE = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5001/api';

  // Gallery images
  const galleryImages = [
    '/gallery/WhatsApp%20Image%202025-07-27%20at%2011.02.34.jpeg',
    '/gallery/WhatsApp%20Image%202025-08-03%20at%2010.33.16.jpeg',
    '/gallery/WhatsApp%20Image%202025-07-20%20at%2013.12.34.jpeg',
    '/gallery/WhatsApp%20Image%202025-07-20%20at%2013.12.33.jpeg',
    '/gallery/WhatsApp%20Image%202025-07-20%20at%2013.00.43.jpeg',
    '/gallery/WhatsApp%20Image%202025-07-20%20at%2013.00.32.jpeg'
  ];

  const fetchRunsData = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/runs`);
      const data = await response.json();
      setTotalKm(data.totalKm);
      setRecentRuns(data.recentRuns || []);
    } catch (error) {
      console.error('Error fetching runs data:', error);
    }
  }, [API_BASE]);

  const fetchUserStats = useCallback(async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`${API_BASE}/user/${userId}`);
      const data = await response.json();
      setUserStats(data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  }, [API_BASE, userId]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/leaderboard`);
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  }, [API_BASE]);

  const fetchPhotos = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/photos`);
      const data = await response.json();
      // Ensure data is an array
      setPhotos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching photos:', error);
      setPhotos([]); // Set empty array on error
    }
  }, [API_BASE]);

  useEffect(() => {
    // Check if gate was already passed (from localStorage)
    const gateStatus = localStorage.getItem('gatePassed');
    if (gateStatus === 'true') {
      setIsGatePassed(true);
    }
    
    // Check for existing login
    const savedUser = localStorage.getItem('user');
    const savedUserId = localStorage.getItem('userId');
    if (savedUser && savedUserId) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setUserId(savedUserId);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
      }
    }
  }, []);

  useEffect(() => {
    if (isGatePassed) {
      fetchRunsData();
      fetchPhotos();
      if (userId) {
        fetchUserStats();
      }
      fetchLeaderboard();
    }
  }, [isGatePassed, userId, fetchRunsData, fetchPhotos, fetchUserStats, fetchLeaderboard]);

  const prevLightbox = useCallback(() => {
    const totalImages = photos.length + galleryImages.length;
    setLightboxIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  }, [photos.length, galleryImages.length]);

  const nextLightbox = useCallback(() => {
    const totalImages = photos.length + galleryImages.length;
    setLightboxIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  }, [photos.length, galleryImages.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;
      
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          prevLightbox();
          break;
        case 'ArrowRight':
          nextLightbox();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, prevLightbox, nextLightbox]);

  useEffect(() => {
    const handleAdminKeyDown = (e) => {
      if (!adminLightboxOpen) return;
      
      switch (e.key) {
        case 'Escape':
          closeAdminLightbox();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleAdminKeyDown);
    return () => document.removeEventListener('keydown', handleAdminKeyDown);
  }, [adminLightboxOpen]);

  const handleAddRun = async (e) => {
    e.preventDefault();
    setRunError('');
    setIsLoading(true);

    if (!isLoggedIn) {
      setRunError('Please log in to add a run');
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
          location: runLocation,
          distance: parseFloat(runDistance),
          userId: userId,
          password: loginPassword // This will be used for authentication
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTotalKm(data.totalKm);
        setRecentRuns(data.recentRuns);
        setUserStats(data.userStats);
        
        // Clear form
        setRunLocation('');
        setRunDistance('');
        
        // Refresh leaderboard
        fetchLeaderboard();
      } else {
        setRunError(data.error || 'Failed to add run');
      }
    } catch (error) {
      setRunError('Failed to add run. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    setPhotoUploadLoading(true);
    setPhotoUploadError('');
    
    const formData = new FormData();
    formData.append('photo', selectedPhoto);
    formData.append('firstName', photoFirstName);
    formData.append('lastName', photoLastName);
    formData.append('caption', photoCaption);
    if (userId) {
      formData.append('userId', userId);
    }
    
    try {
      const response = await fetch(`${API_BASE}/photos`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Clear form
        setPhotoFirstName('');
        setPhotoLastName('');
        setPhotoCaption('');
        setSelectedPhoto(null);
        
        // Show success message
        setPhotoUploadError(''); // Clear any previous errors
        alert('Photo uploaded successfully! It will be reviewed by an admin and appear in the gallery once approved.');
      } else {
        setPhotoUploadError(data.error || 'Failed to upload photo');
      }
    } catch (error) {
      setPhotoUploadError('Failed to upload photo. Please try again.');
    } finally {
      setPhotoUploadLoading(false);
    }
  };

  const handlePhotoDelete = async (photoId) => {
    try {
      const response = await fetch(`${API_BASE}/photos/${photoId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setPhotos(photos.filter(photo => photo.id !== photoId));
      } else {
        console.error('Failed to delete photo');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  // Admin functions
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminError('');
    
    try {
      const response = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminPassword })
      });
      
      if (response.ok) {
        setIsAdmin(true);
        // Store admin password for use in approve/reject operations
        localStorage.setItem('adminPassword', adminPassword);
        setAdminPassword('');
        setActiveTab('admin'); // Switch to admin tab
        fetchPendingPhotos();
      } else {
        const data = await response.json();
        setAdminError(data.error || 'Login failed');
      }
    } catch (error) {
      setAdminError('Login failed. Please try again.');
    } finally {
      setAdminLoading(false);
    }
  };

  const fetchPendingPhotos = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/pending-photos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPendingPhotos(data);
      }
    } catch (error) {
      console.error('Error fetching pending photos:', error);
    }
  };

  const handleApprovePhoto = async (photoId) => {
    try {
      const storedAdminPassword = localStorage.getItem('adminPassword');
      const response = await fetch(`${API_BASE}/admin/approve-photo/${photoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminPassword: storedAdminPassword })
      });
      
      if (response.ok) {
        setPendingPhotos(pendingPhotos.filter(photo => photo.id !== photoId));
        fetchPhotos(); // Refresh approved photos
      }
    } catch (error) {
      console.error('Error approving photo:', error);
    }
  };

  const handleRejectPhoto = async (photoId) => {
    try {
      const storedAdminPassword = localStorage.getItem('adminPassword');
      const response = await fetch(`${API_BASE}/admin/reject-photo/${photoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminPassword: storedAdminPassword })
      });
      
      if (response.ok) {
        setPendingPhotos(pendingPhotos.filter(photo => photo.id !== photoId));
      }
    } catch (error) {
      console.error('Error rejecting photo:', error);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactError('');
    setContactSuccess('');
    setContactLoading(true);

    try {
      const response = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          phone: contactPhone,
          message: contactMessage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setContactSuccess('Message sent successfully! We\'ll get back to you soon.');
        setContactName('');
        setContactEmail('');
        setContactPhone('');
        setContactMessage('');
      } else {
        setContactError(data.error || 'Failed to send message');
      }
    } catch (error) {
      setContactError('Failed to send message. Please try again.');
    } finally {
      setContactLoading(false);
    }
  };

  const handleJoinRun = () => {
    setActiveTab('contact');
    setContactMessage('Please add me to the WhatsApp group');
  };

  const handleViewGallery = () => {
    setActiveTab('gallery');
  };

  const handleMentalHealth = () => {
    window.open('https://www.samaritans.org/', '_blank');
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const openAdminLightbox = (index) => {
    setAdminLightboxIndex(index);
    setAdminLightboxOpen(true);
  };

  const closeAdminLightbox = () => {
    setAdminLightboxOpen(false);
  };

  // Authentication functions
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: registerFirstName,
          lastName: registerLastName,
          email: registerEmail,
          password: registerPassword
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Don't log in automatically - user needs to verify email first
        setRegisterError(''); // Clear any previous errors
        
        // Clear form
        setRegisterFirstName('');
        setRegisterLastName('');
        setRegisterEmail('');
        setRegisterPassword('');
        setShowRegisterModal(false);
        
        // Show success message
        setRegisterError('Registration successful! Please check your email and click the verification link to activate your account.');
      } else {
        setRegisterError(data.error || 'Registration failed');
      }
    } catch (error) {
      setRegisterError('Registration failed. Please try again.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsLoggedIn(true);
        setCurrentUser(data.user);
        setUserId(data.userId);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Clear form
        setLoginEmail('');
        setLoginPassword('');
        setShowLoginModal(false);
      } else {
        if (data.needsVerification) {
          setLoginError(data.error);
          // Show resend verification dialog
          setPendingResendEmail(loginEmail);
          setShowResendDialog(true);
        } else {
          setLoginError(data.error || 'Login failed');
        }
      }
    } catch (error) {
      setLoginError('Login failed. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUserId('');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
  };

  const handleResendVerification = async (email) => {
    try {
      const response = await fetch(`${API_BASE}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowResendDialog(false);
        setPendingResendEmail("");
        setLoginError('Verification email sent! Please check your inbox.');
      } else {
        setLoginError(data.error || 'Failed to resend verification email');
      }
    } catch (error) {
      setLoginError('Failed to resend verification email. Please try again.');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;
      
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          prevLightbox();
          break;
        case 'ArrowRight':
          nextLightbox();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, prevLightbox, nextLightbox]);

  const handleGateSubmit = (e) => {
    e.preventDefault();
    if (gatePassword.toLowerCase() === 'dave') {
      setIsGatePassed(true);
      localStorage.setItem('gatePassed', 'true');
    } else {
      setGateError('Incorrect password');
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDistance = (distance) => {
    return `${distance} km`;
  };

  // Check if we're on the admin page
  const isAdminPage = window.location.pathname === '/admin';
  
  // Check if we're on the email verification page
  const isVerificationPage = window.location.pathname === '/verify-email';

  if (!isGatePassed) {
    return (
      <div className="gate">
        <h1>🏃‍♂️ Dave's Running Club</h1>
        <p>Welcome to our memorial running club</p>
        <p>Please enter the password to continue</p>
        <form onSubmit={handleGateSubmit}>
          <input
            type="password"
            placeholder="Enter password"
            value={gatePassword}
            onChange={(e) => setGatePassword(e.target.value)}
            required
          />
          <button type="submit">Enter</button>
        </form>
        {gateError && <div className="error">{gateError}</div>}
      </div>
    );
  }

  // Render verification page if on /verify-email route
  if (isVerificationPage) {
    return (
      <div className="App">
        <nav className="navbar">
          <div className="nav-brand" onClick={() => window.location.href = '/'}>
            <span className="nav-logo">🏃‍♂️</span>
            <span className="nav-title">Dave's Running Club - Email Verification</span>
          </div>
        </nav>
        <main className="main-content">
          <EmailVerificationPage />
        </main>
      </div>
    );
  }

  // Render admin page if on /admin route
  if (isAdminPage) {
    return (
      <div className="App">
        <nav className="navbar">
          <div className="nav-brand" onClick={() => window.location.href = '/'}>
            <span className="nav-logo">🏃‍♂️</span>
            <span className="nav-title">Dave's Running Club - Admin</span>
          </div>
        </nav>
        <main className="main-content">
          {renderAdmin()}
        </main>
        
              {/* Admin Lightbox */}
      {adminLightboxOpen && (
        <div className="lightbox-overlay" onClick={closeAdminLightbox}>
          <div className="lightbox-modal" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeAdminLightbox}>×</button>
            <img
              src={`${API_BASE.replace('/api', '')}${pendingPhotos[adminLightboxIndex]?.url}`}
              alt={`Admin review ${adminLightboxIndex + 1}`}
              className="lightbox-img"
            />
          </div>
        </div>
      )}

      {/* Authentication Modals */}
      {!isLoggedIn && (
        <div className="auth-modal-overlay" onClick={() => setIsRegistering(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="auth-modal-close" onClick={() => setIsRegistering(false)}>×</button>
            
            {isRegistering ? (
              <div className="register-form">
                <h3>Register</h3>
                <form onSubmit={handleRegister}>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={registerFirstName}
                    onChange={(e) => setRegisterFirstName(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={registerLastName}
                    onChange={(e) => setRegisterLastName(e.target.value)}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password (min 6 characters)"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                  />
                  <button type="submit" className="auth-submit-btn">
                    Register
                  </button>
                </form>
                {registerError && <div className="auth-error">{registerError}</div>}
                <p className="auth-switch">
                  Already have an account?{' '}
                  <button onClick={() => setIsRegistering(false)}>Login</button>
                </p>
              </div>
            ) : (
              <div className="login-form">
                <h3>Login</h3>
                <form onSubmit={handleLogin}>
                  <input
                    type="email"
                    placeholder="Email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <button type="submit" className="auth-submit-btn">
                    Login
                  </button>
                </form>
                {loginError && <div className="auth-error">{loginError}</div>}
                <p className="auth-switch">
                  Don't have an account?{' '}
                  <button onClick={() => setIsRegistering(true)}>Register</button>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
  }

  function EmailVerificationPage() {
    const [verificationStatus, setVerificationStatus] = useState('verifying');
    const [message, setMessage] = useState('');
    
    useEffect(() => {
      const verifyEmail = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (!token) {
          setVerificationStatus('error');
          setMessage('No verification token found in the URL.');
          return;
        }
        
        try {
          const response = await fetch(`${API_BASE}/auth/verify-email?token=${token}`);
          const data = await response.json();
          
          if (data.success) {
            setVerificationStatus('success');
            setMessage(data.message);
          } else {
            setVerificationStatus('error');
            setMessage(data.error);
          }
        } catch (error) {
          setVerificationStatus('error');
          setMessage('Failed to verify email. Please try again.');
        }
      };
      
      verifyEmail();
    }, []);
    
    return (
      <div className="verification-page" style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Email Verification</h2>
        
        {verificationStatus === 'verifying' && (
          <div>
            <p>Verifying your email address...</p>
            <div style={{ margin: '2rem 0' }}>⏳</div>
          </div>
        )}
        
        {verificationStatus === 'success' && (
          <div>
            <div style={{ margin: '2rem 0', fontSize: '3rem' }}>✅</div>
            <h3 style={{ color: '#28a745' }}>Email Verified Successfully!</h3>
            <p>{message}</p>
            <button 
              className="action-btn primary" 
              onClick={() => window.location.href = '/'}
              style={{ marginTop: '1rem' }}
            >
              Go to Home Page
            </button>
          </div>
        )}
        
        {verificationStatus === 'error' && (
          <div>
            <div style={{ margin: '2rem 0', fontSize: '3rem' }}>❌</div>
            <h3 style={{ color: '#dc3545' }}>Verification Failed</h3>
            <p>{message}</p>
            <button 
              className="action-btn primary" 
              onClick={() => window.location.href = '/'}
              style={{ marginTop: '1rem' }}
            >
              Go to Home Page
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="App">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-brand" onClick={() => setActiveTab('home')}>
          <span className="nav-logo">🏃‍♂️</span>
          <span className="nav-title">Dave's Running Club</span>
        </div>
        <div className="nav-tabs">
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
        
        {/* Authentication Section */}
        <div className="auth-section">
          {isLoggedIn ? (
            <div className="user-info">
              <span className="user-name">Welcome, {currentUser?.firstName}!</span>
              <button className="auth-btn logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button 
                className="auth-btn login" 
                onClick={() => setShowLoginModal(true)}
              >
                Login
              </button>
              <button 
                className="auth-btn register" 
                onClick={() => setShowRegisterModal(true)}
              >
                Register
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'schedule' && renderSchedule()}
        {activeTab === 'members' && renderMembers()}
        {activeTab === 'gallery' && renderGallery()}
        {activeTab === 'contact' && renderContact()}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2025 Dave's Running Club. Honouring Dave Reynolds' memory.</p>
        <div className="footer-mental-health">
          If you're struggling, please reach out. You're not alone. 💚
        </div>
        <div className="footer-admin">
          <a href="/admin" className="admin-link">Admin</a>
        </div>
      </footer>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-modal" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>×</button>
            <img
              src={photos[lightboxIndex - galleryImages.length]?.url || galleryImages[lightboxIndex - photos.length]}
              alt={`Gallery ${lightboxIndex + 1}`}
              className="lightbox-img"
            />
            <button className="lightbox-nav left" onClick={prevLightbox}>‹</button>
            <button className="lightbox-nav right" onClick={nextLightbox}>›</button>
          </div>
        </div>
      )}

      {/* Authentication Modals */}
      {(showLoginModal || showRegisterModal) && (
        <div className="auth-modal-overlay">
          <div className="auth-modal">
            <button className="auth-modal-close" onClick={() => { setShowLoginModal(false); setShowRegisterModal(false); }}>×</button>
            {showLoginModal && (
              <div className="login-form">
                <h3>Login</h3>
                <form onSubmit={handleLogin}>
                  <input
                    type="email"
                    placeholder="Email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                  </button>
                  {loginError && <div className="auth-error">{loginError}</div>}
                </form>
                <div className="auth-switch">
                  <span>Don't have an account? </span>
                  <button onClick={() => { setShowLoginModal(false); setShowRegisterModal(true); }}>
                    Register
                  </button>
                </div>
              </div>
            )}
            {showRegisterModal && (
              <div className="register-form">
                <h3>Register</h3>
                <form onSubmit={handleRegister}>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={registerFirstName}
                    onChange={(e) => setRegisterFirstName(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={registerLastName}
                    onChange={(e) => setRegisterLastName(e.target.value)}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                  />
                  <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                    {isLoading ? 'Registering...' : 'Register'}
                  </button>
                  {registerError && <div className="auth-error">{registerError}</div>}
                </form>
                <div className="auth-switch">
                  <span>Already have an account? </span>
                  <button onClick={() => { setShowRegisterModal(false); setShowLoginModal(true); }}>
                    Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resend Verification Dialog */}
      {showResendDialog && (
        <div className="auth-modal-overlay">
          <div className="auth-modal">
            <button className="auth-modal-close" onClick={() => { setShowResendDialog(false); setPendingResendEmail(""); }}>×</button>
            <div className="resend-verification-form">
              <h3>Resend Verification Email</h3>
              <p>Would you like to resend the verification email to <strong>{pendingResendEmail}</strong>?</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                <button 
                  className="auth-submit-btn" 
                  onClick={() => handleResendVerification(pendingResendEmail)}
                  style={{ backgroundColor: '#667eea' }}
                >
                  Resend Email
                </button>
                <button 
                  className="auth-submit-btn" 
                  onClick={() => { setShowResendDialog(false); setPendingResendEmail(""); }}
                  style={{ backgroundColor: '#6c757d' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function renderHome() {
    return (
      <div className="home-section">
        <div className="hero">
          <h1>Dave's Running Club</h1>
          <p className="tagline">Honouring Dave Reynolds' love of running and having fun with friends</p>
        </div>

        {/* Dave Tribute Section */}
        <div className="dave-tribute">
          <img src="/gallery/Dave.png" alt="Dave Reynolds" className="dave-photo" />
          <div className="tribute-text">
            <h2>In Memory of Dave Reynolds</h2>
            <p>
              Dave was a passionate runner who found joy, peace, and community through running. 
              His love for the sport and his infectious enthusiasm inspired everyone around him.
            </p>
            <p>
              This club was founded in his honour to continue his legacy of building community 
              through running and supporting mental health awareness.
            </p>
            <div className="mental-health-message">
              💚 Remember: It's okay to not be okay. Reach out, talk to someone, and know that you're not alone.
            </div>
          </div>
        </div>

        {/* Club Stats */}
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-number">45</span>
            <span className="stat-label">Members</span>
          </div>
          <div className="stat">
            <span className="stat-number">{totalKm}</span>
            <span className="stat-label">Km This Year</span>
          </div>
          <div className="stat">
            <span className="stat-number">July 2025</span>
            <span className="stat-label">Founded</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <a 
            href="https://chat.whatsapp.com/EwYCmWyzPNwJIlyXvo25Jr?mode=r_t" 
            target="_blank" 
            rel="noopener noreferrer"
            className="action-btn whatsapp"
          >
            💬 Join WhatsApp Group
          </a>
          <button className="action-btn primary" onClick={handleJoinRun}>
            Join Our Next Run
          </button>
          <button className="action-btn secondary" onClick={handleViewGallery}>
            View Gallery
          </button>
          <button className="action-btn mental-health" onClick={handleMentalHealth}>
            Mental Health Resources
          </button>
        </div>

        {/* Personal Run Tracking */}
        <div className="add-run-section">
          <h2>Add Your Run</h2>
          <form className="add-run-form" onSubmit={handleAddRun}>
            <input
              type="text"
              placeholder="First Name"
              value={runFirstName}
              onChange={(e) => setRunFirstName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={runLastName}
              onChange={(e) => setRunLastName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Location"
              value={runLocation}
              onChange={(e) => setRunLocation(e.target.value)}
              required
            />
            <input
              type="number"
              step="0.1"
              placeholder="Distance (km)"
              value={runDistance}
              onChange={(e) => setRunDistance(e.target.value)}
              required
            />
            <button type="submit" className="action-btn primary" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Run'}
            </button>
          </form>
          
          {runError && <div className="run-error">{runError}</div>}
          
          {/* Personal Stats */}
          {userStats && (
            <div className="personal-stats">
              <h3>Your Running Stats</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">{userStats.totalDistance}</span>
                  <span className="stat-label">Total Km</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{userStats.totalRuns}</span>
                  <span className="stat-label">Total Runs</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{userStats.averageDistance}</span>
                  <span className="stat-label">Avg Distance</span>
                </div>
              </div>
              
              {userStats.recentRuns.length > 0 && (
                <div className="personal-recent-runs">
                  <h4>Your Recent Runs</h4>
                  <ul>
                    {userStats.recentRuns.map((run, index) => (
                      <li key={index}>
                        {formatDistance(run.distance)} at {run.location} - {formatDate(run.timestamp)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Leaderboard */}
          <div className="leaderboard-section">
            <button 
              className="leaderboard-toggle"
              onClick={() => setShowLeaderboard(!showLeaderboard)}
            >
              {showLeaderboard ? 'Hide' : 'Show'} Club Leaderboard
            </button>
            
            {showLeaderboard && leaderboard.length > 0 && (
              <div className="leaderboard">
                <h3>Club Leaderboard</h3>
                <div className="leaderboard-list">
                  {leaderboard.map((user, index) => (
                    <div key={user.userId} className={`leaderboard-item ${user.userId === userId ? 'current-user' : ''}`}>
                      <span className="rank">#{index + 1}</span>
                      <span className="name">{user.firstName} {user.lastName}</span>
                      <span className="distance">{user.totalDistance} km</span>
                      <span className="runs">{user.totalRuns} runs</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recent Club Runs */}
          <div className="recent-runs">
            <h3>Recent Club Runs</h3>
            <ul>
              {recentRuns.map((run, index) => (
                <li key={index}>
                  {run.firstName} {run.lastName} ran {formatDistance(run.distance)} at {run.location} - {formatDate(run.timestamp)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  function renderSchedule() {
    const upcomingRuns = [
      {
        title: 'Sunday Group Run',
        description: 'Our weekly group run where we build community and support each other',
        time: '9:00 AM',
        location: 'Check WhatsApp for location',
        distance: '5-10 km',
        details: 'Join our WhatsApp group for weekly location updates and to connect with other runners'
      }
    ];

    return (
      <div className="schedule-section">
        <h2>Upcoming Runs</h2>
        <p className="section-description">
          Join us for our regular runs and special events. All abilities welcome!
        </p>
        
        <div className="runs-grid">
          {upcomingRuns.map((run, index) => (
            <div key={index} className="run-card">
              <h3>{run.title}</h3>
              <p className="run-description">{run.description}</p>
              <div className="run-details">
                <p><strong>Time:</strong> {run.time}</p>
                <p><strong>Location:</strong> {run.location}</p>
                <p><strong>Distance:</strong> {run.distance}</p>
                <p><strong>Details:</strong> {run.details}</p>
              </div>
              <button className="join-btn" onClick={handleJoinRun}>
                Join This Run
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderMembers() {
    const members = [
      {
        name: 'Dave Reynolds',
        role: 'Honouree',
        runs: 'Inspiring us all',
        memory: 'Forever in our hearts and on our runs',
        isDave: true
      },
      {
        name: 'Tom Mannion',
        role: 'Founder',
        runs: 'Leading the pack'
      },
      {
        name: 'Jennie Mannion',
        role: 'Founder',
        runs: 'Building community'
      }
    ];

    return (
      <div className="members-section">
        <h2>Club Members</h2>
        <p className="section-description">
          Meet the amazing people who make this club special and honour Dave's memory.
        </p>
        
        <div className="members-grid">
          {members.map((member, index) => (
            <div key={index} className={`member-card ${member.isDave ? 'dave-card' : ''}`}>
              <div className="member-avatar">
                {member.isDave ? '💙' : '🏃‍♂️'}
              </div>
              <h3>{member.name}</h3>
              <p className="member-role">{member.role}</p>
              <p className="member-runs">{member.runs}</p>
              {member.memory && <p className="dave-memory">{member.memory}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderGallery() {
    return (
      <div className="gallery-section">
        <h2>Gallery</h2>
        <p className="section-description">
          Share your running memories and see photos from our club runs.
        </p>

        {/* Photo Upload Section */}
        <div className="photo-upload-section">
          <h3>Share Your Run</h3>
          <form className="photo-upload-form" onSubmit={handlePhotoUpload}>
            <div className="form-row">
              <input
                type="text"
                placeholder="First Name"
                value={photoFirstName}
                onChange={(e) => setPhotoFirstName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={photoLastName}
                onChange={(e) => setPhotoLastName(e.target.value)}
                required
              />
            </div>
            <input
              type="text"
              placeholder="Caption (optional)"
              value={photoCaption}
              onChange={(e) => setPhotoCaption(e.target.value)}
            />
            <div className="file-input-wrapper">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedPhoto(e.target.files[0])}
                required
                className="file-input"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="file-input-label">
                {selectedPhoto ? selectedPhoto.name : 'Choose a photo'}
              </label>
            </div>
            <button type="submit" disabled={photoUploadLoading}>
              {photoUploadLoading ? 'Uploading...' : 'Share Photo'}
            </button>
          </form>
          
          {photoUploadError && <div className="photo-upload-error">{photoUploadError}</div>}
        </div>

        {/* Combined Gallery */}
        <div className="gallery-grid">
          {/* User uploaded photos */}
          {Array.isArray(photos) && photos.map((photo, index) => (
            <div key={photo.id} className="gallery-item" onClick={() => openLightbox(index)}>
              <img 
                src={`${API_BASE.replace('/api', '')}${photo.url}`} 
                alt={`By ${photo.firstName} ${photo.lastName}`}
              />
              <div className="photo-info">
                <p className="photo-author">{photo.firstName} {photo.lastName}</p>
                {photo.caption && <p className="photo-caption">{photo.caption}</p>}
                <p className="photo-date">{formatDate(photo.timestamp)}</p>
                {photo.userId === userId && (
                  <button 
                    className="delete-photo-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePhotoDelete(photo.id);
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {/* Original gallery images */}
          {galleryImages.map((image, index) => (
            <div key={`gallery-${index}`} className="gallery-item" onClick={() => openLightbox((Array.isArray(photos) ? photos.length : 0) + index)}>
              <img src={image} alt={`Gallery ${index + 1}`} />
              <div className="photo-info">
                <p className="photo-author">Club Memory</p>
                <p className="photo-date">Club Gallery</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderContact() {
    return (
      <div className="contact-section">
        <h2>Get In Touch</h2>
        <p className="section-description">
          Have questions, want to join a run, or need support? We're here for you.
        </p>
        
        <div className="contact-info">
          <div className="contact-item whatsapp-group">
            <div className="whatsapp-icon">💬</div>
            <h3>Join Our WhatsApp Group</h3>
            <p>Connect with other runners, get run updates, and be part of our community.</p>
            <a 
              href="https://chat.whatsapp.com/EwYCmWyzPNwJIlyXvo25Jr?mode=r_t" 
              target="_blank" 
              rel="noopener noreferrer"
              className="whatsapp-link"
            >
              <span className="whatsapp-btn">
                📱 Join WhatsApp Group
              </span>
            </a>
          </div>
          
          <div className="contact-item mental-health-resource">
            <div className="mental-health-icon">💚</div>
            <h3>Mental Health Support</h3>
            <p>If you're struggling, please reach out. You're not alone. We're here to support you.</p>
            <button 
              onClick={handleMentalHealth}
              className="mental-health-btn"
            >
              🌟 Get Support
            </button>
          </div>
          
          <div className="contact-item">
            <div className="contact-icon">📧</div>
            <h3>General Inquiries</h3>
            <p>Questions about the club, runs, or how to get involved? Send us a message below.</p>
          </div>
        </div>
        
        <div className="contact-form">
          <h3>Send Us a Message</h3>
          <form onSubmit={handleContactSubmit}>
            <input
              type="text"
              placeholder="Your Name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="Phone Number (optional)"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
            <textarea
              placeholder="Your Message"
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              required
            />
            <button type="submit" className="action-btn primary" disabled={contactLoading}>
              {contactLoading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
          
          {contactSuccess && <div className="contact-success">{contactSuccess}</div>}
          {contactError && <div className="contact-error">{contactError}</div>}
        </div>
      </div>
    );
  }

  function renderAdmin() {
    return (
      <div className="admin-section">
        <h2>Admin Panel</h2>
        <p className="section-description">
          Review and approve pending photo uploads from club members.
        </p>

        {!isAdmin ? (
          <div className="admin-login">
            <h3>Admin Login</h3>
            <form onSubmit={handleAdminLogin}>
              <input
                type="password"
                placeholder="Admin Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
              <button type="submit" className="action-btn primary" disabled={adminLoading}>
                {adminLoading ? 'Logging in...' : 'Login as Admin'}
              </button>
            </form>
            {adminError && <div className="admin-error">{adminError}</div>}
          </div>
        ) : (
          <div className="admin-panel">
            <div className="admin-header">
              <h3>Pending Photo Approvals</h3>
              <button 
                className="action-btn secondary" 
                onClick={() => {
                  setIsAdmin(false);
                  setAdminPassword('');
                  setPendingPhotos([]);
                  localStorage.removeItem('adminPassword');
                }}
              >
                Logout
              </button>
            </div>
            
            {pendingPhotos.length > 0 ? (
              <div className="pending-photos">
                {pendingPhotos.map((photo, index) => (
                  <div key={photo.id} className="pending-photo-item">
                    <img 
                      src={`${API_BASE.replace('/api', '')}${photo.url}`} 
                      alt={`By ${photo.firstName} ${photo.lastName}`}
                      onClick={() => openAdminLightbox(index)}
                      className="pending-photo-clickable"
                    />
                    <div className="pending-photo-info">
                      <p><strong>{photo.firstName} {photo.lastName}</strong></p>
                      {photo.caption && <p>{photo.caption}</p>}
                      <p>{formatDate(photo.timestamp)}</p>
                      <div className="admin-actions">
                        <button 
                          className="action-btn primary"
                          onClick={() => handleApprovePhoto(photo.id)}
                        >
                          Approve
                        </button>
                        <button 
                          className="action-btn reject"
                          onClick={() => handleRejectPhoto(photo.id)}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-pending-photos">
                <p>No pending photos to review.</p>
                <p>All uploaded photos have been processed.</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default App;