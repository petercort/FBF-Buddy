# Changelog


### Version 0.0.0

#### semver:patch
* PR [#131](https://github.com/petercort/FBF-Buddy/pull/131) - Bump axios from 1.11.0 to 1.12.0 in the npm_and_yarn group across 1 directory

```
<h2>Release v1.12.0</h2>
<h2>Release notes:</h2>
<h3>Bug Fixes</h3>
<ul>
<li>adding build artifacts (<a href="https://github.com/axios/axios/commit/9ec86de257bfa33856571036279169f385ed92bd">9ec86de</a>)</li>
<li>dont add dist on release (<a href="https://github.com/axios/axios/commit/a2edc3606a4f775d868a67bb3461ff18ce7ecd11">a2edc36</a>)</li>
<li><strong>fetch-adapter:</strong> set correct Content-Type for Node FormData (<a href="https://redirect.github.com/axios/axios/issues/6998">#6998</a>) (<a href="https://github.com/axios/axios/commit/a9f47afbf3224d2ca987dbd8188789c7ea853c5d">a9f47af</a>)</li>
<li><strong>node:</strong> enforce maxContentLength for data: URLs (<a href="https://redirect.github.com/axios/axios/issues/7011">#7011</a>) (<a href="https://github.com/axios/axios/commit/945435fc51467303768202250debb8d4ae892593">945435f</a>)</li>
<li>package exports (<a href="https://redirect.github.com/axios/axios/issues/5627">#5627</a>) (<a href="https://github.com/axios/axios/commit/aa78ac23fc9036163308c0f6bd2bb885e7af3f36">aa78ac2</a>)</li>
<li><strong>params:</strong> removing [ and ] from URL encode exclude characters (<a href="https://redirect.github.com/axios/axios/issues/3316">#3316</a>) (<a href="https://redirect.github.com/axios/axios/issues/5715">#5715</a>) (<a href="https://github.com/axios/axios/commit/6d84189349c43b1dcdd977b522610660cc4c7042">6d84189</a>)</li>
<li>release pr run (<a href="https://github.com/axios/axios/commit/fd7f404488b2c4f238c2fbe635b58026a634bfd2">fd7f404</a>)</li>
<li><strong>types:</strong> change the type guard on isCancel (<a href="https://redirect.github.com/axios/axios/issues/5595">#5595</a>) (<a href="https://github.com/axios/axios/commit/0dbb7fd4f61dc568498cd13a681fa7f907d6ec7e">0dbb7fd</a>)</li>
</ul>
<h3>Features</h3>
<ul>
<li><strong>adapter:</strong> surface low‑level network error details; attach original error via cause (<a href="https://redirect.github.com/axios/axios/issues/6982">#6982</a>) (<a href="https://github.com/axios/axios/commit/78b290c57c978ed2ab420b90d97350231c9e5d74">78b290c</a>)</li>
<li><strong>fetch:</strong> add fetch, Request, Response env config variables for the adapter; (<a href="https://redirect.github.com/axios/axios/issues/7003">#7003</a>) (<a href="https://github.com/axios/axios/commit/c959ff29013a3bc90cde3ac7ea2d9a3f9c08974b">c959ff2</a>)</li>
<li>support reviver on JSON.parse (<a href="https://redirect.github.com/axios/axios/issues/5926">#5926</a>) (<a href="https://github.com/axios/axios/commit/2a9763426e43d996fd60d01afe63fa6e1f5b4fca">2a97634</a>), closes <a href="https://redirect.github.com/axios/axios/issues/5924">#5924</a></li>
<li><strong>types:</strong> extend AxiosResponse interface to include custom headers type (<a href="https://redirect.github.com/axios/axios/issues/6782">#6782</a>) (<a href="https://github.com/axios/axios/commit/7960d34eded2de66ffd30b4687f8da0e46c4903e">7960d34</a>)</li>
</ul>
<h3>Contributors to this release</h3>
<ul>
<li><!-- raw HTML omitted --> <a href="https://github.com/WillianAgostini" title="+132/-16760 ([#7002](https://github.com/axios/axios/issues/7002) [#5926](https://github.com/axios/axios/issues/5926) [#6782](https://github.com/axios/axios/issues/6782) )">Willian Agostini</a></li>
<li><!-- raw HTML omitted --> <a href="https://github.com/DigitalBrainJS" title="+4263/-293 ([#7006](https://github.com/axios/axios/issues/7006) [#7003](https://github.com/axios/axios/issues/7003) )">Dmitriy Mozgovoy</a></li>
<li><!-- raw HTML omitted --> <a href="https://github.com/mkhani01" title="+111/-15 ([#6982](https://github.com/axios/axios/issues/6982) )">khani</a></li>
<li><!-- raw HTML omitted --> <a href="https://github.com/AmeerAssadi" title="+123/-0 ([#7011](https://github.com/axios/axios/issues/7011) )">Ameer Assadi</a></li>
<li><!-- raw HTML omitted --> <a href="https://github.com/emiedonmokumo" title="+55/-35 ([#6998](https://github.com/axios/axios/issues/6998) )">Emiedonmokumo Dick-Boro</a></li>
<li><!-- raw HTML omitted --> <a href="https://github.com/opsysdebug" title="+8/-8 ([#6980](https://github.com/axios/axios/issues/6980) )">Zeroday BYTE</a></li>
<li><!-- raw HTML omitted --> <a href="https://github.com/jasonsaayman" title="+7/-7 ([#6985](https://github.com/axios/axios/issues/6985) [#6985](https://github.com/axios/axios/issues/6985) )">Jason Saayman</a></li>
<li><!-- raw HTML omitted --> <a href="https://github.com/HealGaren" title="+5/-7 ([#5715](https://github.com/axios/axios/issues/5715) )">최예찬</a></li>
<li><!-- raw HTML omitted --> <a href="https://github.com/gligorkot" title="+3/-1 ([#5627](https://github.com/axios/axios/issues/5627) )">Gligor Kotushevski</a></li>
<li><!-- raw HTML omitted --> <a href="https://github.com/adimit" title="+2/-1 ([#5595](https://github.com/axios/axios/issues/5595) )">Aleksandar Dimitrov</a></li>
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
