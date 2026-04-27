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
    'sora': '🎬',
    'runway': '🎬',
    'cursor': '💻',
    'github': '💻',
    'gamma': '📊',
    'beautiful': '📊',
    'default': '🔧'
};

const TAG_COLORS = {
    'Image Generation':    { bg: 'rgba(168,85,247,0.15)',  border: 'rgba(168,85,247,0.35)',  text: '#c084fc' },
    'Video Generation':    { bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.35)',   text: '#f87171' },
    'Coding':              { bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.35)',   text: '#4ade80' },
    'Project Development': { bg: 'rgba(251,191,36,0.15)',  border: 'rgba(251,191,36,0.35)',  text: '#fbbf24' },
    'General Help':        { bg: 'rgba(99,102,241,0.15)',  border: 'rgba(99,102,241,0.35)',  text: '#818cf8' },
    'Agentic AI':          { bg: 'rgba(6,182,212,0.15)',   border: 'rgba(6,182,212,0.35)',   text: '#22d3ee' },
    'PPT Generation':      { bg: 'rgba(249,115,22,0.15)',  border: 'rgba(249,115,22,0.35)',  text: '#fb923c' },
    'Others':              { bg: 'rgba(100,116,139,0.15)', border: 'rgba(100,116,139,0.35)', text: '#94a3b8' }
};

const TAG_ICONS = {
    'Image Generation':    '🖼️',
    'Video Generation':    '🎬',
    'Coding':              '💻',
    'Project Development': '🛠️',
    'General Help':        '💬',
    'Agentic AI':          '🤖',
    'PPT Generation':      '📊',
    'Others':              '🔧'
};

let allTools = [];
let activeFilter = 'all';

function getToolIcon(name) {
    const lower = name.toLowerCase();
    for (const [key, icon] of Object.entries(TOOL_ICONS)) {
        if (lower.includes(key)) return icon;
    }
    return TOOL_ICONS.default;
}

function getTagChip(tag) {
    const t = tag || 'Others';
    const colors = TAG_COLORS[t] || TAG_COLORS['Others'];
    const icon = TAG_ICONS[t] || '🔧';
    return `<span class="tag-chip" style="background:${colors.bg};border-color:${colors.border};color:${colors.text};">${icon} ${escapeHtml(t)}</span>`;
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

// ─── Filter Logic ─────────────────────────────────────────────────────────────

function filterTools(tag, pillEl) {
    activeFilter = tag;

    // Update pill active state
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    if (pillEl) pillEl.classList.add('active');

    renderTools(allTools);
}

function renderTools(tools) {
    const grid = document.getElementById('tools-grid');
    const filteredCounter = document.getElementById('filtered-count');
    if (!grid) return;

    const visible = activeFilter === 'all'
        ? tools
        : tools.filter(t => t.tag === activeFilter);

    if (filteredCounter) filteredCounter.textContent = visible.length;

    if (visible.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <div class="empty-title">${activeFilter === 'all' ? 'No tools added yet' : 'No tools for this category'}</div>
                <p>${activeFilter === 'all' ? 'Start by adding your favorite AI tools above' : 'Try a different filter or add a new tool'}</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = visible.map(tool => `
        <div class="tool-card" id="tool-${tool.id}">
            <div class="tool-icon">${getToolIcon(tool.name)}</div>
            <div class="tool-name">${escapeHtml(tool.name)}</div>
            ${getTagChip(tool.tag)}
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
}

// ─── Load Tools ───────────────────────────────────────────────────────────────

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

        allTools = await res.json();

        if (counter) counter.textContent = allTools.length;

        renderTools(allTools);

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

// ─── Add Tool ─────────────────────────────────────────────────────────────────

async function handleAddTool(event) {
    event.preventDefault();
    hideError('tool-error');

    const name = document.getElementById('tool-name').value.trim();
    const url  = document.getElementById('tool-url').value.trim();
    const tag  = document.getElementById('tool-tag').value;

    if (!name || !url) {
        showError('tool-error', 'Please fill in both name and URL fields');
        return;
    }

    try {
        const res = await fetch(API_BASE + '/api/tools', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ name, url, tag })
        });

        if (res.status === 401 || res.status === 403) {
            logout();
            return;
        }

        if (res.ok) {
            document.getElementById('tool-name').value = '';
            document.getElementById('tool-url').value = '';
            document.getElementById('tool-tag').value = 'Others';
            loadTools();
        } else {
            const data = await res.json();
            showError('tool-error', data.message || 'Failed to add tool');
        }
    } catch (err) {
        showError('tool-error', 'Network error. Please try again.');
    }
}

// ─── Delete Tool ──────────────────────────────────────────────────────────────

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

// ─── Utilities ────────────────────────────────────────────────────────────────

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
