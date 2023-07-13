const apiUrl =
  process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_LOCAL_apiUrl || 'http://localhost:5000'
    : process.env.REACT_APP_apiUrl;

export const SignInApi = `${apiUrl}/api/users/login`;
export const baseLocalApi = `${apiUrl}/api`;
export const SignUpAPI = `${apiUrl}/api/users`;
export const baseApi = apiUrl;

export const validateFormData = formData => {
  const allowedStartDigit = ['9', '8', '7', '6'];
  if (!(formData.mobile.length === 10 || formData.mobile.length === 13)) {
    return false;
  }
  let startIndex = 0;
  if (formData.mobile.substr(0, 3) === '+91') {
    startIndex = 3;
  }
  if (!allowedStartDigit.includes(formData.mobile[startIndex])) {
    return false;
  }
  for (let i = startIndex; i < formData.mobile.length; i += 1) {
    if (formData.mobile[i] < '0' || formData.mobile[i] > '9') {
      return false;
    }
  }
  return true;
};
