// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    const tabContainer = document.getElementById('tab-container');
    const tabBtns = document.querySelectorAll('.tab-btn');

    // Generate 12 tab contents dynamically
    const days = ['DOMINGO', 'SEGUNDA-FEIRA', 'TERÇA-FEIRA', 'QUARTA-FEIRA', 'QUINTA-FEIRA', 'SEXTA-FEIRA', 'SÁBADO'];
    const dayLabels = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const standardIntervals = ['10:00 - 14:00', '14:00 - 15:00', '15:00 - 18:50', '18:50 - 19:00'];
    const sabadoIntervals = ['11:00 - 15:00', '15:00 - 16:00', '16:00 - 16:50', '16:50 - 17:00'];

    for (let i = 1; i <= 12; i++) {
        const tabDiv = document.createElement('div');
        tabDiv.id = `page${i}`;
        tabDiv.className = 'tab-content';
        if (i === 1) tabDiv.classList.add('active');

        let photosHTML = '';
        const numMain = i === 1 ? 6 : i === 2 || i === 3 || i === 4 ? 0 : i === 5 ? 3 : i === 6 ? 1 : i === 7 ? 1 : i === 8 ? 4 : i === 9 ? 4 : i === 10 ? 5 : i === 11 ? 4 : i === 12 ? 3 : 7;
        dayLabels.slice(0, numMain).forEach((label, slotIndex) => {
            const photoId = `semana${i}-foto${slotIndex}`;
            photosHTML += `
                <div class="photo-slot" data-photo-id="${photoId}">
                    <input type="file" id="${photoId}-file" accept="image/*">
                    <div class="add-placeholder">
                        <span class="flag">🇧🇷</span>
                        ADICIONAR
                    </div>
                    <img id="${photoId}" src="" alt="Foto Motorista ${label}" style="display: none;">
                </div>
            `;
        });

        // Transpose table: days as columns, shifts as rows
        let theadHTML = '<tr>';
        days.forEach(day => {
            const isDomingo = day === 'DOMINGO';
            const dayClass = isDomingo ? 'domingo-accent' : '';
            theadHTML += `<th class="${dayClass}">${day}</th>`;
        });
        theadHTML += '</tr>';

        let tbodyTransposedHTML = '';
        for (let shiftIndex = 0; shiftIndex < 4; shiftIndex++) {
            let rowHTML = '';
            days.forEach((day, dayIndex) => {
                const isDomingo = day === 'DOMINGO';
                const isSabado = day === 'SÁBADO';
                const intervals = isSabado ? sabadoIntervals : standardIntervals;
                const interval = intervals[shiftIndex];
                const cellClass = isDomingo ? 'domingo-schedule schedule-cell' : 'schedule-cell';
                const inputId = `semana${i}-time${shiftIndex}-${dayIndex}`;
                rowHTML += `<td class="${cellClass}"><input type="text" id="${inputId}" value="${interval}" /></td>`;
            });
        tbodyTransposedHTML += `<tr>${rowHTML}</tr>`;
        }

        let additionalPhotosHTML = '';
        const numExtra = i === 1 ? 2 : i === 3 ? 1 : i === 5 ? 0 : i === 6 ? 0 : i === 7 ? 0 : i === 8 ? 0 : i === 9 ? 0 : i === 10 ? 0 : i === 11 ? 0 : i === 12 ? 0 : 2;
        for (let slotIndex = 0; slotIndex < numExtra; slotIndex++) {
            const label = dayLabels[slotIndex];
            const extraPhotoId = `semana${i}-extra-foto${slotIndex}`;
            additionalPhotosHTML += `
                <div class="photo-slot" data-photo-id="${extraPhotoId}">
                    <input type="file" id="${extraPhotoId}-file" accept="image/*">
                    <div class="add-placeholder">
                        <span class="flag">🇧🇷</span>
                        ADICIONAR EXTRA
                    </div>
                    <img id="${extraPhotoId}" src="" alt="Foto Motorista Extra ${label}" style="display: none;">
                </div>
            `;
        }

        tabDiv.innerHTML = `
            <div class="driver-photos">
                ${photosHTML}
            </div>
            <div class="additional-photos">
                ${additionalPhotosHTML}
            </div>
            <h2>CARGA HORÁRIA MOTORISTAS JV TRANSPORTE - Semana ${i}</h2>
            <table class="${i === 1 ? 'week1-table' : ''}">
                <thead>
                    ${theadHTML}
                </thead>
                <tbody>
                    ${tbodyTransposedHTML}
                </tbody>
            </table>
        `;

        tabContainer.appendChild(tabDiv);
    }

    let currentTabIndex = 1;
    let autoSwitchInterval;

    // Function to switch to a specific tab
    function switchToTab(index) {
        // Remove active class from all buttons and contents
        tabBtns.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active to the button
        const btn = document.querySelector(`[data-tab="page${index}"]`);
        if (btn) btn.classList.add('active');

        // Show corresponding content
        const targetTab = document.getElementById(`page${index}`);
        if (targetTab) {
            targetTab.classList.add('active');
        }

        currentTabIndex = index;
    }

    // Auto-switch setup (disabled for adjustment)
    // autoSwitchInterval = setInterval(() => {
    //     currentTabIndex = (currentTabIndex % 12) + 1;
    //     switchToTab(currentTabIndex);
    // }, 25000);

    // Handle file upload for photos
    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            const imgId = event.target.id.replace('-file', '');
            const img = document.getElementById(imgId);
            const input = event.target;
            const slot = input.parentElement;
            const placeholder = slot.querySelector('.add-placeholder');
            reader.onload = function(e) {
                const base64 = e.target.result;
                img.src = base64;
                img.style.display = 'block';
                input.style.display = 'none';
                if (placeholder) placeholder.style.display = 'none';
                localStorage.setItem(imgId, base64);
                // Make img clickable to change photo
                img.onclick = function() {
                    input.click();
                };
            };
            reader.readAsDataURL(file);
        }
    }

    // Save photos data and times
    function saveData() {
        document.querySelectorAll('img[id^="semana"]').forEach(img => {
            if (img.src && img.src.startsWith('data:image')) {
                localStorage.setItem(img.id, img.src);
            }
        });
        document.querySelectorAll('input[id^="semana"][type="text"]').forEach(input => {
            localStorage.setItem(input.id, input.value);
        });
    }

    // Load saved photos and times
    function loadData() {
        document.querySelectorAll('img[id^="semana"]').forEach(img => {
            const saved = localStorage.getItem(img.id);
            if (saved && saved.startsWith('data:image')) {
                img.src = saved;
                img.style.display = 'block';
                const inputId = img.id + '-file';
                const input = document.getElementById(inputId);
                const slot = input.parentElement;
                const placeholder = slot.querySelector('.add-placeholder');
                if (input) {
                    input.style.display = 'none';
                    if (placeholder) placeholder.style.display = 'none';
                    img.onclick = function() {
                        input.click();
                    };
                }
            }
        });
        document.querySelectorAll('input[id^="semana"][type="text"]').forEach(input => {
            const saved = localStorage.getItem(input.id);
            if (saved) {
                input.value = saved;
            }
        });
    }

    // Add event listeners for file uploads
    document.addEventListener('change', handleFileUpload);
    // Save on change (for photos and times)
    document.addEventListener('change', saveData);
    document.addEventListener('input', saveData);

    // Make photo slots clickable for initial upload
    document.addEventListener('click', function(event) {
        if (event.target.closest('.photo-slot') && !event.target.closest('img')) {
            const slot = event.target.closest('.photo-slot');
            const img = slot.querySelector('img');
            if (!img.src || img.style.display === 'none') {
                const input = slot.querySelector('input[type="file"]');
                if (input) {
                    input.click();
                }
            }
        }
    });

    loadData(); // Load on init
});
