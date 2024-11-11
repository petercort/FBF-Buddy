module.exports = ({github, context, core}) => {
    const { PREV_VERSION, RELEASE_TYPE, PROVIDER_VERSION } = process.env;
    console.log('Previous version was', PREV_VERSION);
    console.log('Release type is', RELEASE_TYPE);
    if (PROVIDER_VERSION!="" && PREV_VERSION=="0.0.0") {
      console.log('Provider Version is',PROVIDER_VERSION);
      core.setOutput("new-version", PROVIDER_VERSION);
      return PROVIDER_VERSION;
    } else {
      const numbers = PREV_VERSION.split('.');
      const numberIdx = ['semver:major', 'semver:minor', 'semver:patch'].indexOf(RELEASE_TYPE);
      numbers[numberIdx] = parseInt(numbers[numberIdx]) + 1;
      for (let i = numberIdx + 1; i < numbers.length; i++) {
        numbers[i] = 0;
      }
      core.setOutput("new-version", numbers.join('.'));
      return numbers.join('.');
    }
  }