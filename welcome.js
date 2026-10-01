/**
 * Welcome to Digital Resume Splash Overlay Controller
 * Dalila Stephany Granados-Martinez - Personal Portfolio & Resume
 * 
 * Provides an elegant, animated welcome splash screen that smoothly fades
 * into the digital resume website after a 10-second preview, with
 * immediate skip via click, Enter/Space/Escape keys, and replay capability.
 */
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('welcome-overlay');
    const enterBtn = document.getElementById('enter-site-btn');
    const progressBar = document.getElementById('welcome-progress');
    const replayBtns = document.querySelectorAll('.js-replay-welcome');
    const backgroundSections = document.querySelectorAll('header, main, footer');

    if (!overlay) return;

    let autoFadeTimeout = null;
    let isDismissed = false;

    // Check if page was refreshed or explicitly requested
    const isReload = window.performance && 
        performance.getEntriesByType('navigation')[0]?.type === 'reload';
    const urlParams = new URLSearchParams(window.location.search);
    const forceIntro = urlParams.has('intro') || urlParams.has('welcome');
    
    let hasSeen = false;
    try {
        hasSeen = sessionStorage.getItem('digitalResumeWelcomeSeen') === 'true';
    } catch (e) {
        // Fallback for private browsing / blocked storage
        hasSeen = false;
    }

    function setBackgroundInert(inert) {
        backgroundSections.forEach(section => {
            if (inert) {
                section.setAttribute('inert', '');
                section.setAttribute('aria-hidden', 'true');
            } else {
                section.removeAttribute('inert');
                section.removeAttribute('aria-hidden');
            }
        });
    }

    function startAutoFade() {
        if (!progressBar) return;

        // Reset progress bar
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';

        // Trigger reflow to restart animation reliably
        void progressBar.offsetWidth;

        // 10-second smooth progress indicator
        progressBar.style.transition = 'width 10000ms linear';
        progressBar.style.width = '100%';

        if (autoFadeTimeout) clearTimeout(autoFadeTimeout);

        // Auto fade into the site after 10 seconds
        autoFadeTimeout = setTimeout(() => {
            dismissWelcome();
        }, 10000);
    }

    function showWelcome() {
        isDismissed = false;
        overlay.classList.remove('fade-out');
        overlay.style.display = 'flex';
        overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('welcome-active');
        document.body.classList.remove('welcome-loaded');
        setBackgroundInert(true);

        // Scroll to top when replaying
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (enterBtn) {
            setTimeout(() => enterBtn.focus(), 150);
        }

        startAutoFade();
    }

    function dismissWelcome() {
        if (isDismissed) return;
        isDismissed = true;

        if (autoFadeTimeout) {
            clearTimeout(autoFadeTimeout);
            autoFadeTimeout = null;
        }

        // Trigger cinematic fade-out
        overlay.classList.add('fade-out');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('welcome-active');
        document.body.classList.add('welcome-loaded');
        setBackgroundInert(false);

        try {
            sessionStorage.setItem('digitalResumeWelcomeSeen', 'true');
        } catch (e) {
            // Storage quota or private browsing
        }

        // Clean up ?intro=1 query parameter so refreshing afterwards behaves normally
        if (forceIntro && window.history && window.history.replaceState) {
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
        }

        // Remove from view once transition completes
        setTimeout(() => {
            if (isDismissed) {
                overlay.style.display = 'none';
            }
        }, 750);
    }

    // Interactive Enter button
    if (enterBtn) {
        enterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dismissWelcome();
        });
    }

    // Dismiss when clicking anywhere on overlay
    overlay.addEventListener('click', (e) => {
        if (!e.target.closest('a, button')) {
            dismissWelcome();
        }
    });

    // Keyboard accessibility: Enter, Space, or Escape to immediately dismiss
    document.addEventListener('keydown', (e) => {
        if (!isDismissed && overlay.style.display !== 'none') {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
                e.preventDefault();
                dismissWelcome();
            }
        }
    });

    // Replay buttons throughout the site
    replayBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showWelcome();
        });
    });

    // Show on first visit, reload, or explicit intro query
    if (!hasSeen || isReload || forceIntro) {
        showWelcome();
    } else {
        overlay.style.display = 'none';
        overlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('welcome-active');
        document.body.classList.add('welcome-loaded');
        setBackgroundInert(false);
    }
});

