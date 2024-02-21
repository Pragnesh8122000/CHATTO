const crypto = require('crypto');
const util = require('util');
const randomBytesAsync = util.promisify(crypto.randomBytes);


exports.generateUserCode = async () => {
  const length = 6;
  const charset = "abcdefghijklmnopqrstuvwxyz0123456789";

  let userCode = "";

  const buffer = await randomBytesAsync(length);

  for (let i = 0; i < length; i++) {
    userCode += charset[buffer[i] % charset.length]; 
  }
  return userCode;
};