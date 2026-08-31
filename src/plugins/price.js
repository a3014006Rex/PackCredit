export default {
  install(app, options) {
    app.config.globalProperties.$price = function (val) {
      let regExp = new RegExp("(\\d{1,3})(?=(\\d{3})+(?:$|\\D))", "g");
      return val?.toString().replace(regExp, "$1,");
    };
  },
};
