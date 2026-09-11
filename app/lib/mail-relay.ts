// Outbound mail relay for the enquiry form: a small Timeweb cloud server
// (72.56.106.2, reverse DNS mail.aihamyn.ae) that accepts mail only from the
// website host and delivers it with SPF and DKIM for aihamyn.ae. App Platform
// IPs cannot have reverse DNS, so the website cannot deliver to Gmail itself.
export const MAIL_RELAY_HOST = "mail.aihamyn.ae";

// The relay's own self-signed certificate, pinned so the website only talks
// to that server over TLS. Valid until 2036-09-08.
export const MAIL_RELAY_CERTIFICATE = `-----BEGIN CERTIFICATE-----
MIIDMTCCAhmgAwIBAgIULc0wrjFfBs4TBwGqHIRBsoJLP0wwDQYJKoZIhvcNAQEL
BQAwGjEYMBYGA1UEAwwPbWFpbC5haWhhbXluLmFlMB4XDTI2MDkxMTA3MjAzNloX
DTM2MDkwODA3MjAzNlowGjEYMBYGA1UEAwwPbWFpbC5haWhhbXluLmFlMIIBIjAN
BgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwKNdWbGZjbw1HcldiqVAFVx5GBIG
nCYwgITiZweaiz3jmZxmRfZzTqAnqrHjVSFdIHtiBuM9S9amo3euCWwH6P+eqLOs
Q7MXT/r3wogtZLYGMnN+4IW9lSZ+jMqi/mau1UWFN4RzE7fN1XCCocgRDhFqAU3g
5Sdx6/Azx0NqasjNMQ4N2cgAHflXVNEjDYsghQXFqPmS31Dolrlc/kL+He01Jeyo
W9J7q4TfdZZmdFquLwvrPw+tefB/GPoAKkmIUon4CiGKv2l5vDv43kiyBNEh8ijG
GWcl5AitmmU9U7u3Lrmy+hxnK0EUD4SV7gepYlRQ67k74PfuMifQo1cVXwIDAQAB
o28wbTAdBgNVHQ4EFgQU3uIPbxBuOexpCBhEY+VeQeqsnNcwHwYDVR0jBBgwFoAU
3uIPbxBuOexpCBhEY+VeQeqsnNcwDwYDVR0TAQH/BAUwAwEB/zAaBgNVHREEEzAR
gg9tYWlsLmFpaGFteW4uYWUwDQYJKoZIhvcNAQELBQADggEBABmBzG+hwjZdRfyR
AInh2Qpzpp63FVvPyvdXtBvCBaAT9CRZpRob6QA1TaM/a1FDQJXw9xQWAGbs8wIW
eL/R2S6PV2INVgYQi196ldEw0ORLKCx1AQjglkX1eZ0u5NkRrbOQP2gXVsu2vC2m
KYG0jR865mOYuUezqx7w4PVHHftdyK8jDeYk03cqW2Z6+SChxnV3mltLqjWomduj
Ecgm76TQ5tCtQoQQpcIgcLRHNpU13Xu4UldfIlf4eB2RM1g6H3qc+jPgef3T9cpA
JJNPW6Gwqy8ilTzHAB4p1w0EWQKDJ0hVTFuudWeLQyxPWbIromQOQoxm7pqrUx7C
qbNbdTM=
-----END CERTIFICATE-----`;
