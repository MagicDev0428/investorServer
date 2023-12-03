module.exports.pingenerator = () => {
  // Generating pin between 10 to 99
  const randomPin = Math.floor(Math.random() * (99 - 10 + 1)) + 10;

  return `${randomPin}${randomPin}`;
};
