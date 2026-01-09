/**
 * Debug Module
 * Debug system that only works when:
 * - URL contains ?debug=true
 * - User is logged in (body has .logged-in class)
 *
 * @usage
 * import debug from './components/debug/debug';
 *
 * @methods
 * debug.log(message, ...data)      - Standard log
 * debug.info(message, ...data)     - Info (blue)
 * debug.success(message, ...data)  - Success (green) ✓
 * debug.warn(message, ...data)     - Warning (yellow) ⚠
 * debug.error(message, ...data)    - Error (red) ✖
 * debug.group(groupName)           - Start log group
 * debug.groupCollapsed(groupName)  - Start collapsed group
 * debug.groupEnd()                 - Close group
 * debug.table(data)                - Display table
 * debug.time(label)                - Start timer
 * debug.timeEnd(label)             - End timer
 * debug.trace(message)             - Stack trace
 *
 * @examples
 * debug.log('Simple message');
 * debug.success('Operation completed', { id: 123 });
 * debug.error('Something went wrong', error);
 * debug.group('My Group');
 * debug.log('Item 1');
 * debug.log('Item 2');
 * debug.groupEnd();
 */

/**
 * Check if debug is active
 * @returns {boolean}
 */
function isDebugActive() {
	// Check if URL has debug=true
	const urlParams = new URLSearchParams(window.location.search);
	const hasDebugParam = urlParams.get("debug") === "true";

	// Check if user is logged in (WordPress adds logged-in class)
	const isLoggedIn = document.body.classList.contains("logged-in");

	return hasDebugParam || isLoggedIn;
}

/**
 * Debug class with structured methods
 */
class Debug {
	constructor() {
		this.enabled = isDebugActive();
		this.prefix = "[Byrde]";

		// Show debug status in console
		if (this.enabled) {
			console.log(
				`%c${this.prefix} Debug Mode Active`,
				"background: #4CAF50; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;"
			);
		}
	}

	/**
	 * Standard debug log
	 * @param {string} message - Message
	 * @param {any} data - Optional data
	 */
	log(message, ...data) {
		if (!this.enabled) return;

		if (data.length > 0) {
			console.log(`${this.prefix} ${message}`, ...data);
		} else {
			console.log(`${this.prefix} ${message}`);
		}
	}

	/**
	 * Info log (blue)
	 * @param {string} message - Message
	 * @param {any} data - Optional data
	 */
	info(message, ...data) {
		if (!this.enabled) return;

		if (data.length > 0) {
			console.info(
				`%c${this.prefix} ${message}`,
				"color: #2196F3; font-weight: bold;",
				...data
			);
		} else {
			console.info(
				`%c${this.prefix} ${message}`,
				"color: #2196F3; font-weight: bold;"
			);
		}
	}

	/**
	 * Success log (green)
	 * @param {string} message - Message
	 * @param {any} data - Optional data
	 */
	success(message, ...data) {
		if (!this.enabled) return;

		if (data.length > 0) {
			console.log(
				`%c${this.prefix} ✓ ${message}`,
				"color: #4CAF50; font-weight: bold;",
				...data
			);
		} else {
			console.log(
				`%c${this.prefix} ✓ ${message}`,
				"color: #4CAF50; font-weight: bold;"
			);
		}
	}

	/**
	 * Warning log (yellow)
	 * @param {string} message - Message
	 * @param {any} data - Optional data
	 */
	warn(message, ...data) {
		if (!this.enabled) return;

		if (data.length > 0) {
			console.warn(`${this.prefix} ⚠ ${message}`, ...data);
		} else {
			console.warn(`${this.prefix} ⚠ ${message}`);
		}
	}

	/**
	 * Error log (red)
	 * @param {string} message - Message
	 * @param {any} data - Optional data
	 */
	error(message, ...data) {
		if (!this.enabled) return;

		if (data.length > 0) {
			console.error(`${this.prefix} ✖ ${message}`, ...data);
		} else {
			console.error(`${this.prefix} ✖ ${message}`);
		}
	}

	/**
	 * Create a log group
	 * @param {string} groupName - Group name
	 */
	group(groupName) {
		if (!this.enabled) return;
		console.group(`${this.prefix} ${groupName}`);
	}

	/**
	 * Create a collapsed log group
	 * @param {string} groupName - Group name
	 */
	groupCollapsed(groupName) {
		if (!this.enabled) return;
		console.groupCollapsed(`${this.prefix} ${groupName}`);
	}

	/**
	 * Close log group
	 */
	groupEnd() {
		if (!this.enabled) return;
		console.groupEnd();
	}

	/**
	 * Display a table
	 * @param {object|array} data - Data for the table
	 */
	table(data) {
		if (!this.enabled) return;
		console.table(data);
	}

	/**
	 * Start timer
	 * @param {string} label - Timer label
	 */
	time(label) {
		if (!this.enabled) return;
		console.time(`${this.prefix} ${label}`);
	}

	/**
	 * End timer
	 * @param {string} label - Timer label
	 */
	timeEnd(label) {
		if (!this.enabled) return;
		console.timeEnd(`${this.prefix} ${label}`);
	}

	/**
	 * Stack trace
	 */
	trace(message = "Trace") {
		if (!this.enabled) return;
		console.trace(`${this.prefix} ${message}`);
	}
}

// Create unique instance (singleton)
const debug = new Debug();

// Export
export default debug;
