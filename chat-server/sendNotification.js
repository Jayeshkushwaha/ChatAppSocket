// sendNotification.js

const admin = require('firebase-admin');
const fs = require('fs');

// Load your service account key
const serviceAccount = require('./basecode-reactnative-bf403-firebase-adminsdk-fbsvc-ae4139061b.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Define the message
const message = {
  token: 'cQgYW1O_SzKGG99afLQy70:APA91bGJuA-SHM8nHJbGXEKImFeyrjBBO0FE86lFWRMdWVVKxF7oP5JLPGD96HzdrSBvyCTQzO3s7Z0XNany8tQsEZKvcfNlxdM79SjWjX-cKEUYRelmJFo', // Replace with your device's token
  notification: {
    title: 'Hello!',
    body: 'This is a test notification using FCM v1 API',
  },
  data: {
    customKey1: 'value1',
    customKey2: 'value2',
  }
};

// Send the message
admin.messaging().send(message)
  .then((response) => {
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.error('Error sending message:', error);
  });
