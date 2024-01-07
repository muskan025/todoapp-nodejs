document.addEventListener("click", async function (e) {
  const loginId = document.getElementById("lusername").value;
  const password = document.getElementById("lpassword").value;

  if (e.target.classList.contains("login-form")) {
    e.preventDefault();
    try {
      const res = await axios.post("/login", { loginId, password });

      if (res.data.status !== 200) {
        return alert(res.data.message);
      }

      window.location.href = "/dashboard";
    } catch (error) {
      console.log(error);
      alert(error);
    }
  } else if (e.target.classList.contains("forgot-password")) {

    if(!loginId){
       return alert("Please provide your email Id to reset the password")
    }
    try {
      const res = await axios.post("/forgot-password", { loginId });

      if (res.status !== 200) {
        alert(res.data.error);
      }

      alert(res.data.message)
    } catch (error) {
      alert(error);
    }
  }
});
