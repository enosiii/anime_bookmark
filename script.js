document.addEventListener('DOMContentLoaded', () => {
    const animeList = document.getElementById('anime-list');
    const addButton = document.getElementById('add-button');
    const deleteButton = document.getElementById('delete-button');
    const addContainer = document.getElementById('add-container');
    const deleteContainer = document.getElementById('delete-container');
    const submitButton = document.getElementById('submit-button');
    const animeIdInput = document.getElementById('anime-id');
    const animeTitleInput = document.getElementById('anime-title');
    const notification = document.getElementById('notification');
    const deleteList = document.getElementById('delete-list');
    const confirmDeleteButton = document.getElementById('confirm-delete');

    const AIRTABLE_API_KEY = 'patrngWRvVfspTkCU.7114186a9e435c5133957698100ee336746fa5abe94c99c35ab349cdc3cdbb14';
    const AIRTABLE_BASE_ID = 'app0C1cGJkz2QerDg';
    const AIRTABLE_TABLE_NAME = 'Anime';
    const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

    let animeData = [];

    // Load data from cache
    function loadCache() {
        const cachedData = localStorage.getItem('animeData');
        if (cachedData) {
            animeData = JSON.parse(cachedData);
            renderAnimeList();
        }
    }

    // Save data to cache
    function saveCache() {
        localStorage.setItem('animeData', JSON.stringify(animeData));
    }

    // Fetch anime data from Airtable and update cache if needed
    async function fetchAnimeData(forceUpdate = false) {
        try {
            const response = await fetch(AIRTABLE_URL, {
                headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
            });
            const data = await response.json();
            const newAnimeData = data.records.map(record => ({
                id: record.fields.id,
                title: record.fields.title,
                recordId: record.id, // Airtable record ID for deletion
            }));

            if (JSON.stringify(newAnimeData) !== JSON.stringify(animeData) || forceUpdate) {
                animeData = newAnimeData;
                saveCache(); // Update cache
                renderAnimeList();
            }
        } catch (error) {
            console.error('Error fetching anime data:', error);
        }
    }

    // Render anime list
    function renderAnimeList() {
        animeList.innerHTML = '';
        animeData.sort((a, b) => a.title.localeCompare(b.title)).forEach(anime => {
            const button = document.createElement('button');
            button.className = 'anime-button';
            button.textContent = anime.title;
            button.onclick = () => window.open(`https://animepahe.ru/a/${anime.id}`, '_blank');
            animeList.appendChild(button);
        });
    }

    // Show add container and hide delete container
    addButton.addEventListener('click', () => {
        addContainer.classList.remove('hidden');
        deleteContainer.classList.add('hidden');
    });

    // Show delete container and hide add container
    deleteButton.addEventListener('click', () => {
        deleteContainer.classList.remove('hidden');
        addContainer.classList.add('hidden');
        renderDeleteList();
    });

    // Render delete list
    function renderDeleteList() {
        deleteList.innerHTML = '';
        animeData.forEach((anime, index) => {
            const item = document.createElement('div');
            item.className = 'delete-list-item';
            item.innerHTML = `
                <input type="checkbox" id="anime-${index}" value="${anime.recordId}" class="cyberpunk-checkbox">
                <label for="anime-${index}">${anime.title}</label>
            `;
            deleteList.appendChild(item);
        });
    }

    // Submit new anime
    submitButton.addEventListener('click', async () => {
        const id = animeIdInput.value.trim();
        const title = animeTitleInput.value.trim();

        if (id && title) {
            try {
                const response = await fetch(AIRTABLE_URL, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        fields: { id, title },
                    }),
                });

                if (response.ok) {
                    fetchAnimeData(true); // Force update cache
                    animeIdInput.value = '';
                    animeTitleInput.value = '';
                    notification.textContent = `${title} added to the list!`;
                    notification.classList.remove('hidden');
                    setTimeout(() => notification.classList.add('hidden'), 7000);
                }
            } catch (error) {
                console.error('Error adding anime: ', error);
            }
        }
    });

    // Confirm delete
    confirmDeleteButton.addEventListener('click', async () => {
        const selectedAnime = Array.from(document.querySelectorAll('.delete-list-item input:checked'))
            .map(input => input.value);

        if (selectedAnime.length > 0) {
            if (confirm(`🗑️ Do you want to delete the Anime:\n🔹${selectedAnime.map(recordId => animeData.find(anime => anime.recordId === recordId).title).join('\n🔹')}`)) {
                try {
                    for (const recordId of selectedAnime) {
                        await fetch(`${AIRTABLE_URL}/${recordId}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
                        });
                    }
                    fetchAnimeData(true); // Force update cache
                    renderDeleteList();
                } catch (error) {
                    console.error('Error deleting anime: ', error);
                }
            }
        }
    });

    // Load cached data first, then fetch new data in the background
    loadCache();
    fetchAnimeData();
});

