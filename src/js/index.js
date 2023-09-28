const productsList = document.querySelector('.products-sidebar__list');

// Интерактивные элементы
const addProductBtn = document.querySelector('.btn-add-product');
const setCaloriesBtn = document.querySelector('.btn-target-calories');
const sortListBtn = document.querySelector('.btn-sort-list');
const clearDataBtn = document.querySelector('.btn-clear-data');
const removeProductsBtn = document.querySelector('.btn-remove-all-products');
const searchInput = document.querySelector('#search');

// Блок меню настроек
const settingsMenu = document.querySelector('.settings__menu');
const settingsBtn = document.querySelector('.settings__open-menu-icon');

// Информация о калориях
const caloriesPerDay = document.querySelector('.calories-per-day');
const targetCalories = document.querySelector('.target-calories');

// Элементы диаграммы
const donutSegment = document.querySelector('.chart-segment');
const consumedCal = document.querySelector('.consumed-calories');
const dailyNormCal = document.querySelector('.daily-norm');


const dataModel = {
    products: [],
    consumedCalories: 0,
    targetCalories: 2000,
};


document.addEventListener('DOMContentLoaded', () => {
    // Задержка запуска анимации диаграммы, чтобы функция updateChart успела выполниться раньше анимации
    setTimeout(function() {
        donutSegment.classList.add('animate');
    }, 100);


    // Проверяем данные в localStorage
    let storageData = JSON.parse(localStorage.getItem('calories-calculator-data'));
    if (storageData) {
        console.log(storageData);

        // заполняем данные из localStorage
        dataModel.products = [...storageData.products];
        dataModel.targetCalories = +storageData.targetCalories;
        dataModel.consumedCalories = +storageData.consumedCalories;
    }

    // Отображаем суточную норму калорий
    setTargetCalories(dataModel.targetCalories);

    // Отрисовываем начальное состояние списка продуктов
    renderProductsList();

    // Показываем потребленные калории
    calculateConsumedCalories();


    // Обработчик добавления продукта
    addProductBtn.addEventListener('click', (e) => {
        const title = prompt('Укажите название продукта');
        const calories = +prompt('Укажите калорийность');

        if ((title && calories) && !isNaN(calories)) {
            addProduct(title, calories);
        } else {
            if (isNaN(calories)) {
                alert('Введите числовое значение калорий');
            } else {
                alert('Необходимо указать название продукта и его калорийность');
            }
        }
    });

    // Обработчик установки нормы калорий
    setCaloriesBtn.addEventListener('click', () => {
        setTargetCalories(+prompt('Укажите суточную норму калорий в день'));
    });

    // Обработчик сортировки продуктов
    sortListBtn.addEventListener('click', () => {
        sortProductsByCalories();
    });

    // Обработчик инпута поиска
    searchInput.addEventListener('input' , (e) => {
        console.log(e.target.value);
        filterProductsByName(e.target.value);
    });

    // Обработчики настроек
    settingsBtn.addEventListener('click', (e) => {
        // Открываем или закрываем меню настроек по клику на иконку
        e.stopPropagation();
        settingsMenu.classList.toggle('hidden');
    });
    window.addEventListener('click', (e) => {
        // Закрытие меню настроек по клику вне самого меню
        if (!settingsMenu.classList.contains('hidden')) {
            if (!settingsMenu.contains(e.target) && e.target !== settingsMenu) {
                settingsMenu.classList.add('hidden');
            }
        }
    });

    // Обработчики удаления данных
    clearDataBtn.addEventListener('click', () => {
        // Удаляем все данные в том числе из localstorage
        if (confirm('Удалить данные приложения?')) {
            clearData();
        }
    });
    removeProductsBtn.addEventListener('click', () => {
        // Очищаем только список продуктов
        if (confirm('Очистить список продуктов?')) {
            deleteAllProducts();
        }
    });
});


function renderProductsList(list = null) {
    productsList.innerHTML = '';

    if (list && list.length > 0) {
        // list предается в случае сортировки
        list.forEach(item => {
            const html = `
            <div class="product-card" id=${item.id}>
            <div class="product-card__info">
                <span class="title">${item.title}</span>
                <span class="calories">${item.calories} ккал</span>
            </div>

            <div class="product-card__actions">
                <button class="btn-delete-product" title="Удалить продукт">
                    <img src="./assets/img/icon-delete.png" alt="Удалить продукт">
                </button>
            </div>
        </div>`

            productsList.insertAdjacentHTML('beforeend', html);
        });
    } else {
        if (dataModel.products.length === 0) {
            productsList.innerHTML = `<h3 style="margin: 0 auto;">Список пуст</h3>`;
        }

        dataModel.products.forEach(product => {
            const html = `
            <div class="product-card" id=${product.id}>
            <div class="product-card__info">
                <span class="title">${product.title}</span>
                <span class="calories">${product.calories} ккал</span>
            </div>

            <div class="product-card__actions">
                <button class="btn-delete-product" title="Удалить продукт">
                    <img src="./assets/img/icon-delete.png" alt="Удалить продукт">
                </button>
            </div>
        </div>`

            productsList.insertAdjacentHTML('beforeend', html);
        });
    }


    // Вешаем функцию удаления конкретного продукта из списка на каждую кнопку карточки
    [...document.querySelectorAll('.btn-delete-product')].forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productID = e.target.closest('.product-card').id;

            deleteProduct(productID);
        });
    });
}

