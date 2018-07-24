const rp = require('request-promise-native');

function doRequestProblems() {
  URI = 'https://leetcode-cn.com/api/problems/all/'
  return rp({
    url: URI,
    json: true
  }).then(function (json) {
    let problems = []
    json.stat_status_pairs.forEach(element => {
      problems.push({
        id: element.stat.frontend_question_id,
        _id: element.stat.question_id,
        name: element.stat.question__title,
        _name: element.stat.question__title_slug,
        numberOfSubmitted: element.stat.total_submitted,
        numberOfAccepted: element.stat.total_acs,
        difficulty: element.difficulty.level
      })
    })
    problems.sort((problem1, problem2) => {
      if (problem1.id > problem2.id) { return 1 }
      else if ( problem1.id === problem2.id) { return 0 }
      else { return -1 }
    })
    return problems
  })
}

function doRequestProblem(name) {
  const URI = `https://leetcode-cn.com/problems/${name}/description/`
  return rp(URI).then(string => {
    let problem = string.match(/<meta name="description" content="((?:.|\n)*?)" \/>/)[1]
    return problem
  })
}

module.exports = {
  requestProblems: doRequestProblems,
  requestProblem: function(name) {
    return doRequestProblem(name)
  }
}
