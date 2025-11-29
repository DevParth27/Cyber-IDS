import { securityUtils } from '../utils/securityUtils.js';

describe('SQL Injection Detection', () => {
  const testCases = [
    {
      name: 'Basic SQL Injection',
      input: { email: "' OR '1'='1" },
      shouldDetect: true
    },
    {
      name: 'UNION Attack',
      input: { email: "admin@test.com' UNION SELECT * FROM users--" },
      shouldDetect: true
    },
    {
      name: 'Comment Attack',
      input: { email: "admin@test.com'--" },
      shouldDetect: true
    },
    {
      name: 'Stacked Queries',
      input: { email: "admin@test.com'; DROP TABLE users--" },
      shouldDetect: true
    },
    {
      name: 'Valid Email',
      input: { email: "user@example.com" },
      shouldDetect: false
    }
  ];

  testCases.forEach(({ name, input, shouldDetect }) => {
    test(name, () => {
      const result = securityUtils.detectSqlInjection(input);
      expect(result.detected).toBe(shouldDetect);
      if (shouldDetect) {
        expect(result.value).toBe(input.email);
      }
    });
  });
});

describe('Input Sanitization', () => {
  test('Sanitizes malicious input', () => {
    const maliciousInput = {
      email: "user@test.com<script>alert('xss')</script>",
      password: "password' OR '1'='1"
    };
    
    const sanitized = securityUtils.sanitizeObject(maliciousInput);
    expect(sanitized.email).not.toContain('<script>');
    expect(sanitized.password).not.toContain("'");
  });
});