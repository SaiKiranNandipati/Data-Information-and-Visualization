
let currentData = null;


function loadDataFromFile() {
    return fetch('./data/directory_tree.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error loading JSON file:', error);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    loadDataFromFile()
        .then(data => {
            currentData = data;
            drawTree(data);
            // console.log('Original data loaded:', data);
        })
        .catch(error => {
            console.error('Error loading data from file:', error);
        });
});