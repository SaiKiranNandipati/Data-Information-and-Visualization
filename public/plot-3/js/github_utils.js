const repoOwnerInput = document.getElementById('owner');
const repoNameInput = document.getElementById('repo');
const fetchButton = document.getElementById('fetchButton');
const saveButton = document.getElementById('saveButton');
const loadingIndicator = document.getElementById('loadingIndicator');


function makeRequest(owner, name) {
    let url = `/fetchData?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(name)}`;

    loadingIndicator.style.display = 'block';
    console.log('loading...');
    return new Promise((resolve, reject) => {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(jsonData => {
                loadingIndicator.style.display = 'none';
                currentData = jsonData;
                console.log('setting current data', currentData);
                // clear the plot
                d3.select('#tidy-tree').selectAll("*").remove();
                // redraw the plot
                drawTree(jsonData);
                // Resolve the promise without passing any data
                resolve(); 
            })
            .catch(error => {
                loadingIndicator.style.display = 'none';
                reject(error);
            });
    });
}

function saveDataToFile(data) {
    const jsonData = JSON.stringify(data);

    fetch('/saveData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: jsonData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        console.log('Data saved successfully');
    })
    .catch(error => {
        console.error('Error saving data:', error);
    });
}

fetchButton.addEventListener('click', () => {
    const owner = repoOwnerInput.value || repoOwner;
    const name = repoNameInput.value || repoName;
    makeRequest(owner, name)
        .then(() => {
            console.log("finished");
        })
        .catch(error => {
            console.error('Error occurred:', error);
        });
});

saveButton.addEventListener('click', () => {
    if (confirm("Are you sure you want to save the new data? This will replace the default structure being displayed.")) {
        if (currentData !== null) {
            console.log('sending current data', currentData);
            saveDataToFile(currentData);
        } else {
            console.error('No data to save.');
        }
    }
});

