
let temp = parseInt(document.getElementById("high-temp").innerHTML);
let speed = parseInt(document.getElementById("wind-speed").innerHTML);

let result = "N/A";

if (temp <= 50 && speed > 3) {
    let windChill = 35.74 + (0.6215 * temp)
    - (35.75 * Math.pow(speed, 0.16))
    + (0.4275 * temp * Math.pow(speed, 0.16));
    result = Math.round(windChill);;
}

document.getElementById("wind-chill").innerHTML = result;

console.log(result);