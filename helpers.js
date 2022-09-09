const findUserByEmail = (givenEmail, database) => {
  for (let user in database) {
    if (database[user].email === givenEmail) {
      return user;
    }
  }
};

const generateRandomString = (stringLength) => {
  return (Math.random().toString(36).slice(2, stringLength + 2));
};

module.exports = {
  findUserByEmail,
  generateRandomString,
}