// ─────────────────────────────────────────────
// CueLoop Landing Page
// Email capture + scroll reveal animations
// ─────────────────────────────────────────────

(function () {
    'use strict';

    // ─── Scroll Reveal ───

    var revealElements = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
        );

        revealElements.forEach(function (el) {
            observer.observe(el);
        });
    } else {
        revealElements.forEach(function (el) {
            el.classList.add('visible');
        });
    }

    // ─── Email Form Handling ───

    var forms = document.querySelectorAll('.email-form');

    forms.forEach(function (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var input = form.querySelector('input[type="email"]');
            var message = form.querySelector('.form-message');
            var button = form.querySelector('button');
            var email = input.value.trim();

            if (!email || !isValidEmail(email)) {
                showMessage(message, 'Please enter a valid email address.', 'error');
                return;
            }

            button.disabled = true;
            button.textContent = 'Joining\u2026';

            submitEmail(email)
                .then(function () {
                    form.classList.add('submitted');
                    showMessage(message, "You\u2019re on the list!", 'success');
                })
                .catch(function (err) {
                    button.disabled = false;
                    button.textContent = 'Join the waitlist';

                    if (err.message === 'duplicate') {
                        showMessage(message, "You\u2019re already signed up!", 'success');
                    } else {
                        showMessage(message, 'Something went wrong. Please try again.', 'error');
                    }
                });
        });
    });

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showMessage(el, text, type) {
        el.textContent = text;
        el.className = 'form-message ' + type;
    }

    // ─── Supabase Integration ───
    // Fill in your Supabase project credentials below.
    // Get these from: Supabase Dashboard → Settings → API

    var SUPABASE_URL = 'https://jcplnrjspvcnuuwbcvcw.supabase.co';
    var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjcGxucmpzcHZjbnV1d2JjdmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2OTUwNTgsImV4cCI6MjA4NjI3MTA1OH0.HhEHuY8pHAsSbF0Hw4X6dYw_uHJFN8DfVHTuo_G2BYY';

    function submitEmail(email) {
        // Development mode — log to console if no credentials
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
            console.log('[CueLoop] Waitlist signup:', email);
            return Promise.resolve();
        }

        return fetch(SUPABASE_URL + '/rest/v1/waitlist', {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ email: email })
        }).then(function (response) {
            if (response.status === 409) {
                throw new Error('duplicate');
            }
            if (!response.ok) {
                return response.json().then(function (body) {
                    // Supabase returns code 23505 for unique violations
                    if (body && body.code === '23505') {
                        throw new Error('duplicate');
                    }
                    throw new Error('failed');
                });
            }
        });
    }

})();
