export default ({core}) => {
    const { PREV_VERSION, RELEASE_TYPE, PROVIDER_VERSION, PRERELEASE_TYPE } = process.env;
    console.log('Previous version was', PREV_VERSION);
    console.log('Release type is', RELEASE_TYPE);
    console.log('Pre-Release type is', PRERELEASE_TYPE);
    if (PROVIDER_VERSION!="" && PREV_VERSION=="0.0.0") {
      console.log('Provider Version is',PROVIDER_VERSION);
      const preRelease = PROVIDER_VERSION + "-" + PRERELEASE_TYPE;
      core.setOutput("newversion", preRelease);
      return preRelease;
    } else if (RELEASE_TYPE=='transition'){
      const numbers = PREV_VERSION.split('.');
      const numberIdx = ['semver:major', 'transition', 'semver:patch'].indexOf(RELEASE_TYPE);
      numbers[numberIdx] = '100' ;
      for (let i = numberIdx + 1; i < numbers.length; i++) {
        numbers[i] = 0;
      }
      const preRelease = numbers.join('.') + "-" + PRERELEASE_TYPE +'.0';
      core.setOutput("newversion", preRelease);
      return preRelease;
    } else {
      const numbers = PREV_VERSION.split('.');
      const numberIdx = ['semver:major', 'semver:minor', 'prerelease', 'semver:patch'].indexOf(RELEASE_TYPE);
      if (RELEASE_TYPE == 'semver:major') {
        numbers[numberIdx] = parseInt(numbers[numberIdx]) + 1;
        const preRelease = numbers[numberIdx] + '.0.0-'+PRERELEASE_TYPE +'.0';
        core.setOutput("newversion", preRelease);
        return preRelease;
      } else if (RELEASE_TYPE == 'semver:patch') {
        const preReleaseType = numbers[2].split('-');
        if (preReleaseType[1] == PRERELEASE_TYPE) {
          numbers[numberIdx] = parseInt(numbers[numberIdx]) + 1;
          const preRelease = numbers.join('.');
          core.setOutput("newversion", preRelease);
        } else {
          numbers[2] = '0-' + PRERELEASE_TYPE;
          numbers[numberIdx] = 0;
          const preRelease = numbers.join('.');
          core.setOutput("newversion", preRelease);
        }
  
      } else {
        console.log("Cannot create a Pre-Release type for a Minor version")
      }
    }
  
  }
  