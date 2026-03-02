/* ============================================================
   Student Complaint Management System — Shared JS
   ============================================================ */

'use strict';

// ── Constants ────────────────────────────────────────────────
const STORAGE_KEY   = 'scms_complaints';
const SESSION_KEY   = 'scms_admin_logged_in';
const ADMIN_USER    = 'admin';
const ADMIN_PASS    = 'admin123';

const CATEGORIES = ['Infrastructure', 'Hygiene', 'Hostel', 'Labs', 'Other'];
const STATUSES   = ['Pending', 'In Progress', 'Resolved'];

// ── LocalStorage Helpers ─────────────────────────────────────
function getComplaints() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveComplaints(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function getComplaintById(id) {
  return getComplaints().find(c => c.id === id) || null;
}

function addComplaint(complaint) {
  const list = getComplaints();
  list.unshift(complaint);          // newest first
  saveComplaints(list);
}

function updateComplaintStatus(id, status) {
  const list = getComplaints();
  const idx  = list.findIndex(c => c.id === id);
  if (idx === -1) return false;
  list[idx].status    = status;
  list[idx].updatedAt = new Date().toISOString();
  saveComplaints(list);
  return true;
}

// ── ID Generator ─────────────────────────────────────────────
function generateComplaintId() {
  const ts   = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `COMP-${ts}-${rand}`;
}

// ── Session Helpers ──────────────────────────────────────────
function isAdminLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}

function setAdminSession(val) {
  if (val) {
    sessionStorage.setItem(SESSION_KEY, 'true');
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

// ── Protect Dashboard ────────────────────────────────────────
function requireAdminAuth() {
  if (!isAdminLoggedIn()) {
    window.location.href = 'admin.html';
  }
}

// ── Date Formatter ───────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day:    '2-digit',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
}

// ── Status Badge HTML ────────────────────────────────────────
function statusBadge(status) {
  const map = {
    'Pending':     { cls: 'badge-pending',    icon: '🕐' },
    'In Progress': { cls: 'badge-inprogress', icon: '🔄' },
    'Resolved':    { cls: 'badge-resolved',   icon: '✅' },
  };
  const s = map[status] || map['Pending'];
  return `<span class="badge ${s.cls}">${s.icon} ${status}</span>`;
}

// ── Navbar Mobile Toggle ─────────────────────────────────────
function initNavbar() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
    }
  });

  // Mark active link
  const path = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.querySelectorAll('a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
}

// ── Form Validation Helpers ───────────────────────────────────
function showFieldError(fieldId, msg) {
  const field = document.getElementById(fieldId);
  const err   = document.getElementById(fieldId + 'Error');
  if (field) field.classList.add('error-field');
  if (err)   { err.textContent = msg; err.classList.add('show'); }
}

function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  const err   = document.getElementById(fieldId + 'Error');
  if (field) field.classList.remove('error-field');
  if (err)   err.classList.remove('show');
}

function clearAllErrors(fieldIds) {
  fieldIds.forEach(clearFieldError);
}

// ── Show Alert ───────────────────────────────────────────────
function showAlert(containerId, type, message, icon) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  el.innerHTML = `
    <div class="alert alert-${type}">
      <span class="alert-icon">${icon || icons[type]}</span>
      <span>${message}</span>
    </div>`;
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearAlert(containerId) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = '';
}

// ── Stats Calculator ─────────────────────────────────────────
function calcStats(list) {
  return {
    total:      list.length,
    pending:    list.filter(c => c.status === 'Pending').length,
    inProgress: list.filter(c => c.status === 'In Progress').length,
    resolved:   list.filter(c => c.status === 'Resolved').length,
  };
}

// ── Category emoji map ───────────────────────────────────────
const CATEGORY_ICONS = {
  Infrastructure: '🏗️',
  Hygiene:        '🧹',
  Hostel:         '🏠',
  Labs:           '🔬',
  Other:          '📋',
};

function categoryIcon(cat) {
  return CATEGORY_ICONS[cat] || '📋';
}

// ── Animate counters ─────────────────────────────────────────
function animateCounter(el, target, duration = 900) {
  let start = 0;
  const step = target / (duration / 16);
  const tick = () => {
    start += step;
    if (start >= target) { el.textContent = target; return; }
    el.textContent = Math.floor(start);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
