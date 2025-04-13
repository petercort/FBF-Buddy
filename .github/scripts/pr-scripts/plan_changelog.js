export default async ({github, context, core}) => {
    const { owner, repo } = context.repo;
    const { data: prInfo } = await github.rest.pulls.get({
      owner, repo,
      pull_number: context.issue.number,
    });
    console.log('Found PR body:|');
    console.log(prInfo.body);
  
    const changelogEntry = ((prInfo.body
      .split(/^#+ ?/m)
      .find(x => x.startsWith('Changelog'))
      || '').split(/^```/m)[1] || '').trim();
    if (!changelogEntry)
      throw `'Changelog' section not found in PR body! Please add it back.`;
    if (changelogEntry.match(/^TODO:/m))
      throw `'Changelog' section needs proper text, instead of 'TODO'`;
    const changelog = `\r\n### Version ${process.env.releaseversion}\r\n\r\n#### ${process.env.changetype}\r\n* PR [#${ prInfo.number }](${ prInfo.html_url }) - ${ prInfo.title }\r\n\r\n\`\`\`\r\n${changelogEntry}\r\n\`\`\``;
    core.setOutput('changelog', changelog);
  }