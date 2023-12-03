//
// Show instead of console.log cause its much easier to debug!
//
global.show = (myVariable) => {
  if (global.isLIVE) {
    return;
  }
  if (!myVariable && typeof myVariable != "object") {
    console.log(myVariable);
    return;
  }
  var front = "";
  var back = "";
  for (var key in myVariable) {
    if (myVariable.hasOwnProperty(key)) {
      front = key + ": ";
      back = myVariable[key];
      break;
    }
  }
  if (back > 1400000000 && back < 1700000000) {
    var theDate = new Date(back * 1000);
    var myDateString =
      ("0" + theDate.getDate()).slice(-2) +
      "-" +
      ("0" + (theDate.getMonth() + 1)).slice(-2) +
      "-" +
      theDate.getFullYear() +
      " " +
      ("0" + theDate.getHours()).slice(-2) +
      ":" +
      ("0" + theDate.getMinutes()).slice(-2);
    console.log(front + myDateString + " (unix)");
    return;
  }
  if (typeof back.getMonth === "function") {
    var myDateString =
      ("0" + back.getDate()).slice(-2) +
      "-" +
      ("0" + (back.getMonth() + 1)).slice(-2) +
      "-" +
      back.getFullYear() +
      " " +
      ("0" + back.getHours()).slice(-2) +
      ":" +
      ("0" + back.getMinutes()).slice(-2);
    return;
  }
  if (back instanceof Object) {
    console.log(front + JSON.stringify(back, null, 4) + " (obj)");
    return;
  }
  if (typeof back == "string") {
    console.log(myVariable + " (str)");
    return;
  }
  if (typeof back == "number") {
    console.log(front + back + " (num)");
    return;
  }
  if (typeof back == "boolean") {
    console.log(front + back + " (bool)");
    return;
  }
  console.log(front + back);
};
