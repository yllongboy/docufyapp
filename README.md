# Docufy App
Docufy app is a mobile and web application that allows users to upload files to Docufy Web application. It performs encryption of the file using `cryptojs` before the file is uploaded. Uploaded files are stored in Firebase Storage.

> Disclaimer: For this task, Only web was tested before commiting the code. :) You might encounter missing libraries if running android or ios. The original source is in bitbucket and it's integrated in the pipeline. No CI/CD pipeline is integrated in this task.
> You also have to add firebase config in .env file. Please refer to `https://firebase.google.com/docs/web/setup`

## Prerequisites
* expo - `npm install -g expo-cli`
* yarn - `npm install -g yarn`

## Running the Project
- `git clone https://github.com/yllongboy/docufyapp.git`
- `cd docufyapp`
- `yarn install`
- `yarn start`

after executing above, you will see a console log. Choose what platform you want. 

› Web is waiting on http://localhost:19006

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu

› Press ? │ show all commands

## Screenshots
![Alt text](https://github.com/yllongboy/docufyapp/blob/main/screenshots/Screenshot%202023-06-08%20at%2010.47.10%20PM.png?raw=true "Home Screen")
![Alt text]([screenshots/Screenshot 2023-06-08 at 10.47.56 PM.png?raw=true](https://github.com/yllongboy/docufyapp/blob/main/screenshots/Screenshot%202023-06-08%20at%2010.47.56%20PM.png?raw=true) "Detail Screen")
![Alt text](/screenshots/Screenshot%202023-06-08%20at%2010.47.56%20PM.png?raw=true "Upload Screen")


