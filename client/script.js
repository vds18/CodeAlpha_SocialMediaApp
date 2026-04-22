let userId = null;
let userName = null;

// 🔁 TOGGLE LOGIN / REGISTER
function toggleAuth() {
  const login = document.getElementById("loginBox");
  const register = document.getElementById("registerBox");
  const title = document.getElementById("authTitle");
  const text = document.getElementById("toggleText");

  if (login.style.display === "none") {
    login.style.display = "block";
    register.style.display = "none";
    title.innerText = "Login";
    text.innerText = "Don't have an account? Register";
  } else {
    login.style.display = "none";
    register.style.display = "block";
    title.innerText = "Register";
    text.innerText = "Already have an account? Login";
  }
}

// 🔐 REGISTER
async function register() {
  const name = regName.value;
  const email = regEmail.value;
  const password = regPassword.value;

  if (!name || !email || !password) {
    return alert("All fields required");
  }

  const res = await fetch("http://localhost:5000/api/users/register", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();
  alert(data);
}

// 🔐 LOGIN
async function login() {
  const emailVal = email.value;
  const passVal = password.value;

  const res = await fetch("http://localhost:5000/api/users/login", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ email: emailVal, password: passVal })
  });

  const data = await res.json();

  if (!data.user) return alert(data);

  userId = data.user._id;
  userName = data.user.name;

  localStorage.setItem("userId", userId);
  localStorage.setItem("userName", userName);

  document.getElementById("userLabel").innerText = userName;
  document.getElementById("authCard").style.display = "none";
  document.getElementById("postBox").style.display = "block";
  document.getElementById("logoutBtn").style.display = "inline-block";
  document.getElementById("discoverBox").style.display = "block";

  loadPosts();
}

// 🚪 LOGOUT
function logout() {
  localStorage.clear();
  location.reload();
}

// 📝 CREATE POST
async function createPost() {
  const contentVal = content.value;

  if (!userId) return alert("Login first");
  if (!contentVal) return alert("Write something!");

  await fetch("http://localhost:5000/api/posts/create", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      userId,
      content: contentVal
    })
  });

  content.value = "";
  loadPosts();
}

// 📥 LOAD FEED (WITH COMMENTS)
async function loadPosts() {
  if (!userId) return;

  const res = await fetch(`http://localhost:5000/api/posts/feed/${userId}`);
  const posts = await res.json();

  const feed = document.getElementById("feed");
  feed.innerHTML = "<h3>🏠 Home Feed</h3>";

  for (let p of posts) {

    const postUserId = p.userId?._id || p.userId;
    const postUserName = p.userId?.name || "User";

    // 🔥 GET COMMENTS
    const commentRes = await fetch(`http://localhost:5000/api/comments/${p._id}`);
    const comments = await commentRes.json();

    const div = document.createElement("div");
    div.className = "post";

    div.innerHTML = `
      <p>
        <b class="clickable-user" onclick="viewProfile('${postUserId}')">
          ${postUserName}
        </b>
      </p>

      <p>${p.content}</p>

      <div class="actions">
        <button onclick="likePost('${p._id}')">❤️ ${p.likes.length}</button>

        ${
          postUserId !== userId
            ? `<button onclick="followUser('${postUserId}')">Follow</button>`
            : ""
        }
      </div>

      <!-- COMMENTS -->
      <div class="comments">
        ${comments.map(c => `<p>💬 ${c.text}</p>`).join("")}
      </div>

      <!-- ADD COMMENT -->
      <div class="comment-box">
        <input id="c-${p._id}" placeholder="Write comment...">
        <button onclick="addComment('${p._id}')">Send</button>
      </div>
    `;

    feed.appendChild(div);
  }
}

// ❤️ LIKE
async function likePost(postId) {
  await fetch(`http://localhost:5000/api/posts/like/${postId}`, {
    method: "PUT",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ userId })
  });

  loadPosts();
}

// 💬 ADD COMMENT
async function addComment(postId) {
  const text = document.getElementById(`c-${postId}`).value;

  if (!text) return;

  await fetch("http://localhost:5000/api/comments/add", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      postId,
      userId,
      text
    })
  });

  loadPosts();
}

// 🔍 DISCOVER USERS
async function loadUsers() {
  const res = await fetch("http://localhost:5000/api/users");
  const users = await res.json();

  const feed = document.getElementById("feed");
  feed.innerHTML = "<h3>🔍 Discover Users</h3>";

  users.forEach(u => {
    if (u._id === userId) return;

    const div = document.createElement("div");
    div.className = "post";

    div.innerHTML = `
      <p><b onclick="viewProfile('${u._id}')">${u.name}</b></p>
      <button onclick="followUser('${u._id}')">Follow</button>
    `;

    feed.appendChild(div);
  });
}

// 👤 VIEW PROFILE
async function viewProfile(profileId) {

  const userRes = await fetch(`http://localhost:5000/api/users/${profileId}`);
  const user = await userRes.json();

  const postRes = await fetch(`http://localhost:5000/api/posts/user/${profileId}`);
  const posts = await postRes.json();

  const feed = document.getElementById("feed");

  feed.innerHTML = `
    <div class="profile-card">
      <button onclick="loadPosts()">⬅ Back</button>
      <h2>${user.name}</h2>
      <p>👥 ${user.followers.length} Followers | ➡ ${user.following.length}</p>

      ${
        profileId !== userId
          ? `<button onclick="followUser('${profileId}')">Follow</button>`
          : ""
      }
    </div>
  `;

  posts.forEach(p => {
    const div = document.createElement("div");
    div.className = "post";

    div.innerHTML = `
      <p>${p.content}</p>
      <button onclick="likePost('${p._id}')">❤️ ${p.likes.length}</button>
    `;

    feed.appendChild(div);
  });
}

// 👥 FOLLOW
async function followUser(targetId) {
  await fetch(`http://localhost:5000/api/users/follow/${targetId}`, {
    method: "PUT",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ userId })
  });

  alert("Followed ✅");

  loadPosts(); // 🔥 VERY IMPORTANT FIX
}

// 🔁 UNFOLLOW
async function unfollowUser(targetId) {
  await fetch(`http://localhost:5000/api/users/unfollow/${targetId}`, {
    method: "PUT",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ userId })
  });

  loadPosts();
}

// 🔄 AUTO LOGIN
window.onload = () => {
  const savedId = localStorage.getItem("userId");
  const savedName = localStorage.getItem("userName");

  if (savedId && savedName) {
    userId = savedId;
    userName = savedName;

    document.getElementById("userLabel").innerText = userName;
    document.getElementById("authCard").style.display = "none";
    document.getElementById("postBox").style.display = "block";
    document.getElementById("logoutBtn").style.display = "inline-block";
    document.getElementById("discoverBox").style.display = "block";

    loadPosts();
  }
};