

# Cool AudioM

A desktop application for batch audio mastering using reference tracks. Available in two versions - Cool AudioM Electron and Cool AudioM Python.

## Features

- Multiple audio file processing in one go
- Reference track-based mastering
- Easy-to-use interface
- Supports WAV and MP3 formats
- Results saved in high-quality WAV format

## Cool AudioM Electron

## Requirements

- Python with matchering package installed
- Windows operating system

## Installation

Download the latest installer from the Releases section and run `Cool AudioM Setup.exe`. The app will then use the installed matchering code to do the mastering of the track/s.

## Development Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Run the application:
```bash
npm start
```

## Building

To create a Windows installer:
```bash
npm run build
```
## Cool AudioM Python

This is a new standalone version that includes all necessary dependencies in one zip file. Just download the zip, extract it to your computer and click on the .exe file to start mastering your track/s. Unfortunately because of the Python UI limitations the standalone app is not as pretty as the Electron app, but they all have the same functionality and results. And of course the standalone version is easier to get going.

### Installation and Usage:

1. Download the Cool AudioM Python zip file from the Releases section.
2. Extract the zip file to a location of your choice.
3. Run the "Cool AudioM.exe" file inside the extracted folder.

No additional installation or setup is required.

## License

ISC
