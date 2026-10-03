# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

---

## Reporting a Vulnerability

Security is paramount in EaglEs EyE due to the ingestion and processing of real-time multi-source data and sensitive API tokens.

If you discover a security vulnerability, **please do NOT open a public issue**. Instead, follow these steps:

1. Open a **Private Security Advisory** on GitHub under the repository's **Security** tab:
   `https://github.com/enrolconsultancy1-hue/EaglEs-EyE-Geospatial/security/advisories/new`
2. Include in your report:
   - Type of vulnerability (e.g., SSRF, XSS, Secret Disclosure, Denial of Service)
   - Step-by-step reproduction instructions or proof-of-concept
   - Impact assessment
3. You will receive an initial response within 48 hours acknowledging receipt.
4. Once verified, a patched release will be prepared and coordinated before public disclosure.

---

## Architectural Security Controls

1. **Server-Side Token Isolation:**
   All third-party services (Cesium Ion, OpenSky, OpenAI, Google Places, AISStream, NASA FIRMS) are brokered through backend proxy routes. Secrets are injected strictly on the server and are never exposed to the client bundle.

2. **Rate Limiting & Abuse Prevention:**
   Proxy routes employ token-bucket rate limiting to protect external quotas and prevent abuse.

3. **Input Sanitization & Spatial Clamping:**
   Geospatial query parameters (`latitude`, `longitude`, `radius`, `bbox`) are validated and clamped against WGS84 physical boundaries before execution.
