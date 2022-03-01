// class ErrorMethod extends Error{
//     constructor(message){
//         super(message);
//         this.message = message;
//         this.name = this.constructor.name;
//         Error.captureStackTrace(this, this.constructor.name);
//     }
// }

// class FormError extends ErrorMethod{
//     constructor(message = '非JSON格式'){
//         super(message);
//         this.name = '格式錯誤';
//     }
// }

function ErrorMethod(message) {
    this.message = message;
    this.name = '格式錯誤'
}
module.exports = ErrorMethod;