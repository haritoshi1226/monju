var formattedProblems = [];
learnjs.problems.forEach(function(problem){
    formattedProblems.push({
        code: learnjs.formatCode(problem.code),
        name: problem.name
    });
});
return formattedProblems;


return learnjs.problem.map(learnjs.formatCode);

learnjs.problems.map(formatCode).sort(byName);

