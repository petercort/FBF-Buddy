export default async ({github, context, core}) => {
    const { releaseversion, changelog } = process.env;
    const { owner, repo } = context.repo;
    const { number: issue_number } = context.issue;
          
    const {data: allComments} = await github.rest.issues.listComments({ issue_number, owner, repo });
    const ourComments = allComments
      .filter(comment => comment.user.login === 'github-actions[bot]')
      .filter(comment => comment.body.startsWith('Created Draft'));
    
    const latestComment = ourComments.slice(-1)[0];
  
    if (latestComment) {
      var releaseID = latestComment.body.substring(    
        latestComment.body.indexOf("`") + 1, 
        latestComment.body.lastIndexOf("`")
      );
      console.log(`Draft Release exists, checking if changes to existing release ID \`${releaseID}\`.`);
      const {data: lastRelease} = await github.rest.repos.getRelease({
        owner: owner,
        repo: repo,
        release_id: releaseID });
      if (lastRelease.body == changelog && lastRelease.name == releaseversion){
          console.log('No changes to the release version or notes of existing release', lastRelease.name, 'with release ID ', releaseID);
          return;
      };
      console.log('Found changes to changelog, deleting existing release ID ', releaseID);
      const {response} = await github.rest.repos.deleteRelease({
        owner: owner,
        repo: repo,
        release_id: releaseID });
    };
  
    const {data: newRelease}  = await github.rest.repos.createRelease({
      draft: true,
      generate_release_notes: false,
      name: releaseversion,
      owner: owner,
      prerelease: false,
      repo: repo,
      tag_name: releaseversion,
      body: changelog });
  
    console.log('Created release id', newRelease.id);
    let finalBody =`Created Draft Release **${newRelease.name}** with ID \`${newRelease.id}\``;
    const {data: newComment} = await github.rest.issues.createComment({ issue_number, owner, repo, body: finalBody });
    console.log('Posted comment', newComment.id, '@', newComment.html_url);
    // Delete all our previous comments
    for (const comment of ourComments) {
      if (comment.id === newComment.id) continue;
      console.log('Deleting previous PR comment from', comment.created_at);
      await github.rest.issues.deleteComment({ comment_id: comment.id, owner, repo });
    }
  }