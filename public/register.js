let name = "";
let email = "";
let username = "";
let password = "";

document.addEventListener("click", async function (e) {
  if (e.target.classList.contains("register-form")) {
    e.preventDefault();

    name = document.getElementById("rname").value;
    email = document.getElementById("remail").value;
    username = document.getElementById("rusername").value;
    password = document.getElementById("rpassword").value;

    try {
      const res = await axios.post("/register", {
        name: name,
        email: email,
        username: username,
        password: password,
      });

      console.log("register", res);

      if (res.data.status === 201) {
        // Success! Add HTML content to the modal
        const modalBody = document.getElementById("modal");
        modalBody.innerHTML = `
        <div class="card" style="width: 18rem;">
        <div class="card-body">
          <h5 class="card-title">Email sent successfully!</h5>
          <p class="card-text">Please check your gmail to verify your email id</p>
          <a href="#" class="btn btn-primary" id="resend">Resend email</a>
        </div>
      </div>
  `;

        // Styles to center the modal
        const card = document.getElementById("card");
        modalBody.style.position = "fixed";
        modalBody.style.top = "50%";
        modalBody.style.left = "50%";
        modalBody.style.transform = "translate(-50%, -50%)";
        modalBody.style.zIndex = "1050";

        // Resend button

        document
          .getElementById("resend")
          .addEventListener("click", async function (e) {
            try {
              const res = await axios.post("/resend-email", {
                email,
                username,
              });

              if (res.data.status !== 200) {
                return alert(res.data.message);
              }
            } catch (err) {
              alert(res.data.error);
            }
          });
      } else {
        // Registration failed, handle the error
        alert(res.data.error);
      }
    } catch (error) {
      alert(error);
    }
  }
});
