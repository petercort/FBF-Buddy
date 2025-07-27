export default async ({github, context, core}) => {
    const { owner, repo } = context.repo;
    const { data: prInfo } = await github.rest.pulls.get({
      owner, repo,
      pull_number: context.issue.number,
    });
    console.log('Found PR body:|');
    console.log(prInfo.body);

    let changelogEntry;

    if (prInfo.user.login === 'dependabot[bot]') {
      // Handle dependabot PR structure
      const releaseNotesMatch = prInfo.body.match(/<summary>Release notes<\/summary>[\s\S]*?<blockquote>([\s\S]*?)<\/blockquote>/);
      if (releaseNotesMatch) {
        changelogEntry = releaseNotesMatch[1].trim();
      } else {
        throw `'Release notes' section not found in dependabot PR body!`;
      }
    } else {
      // Handle regular PR structure
      changelogEntry = ((prInfo.body
        .split(/^#+ ?/m)
        .find(x => x.startsWith('Changelog'))
        || '').split(/^```/m)[1] || '').trim();
      if (!changelogEntry)
        throw `'Changelog' section not found in PR body! Please add it back.`;
      if (changelogEntry.match(/^TODO:/m))
        throw `'Changelog' section needs proper text, instead of 'TODO'`;
    }

    const changelog = `\r\n### Version ${process.env.releaseversion}\r\n\r\n#### ${process.env.changetype}\r\n* PR [#${ prInfo.number }](${ prInfo.html_url }) - ${ prInfo.title }\r\n\r\n\`\`\`\r\n${changelogEntry}\r\n\`\`\``;
    core.setOutput('changelog', changelog);
}

{/* 
  this is the dependabot PR structure for a release
  Parse the following format as well if the actor is dependabot
  <details>
<summary>Release notes</summary>
<p><em>Sourced from <a href="https://github.com/sindresorhus/globals/releases">globals's releases</a>.</em></p>
<blockquote>
<h2>v16.1.0</h2>
<ul>
<li>Update globals (<a href="https://redirect.github.com/sindresorhus/globals/issues/293">#293</a>)  5c58875</li>
</ul>
<hr />
<p><a href="https://github.com/sindresorhus/globals/compare/v16.0.0...v16.1.0">https://github.com/sindresorhus/globals/compare/v16.0.0...v16.1.0</a></p>
</blockquote>
</details> */}