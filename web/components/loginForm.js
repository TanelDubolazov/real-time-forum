export function LoginComponent() {
  // Create the login form HTML
  const loginFormHTML = `
    <div id="login-view">
      <form id="loginForm">
        <input type="text" id="usernameOrEmail" placeholder="Username or Email" required />
        <input type="password" id="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
    </div>
  `;

  setTimeout(() => {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", handleLoginSubmit);
    }
  }, 0);

  return loginFormHTML;
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const usernameOrEmail = document.getElementById("usernameOrEmail").value;
  const password = document.getElementById("password").value;

  console.log("Form submitted:", { usernameOrEmail, password }); // Debugging log

  try {
    const response = await fetch("http://localhost:8080/api/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username_or_email: usernameOrEmail, password }),
    });

    const data = await response.json();

    console.log("Login response:", data); // Debugging log

    if (data.code === 200) {
      localStorage.setItem("authToken", data.data.token);
      window.location.hash = "#/forum";
    } else {
      alert(data.message || "Login failed");
    }
  } catch (error) {
    console.error("Error during login:", error);
    alert("Login failed. Please try again.");
  }
}
