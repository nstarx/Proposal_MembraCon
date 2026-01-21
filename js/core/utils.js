/**
 * utils.js - Utility functions
 */

/**
 * Escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeHtml(str) {
  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return String(str).replace(/[&<>"']/g, c => escapeMap[c]);
}

/**
 * Format number with units
 * @param {number} value - Value to format
 * @param {string} unit - Unit suffix
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted string
 */
export function formatValue(value, unit = '', decimals = 0) {
  if (typeof value !== 'number' || isNaN(value)) {
    return '--';
  }
  return value.toFixed(decimals) + (unit ? ` ${unit}` : '');
}

/**
 * Format currency
 * @param {number} value - Value in base units
 * @param {string} currency - Currency symbol
 * @param {boolean} thousands - Divide by 1000 and add 'k'
 * @returns {string} Formatted currency
 */
export function formatCurrency(value, currency = '£', thousands = true) {
  if (typeof value !== 'number' || isNaN(value)) {
    return '--';
  }
  if (thousands) {
    return `${currency}${(value / 1000).toFixed(0)}k`;
  }
  return `${currency}${value.toLocaleString()}`;
}

/**
 * Format percentage
 * @param {number} value - Value (0-1 or 0-100)
 * @param {boolean} isDecimal - Whether input is 0-1 (true) or 0-100 (false)
 * @returns {string} Formatted percentage
 */
export function formatPercent(value, isDecimal = true) {
  if (typeof value !== 'number' || isNaN(value)) {
    return '--';
  }
  const pct = isDecimal ? value * 100 : value;
  return `${pct.toFixed(0)}%`;
}

/**
 * Debounce function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in ms
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay = 250) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Throttle function
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Minimum interval in ms
 * @returns {Function} Throttled function
 */
export function throttle(fn, limit = 100) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Generate a simple hash from string
 * @param {string} str - String to hash
 * @returns {string} Hex hash
 */
export function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Generate a pseudo-random hex string
 * @param {number} length - Length of string
 * @returns {string} Random hex string
 */
export function randomHex(length = 16) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 16).toString(16);
  }
  return result;
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Map value from one range to another
 * @param {number} value - Input value
 * @param {number} inMin - Input range minimum
 * @param {number} inMax - Input range maximum
 * @param {number} outMin - Output range minimum
 * @param {number} outMax - Output range maximum
 * @returns {number} Mapped value
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
  return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
}

/**
 * Ease in-out quadratic
 * @param {number} t - Progress (0-1)
 * @returns {number} Eased value
 */
export function easeInOutQuad(t) {
  return t < 0.5
    ? 2 * t * t
    : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * Create DOM element with attributes
 * @param {string} tag - Element tag
 * @param {Object} attrs - Attributes
 * @param {string|Element|Element[]} children - Child content
 * @returns {Element} Created element
 */
export function createElement(tag, attrs = {}, children = null) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') {
      el.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key.startsWith('data')) {
      el.setAttribute(key.replace(/([A-Z])/g, '-$1').toLowerCase(), value);
    } else {
      el.setAttribute(key, value);
    }
  }

  if (children) {
    if (typeof children === 'string') {
      el.textContent = children;
    } else if (Array.isArray(children)) {
      children.forEach(child => {
        if (typeof child === 'string') {
          el.appendChild(document.createTextNode(child));
        } else {
          el.appendChild(child);
        }
      });
    } else {
      el.appendChild(children);
    }
  }

  return el;
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {number} duration - Duration in ms
 */
export function showToast(message, duration = 1500) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.style.display = 'block';

  setTimeout(() => {
    toast.style.display = 'none';
  }, duration);
}

/**
 * Get computed CSS variable value
 * @param {string} varName - CSS variable name (with --)
 * @returns {string} Computed value
 */
export function getCSSVar(varName) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
}

/**
 * Request animation frame with fallback
 */
export const raf = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  ((callback) => setTimeout(callback, 16));

/**
 * Cancel animation frame with fallback
 */
export const cancelRaf = window.cancelAnimationFrame ||
  window.webkitCancelAnimationFrame ||
  clearTimeout;

export default {
  escapeHtml,
  formatValue,
  formatCurrency,
  formatPercent,
  debounce,
  throttle,
  deepClone,
  simpleHash,
  randomHex,
  clamp,
  lerp,
  mapRange,
  easeInOutQuad,
  createElement,
  showToast,
  getCSSVar,
  raf,
  cancelRaf
};
