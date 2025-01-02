document.addEventListener('DOMContentLoaded', function() {
    showThankYouScreen();
    setTimeout(function() {
        window.location.href = '../index.html'; // Redireciona de volta para a tela principal
    }, 5000); // Redireciona após 5 segundos
});

function showThankYouScreen() {
    const thankYouScreen = document.getElementById('thank-you-screen');
    thankYouScreen.style.display = 'flex';
}
