/**
 * Welcome to Digital Resume Splash Overlay Controller
 * Dalila Stephany Granados-Martinez - Personal Portfolio & Resume
 * 
 * Provides an elegant, animated welcome splash screen that smoothly fades
 * into the digital resume website after a brief 2-second preview, with
 * immediate skip via click, Enter/Space/Escape keys, and replay capability.
 */
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('welcome-overlay');
    const enterBtn = document.getElementById('enter-site-btn');
    const progressBar = document.getElementById('welcome-progress');
    const replayBtns = document.querySelectorAll('.js-replay-welcome');

    if (!overlay) return;

    let autoFadeTimeout = null;
    let isDismissed = false;

    // Check if page was refreshed or explicitly requested
    const isReload = window.performance && 
        performance.getEntriesByType('navigation')[0]?.type === 'reload';
    const urlParams = new URLSearchParams(window.location.search);
    const forceIntro = urlParams.has('intro') || urlParams.has('welcome');
    const hasSeen = sessionStorage.getItem('digitalResumeWelcomeSeen');

    function startAutoFade() {
        if (!progressBar) return;

        // Reset progress bar
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';

        // Trigger reflow to restart animation reliably
        void progressBar.offsetWidth;

        // 2-second smooth progress indicator
        progressBar.style.transition = 'width 2000ms cubic-bezier(0.25, 1, 0.5, 1)';
        progressBar.style.width = '100%';

        if (autoFadeTimeout) clearTimeout(autoFadeTimeout);

        // Auto fade into the site after 2 seconds
        autoFadeTimeout = setTimeout(() => {
            dismissWelcome();
        }, 2000);
    }

    function showWelcome() {
        isDismissed = false;
        overlay.classList.remove('fade-out');
        overlay.style.display = 'flex';
        overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('welcome-active');
        document.body.classList.remove('welcome-loaded');

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

        sessionStorage.setItem('digitalResumeWelcomeSeen', 'true');

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
        document.body.classList.add('welcome-loaded');
    }
});
