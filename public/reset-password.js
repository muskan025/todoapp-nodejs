document.addEventListener("click", async function (e) {
  e.preventDefault();

  const email = document.getElementById("femail").value;
  const password = document.getElementById("fpassword").value;

  if (e.target.classList.contains("reset-password")) {
    try {
      const res = await axios.post("/reset-password", { email, password });

      if (res.data.status !== 200) {
        alert(res.data.message);
      }

      window.location.href = "login";
    } catch (err) {
      console.log(err);
    }
  }
});

//1.click on forgot
//2.modal directing to gmail
//3.click button in gmail redirects to reset password form
//4.on submit redirect to login form
