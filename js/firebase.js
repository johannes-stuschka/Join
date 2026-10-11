const FIREBASE_URL = "https://join-6b90f-default-rtdb.europe-west1.firebasedatabase.app/";


async function parseResponse(response) {
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return await response.json();
}


async function sendRequest(method, path, data) {
  const response = await fetch(`${FIREBASE_URL}${path}.json`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await parseResponse(response);
}


async function loadData(path) {
  const response = await fetch(`${FIREBASE_URL}${path}.json`);
  return await parseResponse(response);
}


async function postData(path, data) {
  return await sendRequest("POST", path, data);
}


async function putData(path, data) {
  return await sendRequest("PUT", path, data);
}
