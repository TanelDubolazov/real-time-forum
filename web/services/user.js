import state from './state.js';

export async function fetchAllUsers() {
  try {
    const response = await fetch("http://localhost:8080/api/user", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    const data = await response.json();
    console.log("Fetched users:", data);

    if (data.code === 200 && data.data && Array.isArray(data.data.data)) {
      state.offlineUsers = data.data.data.map(user => ({
        userId: user.id,
        username: user.username
      }));
    } else {
      console.error("Failed to fetch users or data format is incorrect:", data.message);
      state.offlineUsers = [];
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    state.offlineUsers = [];
  }
}

export function updateOnlineUsers(data) {
  const { userId, username, status } = data;
  if (status === "online" && !state.onlineUsers.some((user) => user.userId === userId) && userId !== state.loggedInUserId) {
    state.onlineUsers.push({ userId, username });
    state.offlineUsers = state.offlineUsers.filter((user) => user.userId !== userId);
  } else if (status === "offline") {
    state.onlineUsers = state.onlineUsers.filter((user) => user.userId !== userId);
    if (!state.offlineUsers.some((user) => user.userId === userId)) {
      state.offlineUsers.push({ userId, username });
    }
  }
  renderOnlineUsers();
}

export function removeDuplicateUsers() {
  state.offlineUsers = state.offlineUsers.filter(offlineUser => 
    !state.onlineUsers.some(onlineUser => onlineUser.username === offlineUser.username)
  );
}

export function renderOnlineUsers() {
  const onlineUsersDiv = document.getElementById("online-users");
  const offlineUsersDiv = document.getElementById("offline-users");
  
  if (!onlineUsersDiv || !offlineUsersDiv) {
    console.error("Online or offline users container not found!");
    return;
  }

  onlineUsersDiv.innerHTML = "";
  offlineUsersDiv.innerHTML = "";

  state.onlineUsers
    .filter(user => user.userId !== state.loggedInUserId) // Exclude the logged-in user
    .forEach((user) => {
      const userStatus = document.createElement("div");
      userStatus.setAttribute("data-user-id", user.userId);
      userStatus.textContent = `${user.username} is online`;
      userStatus.classList.add("user-status", "online-user");
      userStatus.addEventListener("click", () => selectUser(user.userId));
      onlineUsersDiv.appendChild(userStatus);
  });

  state.offlineUsers.forEach((user) => {
    const userStatus = document.createElement("div");
    userStatus.setAttribute("data-user-id", user.userId);
    userStatus.textContent = `${user.username} is offline`;
    userStatus.classList.add("user-status", "offline-user");
    userStatus.addEventListener("click", () => selectUser(user.userId));
    offlineUsersDiv.appendChild(userStatus);
  });
}

export function selectUser(userID) {
  const user = [...state.onlineUsers, ...state.offlineUsers].find((user) => user.userId === userID);
  state.selectedUser = userID;
  document.getElementById("chat-header").innerHTML = `
    <button id="back-button">Back</button>
    <span>${user.username}</span>
  `;
  document.getElementById("back-button").addEventListener("click", (e) => {
    e.preventDefault();
    goBackToUserList();
  });
  document.getElementById("chat-messages-container").style.display = "flex";
  document.getElementById("user-list-container").style.display = "none";
  document.getElementById("message-input").placeholder = `Message to ${user.username}`;
  const userElements = document.querySelectorAll(".online-user, .offline-user");
  userElements.forEach((element) => {
    if (element.getAttribute("data-user-id") === userID) {
      element.classList.add("selected");
    } else {
      element.classList.remove("selected");
    }
  });

  // Request chat history for the selected user
  state.ws.send(JSON.stringify({ type: "get_chat_history", receiverId: state.selectedUser }));
}

export function goBackToUserList() {
  state.selectedUser = null;
  document.getElementById("chat-header").innerHTML = `<span>Chat</span>`;
  renderUserList();
}

export function renderUserList() {
  document.getElementById("chat-messages-container").style.display = "none";
  document.getElementById("user-list-container").style.display = "block";
  renderOnlineUsers();
}

export function getUsernameById(userId) {
  const user = [...state.onlineUsers, ...state.offlineUsers].find(user => user.userId === userId);
  return user ? user.username : 'Unknown';
}