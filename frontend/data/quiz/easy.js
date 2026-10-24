export const easyQuestions = [
    {
      id: "easy-001",
      type: "scenario",
      selectionMode: "single",
      category: "Phishing",
      title: "Urgent bank verification",
      scenario:
        "You receive an SMS saying your bank account will be blocked in 30 minutes unless you verify your identity through a link.",
      question: "What is the safest action?",
      options: [
        { id: "a", text: "Open the link immediately" },
        { id: "b", text: "Reply with your account details" },
        { id: "c", text: "Check through the bank's official app or number" },
        { id: "d", text: "Forward the SMS to your contacts" },
      ],
      correctAnswers: ["c"],
      explanation:
        "Urgent threats are common phishing tactics. Contact the bank through an independently verified official channel.",
    },
    {
      id: "easy-002",
      type: "multiple",
      selectionMode: "multiple",
      category: "Password Security",
      question: "Which practices help protect your accounts?",
      options: [
        { id: "a", text: "Use unique passwords for different accounts" },
        { id: "b", text: "Enable multi-factor authentication" },
        { id: "c", text: "Share passwords with trusted friends" },
        { id: "d", text: "Use a reputable password manager" },
      ],
      correctAnswers: ["a", "b", "d"],
      explanation:
        "Unique passwords, MFA, and password managers reduce account compromise risks. Passwords should not be shared.",
    },
    {
      id: "easy-003",
      type: "single",
      selectionMode: "single",
      category: "Cybersecurity Basics",
      question: "What does phishing primarily attempt to do?",
      options: [
        { id: "a", text: "Improve internet speed" },
        { id: "b", text: "Trick people into revealing information" },
        { id: "c", text: "Update device drivers" },
        { id: "d", text: "Encrypt local backups" },
      ],
      correctAnswers: ["b"],
      explanation:
        "Phishing uses deceptive messages or websites to obtain sensitive information or persuade people to perform unsafe actions.",
    },
    {
      id: "easy-004",
      type: "scenario",
      selectionMode: "multiple",
      category: "Social Engineering",
      title: "Unexpected technical support call",
      scenario:
        "Someone calls claiming to be from technical support. They say your laptop has a virus and ask you to install remote-access software.",
      question: "Which actions are appropriate? Select all that apply.",
      options: [
        { id: "a", text: "Refuse the unsolicited remote-access request" },
        { id: "b", text: "Verify support through an official channel" },
        { id: "c", text: "Share your computer password" },
        { id: "d", text: "End the call if the caller pressures you" },
      ],
      correctAnswers: ["a", "b", "d"],
      explanation:
        "Unexpected support calls can be scams. Independently verify the caller and never grant access based only on an unsolicited request.",
    },
    {
      id: "easy-005",
      type: "single",
      selectionMode: "single",
      category: "Web Security",
      question: "What does HTTPS primarily provide?",
      options: [
        { id: "a", text: "A guarantee that the website is legitimate" },
        { id: "b", text: "Protection against every type of malware" },
        { id: "c", text: "Encryption of data in transit" },
        { id: "d", text: "Automatic verification of online sellers" },
      ],
      correctAnswers: ["c"],
      explanation:
        "HTTPS encrypts communication between your browser and the website. Malicious websites can also use HTTPS.",
    },
    {
      id: "easy-006",
      type: "scenario",
      selectionMode: "single",
      category: "OTP Fraud",
      title: "Unexpected OTP request",
      scenario:
        "You receive an OTP that you did not request. A caller then asks you to read it aloud to cancel a transaction.",
      question: "What should you do?",
      options: [
        { id: "a", text: "Share the OTP to cancel the transaction" },
        { id: "b", text: "Ignore the caller and check your account independently" },
        { id: "c", text: "Send the OTP to a different phone number" },
        { id: "d", text: "Post the OTP in a support forum" },
      ],
      correctAnswers: ["b"],
      explanation:
        "Never share an OTP with an unsolicited caller. Check the account through the provider's official app or website.",
    },
    {
      id: "easy-007",
      type: "multiple",
      selectionMode: "multiple",
      category: "Device Security",
      question: "Which actions improve smartphone security?",
      options: [
        { id: "a", text: "Install operating system updates" },
        { id: "b", text: "Use a screen lock" },
        { id: "c", text: "Install apps from unknown links without checking" },
        { id: "d", text: "Review application permissions" },
      ],
      correctAnswers: ["a", "b", "d"],
      explanation:
        "Updates, screen locks, and permission reviews reduce common security risks. Unknown app sources can introduce malware.",
    },
    {
      id: "easy-008",
      type: "scenario",
      selectionMode: "single",
      category: "Public Wi-Fi",
      title: "Free airport Wi-Fi",
      scenario:
        "At an airport, you see two Wi-Fi networks with similar names. You cannot tell which one belongs to the airport.",
      question: "What is the best next step?",
      options: [
        { id: "a", text: "Connect to the one with the strongest signal" },
        { id: "b", text: "Ask airport staff for the official network name" },
        { id: "c", text: "Connect to both networks to compare speeds" },
        { id: "d", text: "Disable your device's security warnings" },
      ],
      correctAnswers: ["b"],
      explanation:
        "Attackers may create lookalike Wi-Fi networks. Confirm the official network name before connecting.",
    },
    {
      id: "easy-009",
      type: "single",
      selectionMode: "single",
      category: "Malware",
      question: "Which malware category commonly encrypts files and demands payment?",
      options: [
        { id: "a", text: "Adware" },
        { id: "b", text: "Ransomware" },
        { id: "c", text: "Spyware" },
        { id: "d", text: "Browser extension" },
      ],
      correctAnswers: ["b"],
      explanation:
        "Ransomware commonly encrypts or otherwise blocks access to data and demands payment. Paying does not guarantee recovery.",
    },
    {
      id: "easy-010",
      type: "scenario",
      selectionMode: "multiple",
      category: "Online Shopping",
      title: "Suspicious online store",
      scenario:
        "An unfamiliar shopping website offers an expensive phone at an unusually low price and requests payment only through a personal account.",
      question: "Which are reasonable precautions?",
      options: [
        { id: "a", text: "Research independent reviews of the seller" },
        { id: "b", text: "Verify the website and business details" },
        { id: "c", text: "Pay immediately because the offer expires soon" },
        { id: "d", text: "Avoid payment until the seller is verified" },
      ],
      correctAnswers: ["a", "b", "d"],
      explanation:
        "Unrealistic prices, urgency, and unusual payment methods are warning signs. Verify the seller before paying.",
    },
    {
      id: "easy-011",
      type: "single",
      selectionMode: "single",
      category: "Account Security",
      question: "What is the main purpose of multi-factor authentication?",
      options: [
        { id: "a", text: "To remove the need for account security" },
        { id: "b", text: "To make passwords publicly accessible" },
        { id: "c", text: "To require an additional authentication factor" },
        { id: "d", text: "To automatically delete suspicious emails" },
      ],
      correctAnswers: ["c"],
      explanation:
        "MFA requires authentication using more than one factor, making unauthorized access harder when a password is stolen.",
    },
    {
      id: "easy-012",
      type: "scenario",
      selectionMode: "single",
      category: "QR Code Security",
      title: "Unexpected QR code",
      scenario:
        "A QR code sticker has been placed over the original payment QR code at a restaurant.",
      question: "What should you do?",
      options: [
        { id: "a", text: "Scan and pay without checking" },
        { id: "b", text: "Verify the payment details with restaurant staff" },
        { id: "c", text: "Share the code on social media" },
        { id: "d", text: "Disable transaction notifications" },
      ],
      correctAnswers: ["b"],
      explanation:
        "Tampered QR codes may redirect payments or lead to malicious sites. Verify the recipient before confirming payment.",
    },
    {
      id: "easy-013",
      type: "multiple",
      selectionMode: "multiple",
      category: "Phishing",
      question: "Which can be warning signs of a phishing message?",
      options: [
        { id: "a", text: "An unexpected request for login credentials" },
        { id: "b", text: "Pressure to act immediately" },
        { id: "c", text: "A suspicious or misleading sender address" },
        { id: "d", text: "A message from a previously verified contact" },
      ],
      correctAnswers: ["a", "b", "c"],
      explanation:
        "Credential requests, urgency, and misleading sender details can indicate phishing. Even known contacts can be compromised, so context matters.",
    },
    {
      id: "easy-014",
      type: "scenario",
      selectionMode: "single",
      category: "File Security",
      title: "Unexpected email attachment",
      scenario:
        "You receive an unexpected invoice attachment from an unknown sender. You were not expecting any invoice.",
      question: "What is the safest response?",
      options: [
        { id: "a", text: "Open it to check whether it is important" },
        { id: "b", text: "Enable macros if the file requests them" },
        { id: "c", text: "Avoid opening it and verify the sender independently" },
        { id: "d", text: "Forward it to your entire team" },
      ],
      correctAnswers: ["c"],
      explanation:
        "Unexpected attachments can contain malicious content. Confirm legitimacy before opening or enabling active content.",
    },
    {
      id: "easy-015",
      type: "single",
      selectionMode: "single",
      category: "Data Protection",
      question: "Why are regular backups important?",
      options: [
        { id: "a", text: "They guarantee malware cannot enter a device" },
        { id: "b", text: "They help recover data after loss or damage" },
        { id: "c", text: "They prevent every account takeover" },
        { id: "d", text: "They replace operating system updates" },
      ],
      correctAnswers: ["b"],
      explanation:
        "Reliable backups support recovery after accidental deletion, hardware failure, or ransomware incidents.",
    },
  ];