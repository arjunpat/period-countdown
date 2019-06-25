module.exports = {
  success(data = {}) {
    return {
      success: true,
      data
    }
  },
  error(error = 404) {
    return {
      success: false,
      error
    }
  }
}