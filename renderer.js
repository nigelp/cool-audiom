const { ipcRenderer } = require('electron/renderer');
const fs = require('fs');
const path = require('path');

let targetFiles = [null];
let referenceFile = null;

function createTargetTrack() {
    const trackDiv = document.createElement('div');
    trackDiv.className = 'target-track';
    
    const selectButton = document.createElement('button');
    selectButton.className = 'selectTarget';
    selectButton.textContent = 'Select Target File';
    
    const pathText = document.createElement('p');
    pathText.className = 'targetPath';
    pathText.textContent = 'No file selected';
    
    trackDiv.appendChild(selectButton);
    trackDiv.appendChild(pathText);
    
    const index = targetFiles.length;
    targetFiles.push(null);
    
    selectButton.addEventListener('click', async () => {
        const filePath = await ipcRenderer.invoke('select-file', 'target');
        if (filePath) {
            targetFiles[index] = filePath;
            pathText.textContent = filePath;
            updateProcessButton();
        }
    });
    
    return trackDiv;
}

document.getElementById('addTrackButton').addEventListener('click', () => {
    const targetTracks = document.getElementById('targetTracks');
    targetTracks.appendChild(createTargetTrack());
});

// Initialize first target track button
document.querySelector('.selectTarget').addEventListener('click', async () => {
    const filePath = await ipcRenderer.invoke('select-file', 'target');
    if (filePath) {
        targetFiles[0] = filePath;
        document.querySelector('.targetPath').textContent = filePath;
        updateProcessButton();
    }
});

document.getElementById('selectReference').addEventListener('click', async () => {
    const filePath = await ipcRenderer.invoke('select-file', 'reference');
    if (filePath) {
        const folderPath = path.dirname(filePath);
        localStorage.setItem('lastReferenceFolder', folderPath);
        referenceFile = filePath;
        document.getElementById('referencePath').textContent = filePath;
        
        // Create mastered folder if it doesn't exist
        const masteredFolder = path.join(process.cwd(), 'mastered');
        if (!fs.existsSync(masteredFolder))
            fs.mkdirSync(masteredFolder);
        updateProcessButton();
    }
});

document.getElementById('processButton').addEventListener('click', async () => {
    const validTargetFiles = targetFiles.filter(file => file !== null);
    if (validTargetFiles.length === 0 || !referenceFile) return;

    const processButton = document.getElementById('processButton');
    const progressBar = document.getElementById('progress');
    const status = document.getElementById('status');
    const resultLink = document.getElementById('resultLink');

    processButton.disabled = true;
    progressBar.style.display = 'block';
    status.textContent = 'Processing...';
    resultLink.style.display = 'none';

    try {
        let successCount = 0;
        for (let i = 0; i < validTargetFiles.length; i++) {
            status.textContent = `Processing file ${i + 1} of ${validTargetFiles.length}...`;
            const originalName = validTargetFiles[i].split(/[\\\/]/).pop().split('.')[0];
            const outputFile = path.join('mastered', `${originalName}_ma.wav`);
            const result = await ipcRenderer.invoke('process-audio', {
                targetFile: validTargetFiles[i],
                referenceFile,
                outputFile
            });

            if (result.includes('success')) {
                successCount++;
            } else if (result.includes('error')) {
                throw new Error(`Error processing file ${i + 1}: ${result.split('error:')[1].trim()}`);
            }
        }

        status.textContent = `Processing completed! ${successCount} files processed.`;
        resultLink.style.display = 'block';
        document.getElementById('downloadLink').onclick = () => ipcRenderer.invoke('open-folder', path.join(process.cwd(), 'mastered'));
        document.getElementById('folderLink').onclick = () => ipcRenderer.invoke('open-folder', path.join(process.cwd(), 'mastered'));
    } catch (error) {
        status.textContent = 'Error: ' + error.message;
        resultLink.style.display = 'none';
    } finally {
        processButton.disabled = false;
        progressBar.style.display = 'none';
        document.querySelector('.progress-fill').style.width = '0%';
    }
});

function updateProcessButton() {
    const processButton = document.getElementById('processButton');
    const hasValidTarget = targetFiles.some(file => file !== null);
    processButton.disabled = !(hasValidTarget && referenceFile);
}

// Load last reference folder on startup
window.addEventListener('DOMContentLoaded', () => {
    const lastReferenceFolder = localStorage.getItem('lastReferenceFolder');
    if (lastReferenceFolder) {
        document.getElementById('referencePath').textContent = 
            'Last used folder: ' + lastReferenceFolder + 
            '\nClick to select a new reference file';
    }
});