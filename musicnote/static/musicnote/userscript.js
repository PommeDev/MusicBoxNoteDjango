window.addEventListener('load', function() {
    document.getElementById('loader').style.display = 'none';
});



async function fetchData() {
    const loader = document.getElementById('loader');
    loader.style.display = 'flex'; // montre le loader

    try {
        const response = await fetch('/musicnote/search/?q=test');
        const data = await response.json();
        // traiter les données
    } catch(e) {
        console.error(e);
    } finally {
        loader.style.display = 'none'; // cache le loader
    }
}
