export async function createUser(user) {
  const response = await fetch("http://localhost:8080/api/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  const data = await response.json();
  if (data.code !== 200) {
    throw new Error(data.message || "Failed to create user");
  }

  return data;
}

export async function handleUserCreationSubmit(event) {
  event.preventDefault();

  const user = {
    username: document.getElementById("username").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    age: parseInt(document.getElementById("age").value, 10),
    gender: document.getElementById("gender").value,
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    profilePictureURL: document.querySelector(
      'input[name="profilePicture"]:checked'
    ).value,
  };

  try {
    const data = await createUser(user);
    alert("User created successfully!");

    window.location.hash = '#/'; 

  } catch (error) {
    console.error("Error during user creation:", error);
    alert("User creation failed. Please try again.");
  }
}

