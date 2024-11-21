const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.handle('select-file', async (event, type) => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Audio Files', extensions: ['wav', 'mp3'] }
        ]
    });
    return result.filePaths[0];
});

ipcMain.handle('process-audio', async (event, { targetFile, referenceFile, outputFile }) => {
    return new Promise((resolve, reject) => {
        const pythonScript = `
import matchering as mg
import sys

try:
    mg.process(
        target=sys.argv[1],
        reference=sys.argv[2],
        results=[
            mg.pcm16(sys.argv[3])
        ]
    )
    print("success")
except Exception as e:
    print(f"error: {str(e)}")
`;
        const pythonProcess = spawn('python', ['-c', pythonScript, targetFile, referenceFile, outputFile || 'result.wav']);
        
        pythonProcess.stdout.on('data', (data) => {
            const output = data.toString().trim();
            resolve(output);
        });
        
        pythonProcess.stderr.on('data', (data) => reject(data.toString()));
    });
});

ipcMain.handle('open-folder', async (event, folderPath) => {
    await shell.openPath(folderPath);
    return true;
});