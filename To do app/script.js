// script.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('todo-form');
    const taskInput = document.getElementById('task-input');
    const deadlineInput = document.getElementById('deadline-input');
    const categoryInput = document.getElementById('category-input');
    const taskList = document.getElementById('task-list');

    form.addEventListener('submit', addTask);
    taskList.addEventListener('click', manageTask);
    taskList.addEventListener('dragstart', handleDragStart);
    taskList.addEventListener('dragover', handleDragOver);
    taskList.addEventListener('drop', handleDrop);
    loadTasks();

    function addTask(e) {
        e.preventDefault();
        const taskText = taskInput.value.trim();
        const deadline = deadlineInput.value;
        const category = categoryInput.value;

        if (taskText) {
            const task = {
                id: Date.now(),
                text: taskText,
                deadline: deadline,
                category: category,
                complete: false
            };
            saveTask(task);
            renderTask(task);
            taskInput.value = '';
            deadlineInput.value = '';
            categoryInput.value = 'none';
        }
    }

    function saveTask(task) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => renderTask(task));
    }

    function renderTask(task) {
        const li = document.createElement('li');
        li.className = `${task.category} ${task.complete ? 'complete' : ''}`;
        li.setAttribute('draggable', true);
        li.dataset.id = task.id;

        const taskText = document.createElement('span');
        taskText.className = 'task';
        taskText.textContent = task.text;

        const deadlineText = document.createElement('span');
        deadlineText.className = 'deadline';
        deadlineText.textContent = task.deadline ? `Due: ${task.deadline}` : '';

        const completeButton = document.createElement('button');
        completeButton.textContent = 'Complete';
        completeButton.className = 'complete-btn';

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-btn';

        li.appendChild(taskText);
        li.appendChild(deadlineText);
        li.appendChild(completeButton);
        li.appendChild(deleteButton);
        taskList.appendChild(li);
    }

    function manageTask(e) {
        if (e.target.classList.contains('complete-btn')) {
            const li = e.target.closest('li');
            li.classList.toggle('complete');
            updateTaskStatus(li.dataset.id, li.classList.contains('complete'));
        } else if (e.target.classList.contains('delete-btn')) {
            const li = e.target.closest('li');
            li.remove();
            deleteTask(li.dataset.id);
        }
    }

    function updateTaskStatus(id, complete) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.map(task => {
            if (task.id == id) {
                task.complete = complete;
            }
            return task;
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function deleteTask(id) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.filter(task => task.id != id);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.id);
        e.target.classList.add('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault();
        const draggingItem = document.querySelector('.dragging');
        const afterElement = getDragAfterElement(taskList, e.clientY);
        if (afterElement == null) {
            taskList.appendChild(draggingItem);
        } else {
            taskList.insertBefore(draggingItem, afterElement);
        }
    }

    function handleDrop(e) {
        const id = e.dataTransfer.getData('text/plain');
        const draggingItem = document.querySelector('.dragging');
        draggingItem.classList.remove('dragging');
        const afterElement = getDragAfterElement(taskList, e.clientY);
        taskList.insertBefore(draggingItem, afterElement);
        reorderTasks();
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function reorderTasks() {
        const tasks = [...taskList.querySelectorAll('li')];
        const reorderedTasks = tasks.map(task => {
            return {
                id: task.dataset.id,
                text: task.querySelector('.task').textContent,
                deadline: task.querySelector('.deadline').textContent.replace('Due: ', ''),
                category: task.classList[0],
                complete: task.classList.contains('complete')
            };
        });
        localStorage.setItem('tasks', JSON.stringify(reorderedTasks));
    }
});
