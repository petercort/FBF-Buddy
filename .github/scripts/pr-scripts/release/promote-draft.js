module.exports = async ({github, context, core}) => {
    const { owner, repo } = context.repo;
    const { number: issue_number } = context.issue;
    const {data: allComments} = await github.rest.issues.listComments({ issue_number, owner, repo });
    const ourComments = allComments
      .filter(comment => comment.user.login === 'github-actions[bot]')
      .filter(comment => comment.body.startsWith('Created Draft'));
  
    const latestComment = ourComments.slice(-1)[0];
    var releaseID = latestComment.body.substring(    
      latestComment.body.indexOf("`") + 1, 
      latestComment.body.lastIndexOf("`")
    );
    core.exportVariable('releaseID', releaseID);
    var tag = latestComment.body.substring(    
      latestComment.body.indexOf("**") + 2, 
      latestComment.body.lastIndexOf("**")
    );
  
    const {data: lastRelease} = await github.rest.repos.updateRelease({
      owner: owner,
      repo: repo,
      release_id: releaseID,
      tag_name: tag,
      draft: false,
      make_latest: true,
      target_commitish: context.sha });
    return lastRelease;
  }