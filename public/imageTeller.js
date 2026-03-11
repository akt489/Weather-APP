const imageArea = document.querySelector('.imageArea');
const image = document.createElement('img');

export default function imageTeller(temp) {
  imageArea.innerHTML = "";
  temp = temp - 273.15;

  let source = "";

  if (temp <= 0) {
    source = "./image/snow.png";
  } else if (temp <= 5) {
    source = "./image/cloud.png";
  } else if (temp <= 15) {
    source = "./image/partial-cloud.png";
  } else if (temp <= 25) {
    source = "./image/little-sun.png";
  } else if (temp <= 30) {
    source = "./image/sun.png";
  } else {
    source = "#";
  }

  image.src = source;
  imageArea.append(image);
}