module.exports = async ({github, context, core}) => {
    const { owner, repo } = context.repo;
    const { number: issue_number } = context.issue;
  
    const body = context.payload.pull_request.body;
    const releaseTypes = ["major", "minor", "patch", "transition", "no release"];
    const changeTypes = ["feature", "enhancement", "fix", "bugfix", "chore"];
  
    const releaseMap = {
      'major': 'semver:major',
      'minor': 'semver:minor',
      'patch': 'semver:patch',
      'transition': 'transition',
      'no release': 'no-release',
    };
    const changeMap = {
      'feature': 'feature',
      'enhancement': 'enhancement',
      'bugfix': 'bugfix',
      'fix': 'bugfix',
      'chore': 'chore',
    };
  
    const failedChecks = [];
  
    const releaseTypeSection = body.split('## What type of Release is this?')[1]?.split('##')[0]?.trim();
    if (!releaseTypeSection) {
      failedChecks.push("No release type section found, please ensure you have updated your pull request with the correct release type.");
    }
  
    const changeTypeSection = body.split('## What type of change was made?')[1]?.split('##')[0]?.trim();
    if (!changeTypeSection) {
      failedChecks.push("No change type section found, please ensure you have updated your pull request with the correct change type.");
    }
  
    // Find all matches
    const releaseMatch = releaseTypes.filter(type => new RegExp(`^-\\s*${type}`, 'mi').test(releaseTypeSection));
    console.log('Matched Release Types:', releaseMatch);
    const changeMatch = changeTypes.filter(type => new RegExp(`^-\\s*${type}`, 'mi').test(changeTypeSection));
    console.log('Matched Change Types:', changeMatch);
  
    if (releaseMatch.length > 1) {
      failedChecks.push(`Pull request must have exactly one release label, found ${releaseMatch.join(', ')}.`);
    }
  
    if (changeMatch.length > 1) {
      failedChecks.push(`Pull request must have exactly one change label, found ${changeMatch.join(', ')}.`);
    }
  
    // Define releaseLabel using releaseMap
    const releaseLabel = releaseMatch.length === 1 ? releaseMap[releaseMatch[0]] : null;
    const changeLabel = changeMatch.length === 1 ? changeMap[changeMatch[0]] : null;
  
    const labelsToAdd = [
      releaseLabel,
      changeLabel
    ].filter(Boolean);

  
    if (failedChecks.length > 0) {
      const commentBody = `### Label Check Failures\n\n${failedChecks.map(check => `- ${check}`).join('\n')}`;
      const { data: allComments } = await github.rest.issues.listComments({ issue_number, owner, repo });
      const existingComment = allComments.find(comment => comment.user.login === 'github-actions[bot]' && comment.body.startsWith('### Label Check Failures'));
  
      if (existingComment) {
        await github.rest.issues.updateComment({
          owner,
          repo,
          comment_id: existingComment.id,
          body: commentBody
        });
      } else {
        await github.rest.issues.createComment({
          owner,
          repo,
          issue_number,
          body: commentBody
        });
      }
      core.setFailed("Label checks failed. See the comment for details.");
      return;
    }
  
    const currentLabels = (await github.rest.issues.listLabelsOnIssue({
      owner,
      repo,
      issue_number
    })).data.map(label => label.name);
  
    const labelsToRemove = [...Object.values(releaseMap), ...Object.values(changeMap),].filter(label => currentLabels.includes(label) && !labelsToAdd.includes(label));
  
    for (const label of labelsToRemove) {
      await github.rest.issues.removeLabel({
        owner,
        repo,
        issue_number,
        name: label
      });
    }
    console.log('Adding labels:', labelsToAdd);
    await github.rest.issues.addLabels({
      owner,
      repo,
      issue_number,
      labels: labelsToAdd
    });
  
    core.setOutput('release-type', releaseLabel);
    core.setOutput('change-type', changeLabel);
  }