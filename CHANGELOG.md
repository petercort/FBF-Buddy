# Changelog


### Version 0.0.0

#### semver:patch
* PR [#123](https://github.com/petercort/FBF-Buddy/pull/123) - Bump @eslint/js from 9.32.0 to 9.33.0

```
<h2>v9.33.0</h2>
<h2>Features</h2>
<ul>
<li><a href="https://github.com/eslint/eslint/commit/e07820e66fd1fceaf2620dc931154955a706cc0f"><code>e07820e</code></a> feat: add global object access detection to no-restricted-globals (<a href="https://github.com/eslint/eslint/tree/HEAD/packages/js/issues/19939">#19939</a>) (sethamus)</li>
<li><a href="https://github.com/eslint/eslint/commit/90b050ec11557cab08b6be9f05fabf97dba6a63d"><code>90b050e</code></a> feat: support explicit resource management in <code>one-var</code> (<a href="https://github.com/eslint/eslint/tree/HEAD/packages/js/issues/19941">#19941</a>) (Sweta Tanwar)</li>
</ul>
<h2>Bug Fixes</h2>
<ul>
<li><a href="https://github.com/eslint/eslint/commit/732433c4fb023f45154b825cdc8cdaf1979d4336"><code>732433c</code></a> fix: allow any type for <code>meta.docs.recommended</code> in custom rules (<a href="https://github.com/eslint/eslint/tree/HEAD/packages/js/issues/19995">#19995</a>) (Francesco Trotta)</li>
<li><a href="https://github.com/eslint/eslint/commit/e8a6914a249d036e12494004e586b2a2b6e104d1"><code>e8a6914</code></a> fix: Fixed potential bug in check-emfile-handling.js (<a href="https://github.com/eslint/eslint/tree/HEAD/packages/js/issues/19975">#19975</a>) (諏訪原慶斗)</li>
</ul>
<h2>Documentation</h2>
<ul>
<li><a href="https://github.com/eslint/eslint/commit/34f0723e2d0faf8ac8dc95ec56e6d181bd6b67f2"><code>34f0723</code></a> docs: playground button for TypeScript code example (<a href="https://github.com/eslint/eslint/tree/HEAD/packages/js/issues/19671">#19671</a>) (Tanuj Kanti)</li>
<li><a href="https://github.com/eslint/eslint/commit/dc942a47daf41228d69072c52f1be20789426862"><code>dc942a4</code></a> docs: Update README (GitHub Actions Bot)</li>
<li><a href="https://github.com/eslint/eslint/commit/5a4b6f74320b72f9b6ad8b30f5c463b2b71315af"><code>5a4b6f7</code></a> docs: Update no-multi-assign.md (<a href="https://github.com/eslint/eslint/tree/HEAD/packages/js/issues/19979">#19979</a>) (Yuki Takada (Yukinosuke Takada))</li>
<li><a href="https://github.com/eslint/eslint/commit/247e15698e34919a0cd411842fb3e14ac7a8f1ba"><code>247e156</code></a> docs: add missing let declarations in <code>no-plusplus</code> (<a href="https://github.com/eslint/eslint/tree/HEAD/packages/js/issues/19980">#19980</a>) (Yuki Takada (Yukinosuke Takada))</li>
<li><a href="https://github.com/eslint/eslint/commit/0d17242b3c25c2ddf8363f4560641acd1ae82ca9"><code>0d17242</code></a> docs: Update README (GitHub Actions Bot)</li>
<li><a href="https://github.com/eslint/eslint/commit/fa20b9db8ff90ea9f0527118114dda17c656d095"><code>fa20b9d</code></a> docs: Clarify when to open an issue for a PR (<a href="https://github.com/eslint/eslint/tree/HEAD/packages/js/issues/19974">#19974</a>) (Nicholas C. Zakas)</li>
</ul>
<h2>Build Related</h2>
<ul>
<li><a href="https://github.com/eslint/eslint/commit/27fa86551bd173387e29a139293de78b0e14f0f3"><code>27fa865</code></a> build: use <code>ESLint</code> class to generate formatter examples (<a href="https://github.com/eslint/eslint/tree/HEAD/packages/js/issues/19972">#19972</a>) (Milos Djermanovic)</li>
</ul>
<h2>Chores</h2>
<ul>
<li><a href="https://github.com/eslint/eslint/commit/425804602ecb9ee5f54d1c38a473cf20538420c5"><code>4258046</code></a> chore: update dependency <code>@​eslint/js</code> to v9.33.0 (<a href="https://github.com/eslint/eslint/tree/HEAD/packages/js/issues/19998">#19998</a>) (renovate[bot])</li>
<li><a href="https://github.com/eslint/eslint/commit/ad283717ed4764a171120ca7c6cba82a78fa024c"><code>ad28371</code></a> chore: package.json update for <code>@​eslint/js</code> release (Jenkins)</li>
<li><a href="https://github.com/eslint/eslint/commit/06a22f154c08ea044b3172b357b226d34dfefc6a"><code>06a22f1</code></a> test: resolve flakiness in --mcp flag test (<a href="https://github.com/eslint/eslint/tree/HEAD/packages/js/issues/19993">#19993</a>) (Pixel998)</li>
<li><a href="https://github.com/eslint/eslint/commit/54920ed229693f23650dace6e567bf44413aaf98"><code>54920ed</code></a> test: switch to <code>Linter.Config</code> in <code>ESLintRules</code> type tests (<a href="https://github.com/eslint/eslint/tree/HEAD/packages/js/issues/19977">#19977</a>) (Francesco Trotta)</li>
</ul>
```


### Version 1.5.4

#### bugfix
* PR [#119](https://github.com/petercort/FBF-Buddy/pull/119) - fixes searching on activity type to ensure only rides are processed. …

```
Fixes activity_type based processing. Works only on type:ride events
```


### Version 1.5.3

#### bugfix
* PR [#118](https://github.com/petercort/FBF-Buddy/pull/118) - updating the message when bike name is referenced close to wax time

```
Quick update of the wax message
```


### Version 1.5.2

#### bugfix
* PR [#117](https://github.com/petercort/FBF-Buddy/pull/117) - updating with login

```
Adds Azure login to deploy workflow
```


### Version 1.5.1

#### enhancement
* PR [#116](https://github.com/petercort/FBF-Buddy/pull/116) - adding a force deployment when we build

```
Enhanced deploys to auto deploy the latest rather than waiting for whatever Azure scheduler picks up the latest image.
```


### Version 1.5.0

#### chore
* PR [#115](https://github.com/petercort/FBF-Buddy/pull/115) - refactoring to standardize case



### Version 0.1.0

#### bugfix
* PR [#114](https://github.com/petercort/FBF-Buddy/pull/114) - Bug/issue 94



### Version 0.0.0

#### chore
* PR [#91](https://github.com/petercort/FBF-Buddy/pull/91) - updating dependabot to group configs and work with our pr body strategy [no ci]



### Version 1.4.0

#### bugfix
* PR [#90](https://github.com/petercort/FBF-Buddy/pull/90) - updating strava connect to pull the redirect uri



### Version 1.3.12

#### bugfix
* PR [#83](https://github.com/petercort/FBF-Buddy/pull/83) - Dependencies



### Version 1.3.11

#### chore
* PR [#82](https://github.com/petercort/FBF-Buddy/pull/82) - Dependencies



### Version 1.3.10

#### bugfix
* PR [#81](https://github.com/petercort/FBF-Buddy/pull/81) - Dependencies



### Version 1.3.9

#### bugfix
* PR [#80](https://github.com/petercort/FBF-Buddy/pull/80) - Maths



### Version 1.3.8

#### bugfix
* PR [#79](https://github.com/petercort/FBF-Buddy/pull/79) - updating



### Version 1.3.7

#### bugfix
* PR [#78](https://github.com/petercort/FBF-Buddy/pull/78) - updating package json



### Version 1.3.6

#### enhancement
* PR [#77](https://github.com/petercort/FBF-Buddy/pull/77) - Add tests for Strava webhook



### Version 1.3.2

#### bugfix
* PR [#69](https://github.com/petercort/FBF-Buddy/pull/69) - updating some docker and dependencies nad moving to esmodules cause t…



### Version 1.4.0

#### enhancement
* PR [#68](https://github.com/petercort/FBF-Buddy/pull/68) - updating the workflows for latest tags and adding some test



### Version 1.3.1

#### bugfix
* PR [#32](https://github.com/petercort/FBF-Buddy/pull/32) - updating the typecasting on the webhook ownerid



### Version 1.3.0

#### chore
* PR [#31](https://github.com/petercort/FBF-Buddy/pull/31) - updating the webhook with more verboseness



### Version 1.2.1

#### bugfix
* PR [#28](https://github.com/petercort/FBF-Buddy/pull/28) - Update refresh flow



### Version 1.2.0

#### bugfix
* PR [#27](https://github.com/petercort/FBF-Buddy/pull/27) - adding linter and fixing a bunch of misc changed outlined in issue 24



### Version 1.1.1

#### chore
* PR [#26](https://github.com/petercort/FBF-Buddy/pull/26) - Update package.json



### Version 1.1.0

#### bugfix
* PR [#25](https://github.com/petercort/FBF-Buddy/pull/25) - updating the initial sync and healthchecks



### Version 1.0.2

#### bugfix
* PR [#23](https://github.com/petercort/FBF-Buddy/pull/23) - updating data types



### Version 1.0.1

#### bugfix
* PR [#22](https://github.com/petercort/FBF-Buddy/pull/22) - Setup db connection



### Version 0.1.0

#### enhancement
* PR [#20](https://github.com/petercort/FBF-Buddy/pull/20) - updating!



### Version 1.0.0

#### feature
* PR [#17](https://github.com/petercort/FBF-Buddy/pull/17) - Add wax utilities



### Version 0.0.5

#### feature
* PR [#12](https://github.com/petercort/FBF-Event-Buddy/pull/12) - Update 2



### Version 0.0.4

#### bugfix
* PR [#11](https://github.com/petercort/FBF-Event-Buddy/pull/11) - updating another thing



### Version 0.0.3

#### enhancement
* PR [#10](https://github.com/petercort/FBF-Event-Buddy/pull/10) - updating things!



### Version 0.0.2

#### chore
* PR [#9](https://github.com/petercort/FBF-Event-Buddy/pull/9) - Create CONTRIBUTING.md



### Version 0.0.1

#### chore
* PR [#8](https://github.com/petercort/FBF-Event-Buddy/pull/8) - Update TERMS.md



### Version 0.0.1

#### enhancement
* PR [#6](https://github.com/petercort/FBF-Event-Buddy/pull/6) - Update TERMS.md
