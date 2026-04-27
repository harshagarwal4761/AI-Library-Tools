const API_BASE = '';

const TOOL_ICONS = {
    'chatgpt': '🤖',
    'canva': '🎨',
    'groq': '⚡',
    'antigravity': '🚀',
    'midjourney': '🖼️',
    'copilot': '👨‍💻',
    'claude': '🧠',
    'gemini': '✨',
    'dall-e': '🎭',
    'notion': '📝',
    'default': '🔧'
};

function getToolIcon(name) {
    const lower = name.toLowerCase();
    for (const [key, icon] of Object.entries(TOOL_ICONS)) {
        if (lower.includes(key)) return icon;
    }
    return TOOL_ICONS.default;
}

function getToken() {
    return localStorage.getItem('jwt_token');
}

function getUsername() {
    return localStorage.getItem('username');
}

function setAuth(token, username) {
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('username', username);
}

function clearAuth() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('username');
}

function isAuthenticated() {
    return !!getToken();
}

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
    };
}

function showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
        el.style.display = 'block';
    }
}

function hideError(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.style.display = 'none';
    }
}

function showSuccess(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
        el.style.display = 'block';
    }
}

async function handleSignup(event) {
    event.preventDefault();
    hideError('signup-error');

    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value;
    const btn = document.getElementById('signup-btn');

    if (username.length < 3) {
        showError('signup-error', 'Username must be at least 3 characters');
        return;
    }
    if (password.length < 6) {
        showError('signup-error', 'Password must be at least 6 characters');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span>';

    try {
        const res = await fetch(API_BASE + '/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
            showSuccess('signup-success', 'Account created! Redirecting to login...');
            setTimeout(() => window.location.href = '/login', 1500);
        } else {
            showError('signup-error', data.message || 'Signup failed');
        }
    } catch (err) {
        showError('signup-error', 'Network error. Please try again.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Create Account';
    }
}

async function handleLogin(event) {
    event.preventDefault();
    hideError('login-error');

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');

    if (!username || !password) {
        showError('login-error', 'Please fill in all fields');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span>';

    try {
        const res = await fetch(API_BASE + '/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
            setAuth(data.token, data.username);
            window.location.href = '/dashboard';
        } else {
            showError('login-error', data.message || 'Invalid credentials');
        }
    } catch (err) {
        showError('login-error', 'Network error. Please try again.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Sign In';
    }
}

function logout() {
    clearAuth();
    window.location.href = '/login';
}

async function loadTools() {
    const grid = document.getElementById('tools-grid');
    const counter = document.getElementById('tools-count');

    if (!grid) return;

    try {
        const res = await fetch(API_BASE + '/api/tools', {
            headers: authHeaders()
        });

        if (res.status === 401 || res.status === 403) {
            logout();
            return;
        }

        const tools = await res.json();

        if (counter) counter.textContent = tools.length;

        if (tools.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <div class="empty-title">No tools added yet</div>
                    <p>Start by adding your favorite AI tools above</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = tools.map(tool => `
            <div class="tool-card" id="tool-${tool.id}">
                <div class="tool-icon">${getToolIcon(tool.name)}</div>
                <div class="tool-name">${escapeHtml(tool.name)}</div>
                <div class="tool-url">${escapeHtml(tool.url)}</div>
                <div class="tool-actions">
                    <a href="${escapeHtml(tool.url)}" target="_blank" rel="noopener" class="tool-visit">
                        Visit ↗
                    </a>
                    <button class="btn btn-danger" onclick="deleteTool(${tool.id})">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');

    } catch (err) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <div class="empty-title">Failed to load tools</div>
                <p>Please check your connection and try again</p>
            </div>
        `;
    }
}

async function handleAddTool(event) {
    event.preventDefault();
    hideError('tool-error');

    const name = document.getElementById('tool-name').value.trim();
    const url = document.getElementById('tool-url').value.trim();

    if (!name || !url) {
        showError('tool-error', 'Please fill in both fields');
        return;
    }

    try {
        const res = await fetch(API_BASE + '/api/tools', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ name, url })
        });

        if (res.status === 401 || res.status === 403) {
            logout();
            return;
        }

        if (res.ok) {
            document.getElementById('tool-name').value = '';
            document.getElementById('tool-url').value = '';
            loadTools();
        } else {
            const data = await res.json();
            showError('tool-error', data.message || 'Failed to add tool');
        }
    } catch (err) {
        showError('tool-error', 'Network error. Please try again.');
    }
}

async function deleteTool(id) {
    try {
        const res = await fetch(API_BASE + '/api/tools/' + id, {
            method: 'DELETE',
            headers: authHeaders()
        });

        if (res.status === 401 || res.status === 403) {
            logout();
            return;
        }

        if (res.ok) {
            const card = document.getElementById('tool-' + id);
            if (card) {
                card.style.transform = 'scale(0.9)';
                card.style.opacity = '0';
                setTimeout(() => loadTools(), 300);
            }
        }
    } catch (err) {
        console.error('Delete failed');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function initDashboard() {
    if (!isAuthenticated()) {
        window.location.href = '/login';
        return;
    }

    const usernameEl = document.getElementById('display-username');
    if (usernameEl) {
        usernameEl.textContent = getUsername();
    }

    loadTools();
}

function initAuthPage() {
    if (isAuthenticated()) {
        window.location.href = '/dashboard';
    }
}
