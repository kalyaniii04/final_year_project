// Dummy sendOTP function - not used for verifier authentication
export const sendOTP = async (email) => {
  // This function is not used in verifier authentication
  // It's only used for issuer login flow
  console.log(`OTP would be sent to ${email}`);
};