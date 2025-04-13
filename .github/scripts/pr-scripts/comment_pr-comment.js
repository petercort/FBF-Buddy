module.exports = async ({github, context, core}) => {
    const { owner, repo } = context.repo;
    const { number: issue_number } = context.issue;
    const { readdir, readFile } = require('fs').promises;
    const utf8 = { encoding: 'utf-8' };
    const {previousVersion, releaseVersion, changelogContent} = process.env;
    const lines = [
      '# Release plan', '',
      '| Previous version | New version |',
      '|--|--|',
    ];
    const sections = [];
  
    lines.push('| '+[
      `${previousVersion}`,
      `**${releaseVersion}**`,
    ].join(' | ')+' |');
  
    sections.push(`<details><summary>Changelog preview: </summary>\n\n${changelogContent}\n</details>`);
  
    const finalBody = [lines.join('\n'), ...sections].join('\n\n');
  
    const {data: allComments} = await github.rest.issues.listComments({ issue_number, owner, repo });
    const ourComments = allComments
      .filter(comment => comment.user.login === 'github-actions[bot]')
      .filter(comment => comment.body.startsWith(lines[0]+'\n'));
  
    const latestComment = ourComments.slice(-1)[0];
  
    if (latestComment && latestComment.body === finalBody) {
      console.log('Existing comment is already up to date.'); 
      return;
    }
    const {data: newComment} = await github.rest.issues.createComment({ issue_number, owner, repo, body: finalBody });
    console.log('Posted comment', newComment.id, '@', newComment.html_url);
    // Delete all our previous comments
    for (const comment of ourComments) {
      if (comment.id === newComment.id) continue;
      console.log('Deleting previous PR comment from', comment.created_at);
      await github.rest.issues.deleteComment({ comment_id: comment.id, owner, repo });
    }
  }