
// CyberMentis Hard cybersecurity question bank.
// Compatible with services/quizEngine.js.

export const hardQuestions = [
    {
      id: "hard-001",
      type: "single",
      selectionMode: "single",
      category: "Security Testing",
      question: "What is the essential prerequisite before performing a penetration test on a system?",
      options: [
        { id: "a", text: "Explicit authorization and an agreed scope" },
        { id: "b", text: "Knowledge of the system's public IP address" },
        { id: "c", text: "A publicly available vulnerability scanner" },
        { id: "d", text: "A promise not to publish results" },
      ],
      correctAnswers: ["a"],
      explanation:
        "Authorization and scope define the permitted targets, methods, and boundaries of a legitimate penetration test.",
    },
    {
      id: "hard-002",
      type: "multiple",
      selectionMode: "multiple",
      category: "Security Testing",
      question: "Which activities belong in a responsible penetration-testing engagement? Select all that apply.",
      options: [
        { id: "a", text: "Define written scope and rules of engagement" },
        { id: "b", text: "Document evidence and remediation recommendations" },
        { id: "c", text: "Test unrelated third-party systems without permission" },
        { id: "d", text: "Coordinate reporting and safe handling of findings" },
      ],
      correctAnswers: ["a", "b", "d"],
      explanation:
        "Authorized penetration testing requires agreed boundaries, documented findings, and responsible reporting.",
    },
    {
      id: "hard-003",
      type: "single",
      selectionMode: "single",
      category: "Network Attacks",
      question: "Which statement best distinguishes a DDoS attack from a DoS attack?",
      options: [
        { id: "a", text: "DDoS attacks always steal passwords" },
        { id: "b", text: "DDoS attacks involve traffic or requests from multiple distributed sources" },
        { id: "c", text: "DoS attacks only affect wireless networks" },
        { id: "d", text: "DDoS attacks cannot affect cloud services" },
      ],
      correctAnswers: ["b"],
      explanation:
        "A distributed denial-of-service attack uses multiple sources to overwhelm or exhaust a target's resources.",
    },
    {
      id: "hard-004",
      type: "scenario",
      selectionMode: "multiple",
      category: "DDoS Defense",
      title: "Unexpected traffic surge",
      scenario:
        "A public website suddenly receives a massive volume of requests from many networks. Legitimate visitors are experiencing timeouts.",
      question: "Which defensive actions are appropriate? Select all that apply.",
      options: [
        { id: "a", text: "Activate DDoS mitigation through the hosting or CDN provider" },
        { id: "b", text: "Analyze traffic patterns and apply suitable rate limits" },
        { id: "c", text: "Publish administrator credentials to prove the service is legitimate" },
        { id: "d", text: "Coordinate with the provider and monitor service availability" },
      ],
      correctAnswers: ["a", "b", "d"],
      explanation:
        "DDoS response may involve provider mitigation, traffic analysis, rate limiting, and ongoing availability monitoring.",
    },
    {
      id: "hard-005",
      type: "single",
      selectionMode: "single",
      category: "Malware",
      question: "Why can rootkits be particularly difficult to detect?",
      options: [
        { id: "a", text: "They only run when the internet is disconnected" },
        { id: "b", text: "They cannot modify system behavior" },
        { id: "c", text: "They may conceal malicious processes, files, or activity from normal inspection" },
        { id: "d", text: "They always display a warning before executing" },
      ],
      correctAnswers: ["c"],
      explanation:
        "Rootkits can interfere with normal visibility into system activity, making malicious components harder to identify.",
    },
    {
      id: "hard-006",
      type: "single",
      selectionMode: "single",
      category: "Malware",
      question: "Which behavior most strongly suggests a backdoor on a compromised system?",
      options: [
        { id: "a", text: "The system downloads a legitimate software update" },
        { id: "b", text: "A user changes their desktop wallpaper" },
        { id: "c", text: "A browser clears its cache automatically" },
        { id: "d", text: "An unauthorized mechanism permits persistent remote access" },
      ],
      correctAnswers: ["d"],
      explanation:
        "A backdoor enables access that bypasses or undermines expected authentication and security controls.",
    },
    {
      id: "hard-007",
      type: "multiple",
      selectionMode: "multiple",
      category: "Ransomware Defense",
      question: "Which controls can reduce the impact of ransomware? Select all that apply.",
      options: [
        { id: "a", text: "Maintain tested offline or immutable backups" },
        { id: "b", text: "Restrict unnecessary administrative privileges" },
        { id: "c", text: "Allow unrestricted execution of unknown programs" },
        { id: "d", text: "Use network segmentation and timely security updates" },
      ],
      correctAnswers: ["a", "b", "d"],
      explanation:
        "Resilient backups, least privilege, segmentation, and patching reduce ransomware exposure and support recovery.",
    },
    {
      id: "hard-008",
      type: "scenario",
      selectionMode: "multiple",
      category: "Incident Response",
      title: "Suspected credential compromise",
      scenario:
        "A security analyst discovers successful logins from unfamiliar locations, followed by unusual data downloads from a privileged account.",
      question: "Which initial response actions are appropriate? Select all that apply.",
      options: [
        { id: "a", text: "Preserve relevant authentication and access logs" },
        { id: "b", text: "Contain suspicious sessions and secure the account" },
        { id: "c", text: "Ignore the activity because the password was valid" },
        { id: "d", text: "Investigate the scope and follow the incident response plan" },
      ],
      correctAnswers: ["a", "b", "d"],
      explanation:
        "Suspicious privileged-account activity requires evidence preservation, containment, and investigation.",
    },
    {
      id: "hard-009",
      type: "single",
      selectionMode: "single",
      category: "Web Security",
      question: "What is SQL injection?",
      options: [
        { id: "a", text: "A method for encrypting database backups" },
        { id: "b", text: "A vulnerability where untrusted input alters the structure of a database query" },
        { id: "c", text: "A standard database authentication mechanism" },
        { id: "d", text: "A technique for increasing database storage capacity" },
      ],
      correctAnswers: ["b"],
      explanation:
        "SQL injection occurs when untrusted data is interpreted as part of a database query instead of being handled strictly as data.",
    },
    {
      id: "hard-010",
      type: "multiple",
      selectionMode: "multiple",
      category: "Application Security",
      question: "Which practices help prevent SQL injection? Select all that apply.",
      options: [
        { id: "a", text: "Use parameterized queries" },
        { id: "b", text: "Apply least-privilege database permissions" },
        { id: "c", text: "Concatenate raw user input directly into SQL statements" },
        { id: "d", text: "Use safe database APIs and validate inputs appropriately" },
      ],
      correctAnswers: ["a", "b", "d"],
      explanation:
        "Parameterized queries are a primary defense. Least privilege and secure database access provide additional protection.",
    },
    {
      id: "hard-011",
      type: "single",
      selectionMode: "single",
      category: "Web Security",
      question: "What is cross-site scripting (XSS)?",
      options: [
        { id: "a", text: "An attack where malicious script executes in a user's browser within a trusted site's context" },
        { id: "b", text: "A protocol for encrypting email attachments" },
        { id: "c", text: "A technique for physically damaging servers" },
        { id: "d", text: "A feature that prevents all browser vulnerabilities" },
      ],
      correctAnswers: ["a"],
      explanation:
        "XSS occurs when an application allows attacker-controlled content to execute as script in another user's browser.",
    },
    {
      id: "hard-012",
      type: "single",
      selectionMode: "single",
      category: "Network Security",
      question: "What is the primary purpose of an intrusion detection system (IDS)?",
      options: [
        { id: "a", text: "To automatically replace damaged hardware" },
        { id: "b", text: "To guarantee that attacks cannot occur" },
        { id: "c", text: "To identify and alert on potentially suspicious activity" },
        { id: "d", text: "To assign IP addresses to every device" },
      ],
      correctAnswers: ["c"],
      explanation:
        "An IDS monitors activity for suspicious patterns or policy violations and generates alerts for investigation.",
    },
    {
      id: "hard-013",
      type: "single",
      selectionMode: "single",
      category: "Network Security",
      question: "How does an intrusion prevention system (IPS) differ from a typical IDS?",
      options: [
        { id: "a", text: "An IPS only manages passwords" },
        { id: "b", text: "An IPS can actively block or prevent detected malicious traffic" },
        { id: "c", text: "An IPS cannot inspect network traffic" },
        { id: "d", text: "An IPS is always a physical hardware device" },
      ],
      correctAnswers: ["b"],
      explanation:
        "An IPS can take preventive action, such as blocking traffic, while a typical IDS primarily detects and alerts.",
    },
    {
      id: "hard-014",
      type: "multiple",
      selectionMode: "multiple",
      category: "Authentication Security",
      question: "Which controls help defend against credential-stuffing attacks? Select all that apply.",
      options: [
        { id: "a", text: "Use unique passwords for every service" },
        { id: "b", text: "Enable phishing-resistant MFA where available" },
        { id: "c", text: "Reuse compromised passwords across multiple accounts" },
        { id: "d", text: "Apply suspicious-login detection and appropriate rate limiting" },
      ],
      correctAnswers: ["a", "b", "d"],
      explanation:
        "Credential stuffing exploits reused credentials. Unique passwords, MFA, and login-abuse controls reduce risk.",
    },
    {
      id: "hard-015",
      type: "single",
      selectionMode: "single",
      category: "Cryptography",
      question: "What is the main difference between hashing and encryption?",
      options: [
        { id: "a", text: "Hashing and encryption always produce identical results" },
        { id: "b", text: "Encryption cannot protect data confidentiality" },
        { id: "c", text: "Hashing always requires a private decryption key" },
        { id: "d", text: "Hashing is generally one-way, while encryption is designed to be reversible with the proper key" },
      ],
      correctAnswers: ["d"],
      explanation:
        "Cryptographic hashes produce fixed-length digests and are not intended to be reversed. Encryption protects data that authorized parties may later decrypt.",
    },
    {
      id: "hard-016",
      type: "single",
      selectionMode: "single",
      category: "Password Security",
      question: "Why should passwords be stored using a dedicated password-hashing algorithm with unique salts?",
      options: [
        { id: "a", text: "To make passwords readable by administrators" },
        { id: "b", text: "To eliminate the need for authentication" },
        { id: "c", text: "To make offline password guessing more costly and prevent identical passwords from having identical stored hashes" },
        { id: "d", text: "To guarantee that a database can never be breached" },
      ],
      correctAnswers: ["c"],
      explanation:
        "Password-hashing algorithms such as Argon2id, combined with unique salts, help resist offline guessing after a database leak.",
    },
    {
      id: "hard-017",
      type: "scenario",
      selectionMode: "multiple",
      category: "Data Breach Response",
      title: "Exposed customer records",
      scenario:
        "A company discovers that a cloud storage container holding customer records was accidentally accessible to unauthorized users.",
      question: "Which response steps are appropriate? Select all that apply.",
      options: [
        { id: "a", text: "Restrict access to the exposed storage immediately" },
        { id: "b", text: "Investigate what data may have been accessed" },
        { id: "c", text: "Delete all audit logs to reduce public concern" },
        { id: "d", text: "Follow applicable breach notification and incident response requirements" },
      ],
      correctAnswers: ["a", "b", "d"],
      explanation:
        "A potential data breach requires containment, investigation, evidence preservation, and applicable notification procedures.",
    },
    {
      id: "hard-018",
      type: "single",
      selectionMode: "single",
      category: "Network Security",
      question: "What is network segmentation primarily intended to achieve?",
      options: [
        { id: "a", text: "Limit communication paths and reduce lateral movement between systems" },
        { id: "b", text: "Remove the need for endpoint security" },
        { id: "c", text: "Guarantee unlimited network bandwidth" },
        { id: "d", text: "Automatically eliminate every vulnerability" },
      ],
      correctAnswers: ["a"],
      explanation:
        "Segmentation divides networks into controlled zones, limiting unnecessary access and helping contain compromises.",
    },
    {
      id: "hard-019",
      type: "single",
      selectionMode: "single",
      category: "Security Architecture",
      question: "What is the central principle of Zero Trust security?",
      options: [
        { id: "a", text: "Automatically trust every device on an internal network" },
        { id: "b", text: "Continuously verify access based on identity, context, and policy" },
        { id: "c", text: "Remove authentication for trusted employees" },
        { id: "d", text: "Allow all traffic unless an attack has already occurred" },
      ],
      correctAnswers: ["b"],
      explanation:
        "Zero Trust avoids implicit trust based only on network location and requires explicit, context-aware authorization.",
    },
    {
      id: "hard-020",
      type: "multiple",
      selectionMode: "multiple",
      category: "Threat Detection",
      question: "Which observations may indicate malware-related compromise? Select all that apply.",
      options: [
        { id: "a", text: "Unexpected outbound connections to suspicious destinations" },
        { id: "b", text: "Unexplained persistence mechanisms or scheduled tasks" },
        { id: "c", text: "A verified operating system update from the official vendor" },
        { id: "d", text: "Unusual processes accessing sensitive files" },
      ],
      correctAnswers: ["a", "b", "d"],
      explanation:
        "Suspicious network activity, persistence mechanisms, and unexpected access to sensitive files can be indicators of compromise.",
    },
    {
      id: "hard-021",
      type: "single",
      selectionMode: "single",
      category: "Networking",
      question: "Which statement about IPv6 security is most accurate?",
      options: [
        { id: "a", text: "IPv6 automatically prevents all network attacks" },
        { id: "b", text: "IPv6 addresses cannot be publicly reachable" },
        { id: "c", text: "IPv6 removes the need for firewall rules" },
        { id: "d", text: "IPv6 still requires appropriate firewalling, configuration, and monitoring" },
      ],
      correctAnswers: ["d"],
      explanation:
        "IPv6 provides a larger address space and protocol improvements, but it does not eliminate the need for security controls.",
    },
    {
      id: "hard-022",
      type: "scenario",
      selectionMode: "multiple",
      category: "Email Security",
      title: "Executive payment request",
      scenario:
        "An accounts employee receives an email appearing to come from the CEO, requesting an urgent transfer to a new bank account. The message discourages phone verification.",
      question: "Which actions are appropriate? Select all that apply.",
      options: [
        { id: "a", text: "Verify the request through a previously established communication channel" },
        { id: "b", text: "Follow the organization's payment approval procedures" },
        { id: "c", text: "Transfer the funds immediately because the sender appears senior" },
        { id: "d", text: "Report the suspicious request to the security or finance team" },
      ],
      correctAnswers: ["a", "b", "d"],
      explanation:
        "Business email compromise often relies on authority, urgency, and payment-detail changes. Independent verification and approval controls are essential.",
    },
    {
      id: "hard-023",
      type: "single",
      selectionMode: "single",
      category: "Vulnerability Management",
      question: "What does CVSS primarily provide?",
      options: [
        { id: "a", text: "A guarantee that a vulnerability is being exploited" },
        { id: "b", text: "A method for calculating an organization's exact financial loss" },
        { id: "c", text: "A standardized framework for describing vulnerability severity" },
        { id: "d", text: "A replacement for vulnerability remediation" },
      ],
      correctAnswers: ["c"],
      explanation:
        "The Common Vulnerability Scoring System provides standardized severity metrics. Organizations should also consider exploitability, exposure, and business context.",
    },
    {
      id: "hard-024",
      type: "scenario",
      selectionMode: "multiple",
      category: "Incident Response",
      title: "Suspicious outbound traffic",
      scenario:
        "A monitoring system detects repeated outbound connections from a server to an unfamiliar destination. The server also shows unexpected scheduled tasks.",
      question: "Which investigation and response steps are appropriate? Select all that apply.",
      options: [
        { id: "a", text: "Review network logs, process activity, and scheduled tasks" },
        { id: "b", text: "Preserve relevant evidence before making unnecessary changes" },
        { id: "c", text: "Assume the activity is harmless without investigating" },
        { id: "d", text: "Contain the system according to the incident response plan if compromise is suspected" },
      ],
      correctAnswers: ["a", "b", "d"],
      explanation:
        "Unexpected outbound traffic and persistence mechanisms warrant investigation, evidence preservation, and appropriate containment.",
    },
  ];
  