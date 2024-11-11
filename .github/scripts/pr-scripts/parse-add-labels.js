module.exports = async ({github, context, core}) => {
    const { owner, repo } = context.repo;
    const { number: issue_number } = context.issue;
  
    const body = context.payload.pull_request.body;
    const releaseTypes = ["major", "minor", "patch", "transition", "no release"];
    const changeTypes = ["feature", "enhancement", "fix", "bugfix", "chore"];
    const qualityTypes = ["alpha", "beta"];
  
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
  
    const providerVersionSection = body.split('### (If Applicable) Specify Initial Provider Version')[1]?.split('###')[0]?.trim();
  
    const changeTypeSection = body.split('## What type of change was made?')[1]?.split('##')[0]?.trim();
    if (!changeTypeSection) {
      failedChecks.push("No change type section found, please ensure you have updated your pull request with the correct change type.");
    }
    const qualityTypeSection = body.split('## What type of Pre-Release is this?')[1]?.split('##')[0]?.trim();
  
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
  
    const providerVersionLabel = "provider-version-specified";
    if (providerVersionSection) {
      const providerVersionMatch = providerVersionSection.match(/^- (N\/A|\d+\.\d+\.\d+)$/mi);
      console.log('Matched Provider Version:', providerVersionMatch[1]);
      if (providerVersionMatch) {
        if (providerVersionMatch && providerVersionMatch.length === 2) {
          const version = providerVersionMatch[1];
          if (version !== 'N/A') {
            labelsToAdd.push(providerVersionLabel);
            console.log('Adding provider version:', version);
            core.setOutput('provider-version', version);
          }
        } else {
          failedChecks.push("Provider version section must contain exactly one item, either a release version (e.g., 1.0.0) or N/A.");
        }
      }
    };
  
    if (qualityTypeSection){
      const qualityLabel = qualityTypes.filter(type => new RegExp(`^-\\s*${type}`, 'mi').test(qualityTypeSection));
      console.log('Matched Pre-release Types:', qualityLabel);
      if (qualityLabel.length > 1) {
        failedChecks.push(`Pull request must have exactly one quality label, found ${qualityLabel.join(', ')}.`);
      } else if (qualityLabel.length == 1) {
        labelsToAdd.push(qualityLabel[0]);
        core.setOutput('prerelease-type', qualityLabel);
      }
    };
  
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
  
    const labelsToRemove = [...Object.values(releaseMap), ...Object.values(changeMap), ...qualityTypes, ...providerVersionLabel].filter(label => currentLabels.includes(label) && !labelsToAdd.includes(label));
  
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