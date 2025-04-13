export default async ({core}) => {
    const { PREV_VERSION, RELEASE_TYPE } = process.env;
    console.log('Previous version was', PREV_VERSION);
    console.log('Release type is', RELEASE_TYPE);
    const numbers = PREV_VERSION.split('.');
    const numberIdx = ['semver:major', 'semver:minor', 'semver:patch'].indexOf(RELEASE_TYPE);
    numbers[numberIdx] = parseInt(numbers[numberIdx]) + 1;
    for (let i = numberIdx + 1; i < numbers.length; i++) {
    numbers[i] = 0;
    }
    core.setOutput("new-version", numbers.join('.'));
    return numbers.join('.');
}
