/**
 * events.js - Event bus for module communication
 * Allows decoupled communication between visualization modules
 */

export const eventBus = {
  listeners: new Map(),

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Handler function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  },

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Handler to remove
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  },

  /**
   * Subscribe to an event once
   * @param {string} event - Event name
   * @param {Function} callback - Handler function
   */
  once(event, callback) {
    const wrapper = (data) => {
      this.off(event, wrapper);
      callback(data);
    };
    this.on(event, wrapper);
  },

  /**
   * Emit an event with data
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event handler for "${event}":`, error);
        }
      });
    }
  },

  /**
   * Remove all listeners for an event
   * @param {string} event - Event name (optional, clears all if not provided)
   */
  clear(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
};

// Standard events used by the system
export const EVENTS = {
  // Simulator events
  SIMULATOR_UPDATE: 'simulator:update',
  SIMULATOR_RESET: 'simulator:reset',
  SIMULATOR_RUN: 'simulator:run',

  // Technology selection
  TECH_SELECTED: 'tech:selected',
  TECH_CHAIN_CHANGED: 'tech:chain:changed',

  // Visualization events
  VIZ_TOGGLE: 'viz:toggle',
  VIZ_RESIZE: 'viz:resize',
  VIZ_READY: 'viz:ready',

  // Node selection
  NODE_SELECTED: 'node:selected',
  NODE_DESELECTED: 'node:deselected',
  NODE_HOVERED: 'node:hovered',

  // Perspective changes
  PERSPECTIVE_CHANGED: 'perspective:changed',

  // Mode changes
  MODE_CHANGED: 'mode:changed',

  // Flow animation
  FLOW_TOGGLE: 'flow:toggle',
  FLOW_UPDATE_VISIBILITY: 'flow:updateVisibility'
};

export default eventBus;
