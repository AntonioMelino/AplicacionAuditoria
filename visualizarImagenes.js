const fileInput = document.getElementById('file-input');
const carouselTrack = document.getElementById('carousel-track');
const imageCounter = document.getElementById('image-counter');
const commentsList = document.getElementById('comment-items');
const folderNameInput = document.getElementById('folder-name');
let images = [];
let comments = [];
let filenames = [];
let files = [];
let currentIndex = 0;

document.getElementById("file-input").addEventListener("change", function () {
    let count = this.files.length;
    document.getElementById("file-count").textContent = count > 0
        ? `${count} archivo(s) seleccionado(s)`
        : "Ningún archivo seleccionado";
});


fileInput.addEventListener('change', (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length > 0) {
        // Mostrar los elementos ocultos
        document.querySelector('.main-container').classList.remove('hidden');
        document.querySelector('.download-container').classList.remove('hidden');
        document.querySelector('#comments-list').classList.remove('hidden');

        // Cargar las imágenes y renderizar el carrusel
        images = selectedFiles.map(file => URL.createObjectURL(file));
        filenames = selectedFiles.map(file => file.name);
        comments = Array(selectedFiles.length).fill([]); // Inicializar como arreglo de arreglos vacíos
        files = selectedFiles;
        renderCarousel();
    } else {
        // Ocultar los elementos si no hay archivos seleccionados
        document.querySelector('.main-container').classList.add('hidden');
        document.querySelector('.download-container').classList.add('hidden');
        document.querySelector('#comments-list').classList.add('hidden');
    }
});

// Modificar la función renderCarousel para agregar un id único a cada slide
function renderCarousel() {
    carouselTrack.innerHTML = images.map((img, index) => `
        <div class="carousel-slide" id="slide-${index}">
            <img src="${img}" alt="Imagen">
        </div>
    `).join('');
    currentIndex = 0;
    updateCarousel();
}

function moveSlide(direction) {
    currentIndex += direction;
    if (currentIndex < 0) currentIndex = images.length - 1;
    if (currentIndex >= images.length) currentIndex = 0;
    updateCarousel();
}

function updateCarousel() {
    const offset = -currentIndex * 100;
    carouselTrack.style.transform = `translateX(${offset}%)`;
    updateImageCounter();
    resetCheckboxes();

    // Verificar si la imagen actual tiene desvíos guardados
    if (comments[currentIndex] && comments[currentIndex].length > 0) {
        disableControls(); // Bloquear controles si hay desvíos guardados
        const saveButton = document.querySelector('.comment-btn');
        saveButton.textContent = "Desvío guardado";
        saveButton.style.backgroundColor = "#28a745"; // Verde
        saveButton.disabled = true; // Bloquear el botón

        // Mostrar los botones de Editar y Eliminar
        toggleEditDeleteButtons(true);
    } else {
        enableControls(); // Habilitar controles si no hay desvíos guardados
        const saveButton = document.querySelector('.comment-btn');
        saveButton.textContent = "Guardar Desvíos";
        saveButton.style.backgroundColor = "#004aad"; // Color original
        saveButton.disabled = false; // Habilitar el botón

        // Ocultar los botones de Editar y Eliminar
        toggleEditDeleteButtons(false);
    }
}


function resetCheckboxes() {
    const checkboxes = document.querySelectorAll('#deviation-options input');
    checkboxes.forEach(checkbox => (checkbox.checked = false)); // Desmarcar todos los checkboxes

    // Si la imagen actual tiene desvíos guardados, marcarlos
    if (comments[currentIndex] && comments[currentIndex].length > 0) {
        comments[currentIndex].forEach(deviation => {
            const checkbox = Array.from(checkboxes).find(cb => cb.value === deviation);
            if (checkbox) checkbox.checked = true;
        });
    }
}

function updateImageCounter() {
    const desviados = comments.filter(comment => comment.length > 0).length;
    imageCounter.textContent = `Imagen ${currentIndex + 1} de ${images.length} | Desvíos: ${desviados} de ${images.length}`;
}

// Función para deshabilitar el botón y los checkboxes
function disableControls() {
    const checkboxes = document.querySelectorAll('#deviation-options input');
    const saveButton = document.querySelector('.comment-btn');

    checkboxes.forEach(checkbox => {
        checkbox.disabled = true; // Deshabilitar checkboxes
    });
    saveButton.disabled = true; // Deshabilitar botón de guardar
}

// Función para habilitar el botón y los checkboxes
function enableControls() {
    const checkboxes = document.querySelectorAll('#deviation-options input');
    const saveButton = document.querySelector('.comment-btn');

    checkboxes.forEach(checkbox => {
        checkbox.disabled = false; // Habilitar checkboxes
    });
    saveButton.disabled = false; // Habilitar botón de guardar
}



function saveComment() {
    const checkboxes = document.querySelectorAll('#deviation-options input');
    const saveButton = document.querySelector('.comment-btn');
    const selectedDeviations = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    if (selectedDeviations.length > 0) {
        comments[currentIndex] = selectedDeviations;
        updateCommentsList();
        updateImageCounter();

        // Cambiar el botón a "Desvío guardado" y color verde
        saveButton.textContent = "Desvío guardado";
        saveButton.style.backgroundColor = "#28a745"; // Verde
        saveButton.disabled = true; // Bloquear el botón

        // Mostrar los botones de Editar y Eliminar
        toggleEditDeleteButtons(true);

        // Bloquear los checkboxes
        disableControls();

        // Mostrar SweetAlert2 de guardado correctamente
        Swal.fire({
            icon: 'success',
            title: 'Guardado correctamente',
            text: '✔️ Los desvíos se han guardado correctamente.',
            confirmButtonText: 'Aceptar',
            timer: 750,
            timerProgressBar: true,
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Selecciona al menos un desvío antes de guardar.',
            confirmButtonText: 'Aceptar',
        });
    }
}

