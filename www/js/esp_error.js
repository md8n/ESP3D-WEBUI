
let espErrorCode = 0;
const esp_error_code = (value) => {
  if (typeof value === "number") {
    espErrorCode = value;
  }
  return espErrorCode;
}

let espErrorMessage = "";
const esp_error_message = (value) => {
  if (typeof value === "string") {
    espErrorMessage = value;
  }
  return espErrorMessage;
}

export { esp_error_code, esp_error_message };