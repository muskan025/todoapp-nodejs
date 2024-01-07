const todoArray = JSON.parse(todos);
let skip = 0;

window.onload = generateTodos();

async function generateTodos() {
  try {
    const res = await axios.get(`/read-todos?skip=${skip}`);
    const todos = res.data.data;

    if (todos.length === 0) {
      alert("No todos to show now");
    }

    document.getElementById("item_list").insertAdjacentHTML(
      "beforeend",
      todos
        .map((item) => {
          return `
          <li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
                <span class="item-text"> ${item.todo} </span>
                <div>
                <button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
                <button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
            </div>
            </li>
                `;
        })
        .join("")
    );

    skip += todos.length;
    return;
  } catch (error) {
    console.log(error);
  }
}

document.addEventListener("click", async function (e) {
  if (e.target.classList.contains("add_item")) {
    const todoInput = document.getElementById("create_field").value;

    try {
      const res = await axios.post("/create-todo", { todo: todoInput });

      if (res.data.status !== 201) {
        alert(res.data.error);
        return;
      }

      document.getElementById("create_field").value = "";
      generateTodos();

      return;
    } catch (error) {
      console.log(error);
    }
  } else if (e.target.classList.contains("edit-me")) {
    try {
      const id = e.target.getAttribute("data-id");
      const todo = prompt("Enter a todo");

      const res = await axios.post("/edit-todo", { id, todo });

      if (res.data.status !== 200) {
        alert(res.data.error);
      }

      e.target.parentElement.parentElement.querySelector(
        ".item-text"
      ).innerHTML = todo;

      return;
    } catch (error) {
      alert(error.message);
      return;
    }
  } else if (e.target.classList.contains("delete-me")) {
    try {
      const id = e.target.getAttribute("data-id");

      const res = await axios.post("/delete-todo", { id: id });

      if (res.data.status !== 200) {
        alert(res.data.error);
        return;
      }

      e.target.parentElement.parentElement.remove();
      return;
    } catch (error) {
      alert(error);
    }
  }
});

document.getElementById("show-more").addEventListener("click", function (e) {
  generateTodos();
});
