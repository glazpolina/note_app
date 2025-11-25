// Хранилище данных
      let tasks = [];
      let notes = [];
      let currentTaskLabels = [];
      let currentEditingId = null;
      let currentEditingType = null;

      // Инициализация приложения
      function initApp() {
        loadFromLocalStorage();
        renderTasks();
        renderNotes();
        setupEventListeners();
      }

      // ==================== РАБОТА С МЕТКАМИ ====================
      function addLabelToTask() {
        const labelInput = document.getElementById("newLabelInput");
        const colorInput = document.getElementById("labelColorInput");
        const labelName = labelInput.value.trim();
        const labelColor = colorInput.value;

        if (!labelName) {
          alert("Введите название метки!");
          return;
        }

        const label = {
          id: Date.now(),
          name: labelName,
          color: labelColor,
        };

        currentTaskLabels.push(label);
        renderCurrentLabels();
        labelInput.value = "";
      }

      function addLabel(name, color) {
        const label = {
          id: Date.now(),
          name: name,
          color: color,
        };

        currentTaskLabels.push(label);
        renderCurrentLabels();
      }

      function removeLabelFromCurrent(labelId) {
        currentTaskLabels = currentTaskLabels.filter(
          (label) => label.id !== labelId
        );
        renderCurrentLabels();
      }

      function renderCurrentLabels() {
        const preview = document.getElementById("labelsPreview");
        preview.innerHTML = currentTaskLabels
          .map(
            (label) => `
                <div class="label-badge" style="background: ${label.color}">
                    ${label.name}
                    <span class="remove" onclick="removeLabelFromCurrent(${label.id})">×</span>
                </div>
            `
          )
          .join("");
      }

      // ==================== CRUD ДЛЯ ЗАДАЧ ====================
      function create_task() {
        const title = document.getElementById("taskTitleInput").value.trim();
        const description = document
          .getElementById("taskDescriptionInput")
          .value.trim();
        const priority = document.getElementById("taskPrioritySelect").value;

        if (!title) {
          alert("Введите название задачи!");
          return;
        }

        const task = {
          id: Date.now(),
          title,
          description,
          priority,
          labels: [...currentTaskLabels],
          completed: false,
          createdAt:
            new Date().toLocaleDateString("ru-RU") +
            " " +
            new Date().toLocaleTimeString("ru-RU"),
        };

        tasks.push(task);
        saveToLocalStorage();
        renderTasks();
        clearTaskForm();
      }

      function readTasks() {
        return tasks;
      }

      function updateTask(id, updates) {
        const taskIndex = tasks.findIndex((task) => task.id === id);
        if (taskIndex !== -1) {
          tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
          saveToLocalStorage();
          renderTasks();
        }
      }

      function deleteTask(id) {
        if (confirm("Удалить эту задачу?")) {
          tasks = tasks.filter((task) => task.id !== id);
          saveToLocalStorage();
          renderTasks();
        }
      }

      function toggleTaskCompletion(id) {
        const task = tasks.find((task) => task.id === id);
        if (task) {
          task.completed = !task.completed;
          saveToLocalStorage();
          renderTasks();

          // Автоудаление выполненных задач
          if (task.completed) {
            setTimeout(() => {
              deleteTask(id);
            }, 2000);
          }
        }
      }

      // ==================== CRUD ДЛЯ ЗАМЕТОК ====================
      function createNote() {
        const title = document.getElementById("noteTitleInput").value.trim();
        const content = document
          .getElementById("noteContentInput")
          .value.trim();

        if (!title || !content) {
          alert("Заполните все поля!");
          return;
        }

        const note = {
          id: Date.now(),
          title,
          content,
          createdAt:
            new Date().toLocaleDateString("ru-RU") +
            " " +
            new Date().toLocaleTimeString("ru-RU"),
        };

        notes.push(note);
        saveToLocalStorage();
        renderNotes();
        clearNoteForm();
      }

      function readNotes() {
        return notes;
      }

      function updateNote(id, updates) {
        const noteIndex = notes.findIndex((note) => note.id === id);
        if (noteIndex !== -1) {
          notes[noteIndex] = { ...notes[noteIndex], ...updates };
          saveToLocalStorage();
          renderNotes();
        }
      }

      function deleteNote(id) {
        if (confirm("Удалить эту заметку?")) {
          notes = notes.filter((note) => note.id !== id);
          saveToLocalStorage();
          renderNotes();
        }
      }

      // ==================== ОТОБРАЖЕНИЕ ДАННЫХ ====================
      function renderTasks() {
        const container = document.getElementById("tasksContainer");

        if (tasks.length === 0) {
          container.innerHTML =
            '<div class="empty-state">🎉 Отличная работа! Все задачи выполнены.<br><small>Создайте новую задачу чтобы начать</small></div>';
          return;
        }

        container.innerHTML = tasks
          .map(
            (task) => `
                <div class="task-item ${task.completed ? "completed" : ""}">
                    <div class="task-main">
                        <input type="checkbox" ${
                          task.completed ? "checked" : ""
                        } 
                               onchange="toggleTaskCompletion(${task.id})">
                        <span class="task-title">${task.title}</span>
                        <span class="priority ${
                          task.priority
                        }">${getPriorityText(task.priority)}</span>
                    </div>
                    ${
                      task.description
                        ? `<p style="margin: 12px 0; color: #666; line-height: 1.5;">${task.description}</p>`
                        : ""
                    }
                    ${
                      task.labels.length > 0
                        ? `
                        <div class="task-labels">
                            ${task.labels
                              .map(
                                (label) => `
                                <span class="label" style="background: ${label.color}">${label.name}</span>
                            `
                              )
                              .join("")}
                        </div>
                    `
                        : ""
                    }
                    <div class="task-actions">
                        <button onclick="editTask(${
                          task.id
                        })" class="btn btn-edit">✏️ Редактировать</button>
                        <button onclick="deleteTask(${
                          task.id
                        })" class="btn btn-delete">🗑️ Удалить</button>
                    </div>
                    <small style="color: #999; font-size: 12px;">Создано: ${
                      task.createdAt
                    }</small>
                </div>
            `
          )
          .join("");
      }

      function renderNotes() {
        const container = document.getElementById("notesContainer");

        if (notes.length === 0) {
          container.innerHTML =
            '<div class="empty-state">📝 Заметок пока нет.<br><small>Создайте первую заметку</small></div>';
          return;
        }

        container.innerHTML = notes
          .map(
            (note) => `
                <div class="note-item">
                    <h4 style="margin-bottom: 10px; color: #2c3e50;">${note.title}</h4>
                    <p style="color: #555; line-height: 1.6; white-space: pre-wrap;">${note.content}</p>
                    <div class="note-actions">
                        <button onclick="editNote(${note.id})" class="btn btn-edit">✏️ Редактировать</button>
                        <button onclick="deleteNote(${note.id})" class="btn btn-delete">🗑️ Удалить</button>
                    </div>
                    <small style="color: #999; font-size: 12px;">Создано: ${note.createdAt}</small>
                </div>
            `
          )
          .join("");
      }

      // ==================== РЕДАКТИРОВАНИЕ ====================
      function editTask(id) {
        const task = tasks.find((t) => t.id === id);
        if (!task) return;

        currentEditingId = id;
        currentEditingType = "task";

        document.getElementById("modalTitle").textContent =
          "✏️ Редактирование задачи";
        document.getElementById("modalBody").innerHTML = `
                <input type="text" id="editTaskTitle" value="${
                  task.title
                }" placeholder="Название задачи" style="margin-bottom: 15px;">
                <textarea id="editTaskDescription" placeholder="Описание задачи" style="margin-bottom: 15px; height: 100px;">${
                  task.description || ""
                }</textarea>
                <select id="editTaskPriority" style="margin-bottom: 15px;">
                    <option value="low" ${
                      task.priority === "low" ? "selected" : ""
                    }>🔵 Низкий приоритет</option>
                    <option value="medium" ${
                      task.priority === "medium" ? "selected" : ""
                    }>🟡 Средний приоритет</option>
                    <option value="high" ${
                      task.priority === "high" ? "selected" : ""
                    }>🔴 Высокий приоритет</option>
                </select>
                <div>
                    <label style="font-weight: bold;">Метки задачи:</label>
                    <div class="task-labels" style="margin: 10px 0;">
                        ${task.labels
                          .map(
                            (label) => `
                            <span class="label" style="background: ${label.color}">${label.name}</span>
                        `
                          )
                          .join("")}
                    </div>
                    <small style="color: #7f8c8d;">Метки можно изменить только при создании задачи</small>
                </div>
            `;

        document.getElementById("editModal").style.display = "block";
      }

      function editNote(id) {
        const note = notes.find((n) => n.id === id);
        if (!note) return;

        currentEditingId = id;
        currentEditingType = "note";

        document.getElementById("modalTitle").textContent =
          "✏️ Редактирование заметки";
        document.getElementById("modalBody").innerHTML = `
                <input type="text" id="editNoteTitle" value="${note.title}" placeholder="Заголовок заметки" style="margin-bottom: 15px;">
                <textarea id="editNoteContent" placeholder="Текст заметки" style="height: 200px; margin-bottom: 15px;">${note.content}</textarea>
            `;

        document.getElementById("editModal").style.display = "block";
      }

      function save_edit() {
        if (currentEditingType === "task") {
          const title = document.getElementById("editTaskTitle").value.trim();
          const description = document
            .getElementById("editTaskDescription")
            .value.trim();
          const priority = document.getElementById("editTaskPriority").value;

          if (!title) {
            alert("Введите название задачи!");
            return;
          }

          updateTask(currentEditingId, { title, description, priority });
        } else if (currentEditingType === "note") {
          const title = document.getElementById("editNoteTitle").value.trim();
          const content = document
            .getElementById("editNoteContent")
            .value.trim();

          if (!title || !content) {
            alert("Заполните все поля!");
            return;
          }

          updateNote(currentEditingId, { title, content });
        }

        close_change();
      }

      function close_change() {
        document.getElementById("editModal").style.display = "none";
        currentEditingId = null;
        currentEditingType = null;
      }

      // ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
      function getPriorityText(priority) {
        const texts = {
          low: "🔵 Низкий",
          medium: "🟡 Средний",
          high: "🔴 Высокий",
        };
        return texts[priority] || "🟡 Средний";
      }

      function clearTaskForm() {
        document.getElementById("taskTitleInput").value = "";
        document.getElementById("taskDescriptionInput").value = "";
        document.getElementById("taskPrioritySelect").value = "medium";
        document.getElementById("newLabelInput").value = "";
        currentTaskLabels = [];
        renderCurrentLabels();
      }

      function clearNoteForm() {
        document.getElementById("noteTitleInput").value = "";
        document.getElementById("noteContentInput").value = "";
      }

      // ==================== ЛОКАЛЬНОЕ ХРАНИЛИЩЕ ====================
      function saveToLocalStorage() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
        localStorage.setItem("notes", JSON.stringify(notes));
      }

      function loadFromLocalStorage() {
        // Автоматически удаляем выполненные задачи при загрузке
        const allTasks = JSON.parse(localStorage.getItem("tasks")) || [];
        tasks = allTasks.filter((task) => !task.completed);
        notes = JSON.parse(localStorage.getItem("notes")) || [];

        saveToLocalStorage();
      }

      // ==================== ПЕРЕКЛЮЧЕНИЕ РАЗДЕЛОВ ====================
      function setupEventListeners() {
        document
          .getElementById("showTasksBtn")
          .addEventListener("click", () => showSection("tasks"));
        document
          .getElementById("showNotesBtn")
          .addEventListener("click", () => showSection("notes"));
      }

      function showSection(section) {
        document.querySelectorAll(".control-panel .btn").forEach((btn) => {
          btn.classList.remove("active");
        });

        document.getElementById("taskFormSection").style.display =
          section === "tasks" ? "block" : "none";
        document.getElementById("noteFormSection").style.display =
          section === "notes" ? "block" : "none";

        document.getElementById("tasksListSection").style.display =
          section === "tasks" ? "block" : "none";
        document.getElementById("notesListSection").style.display =
          section === "notes" ? "block" : "none";

        document
          .getElementById(
            `show${section.charAt(0).toUpperCase() + section.slice(1)}Btn`
          )
          .classList.add("active");
      }

      // Запуск приложения
      document.addEventListener("DOMContentLoaded", initApp);