/**
 * @typedef {Object} TicketOption
 * @property {string} name - Ticket type name (e.g. 'General', 'VIP')
 * @property {number} price - Ticket price in COP
 * @property {string} perks - Description of benefits
 */

/**
 * @typedef {Object} EventData
 * @property {string} id - Unique event slug/id
 * @property {string} title - Event title
 * @property {string} category - Event category (Música, Tecnología, etc.)
 * @property {string} date - ISO date string
 * @property {string} location - Event location
 * @property {number|string} price - Base or starting price
 * @property {string} image - Image URL
 * @property {string} description - Event description
 * @property {TicketOption[]} tickets - Available ticket types
 */

/**
 * @typedef {'all'|'week'|'month'|'quarter'} DateFilterValue
 */
