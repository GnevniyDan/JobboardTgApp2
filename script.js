document.addEventListener('DOMContentLoaded', function() {
    const tg = window.Telegram.WebApp;
    tg.expand(); // Растягиваем WebApp на весь экран

    let isAuthorized = tg.initDataUnsafe.user ? true : false;
    const AUTH_TOKEN = 'secret-key'; // Токен авторизации

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
        document.getElementById('findJob').style.display = 'none';

        fetch('https://jobboard.up.railway.app/api/jobs')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ошибка сети при получении вакансий');
                }
                return response.json();
            })
            .then(data => {
                const jobCardsContainer = document.getElementById('jobCards');
                jobCardsContainer.innerHTML = '';
                jobCardsContainer.style.display = 'flex';
                jobCardsContainer.style.flexDirection = 'column';
                jobCardsContainer.style.alignItems = 'center';

                data.forEach((job) => {
                    const card = document.createElement('div');
                    card.classList.add('job-card');
                    card.style.margin = '10px auto'; // Центрирование карточек

                    const title = document.createElement('h3');
                    title.textContent = job.title;
                    card.appendChild(title);

                    const description = document.createElement('p');
                    description.textContent = job.description;
                    card.appendChild(description);

                    const moreButton = document.createElement('button');
                    moreButton.classList.add('more-button');
                    moreButton.textContent = 'Подробнее';
                    moreButton.onclick = () => {
                        window.open(job.link, '_blank');
                    };
                    card.appendChild(moreButton);

                    if (isAuthorized) {
                        const deleteButton = document.createElement('button');
                        deleteButton.classList.add('delete-button');
                        deleteButton.textContent = 'Удалить';
                        deleteButton.onclick = () => {
                            fetch(`https://jobboard.up.railway.app/api/jobs${job.id}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': AUTH_TOKEN // Добавляем токен авторизации
                                }
                            }).then(response => {
                                if (!response.ok) {
                                    throw new Error('Ошибка при удалении вакансии');
                                }
                                card.remove();
                            }).catch(error => {
                                alert('Произошла ошибка при удалении вакансии: ' + error.message);
                            });
                        };
                        card.appendChild(deleteButton);
                    }

                    jobCardsContainer.appendChild(card);
                });

                setTimeout(() => {
                    jobCardsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300);
            })
            .catch(error => {
                alert('Произошла ошибка при загрузке вакансий: ' + error.message);
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

        const newJob = {
            title: jobTitle,
            description: jobDescription,
            link: jobLink
        };

        fetch('https://jobboard.up.railway.app/api/jobs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': AUTH_TOKEN // Добавляем токен авторизации
            },
            body: JSON.stringify(newJob)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка при добавлении вакансии');
            }
            return response.json();
        })
        .then(data => {
            alert('Вакансия добавлена успешно!');
            // Вместо location.reload() обновляем список вакансий
            document.getElementById('findJob').click();
        })
        .catch(error => {
            alert('Произошла ошибка при добавлении вакансии: ' + error.message);
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
            // Login через Telegram
            const user = tg.initDataUnsafe.user;
            if (user) {
                isAuthorized = true;
                localStorage.setItem('isAuthorized', 'true');
                document.getElementById('publishJob').style.display = 'inline-block';
                document.getElementById('loginButton').textContent = 'Выйти';
                alert(`Вы успешно авторизовались как ${user.first_name} ${user.last_name}!`);
                location.reload();
            } else {
                alert('Не удалось авторизоваться через Telegram. Попробуйте снова.');
            }
        }
    });
});