// Función para mostrar u ocultar los botones de Editar y Eliminar
function toggleEditDeleteButtons(show) {
    const editDeleteButtons = document.getElementById('edit-delete-buttons');
    if (show) {
        editDeleteButtons.style.display = 'flex'; // Mostrar los botones
    } else {
        editDeleteButtons.style.display = 'none'; // Ocultar los botones
    }
}

// Función para editar el desvío de la imagen actual
function editCurrentComment() {
    editComment(currentIndex); // Reutilizamos la función existente
}

// Función para eliminar el desvío de la imagen actual
function deleteCurrentComment() {
    deleteComment(currentIndex); // Llamar a la función deleteComment con el índice actual
}

function updateCommentsList() {
    const commentItems = comments
        .map((comment, index) => {
            if (comment.length > 0) {
                return `
                            <div class="comment-item">
                                <strong>${filenames[index]}:</strong> ${comment.join(" ")}
                                <div>
                                    <button class="edit-btn" onclick="editComment(${index})">Editar</button>
                                    <button class="delete-btn" onclick="deleteComment(${index})">Eliminar</button>
                                </div>
                            </div>
                        `;
            }
            return '';
        })
        .filter(item => item !== '')
        .join('');

    commentsList.innerHTML = commentItems || "<p>No hay desvíos aún.</p>";
    updateImageCounter();
}

function editComment(index) {
    currentIndex = index;
    updateCarousel();

    // Desplazar la página al carrusel
    const carouselElement = document.getElementById('carousel');
    if (carouselElement) {
        carouselElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Desplazar al slide específico
    const slideElement = document.getElementById(`slide-${index}`);
    if (slideElement) {
        slideElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Restaurar el botón a su estado original
    const saveButton = document.querySelector('.comment-btn');
    saveButton.textContent = "Guardar Desvíos";
    saveButton.style.backgroundColor = "#004aad"; // Color original
    saveButton.disabled = false; // Habilitar el botón

    // Habilitar los controles y marcar los checkboxes correspondientes
    const checkboxes = document.querySelectorAll('#deviation-options input');
    checkboxes.forEach(checkbox => (checkbox.checked = false));
    comments[index].forEach(deviation => {
        const checkbox = Array.from(checkboxes).find(cb => cb.value === deviation);
        if (checkbox) checkbox.checked = true;
    });
    enableControls(); // Habilitar controles al editar
}

function deleteComment(index) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esta acción!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Eliminar el desvío de la imagen
            comments[index] = [];

            // Si la imagen eliminada es la que se está mostrando en el carrusel
            if (index === currentIndex) {
                // Restablecer los checkboxes
                resetCheckboxes();

                // Restablecer el botón "Guardar Desvíos"
                const saveButton = document.querySelector('.comment-btn');
                saveButton.textContent = "Guardar Desvíos";
                saveButton.style.backgroundColor = "#004aad"; // Color original
                saveButton.disabled = false; // Habilitar el botón

                // Ocultar los botones de Editar y Eliminar
                toggleEditDeleteButtons(false);

                // Habilitar los checkboxes
                enableControls();
            }

            // Actualizar la lista de comentarios y el contador de imágenes
            updateCommentsList();
            updateImageCounter();

            // Mostrar mensaje de éxito
            Swal.fire({
                icon: 'success',
                title: 'Desvío eliminado',
                text: 'El desvío se ha eliminado correctamente.',
                confirmButtonText: 'Aceptar',
                timer: 750,
                timerProgressBar: true,
            });
        }
    });
}

function exportToExcel() {
    const commentData = comments
        .map((comment, index) => {
            if (comment.length > 0) {
                return {
                    "Imagen": filenames[index],
                    "Comentario": comment.join(" ")
                };
            }
            return null;
        })
        .filter(item => item !== null);

    if (commentData.length === 0) {
        alert("No hay desvíos para exportar.");
        return;
    }

    const ws = XLSX.utils.json_to_sheet(commentData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Comentarios");
    XLSX.writeFile(wb, "Comentarios_desvios.xlsx");
}

// Inicialización: No deshabilitar nada al inicio
document.addEventListener('DOMContentLoaded', () => {
    enableControls(); // Asegurarse de que todo esté habilitado al cargar la página
});

function downloadPhotosWithDeviation() {
    const zip = new JSZip();
    const folderName = folderNameInput.value.trim() || "Fotos_con_desvio";
    const imagesWithComments = files.filter((_, index) => Array.isArray(comments[index]) && comments[index].length > 0);

    if (imagesWithComments.length === 0) {
        alert("No hay imágenes con desvíos para descargar.");
        return;
    }

    imagesWithComments.forEach((file) => {
        const originalName = filenames[files.indexOf(file)];
        zip.file(originalName, file);
    });

    zip.generateAsync({ type: "blob" }).then(function (content) {
        saveAs(content, `${folderName}.zip`);
    });
}

function downloadPhotosWithoutDeviation() {
    const zip = new JSZip();
    const folderName = folderNameInput.value.trim() || "Fotos_sin_desvio";
    const imagesWithoutComments = files.filter((_, index) => Array.isArray(comments[index]) && comments[index].length === 0);

    if (imagesWithoutComments.length === 0) {
        alert("No hay imágenes sin desvíos para descargar.");
        return;
    }

    imagesWithoutComments.forEach((file) => {
        const originalName = filenames[files.indexOf(file)];
        zip.file(originalName, file);
    });

    zip.generateAsync({ type: "blob" }).then(function (content) {
        saveAs(content, `${folderName}.zip`);
    });
}
