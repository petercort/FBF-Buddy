# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in FBF-Buddy, please report it by emailing the maintainers or opening a confidential security advisory on GitHub.

## Known Vulnerabilities

### validator.js URL Validation Bypass (CVE-2025-56200 / GHSA-9965-vmph-33xx)

**Status:** Known Issue - Awaiting Upstream Fix  
**Severity:** Moderate (CVSS 6.1)  
**Affected Versions:** validator.js ≤ 13.15.15  
**Current Version:** 13.15.15 (via Sequelize transitive dependency)

#### Description
A URL validation bypass vulnerability exists in validator.js through version 13.15.15. The `isURL()` function uses '://' as a delimiter to parse protocols, while browsers use ':' as the delimiter. This parsing difference allows attackers to bypass protocol and domain validation by crafting URLs that could lead to XSS and Open Redirect attacks.

#### Impact on FBF-Buddy
**Risk Level:** LOW

This vulnerability has **minimal impact** on FBF-Buddy because:
- The application does not directly use validator.js
- The `isURL()` function is not called anywhere in the codebase
- The dependency comes indirectly through Sequelize (used for database operations)
- No user-provided URLs are validated using this library
- All URL construction in the codebase uses hardcoded trusted domains (Strava API, Azure Key Vault)

#### Mitigation Status
- ✅ Confirmed validator.js is not directly used in application code
- ✅ All external API calls use hardcoded trusted domains
- ✅ Monitoring for validator.js patch releases
- ⏳ Awaiting validator.js version 13.15.16+ or Sequelize update

#### References
- CVE: [CVE-2025-56200](https://www.cvedetails.com/cve/CVE-2025-56200/)
- GitHub Advisory: [GHSA-9965-vmph-33xx](https://github.com/advisories/GHSA-9965-vmph-33xx)
- Validator.js Repository: [validatorjs/validator.js#2612](https://github.com/validatorjs/validator.js/pull/2612)

#### Action Items
1. Monitor validator.js repository for security patches
2. Update Sequelize when a version using patched validator.js is available
3. Regularly run `npm audit` to check for resolved vulnerabilities

---

**Last Updated:** 2025-10-18
