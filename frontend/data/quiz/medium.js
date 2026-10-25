
export const mediumQuestions = [
    {
      id: "medium-001",
      type: "single",
      selectionMode: "single",
      category: "Networking",
      question: "What does ISP stand for?",
      options: [
        { id: "a", text: "Internet Security Protocol" },
        { id: "b", text: "Internet Service Provider" },
        { id: "c", text: "Internal System Protection" },
        { id: "d", text: "Information Sharing Platform" },
      ],
      correctAnswers: ["b"],
      explanation:
        "ISP stands for Internet Service Provider, a company that provides internet connectivity to individuals and organizations.",
    },
    {
      id: "medium-002",
      type: "single",
      selectionMode: "single",
      category: "Network Attacks",
      question: "What does DDoS stand for?",
      options: [
        { id: "a", text: "Distributed Denial of Service" },
        { id: "b", text: "Digital Data Operating System" },
        { id: "c", text: "Direct Database Security" },
        { id: "d", text: "Dynamic Domain Operating Service" },
      ],
      correctAnswers: ["a"],
      explanation:
        "A Distributed Denial of Service attack attempts to overwhelm a target using traffic or requests from multiple sources.",
    },
    {
      id: "medium-003",
      type: "single",
      selectionMode: "single",
      category: "Malware",
      question: "What is malware?",
      options: [
        { id: "a", text: "Software used only for backups" },
        { id: "b", text: "Hardware that protects a network" },
        { id: "c", text: "Software designed to perform malicious actions" },
        { id: "d", text: "A secure operating system update" },
      ],
      correctAnswers: ["c"],
      explanation:
        "Malware is malicious software designed to disrupt systems, steal information, damage files, or gain unauthorized access.",
    },
    {
      id: "medium-004",
      type: "multiple",
      selectionMode: "multiple",
      category: "Malware",
      question: "Which of the following are types of malware? Select all that apply.",
      options: [
        { id: "a", text: "Trojan horse" },
        { id: "b", text: "Ransomware" },
        { id: "c", text: "Spyware" },
        { id: "d", text: "Firewall" },
      ],
      correctAnswers: ["a", "b", "c"],
      explanation:
        "Trojans, ransomware, and spyware are malware categories. A firewall is a security control rather than malware.",
    },
    {
      id: "medium-005",
      type: "single",
      selectionMode: "single",
      category: "Data Security",
      question: "What is a data breach?",
      options: [
        { id: "a", text: "A scheduled database backup" },
        { id: "b", text: "Unauthorized access, disclosure, or exposure of protected data" },
        { id: "c", text: "A normal software update" },
        { id: "d", text: "The deletion of temporary browser files" },
      ],
      correctAnswers: ["b"],
      explanation:
        "A data breach involves protected or sensitive information being accessed, disclosed, or exposed without authorization.",
    },
    {
      id: "medium-006",
      type: "single",
      selectionMode: "single",
      category: "Malware",
      question: "What is spyware?",
      options: [
        { id: "a", text: "Software that secretly collects information about a user" },
        { id: "b", text: "A tool that improves internet speed" },
        { id: "c", text: "A type of network cable" },
        { id: "d", text: "Software that only compresses files" },
      ],
      correctAnswers: ["a"],
      explanation:
        "Spyware secretly monitors activity or collects information, potentially including browsing activity and sensitive data.",
    },
    {
      id: "medium-007",
      type: "single",
      selectionMode: "single",
      category: "Malware",
      question: "What is backdoor malware?",
      options: [
        { id: "a", text: "Software that automatically creates backups" },
        { id: "b", text: "A tool that checks password strength" },
        { id: "c", text: "Malware that creates or enables unauthorized access to a system" },
        { id: "d", text: "A physical lock for a server room" },
      ],
      correctAnswers: ["c"],
      explanation:
        "Backdoor malware enables unauthorized access, often allowing an attacker to bypass normal authentication or security controls.",
    },
    {
      id: "medium-008",
      type: "single",
      selectionMode: "single",
      category: "Malware",
      question: "What is ransomware?",
      options: [
        { id: "a", text: "Software that only displays advertisements" },
        { id: "b", text: "Malware that blocks access to data or systems and demands payment" },
        { id: "c", text: "A legitimate encryption standard" },
        { id: "d", text: "A tool used to monitor network uptime" },
      ],
      correctAnswers: ["b"],
      explanation:
        "Ransomware may encrypt files or otherwise prevent access and demand payment. Paying does not guarantee recovery.",
    },
    {
      id: "medium-009",
      type: "single",
      selectionMode: "single",
      category: "Malware",
      question: "What is a rootkit?",
      options: [
        { id: "a", text: "A password recovery service" },
        { id: "b", text: "A type of network switch" },
        { id: "c", text: "A standard browser security feature" },
        { id: "d", text: "Software designed to conceal malicious activity or maintain privileged access" },
      ],
      correctAnswers: ["d"],
      explanation:
        "Rootkits are designed to hide malicious components or activity and may help attackers maintain privileged access.",
    },
    {
      id: "medium-010",
      type: "single",
      selectionMode: "single",
      category: "Malware",
      question: "What is a Trojan horse in cybersecurity?",
      options: [
        { id: "a", text: "Malicious software disguised as something legitimate" },
        { id: "b", text: "A program that always spreads without user interaction" },
        { id: "c", text: "A secure authentication protocol" },
        { id: "d", text: "A hardware encryption device" },
      ],
      correctAnswers: ["a"],
      explanation:
        "A Trojan disguises itself as legitimate or desirable software to trick users into installing or executing it.",
    },
    {
      id: "medium-011",
      type: "multiple",
      selectionMode: "multiple",
      category: "Password Security",
      question: "Which practices help create and maintain strong passwords? Select all that apply.",
      options: [
        { id: "a", text: "Use long, unique passwords or passphrases" },
        { id: "b", text: "Use a reputable password manager" },
        { id: "c", text: "Reuse one complex password across all accounts" },
        { id: "d", text: "Avoid predictable personal information and common passwords" },
      ],
      correctAnswers: ["a", "b", "d"],
      explanation:
        "Length, uniqueness, and unpredictability matter. Password managers help generate and store strong credentials.",
    },
    {
      id: "medium-012",
      type: "single",
      selectionMode: "single",
      category: "Network Security",
      question: "What is the primary purpose of a firewall?",
      options: [
        { id: "a", text: "To physically cool a computer" },
        { id: "b", text: "To replace all antivirus software" },
        { id: "c", text: "To monitor and control network traffic according to security rules" },
        { id: "d", text: "To automatically recover deleted files" },
      ],
      correctAnswers: ["c"],
      explanation:
        "Firewalls filter incoming or outgoing network traffic according to configured security policies.",
    },
    {
      id: "medium-013",
      type: "single",
      selectionMode: "single",
      category: "Networking",
      question: "What is the main difference between IPv4 and IPv6?",
      options: [
        { id: "a", text: "IPv4 uses 32-bit addresses, while IPv6 uses 128-bit addresses" },
        { id: "b", text: "IPv4 is wireless, while IPv6 requires cables" },
        { id: "c", text: "IPv6 cannot connect devices to the internet" },
        { id: "d", text: "IPv4 is encrypted, while IPv6 is not" },
      ],
      correctAnswers: ["a"],
      explanation:
        "IPv4 uses 32-bit addresses, while IPv6 uses 128-bit addresses, providing a vastly larger address space.",
    },
    {
      id: "medium-014",
      type: "single",
      selectionMode: "single",
      category: "Ethical Hacking",
      question: "What is penetration testing?",
      options: [
        { id: "a", text: "Installing malware to damage a competitor" },
        { id: "b", text: "An authorized security assessment that simulates attacks to find weaknesses" },
        { id: "c", text: "Increasing the speed of a network" },
        { id: "d", text: "Automatically encrypting every database" },
      ],
      correctAnswers: ["b"],
      explanation:
        "Penetration testing is an authorized assessment in which security professionals simulate attacks within an agreed scope.",
    },
    {
      id: "medium-015",
      type: "single",
      selectionMode: "single",
      category: "Networking",
      question: "What is the purpose of DNS?",
      options: [
        { id: "a", text: "To physically connect network cables" },
        { id: "b", text: "To remove malware from devices" },
        { id: "c", text: "To create passwords automatically" },
        { id: "d", text: "To resolve domain names into IP addresses and provide other domain records" },
      ],
      correctAnswers: ["d"],
      explanation:
        "The Domain Name System helps clients locate services by resolving domain names to records such as IP addresses.",
    },
    {
      id: "medium-016",
      type: "single",
      selectionMode: "single",
      category: "Malware",
      question: "How does a computer worm typically differ from a Trojan?",
      options: [
        { id: "a", text: "A worm can self-propagate, while a Trojan relies on deceptive presentation" },
        { id: "b", text: "A worm is always harmless" },
        { id: "c", text: "A Trojan can only infect mobile phones" },
        { id: "d", text: "Both are always legitimate applications" },
      ],
      correctAnswers: ["a"],
      explanation:
        "Worms can spread between systems automatically, while Trojans typically deceive users into running malicious software.",
    },
    {
      id: "medium-017",
      type: "multiple",
      selectionMode: "multiple",
      category: "Data Protection",
      question: "Which controls can reduce the impact of a data breach? Select all that apply.",
      options: [
        { id: "a", text: "Encrypt sensitive data where appropriate" },
        { id: "b", text: "Apply least-privilege access" },
        { id: "c", text: "Give every employee administrator access" },
        { id: "d", text: "Monitor for suspicious account activity" },
      ],
      correctAnswers: ["a", "b", "d"],
      explanation:
        "Encryption, restricted access, and monitoring can reduce exposure and help detect unauthorized activity.",
    },
    {
      id: "medium-018",
      type: "scenario",
      selectionMode: "multiple",
      category: "Ransomware",
      title: "Suspicious files on a work computer",
      scenario:
        "An employee notices that many files have unfamiliar extensions and a message demands payment to restore access.",
      question: "Which actions are appropriate? Select all that apply.",
      options: [
        { id: "a", text: "Report the incident to the security or IT team immediately" },
        { id: "b", text: "Isolate the affected device using the organization's response procedure" },
        { id: "c", text: "Delete all evidence and hide the incident" },
        { id: "d", text: "Preserve relevant evidence and follow the incident response plan" },
      ],
      correctAnswers: ["a", "b", "d"],
      explanation:
        "Potential ransomware requires prompt reporting, containment, evidence preservation, and a coordinated response.",
    },
    {
      id: "medium-019",
      type: "scenario",
      selectionMode: "single",
      category: "Phishing",
      title: "Unexpected password reset",
      scenario:
        "You receive a password reset email for an account you did not try to access. The message contains a login button.",
      question: "What is the safest response?",
      options: [
        { id: "a", text: "Enter your password using the email button" },
        { id: "b", text: "Reply with your current password" },
        { id: "c", text: "Visit the service independently and review account security" },
        { id: "d", text: "Forward the email to everyone in your contacts" },
      ],
      correctAnswers: ["c"],
      explanation:
        "Use the service's official app or a trusted address to check account activity rather than trusting an unexpected email link.",
    },
    {
      id: "medium-020",
      type: "single",
      selectionMode: "single",
      category: "Web Security",
      question: "What is the purpose of a digital certificate in HTTPS?",
      options: [
        { id: "a", text: "To guarantee the website has no vulnerabilities" },
        { id: "b", text: "To help authenticate the server and establish a trusted encrypted connection" },
        { id: "c", text: "To prevent users from downloading files" },
        { id: "d", text: "To replace DNS entirely" },
      ],
      correctAnswers: ["b"],
      explanation:
        "TLS certificates help clients authenticate servers and establish secure connections, but they do not guarantee a website is trustworthy.",
    },
    {
      id: "medium-021",
      type: "multiple",
      selectionMode: "multiple",
      category: "Malware Prevention",
      question: "Which practices help reduce malware infection risk? Select all that apply.",
      options: [
        { id: "a", text: "Keep operating systems and applications updated" },
        { id: "b", text: "Download software from trusted sources" },
        { id: "c", text: "Disable all security protections permanently" },
        { id: "d", text: "Use reputable endpoint protection where appropriate" },
      ],
      correctAnswers: ["a", "b", "d"],
      explanation:
        "Updates, trusted software sources, and endpoint protection reduce common infection risks.",
    },
    {
      id: "medium-022",
      type: "single",
      selectionMode: "single",
      category: "Cybersecurity Principles",
      question: "What does the CIA triad represent in information security?",
      options: [
        { id: "a", text: "Confidentiality, Integrity, and Availability" },
        { id: "b", text: "Control, Internet, and Authentication" },
        { id: "c", text: "Cybercrime, Investigation, and Analysis" },
        { id: "d", text: "Cloud, Infrastructure, and Access" },
      ],
      correctAnswers: ["a"],
      explanation:
        "The CIA triad describes confidentiality, integrity, and availability, three fundamental information security objectives.",
    },
    {
      id: "medium-023",
      type: "scenario",
      selectionMode: "multiple",
      category: "Account Security",
      title: "Suspicious account login",
      scenario:
        "You receive an alert about a successful login from an unfamiliar device and location. You do not recognize the activity.",
      question: "Which actions should you consider? Select all that apply.",
      options: [
        { id: "a", text: "Change your password through the official website or app" },
        { id: "b", text: "Review active sessions and revoke suspicious ones" },
        { id: "c", text: "Share your login credentials with the alert sender" },
        { id: "d", text: "Enable or review multi-factor authentication" },
      ],
      correctAnswers: ["a", "b", "d"],
      explanation:
        "An unfamiliar login may indicate account compromise. Secure the account through official channels and review active sessions.",
    },
    {
      id: "medium-024",
      type: "single",
      selectionMode: "single",
      category: "Network Security",
      question: "What is a VPN primarily designed to do?",
      options: [
        { id: "a", text: "Guarantee anonymity against every website and service" },
        { id: "b", text: "Remove all malware from a computer" },
        { id: "c", text: "Replace the need for strong passwords" },
        { id: "d", text: "Create an encrypted tunnel between a device and a VPN endpoint" },
      ],
      correctAnswers: ["d"],
      explanation:
        "A VPN creates an encrypted connection to a VPN endpoint. It does not guarantee anonymity or protection from every cyber threat.",
    },
  ];
  