// Функция для добавления продукта
function addProduct(title, calories) {
    const product = {
        id: Date.now().toString(),
        title,
        calories,
    };

    dataModel.products.push(product);

    // Делаем перерасчет калорий
    calculateConsumedCalories();

    // Отрисовываем обновленный список
    renderProductsList();

    // Обновляем данные localstorage
    localStorage.setItem('calories-calculator-data', JSON.stringify(dataModel));
}

// Функция для удаления продукта по ID
function deleteProduct(productID) {
    dataModel.products = dataModel.products.filter(item => item.id !== productID);

    // Делаем перерасчет калорий
    calculateConsumedCalories();

    if (dataModel.products.length === 0) {
        productsList.innerHTML = `<h3 style="margin: 0 auto;">Список пуст</h3>`;
    } else {
        // Отрисовываем обновленный список
        renderProductsList();
    }

    // Обновляем данные localstorage
    localStorage.setItem('calories-calculator-data', JSON.stringify(dataModel));
}

// Функция для удаления продуктов
function deleteAllProducts() {
    dataModel.products = [];
    productsList.innerHTML = `<h3 style="margin: 0 auto;">Список пуст</h3>`;

    // Делаем перерасчет калорий
    calculateConsumedCalories();
}

// Функция для подсчета потребленных калорий
function calculateConsumedCalories() {
    let sum = 0;
    dataModel.products.forEach((product) => {
        sum += +product.calories;
    });
    dataModel.consumedCalories = sum;
    caloriesPerDay.innerText = `Калорий потребленно: ${sum}`;

    // Обновляем диаграмму
    updateChart(dataModel.targetCalories, sum);

    // Обновляем данные localstorage
    localStorage.setItem('calories-calculator-data', JSON.stringify(dataModel));
}

// Функция для установки суточной нормы калорий
function setTargetCalories(calories) {
    if (isNaN(calories)) {
        alert('Введите число');
        return;
    }

    dataModel.targetCalories = calories;
    targetCalories.innerText = `Суточная норма калорий: ${calories}`;

    updateChart(calories, dataModel.consumedCalories);

    // Обновляем данные localstorage
    localStorage.setItem('calories-calculator-data', JSON.stringify(dataModel));
}

// Функция для фильтрации продуктов по названию
function filterProductsByName(keyword) {
    const filteredProducts = dataModel.products.filter((product) => {
        return product.title.toLowerCase().includes(keyword.toLowerCase());
    });

    renderProductsList(filteredProducts);
}

// Функция для сортировки продуктов по калорийности (по убыванию)
function sortProductsByCalories() {
    dataModel.products.sort((a, b) => {
        return b.calories - a.calories;
    });

    // Отрисовываем обновленный список
    renderProductsList();
}

// Функция для удаления данных
function clearData() {
    localStorage.removeItem('calories-calculator-data');

    setTargetCalories(0);
    deleteAllProducts();

    alert('Данные удалены!');
}


// Логика диаграммы
function updateChart(dailyNorm = 0, consumedCalories = 0) {
    let percentage = (consumedCalories / dailyNorm) * 100;
    if (dailyNorm === 0 && consumedCalories === 0) {
        // Проверка, чтобы избежать NaN внутри percentage, так как 0 / 0 = NaN
        percentage = 0;
    }

    // Получаем текущее значение stroke-dasharray
    const currentStrokeDasharray = donutSegment.style.strokeDasharray;

    // Обновляем состояние диаграммы
    if (percentage > 100) {
        // Если percentage больше 100, диаграмма не заполнится до конца
        percentage = 100;
    }
    donutSegment.style.strokeDasharray = `${percentage}, ${100 - percentage}`;
    donutSegment.style.setProperty('--percentage', `${percentage}`);
    donutSegment.style.setProperty('--percentage-left', `${100 - percentage}`);

    // Применяем анимацию только если значения изменились
    if (currentStrokeDasharray !== donutSegment.style.strokeDasharray) {
        donutSegment.style.transition = 'stroke-dasharray 2s';
    } else {
        // Удаляем анимацию, чтобы избежать нежелательного эффекта
        donutSegment.style.transition = 'none';
    }

    consumedCal.textContent = consumedCalories.toString();
    dailyNormCal.textContent = dailyNorm.toString();

    // Если количество потребленных калорий больше нормы, меняем цвет и предупреждаем пользователя
    if (+consumedCal.textContent > dailyNorm && dailyNorm !== 0) {
        document.querySelector('.chart-text').style.fill = '#ff6a00';

        alert('Вы превысили дневную норму калорий!');
    } else {
        document.querySelector('.chart-text').style.fill = 'aqua';
    }
}
