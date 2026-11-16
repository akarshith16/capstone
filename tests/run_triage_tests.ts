/**
 * VíaCiudad / Chulapo Calma - Academic Assessment Appendix C Verification Suite
 * Deterministic execution of 8 test cases validating:
 * 1. SIVCA station Haversine distance computation
 * 2. Madrid Mobile Acoustic fleet (UMMA) fallback (>500m)
 * 3. Asymmetric algorithmic fairness (no sensor downgrade)
 * 4. Low-severity acoustic watchlist routing
 * 5. Anonymous triage vs. Cl@ve formal denuncia governance
 * 6. Spatial-temporal duplicate merging (20-min rolling window)
 * 7. Human-in-the-loop officer override & justification capture
 * 8. Baseline (simple intake) vs. Chulapo Calma enrichment comparison
 */

import { runAllDeterministicTests } from '../src/utils/triageVerificationSuite.ts';

console.log('================================================================================');
console.log('   CHULAPO CALMA: DETERMINISTIC TRIAGE VERIFICATION SUITE (APPENDIX C)');
console.log('   Evaluation Target: Academic Assessment Submission (v1.0-2026-11-23)');
console.log('================================================================================\n');

const suite = runAllDeterministicTests();

suite.results.forEach((test) => {
  const symbol = test.passed ? '✓ PASS' : '✗ FAIL';
  console.log(`[${symbol}] Test #${test.id}: ${test.title}`);
  console.log(`       Category : ${test.category}`);
  console.log(`       Output   : ${test.actualOutput}`);
  console.log('');
});

console.log('--------------------------------------------------------------------------------');
console.log(`SUMMARY: ${suite.passedTests}/${suite.totalTests} tests passed (${suite.allPassed ? '100% SUCCESS' : 'FAILURES DETECTED'}).`);
console.log(`Timestamp: ${suite.timestamp}`);
console.log('--------------------------------------------------------------------------------\n');

if (!suite.allPassed) {
  process.exit(1);
} else {
  process.exit(0);
}