/* ==========================================================================
   Contact Form Controller - AJAX Submission & Email Delivery
   ========================================================================== */
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    const statusBox = document.getElementById('contact-status');
    const submitBtn = document.getElementById('contact-submit-btn');
    const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
    const btnSpinner = submitBtn ? submitBtn.querySelector('.btn-spinner') : null;
    const resetBtn = document.getElementById('contact-reset-btn');

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function showStatus(type, title, message, actionHtml = '') {
        if (!statusBox) return;
        statusBox.className = `form-status status-${type}`;

        let iconSvg = '';
        if (type === 'success') {
            iconSvg = `<svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>`;
        } else if (type === 'error') {
            iconSvg = `<svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>`;
        } else {
            iconSvg = `<svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>`;
        }

        statusBox.innerHTML = `
            <div class="status-body">
                <div class="status-icon">${iconSvg}</div>
                <div class="status-message">
                    <strong>${title}</strong>
                    <div>${message}</div>
                    ${actionHtml ? `<div class="status-action-row">${actionHtml}</div>` : ''}
                </div>
            </div>
        `;
        statusBox.style.display = 'block';
        statusBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function clearStatus() {
        if (!statusBox) return;
        statusBox.className = 'form-status';
        statusBox.innerHTML = '';
        statusBox.style.display = 'none';
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            clearStatus();
        });
    }

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('contact-name');
        const emailInput = document.getElementById('contact-email');
        const subjectInput = document.getElementById('contact-subject');
        const messageInput = document.getElementById('contact-message');

        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const subject = subjectInput ? subjectInput.value.trim() : '';
        const message = messageInput ? messageInput.value.trim() : '';

        if (!name || !email || !subject || !message) {
            showStatus('error', 'Missing Information', 'Please fill out all required fields before submitting.');
            return;
        }

        // Email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showStatus('error', 'Invalid Email', 'Please provide a valid email address so Dalila can reply to you.');
            return;
        }

        // Button loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('is-loading');
        }
        if (btnText) btnText.textContent = 'Sending Message...';
        if (btnSpinner) btnSpinner.style.display = 'inline-flex';
        clearStatus();

        try {
            const response = await fetch('https://formsubmit.co/ajax/dalilagranados08@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    _replyto: email,
                    _subject: `Portfolio Message from ${name}: ${subject}`,
                    message: message,
                    _template: 'table',
                    _captcha: 'false'
                })
            });

            const result = await response.json().catch(() => null);

            if (response.ok) {
                showStatus(
                    'success',
                    'Message Sent Successfully!',
                    `Thank you, <strong>${escapeHtml(name)}</strong>! Your message has been sent. I will review it and get back to you as soon as possible.`
                );
                contactForm.reset();
            } else {
                throw new Error(result?.message || 'Form delivery service returned an error.');
            }
        } catch (error) {
            console.error('Contact Form Submission Error:', error);

            const mailtoUrl = `mailto:dalilagranados08@gmail.com?subject=${encodeURIComponent('Website Inquiry: ' + subject)}&body=${encodeURIComponent('Hi Dalila,\n\n' + message + '\n\nFrom: ' + name + ' (' + email + ')')}`;

            showStatus(
                'error',
                'Message Delivery Notice',
                `There was an issue sending your message automatically (${escapeHtml(error.message)}). Your text is preserved &mdash; click below to send it directly:`,
                `<a href="${mailtoUrl}" class="status-mailto-btn" target="_blank" rel="noopener noreferrer">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Send via Email App
                </a>`
            );
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('is-loading');
            }
            if (btnText) btnText.textContent = 'Send Message';
            if (btnSpinner) btnSpinner.style.display = 'none';
        }
    });
}

// Initialize contact form handler
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm);
} else {
    initContactForm();
}

