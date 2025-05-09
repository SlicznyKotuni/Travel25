document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.gallery-image').forEach(img => {
        img.addEventListener('click', () => {
            const modal = document.createElement('div');
            modal.className = 'modal';
            const modalImg = document.createElement('img');
            modalImg.src = img.src;
            modal.appendChild(modalImg);
            document.body.appendChild(modal);

            modal.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        });
    });
});