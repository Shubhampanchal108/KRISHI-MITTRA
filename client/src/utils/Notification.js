import Toast from 'react-native-toast-message';

// Function to show success message
const successMsg = (text1, text2) => {
  Toast.show({
    type: 'success',
    text1: text1,
    text2: text2
  });
};

// Function to show error message
const errorMsg = (text1, text2) => {
  Toast.show({
    type: 'error',
    text1: text1,
    text2: text2
  });
};

// Function to show info message (e.g. user cancelled an action)
const infoMsg = (text1, text2) => {
  Toast.show({
    type: 'info',
    text1: text1,
    text2: text2
  });
};

export { successMsg, errorMsg, infoMsg };