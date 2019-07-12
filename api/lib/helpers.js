module.exports = {
  generateRequestIssues(arr) {
    let issues = {};

    for (let issue of arr) {
      issues[issue.param] = {
        value_sent: issue.value,
        issue: issue.msg
      }
    }

    return issues;
  }
}