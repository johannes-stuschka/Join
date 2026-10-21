const FIREBASE_URL = "https://join-6b90f-default-rtdb.europe-west1.firebasedatabase.app/";


/**
 * Throws if the request failed, otherwise returns the parsed JSON body.
 *
 * @param {Response} response - The fetch response.
 * @returns {Promise<*>} The parsed body.
 */
async function parseResponse(response) {
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return await response.json();
}


/**
 * Sends data to Firebase with the given HTTP method.
 *
 * @param {string} method - The HTTP method, e.g. "POST".
 * @param {string} path - The database path, e.g. "tasks/abc".
 * @param {*} data - The data to send.
 * @returns {Promise<*>} The response from Firebase.
 */
async function sendRequest(method, path, data) {
  const response = await fetch(`${FIREBASE_URL}${path}.json`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await parseResponse(response);
}


/**
 * Loads the data stored under a path.
 *
 * @param {string} path - The database path, e.g. "tasks/abc".
 * @returns {Promise<*>} The stored data, or null.
 */
async function loadData(path) {
  const response = await fetch(`${FIREBASE_URL}${path}.json`);
  return await parseResponse(response);
}


/**
 * Adds a new entry under a path. Firebase creates the id.
 *
 * @param {string} path - The database path, e.g. "tasks/abc".
 * @param {*} data - The data to send.
 * @returns {Promise<{name: string}>} The new id in "name".
 */
async function postData(path, data) {
  return await sendRequest("POST", path, data);
}


/**
 * Overwrites the data at a path.
 *
 * @param {string} path - The database path, e.g. "tasks/abc".
 * @param {*} data - The data to send.
 * @returns {Promise<*>} The stored data.
 */
async function putData(path, data) {
  return await sendRequest("PUT", path, data);
}


/**
 * Updates only the given fields at a path.
 *
 * @param {string} path - The database path, e.g. "tasks/abc".
 * @param {Object} data - The fields to update.
 * @returns {Promise<*>} The updated fields.
 */
async function patchData(path, data) {
  return await sendRequest("PATCH", path, data);
}


/**
 * Deletes the data at a path.
 *
 * @param {string} path - The database path, e.g. "tasks/abc".
 * @returns {Promise<null>} Always null.
 */
async function deleteData(path) {
  const response = await fetch(`${FIREBASE_URL}${path}.json`, { method: "DELETE" });
  return await parseResponse(response);
}


/**
 * Turns a Firebase object into an array and keeps each key as id.
 *
 * @param {Object|null} data - The object Firebase returned.
 * @returns {Object[]} The entries with their id.
 */
function toList(data) {
  return Object.entries(data || {}).map(([id, entry]) => ({ ...entry, id }));
}
