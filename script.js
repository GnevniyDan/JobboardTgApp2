document.addEventListener('DOMContentLoaded', function() {
    let isAuthorized = localStorage.getItem('isAuthorized') === 'true';
    const BASE_URL = 'http://127.0.0.1:5000'; // Замените на нужный URL
    const AUTH_TOKEN = '123'; // Токен авторизации

    // Проверка доступности объекта Telegram, чтобы избежать ошибки
    let tg;
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
        tg = Telegram.WebApp; // Интеграция с Telegram Web App SDK
        tg.ready(); // Убедиться, что Telegram WebApp готов к работе
    } else {
        console.warn('Telegram WebApp SDK не обнаружен. Проверьте окружение.');
    }

    // Настроить видимость кнопки "Опубликовать вакансию" и "Войти/Выйти" в зависимости от авторизации
    if (isAuthorized) {
        document.getElementById('publishJob').style.display = 'inline-block';
        document.getElementById('loginButton').textContent = 'Выйти';
    } else {
        document.getElementById('publishJob').style.display = 'none';
        document.getElementById('loginButton').textContent = 'Войти';
    }

    // Add test jobs when the "findJob" button is clicked
    document.getElementById('findJob').addEventListener('click', function() {
        console.log("Button 'Find Job' clicked"); // Лог перед запросом
        document.getElementById('findJob').style.display = 'none'; // Скрываем кнопку после нажатия

        fetch(BASE_URL + '/api/jobs')
            .then(response => {
                console.log("Response received:", response); // Лог после получения ответа
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    return response.json();
                } else {
                    throw new Error('Received response is not JSON');
                }
            })
            .then(data => {
                console.log("Data fetched successfully:", data); // Лог для проверки полученных данных

                const jobCardsContainer = document.getElementById('jobCards');
                jobCardsContainer.innerHTML = ''; // Очищаем контейнер
                jobCardsContainer.style.display = 'flex';
                jobCardsContainer.style.flexDirection = 'column';
                jobCardsContainer.style.alignItems = 'center';

                data.forEach((job) => {
                    const card = document.createElement('div');
                    card.classList.add('job-card');
                    card.style.margin = '10px auto'; // Центрирование карточек
                    card.style.padding = '20px';
                    card.style.border = '1px solid #ddd';
                    card.style.borderRadius = '15px';
                    card.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                    card.style.width = '90%';
                    card.style.maxWidth = '600px';
                    card.style.backgroundColor = '#ffffff';
                    card.style.display = 'flex';
                    card.style.gap = '15px';
                    card.style.cursor = 'pointer';
                    card.style.alignItems = 'center';
                    card.style.minHeight = '130px'; // Уменьшить минимальную высоту для карточек

                    // Добавить переход по ссылке при клике на карточку
                    card.addEventListener('click', function() {
                        window.open(job.link, '_blank');
                    });

                    // Логотип
                    if (job.logo) {
                        const logo = document.createElement('img');
                        logo.src = job.logo; // Путь для логотипа
                        logo.alt = `${job.title} logo`;
                        logo.classList.add('job-logo'); // Добавляем класс для логотипа
                        logo.style.width = '70px';
                        logo.style.height = '70px';
                        logo.style.borderRadius = '50%';
                        logo.style.objectFit = 'cover';
                        card.appendChild(logo);
                    }

                    // Информация о вакансии
                    const jobDetails = document.createElement('div');
                    jobDetails.classList.add('job-details');
                    jobDetails.style.textAlign = 'left';

                    const title = document.createElement('h3');
                    title.textContent = job.title;
                    title.style.margin = '0';
                    title.style.fontSize = '22px';
                    title.style.fontWeight = 'bold';
                    title.style.color = '#333';
                    jobDetails.appendChild(title);

                    const badgesContainer = document.createElement('div');
                    badgesContainer.style.display = 'flex';
                    badgesContainer.style.gap = '10px';
                    badgesContainer.style.margin = '10px 0';

                    const levelBadge = document.createElement('span');
                    levelBadge.classList.add('badge');
                    levelBadge.textContent = job.level;
                    levelBadge.style.padding = '5px 10px';
                    levelBadge.style.borderRadius = '20px';
                    levelBadge.style.backgroundColor = '#e0e0e0';
                    levelBadge.style.color = '#333';
                    badgesContainer.appendChild(levelBadge);

                    const typeBadge = document.createElement('span');
                    typeBadge.classList.add('badge');
                    typeBadge.textContent = job.type;
                    typeBadge.style.padding = '5px 10px';
                    typeBadge.style.borderRadius = '20px';
                    typeBadge.style.backgroundColor = '#e0e0e0';
                    typeBadge.style.color = '#333';
                    badgesContainer.appendChild(typeBadge);

                    jobDetails.appendChild(badgesContainer);

                    const description = document.createElement('p');
                    description.textContent = job.description.length > 120 ? job.description.slice(0, 120) + '...' : job.description;
                    description.style.margin = '0';
                    description.style.fontSize = '14px';
                    description.style.color = '#555';
                    description.style.marginTop = '10px';
                    description.style.display = '-webkit-box';
                    description.style.webkitBoxOrient = 'vertical';
                    description.style.overflow = 'hidden';
                    description.style.webkitLineClamp = '2'; // Ограничение количества строк
                    jobDetails.appendChild(description);

                    card.appendChild(jobDetails);
                    jobCardsContainer.appendChild(card);
                });

                // Фокусировка на контейнере с карточками после их добавления
                setTimeout(() => {
                    jobCardsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300);
            })
            .catch(error => {
                console.error("Error during fetch:", error);
                alert("Произошла ошибка: " + error.message);
            });
    });

    // Show form to add a job
    document.getElementById('publishJob').addEventListener('click', function() {
        if (isAuthorized) {
            document.getElementById('addJobForm').style.display = 'block';
        } else {
            alert('Вы должны авторизоваться, чтобы добавить вакансию.');
        }
    });

    // Submit new job
    document.getElementById('submitJob').addEventListener('click', function() {
        const jobTitle = document.getElementById('jobTitle').value;
        const jobDescription = document.getElementById('jobDescription').value;
        const jobLink = document.getElementById('jobLink').value;
        const jobLevel = document.getElementById('jobLevel').value;
        const jobType = document.getElementById('jobType').value;
        const jobLogo = document.getElementById('jobLogo').files[0];

        const formData = new FormData();
        formData.append('title', jobTitle);
        formData.append('description', jobDescription);
        formData.append('link', jobLink);
        formData.append('level', jobLevel);
        formData.append('type', jobType);
        formData.append('logo', jobLogo);

        fetch(BASE_URL + '/api/jobs', {
            method: 'POST',
            headers: {
                'Authorization': AUTH_TOKEN // Добавляем токен авторизации
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Job added successfully:', data);
            alert('Вакансия добавлена успешно!');
            document.getElementById('findJob').click(); // Перезагружаем карточки после добавления новой вакансии
        })
        .catch(error => {
            console.error("Error during job submission:", error);
        });
    });

    // Login and logout functionality
    document.getElementById('loginButton').style.display = 'inline-block';
    document.getElementById('loginButton').addEventListener('click', function() {
        if (isAuthorized) {
            // Logout
            isAuthorized = false;
            localStorage.setItem('isAuthorized', 'false');
            document.getElementById('publishJob').style.display = 'none';
            document.getElementById('loginButton').textContent = 'Войти';
            alert('Вы вышли из системы.');
            location.reload();
        } else {
            // Login
            const password = prompt('Введите ключ-пароль для авторизации:');
            if (password === AUTH_TOKEN) { // Используем токен авторизации
                isAuthorized = true;
                localStorage.setItem('isAuthorized', 'true');
                document.getElementById('publishJob').style.display = 'inline-block';
                document.getElementById('loginButton').textContent = 'Выйти';
                alert('Вы успешно авторизовались!');
                location.reload();
            } else {
                alert('Неверный ключ-пароль. Попробуйте снова.');
            }
        }
    });
});