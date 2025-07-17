const validatePassword = (password) => {
    const minLength = /.{6,}/;
    const uppercase = /[A-Z]/;
    const lowercase = /[a-z]/;
    const digit = /[0-9]/;
    const specialChar = /[^A-Za-z0-9]/;
  
    if (!minLength.test(password)) return "Password must be at least 6 characters long, include at least one uppercase, lowercase, number and special character";
    if (!uppercase.test(password)) return "Password must include at least one uppercase letter.";
    if (!lowercase.test(password)) return "Password must include at least one lowercase letter.";
    if (!digit.test(password)) return "Password must include at least one number.";
    if (!specialChar.test(password)) return "Password must include at least one special character.";
  
    return null; // Valid password
  };
  

  export default validatePassword;



  export const validateIndianMobile = (number) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(number)) return "Not a valid mobile number.";    
    return null;
  };
  