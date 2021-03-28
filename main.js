addEventListener('DOMContentLoaded', (event) => {
  main();
});

const main = () => {
	seedFromQueryParams();
  createSaveButtonListener();
  createAddTodoListener();
}

const days = {
	SUN: 'sun', MON: 'mon', TUES: 'tues', WED: 'wed', THURS: 'thurs', FRI: 'fri', SAT: 'sat'
};
const seedFromQueryParams = () => {
	const queryParams = new URLSearchParams(window.location.search);
	Object.entries(days).forEach(([k, v]) => {
		const day = queryParams.get(v);
		if (!day) {
			return;
		}

		const decodedData = decodeURIComponent(day);
		const jsonData = JSON.parse(decodedData);

		dayElementEl = document.querySelector('.js-day--' + v);
		jsonData.tasks.forEach((taskObject) => {
			addTodoLi(taskObject.task, taskObject.completed, dayElementEl);
		});

		if (jsonData.lunch) {
			dayElementEl.querySelector('.js-lunchInput').value = jsonData.lunch;
		}
		if (jsonData.dinner) {
			dayElementEl.querySelector('.js-dinnerInput').value = jsonData.dinner;
		}
	});
};

const createSaveButtonListener= () => {
	document.querySelector('.js-saveButton').addEventListener('click', () => {
		const queryParams = new URLSearchParams(window.location.search);
		const todoInformation = {};

		// TODO this should already be class
		Object.entries(days).forEach(([k, v]) => {
			if (!todoInformation[v]) {
				todoInformation[v] = {};
				todoInformation[v].tasks = [];
			}

			const dayElement = document.querySelector('.js-day--' + v);
			if (!dayElement) {
				console.error('Cannot find day: ' + v);
				return;
			}

			dayElement.querySelectorAll('.js-todo').forEach((todoEl) => {
				todoInformation[v].tasks.push({
					completed: todoEl.classList.contains('done'),
					task: todoEl.querySelector('.js-todoText').innerText,
				});
			});

			todoInformation[v].lunch = dayElement.querySelector('.js-lunchInput').value;
			todoInformation[v].dinner = dayElement.querySelector('.js-dinnerInput').value;
		});

		Object.entries(todoInformation).forEach(([k, v]) => {
			queryParams.set(k, JSON.stringify(v));
		});
		window.location.search = queryParams.toString();
	});
};

const createAddTodoListener = () => {
  document.querySelectorAll('.js-todoForm').forEach((el) => {
    el.addEventListener('submit', (e) => {
      e.preventDefault();

      const input = el.querySelector('.js-todoAdd');

      const task = input.value;
      const completed = false;
      const dayElementEl = el.closest('.js-day');
      addTodoLi(task , completed, dayElementEl);

      input.value = '';
    });
  });
};

/**
 * @param {string} task The task text
 * @param {boolean} completed Whether the task has been completed or not
 * @param {HTMLElement} dayElementEl The HTML wrapper for the day
 */
const addTodoLi = (task, completed, dayElementEl) => {
  const li = getTodoLi(task);

  const removeButton = li.querySelector('.js-todoRemove');
  removeButton.addEventListener('click', () => {
    removeButton.closest('.js-todo').remove();
  });

  const doneButton = li.querySelector('.js-todoDone');
  doneButton.addEventListener('click', () => {
    doneButton.closest('.js-todo').classList.toggle('done');
  });

  addReorderListener(li);

  const ul = dayElementEl.querySelector('.js-todoList');
  ul.append(li);

  if (completed) {
  	doneButton.checked = true;
    doneButton.closest('.js-todo').classList.toggle('done');
  }
};

const getTodoLi = (value) => {
  const li = document.createElement('li');
  li.classList.add('Schedule-todo');
  li.classList.add('js-todo');
  li.innerHTML = `
    <input type="checkbox" class="Schedule-doneInput js-todoDone"></input>
    <button type="button" class="Schedule-reorderButtonUp js-todoReorderUp">&#9650;</button>
    <button type="button" class="Schedule-reorderButtonDown js-todoReorderDown">&#9660;</button>
    <span class="Schedule-todoText js-todoText">${value}</span>
    <button type="button" class="Schedule-removeText js-todoRemove">x</button>
    `;
  return li;
};

const addReorderListener = (li) => {
	const reorderButtonUp = li.querySelector('.js-todoReorderUp');
	const reorderButtonDown = li.querySelector('.js-todoReorderDown');

	reorderButtonUp.addEventListener('click', () => {
		const prevSibling = li.previousElementSibling;
		if (!prevSibling) {
			return;
		}

		li.parentNode.insertBefore(li, prevSibling);
	});

	reorderButtonDown.addEventListener('click', () => {
		const nextSibling = li.nextElementSibling;
		if (!nextSibling) {
			return;
		}

		li.parentNode.insertBefore(li, li.nextSibling.nextSibling);
	});
}