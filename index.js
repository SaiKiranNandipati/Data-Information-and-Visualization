const express = require('express'); //add the path for express module
const path = require('path'); //add the path here
const app = express();

// git hub api utility functions to fetch and save data
const axios = require('axios');
const fs = require('fs');
const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.get('/fetchData', async (req, res) => {
    try {
        const repoOwner = req.query.owner;
        const repoName = req.query.repo;
        
        let jsonData = {
            name: repoName,
            children: []
        };
        // Process the data and create the desired JSON structure
        await processDirectory(jsonData.children, await repoOwner, repoName, '');
        
        res.json(jsonData);

    } catch (error) {
        console.error('Error fetching data from GitHub API:', error.message);
        res.status(500).json({ error: 'An error occurred while fetching data from GitHub API' });
    }
});


async function processDirectory(parent, repoOwner, repoName, basePath) {
    let data = await makeRequest(repoOwner, repoName, basePath);
    // Iterate through each item in the directory
    for (let item of data) {
        let childNode = { name: item.name };
        
        // If item is a directory, recursively process its contents
        if (item.type === 'dir') {
            childNode.children = []
            await processDirectory(childNode.children, repoOwner, repoName, basePath + item.name + '/');
        }
        parent.push(childNode);
    }
    return parent;
}

async function makeRequest(owner, name, path) {
    const accessToken = ''; // give the github acess token here
    const apiUrl = `https://api.github.com/repos/${owner}/${name}/contents/${path}`;
    
    const headers = {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
    };

    console.log('fetching ', apiUrl);
    const response = await axios.get(apiUrl, { headers });
    return response.data;
}


app.post('/saveData', (req, res) => {
    const jsonData = req.body;

    console.log('received json ', jsonData);
    if (!jsonData) {
        console.error('No data received');
        return res.status(400).send('No data received');
    }

    // Convert JSON data to string
    const jsonString = JSON.stringify(jsonData);

    // Write data to a file
    fs.writeFile('./public/plot-2/data/directory_tree.json', jsonString, 'utf8', (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            res.status(500).send('Error saving data');
        } else {
            console.log('Data saved successfully');
            res.status(200).send('Data saved successfully');
        }
    });
});

app.use(express.static('public'));

// Serve static files from the specified directory
app.use('/plot1', express.static(path.join(__dirname, './public/plot-1')));
app.use('/plot2', express.static(path.join(__dirname, './public/plot-2')));
app.use('/plot3', express.static(path.join(__dirname, './public/plot-3')));
app.use('/plot4', express.static(path.join(__dirname, './public/plot-4')));
app.use('/plot5', express.static(path.join(__dirname, './public/plot-5')));

// Start the server
app.listen(3000, () => console.log('Listening at port 3000'));
