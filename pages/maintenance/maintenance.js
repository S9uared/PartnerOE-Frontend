import { API_URL } from "../../settings.js";

const URL = API_URL + "/maintenance-task";
import {
  makeOptions,
  sanitizeStringWithTableRows,
  handleHttpErrors,
  loadingContent,
  handleFetchError,
} from "../../utils.js";

export async function initMaintenance() {
  document.getElementById("maintenance-content").innerHTML = loadingContent;
  renderMaintenance();
  document.getElementById("maintenance-content").onclick = maintenanceDetails;
  window.onclick = closeModal;

  //TODO implement search functionality
  /* const searchBtn = document.getElementById("maintenance-search-btn");
  searchBtn.addEventListener("click", () => {
    const searchValue = document.getElementById("maintenance-search").value;
    renderMaintenance(0, searchValue);
  }); */
}

async function renderMaintenance(retryCount = 0, searchValue = "") {
  const addButton = `<button id="add-maintenance-task">Tilføj Opgave</button>`;

  searchValue = searchValue ? "/search/" + searchValue : "";

  try {
    let tasks = await fetch(
      URL + searchValue,
      makeOptions("GET", null, true)
    ).then(handleHttpErrors);

    const maintenanceDivs = Array.isArray(tasks.content)
      ? tasks.content.map(generateHTML).join("")
      : tasks.map(generateHTML).join("");

    document.getElementById("maintenance-content").innerHTML =
      addButton + maintenanceDivs;
    document.getElementById("add-maintenance-task").onclick =
      displayAddTaskModal;
    //TODO add button event
  } catch (error) {
    console.error("Could not fetch maintenance tasks: " + error);
    const contentDiv = document.getElementById("maintenance-content");
    handleFetchError(renderMaintenance, retryCount, contentDiv);
  }
}

async function maintenanceDetails(evt) {
  const clicked = evt.target;
  if (!clicked.id.startsWith("maintenance-details_")) {
    return;
  }

  const id = clicked.id.replace("maintenance-details_", "");
  window.router.navigate("maintenance-details?id=" + id);
}

function displayAddTaskModal() {
  const modal = document.getElementById("maintenance-modal");

  const inputForm = `<span class="close">&times;</span>
  
  <label for="task-title">Title:</label>
  <input type="text" id="task-title" name="title" required><br>

  <label for="task-description">Description:</label>
  <input type="text" id="task-description" name="description"><br>

  <label for="task-status">Status:</label>
  <select id="task-status" name="status" required>
      <option value="NOT_STARTED">Not Started</option>
      <option value="IN_PROGRESS">In Progress</option>
      <option value="DONE">Done</option>
  </select><br>

  <label for="task-priority">Priority:</label>
  <select id="task-priority" name="priority" required>
      <option value="LOW">Low</option>
      <option value="MEDIUM">Medium</option>
      <option value="HIGH">High</option>
  </select><br>

  <label for="task-image">Image:</label>
  <input type="file" id="task-image" name="image" accept="image/*"><br>

  <label for="task-account">Account</label>
  <input type="text" id="task-account" name="account"><br>

  <label for="task-unit">Unit</label>
  <input type="number" id="task-unit" name="unit" required><br>

  <button id="create-task-btn">Submit</button>
`;

  modal.querySelector(".modal-content").innerHTML = inputForm;
  modal.style.display = "block";

  const closeBtn = modal.querySelector(".close");
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  const createBtn = document.getElementById("create-task-btn");
  createBtn.addEventListener("click", async () => {
    await createMaintenanceTask();
    //modal.style.display = "none";
    //renderMaintenance();
  });
}

async function createMaintenanceTask() {
  //preventDefault();
  //const formData = new FormData(document.getElementById("maintenanceTaskForm"));

  /* const body = {
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("status"),
    priority: formData.get("priority"),
    image: formData.get("image"),
    accountUsername: formData.get("account"),
    unitId: formData.get("unit"),
  };
  console.log(body); */
  const taskTitleInput = document.getElementById("task-title").value;
  const taskDescriptionInput =
    document.getElementById("task-description").value;
  const taskStatusSelect = document.getElementById("task-status").value;
  const taskPrioritySelect = document.getElementById("task-priority").value;
  const taskImageInput = document.getElementById("task-image").files[0];
  const taskAccountInput = document.getElementById("task-account").value;
  const taskUnitInput = document.getElementById("task-unit").value;

  const formData = new FormData();
  formData.append("title", taskTitleInput);
  formData.append("description", taskDescriptionInput);
  formData.append("status", taskStatusSelect);
  formData.append("priority", taskPrioritySelect);
  formData.append("image", taskImageInput);
  formData.append("accountUsername", taskAccountInput);
  formData.append("unitId", taskUnitInput);

  console.log(formData.getAll);

  try {
    await fetch(URL, makeOptions("POST", formData, true)).then(
      handleHttpErrors
    );
  } catch (error) {
    console.error("Could not create new task: " + error);
  }
}

function closeModal(evt) {
  if (evt.target == document.getElementById("maintenance-modal")) {
    document.getElementById("maintenance-modal").style.display = "none";
  }
}

const generateHTML = (task) => {
  let imageTag = "";
  if (task.image) {
    imageTag = `<img src="data:${task.mimetype};base64,${task.image}" alt="">`;
  }

  return `
    <div class="maintenance-box">
      <p class="maintenance-title">${task.title}</p>
      <p class="maintenance-description">${task.description}</p>
      <p class="maintenance-status">${task.status}</p>
      <p class="maintenance-priority">${task.priority}</p>
      <p class="maintenance-account-assigned">${task.account.userName}</p>
      <p class="maintenance-unit">${task.unit.unitNumber}</p>
      <p class="maintenance-created">${task.created}</p>
      ${imageTag}
      <button id="maintenance-details_${task.id}">Detaljer</button>
    </div>
  `;
};