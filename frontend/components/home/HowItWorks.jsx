

import { useEffect, useRef, useState } from "react";

import Link from "next/link";

import {

    ArrowUpRight,

    CheckCircle2,

    ClipboardPaste,

    Eye,
    Database,
    Globe2,
    LayoutDashboard,
    Server,
    ShieldAlert,
    Activity,
    Wifi,

    FileSearch,

    GraduationCap,

    Link2,

    LockKeyhole,

    MessageSquareWarning,

    MousePointerClick,

    SearchCheck,

    ShieldCheck,

    Sparkles,

    TriangleAlert,

} from "lucide-react";

// ============================================================

// CYBERMENTIS — HOW IT WORKS

// ============================================================

const TOOLS = {

    message: {

        eyebrow: "MESSAGE ANALYSIS",

        name: "ScamShield",

        heading:

            "Spot suspicious messages before you respond.",

        description:

            "Paste a suspicious SMS, email, or chat message into ScamShield. Its rule-based analysis explains possible scam indicators and suggests practical next steps.",

        Icon: MessageSquareWarning,

        steps: [

            {

                number: "01",

                title: "Paste the message",

                description:

                    "Copy the suspicious message and paste it into ScamShield. No need to open unfamiliar links or respond to the sender.",

                Icon: ClipboardPaste,

            },

            {

                number: "02",

                title: "Review the warning signs",

                description:

                    "Review the rule-based risk score, detected pressure tactics, sensitive-data requests, suspicious links, and explanations for each warning.",

                Icon: FileSearch,

            },

            {

                number: "03",

                title: "Make a safer decision",

                description:

                    "Read the recommended actions, verify requests through independently found official channels, and save the findings for reference.",

                Icon: ShieldCheck,

            },

        ],

        preview: {

            label: "MESSAGE INSPECTION",

            input:

                "Your account will be suspended! Verify your details immediately...",

            signals: [

                "Urgency and pressure",

                "Sensitive information request",

                "Unverified sender",

            ],

            result:

                "Potential scam indicators detected",

        },

    },

    url: {

        eyebrow: "LINK ANALYSIS",

        name: "URL Safety Checker",

        heading:

            "Think twice before clicking an unfamiliar link.",

        description:

            "Check suspicious links without visiting them. Smart Scan examines URL warning signs; Deep Scan adds optional DNS and WHOIS intelligence for more context.",

        Icon: Link2,

        steps: [

            {

                number: "01",

                title: "Enter the suspicious URL",

                description:

                    "Copy the web address and paste it into the URL Safety Checker without visiting the suspicious website.",

                Icon: ClipboardPaste,

            },

            {

                number: "02",

                title: "Inspect the security signals",

                description:

                    "Choose Smart Scan for offline checks of URL structure, brand lookalikes, and possible government impersonation. Or select Deep Scan to add DNS and WHOIS context.",

                Icon: SearchCheck,

            },

            {

                number: "03",

                title: "Browse with more awareness",

                description:

                    "Review the risk score and explanations. In Deep Scan, inspect available DNS records and registration details; missing records or a zero score never guarantee safety.",

                Icon: LockKeyhole,

            },

        ],

        preview: {

            label: "URL INSPECTION",

            input:

                "https\://account-verification.example",

            signals: [

                "Unfamiliar domain",

                "Account verification request",

                "Additional verification advised",

            ],

            result:

                "Review this URL carefully",

        },

    },

};


// ============================================================
// ANIMATED TERMINAL — DEMONSTRATION ONLY
// ============================================================
// These are fictional terminal commands; no shell commands, scans,
// DNS lookups, or network requests are performed by this component.
const TERMINAL_SESSIONS = {
    url: [
        { kind: "command", text: "clear" },
        { kind: "ascii", text: "  ╔══════════════════════════════════╗\n  ║       C Y B E R M E N T I S      ║\n  ║         security / lab           ║\n  ╚══════════════════════════════════╝" },
        { kind: "command", text: "cybermentis url --inspect suspicious-link.example --mode deep" },
        { kind: "dim", text: "[session] Starting isolated URL investigation..." },
        { kind: "ok", text: "[PASS] Parsed hostname without opening a page" },
        { kind: "ok", text: "[PASS] Normalized scheme and host components" },
        { kind: "info", text: "[INFO] Inspecting domain label composition" },
        { kind: "warn", text: "[FLAG] Domain wording warrants manual review" },
        { kind: "spacer", text: "" },
        { kind: "command", text: "cybermentis dns --records A,AAAA,MX,NS" },
        { kind: "info", text: "[DNS ] Resolver information is supplementary" },
        { kind: "muted", text: "[NOTE] A DNS record is not proof of legitimacy" },
        { kind: "muted", text: "[NOTE] Registration data may be hidden or missing" },
        { kind: "spacer", text: "" },
        { kind: "warn", text: "[DONE] Manual verification recommended" },
    ],
    message: [
        { kind: "command", text: "clear" },
        { kind: "ascii", text: "  ╔══════════════════════════════════╗\n  ║       C Y B E R M E N T I S      ║\n  ║         security / lab           ║\n  ╚══════════════════════════════════╝" },
        { kind: "command", text: "cybermentis message --analyze sample-message.txt" },
        { kind: "dim", text: "[session] Loading text-only analysis pipeline..." },
        { kind: "ok", text: "[PASS] Text received for local pattern checks" },
        { kind: "info", text: "[INFO] Tokenizing message and extracting links" },
        { kind: "warn", text: "[FLAG] Time-pressure language matched" },
        { kind: "warn", text: "[FLAG] Account-access threat language matched" },
        { kind: "spacer", text: "" },
        { kind: "command", text: "cybermentis explain --format concise" },
        { kind: "info", text: "[INFO] Context matters; keyword matches can be benign" },
        { kind: "muted", text: "[NOTE] Sender identity has not been authenticated" },
        { kind: "muted", text: "[NOTE] No message was sent or replied to" },
        { kind: "spacer", text: "" },
        { kind: "warn", text: "[DONE] Findings require human judgment" },
    ],
};

function TerminalSession ({ activeTool }) {
    const [entries, setEntries] = useState([]);
    const [typing, setTyping] = useState(null);
    const [finished, setFinished] = useState(false);
    const screenRef = useRef(null);
    const session = TERMINAL_SESSIONS[activeTool];

    useEffect(() => {
        let cancelled = false;
        let timeoutId;
        let index = 0;
        let charIndex = 0;
        let currentEntries = [];
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        setEntries([]);
        setTyping(null);
        setFinished(false);

        // Keep animation bounded: once completed, show the final prompt.
        // Changing tools cancels the old session and starts a fresh one.
        const next = () => {
            if (cancelled) return;
            if (index >= session.length) {
                setTyping(null);
                setFinished(true);
                return;
            }

            const item = session[index];
            if (reducedMotion) {
                currentEntries = [...currentEntries, item];
                setEntries(currentEntries);
                index += 1;
                next();
                return;
            }

            if (item.kind === "command") {
                // Type commands character by character, including the prompt cursor.
                charIndex = 0;
                const typeCharacter = () => {
                    if (cancelled) return;
                    charIndex += 1;
                    setTyping({ text: item.text.slice(0, charIndex) });
                    if (charIndex < item.text.length) {
                        timeoutId = window.setTimeout(typeCharacter, 23);
                    } else {
                        timeoutId = window.setTimeout(() => {
                            currentEntries = [...currentEntries, item];
                            setEntries(currentEntries);
                            setTyping(null);
                            index += 1;
                            timeoutId = window.setTimeout(next, 290);
                        }, 230);
                    }
                };
                timeoutId = window.setTimeout(typeCharacter, 180);
            } else {
                timeoutId = window.setTimeout(() => {
                    currentEntries = [...currentEntries, item];
                    setEntries(currentEntries);
                    index += 1;
                    next();
                }, item.kind === "ascii" ? 280 : item.kind === "spacer" ? 160 : 260);
            }
        };
        timeoutId = window.setTimeout(next, 450);
        return () => {
            cancelled = true;
            window.clearTimeout(timeoutId);
        };
    }, [activeTool, session]);

    useEffect(() => {
        if (screenRef.current) {
            screenRef.current.scrollTop = screenRef.current.scrollHeight;
        }
    }, [entries, typing, finished]);

    const renderEntry = (entry, key) => {
        if (entry.kind === "spacer") return <div className="hiw-terminal-spacer" key={key} />;
        if (entry.kind === "ascii") return <div className="hiw-terminal-ascii" aria-hidden="true" key={key}>{entry.text}</div>;
        if (entry.kind === "command") return (
            <div className="hiw-terminal-command" key={key}>
                <span className="hiw-terminal-prompt">cybermentis@mac</span>{" "}
                <span className="hiw-terminal-path">~ %</span>{" "}{entry.text}
            </div>
        );
        const classNames = { ok: "hiw-terminal-ok", info: "hiw-terminal-info", warn: "hiw-terminal-warn", muted: "hiw-terminal-muted" };
        if (entry.kind === "dim") return <div className="hiw-terminal-dim" key={key}>{entry.text}</div>;
        return (
            <div className="hiw-terminal-line" key={key}>
                <span className={classNames[entry.kind]}>{entry.text.slice(0, 6)}</span>{entry.text.slice(6)}
            </div>
        );
    };

    return (
        <div className="hiw-terminal-screen" ref={screenRef} aria-label="Animated illustrative terminal session">
            <div className="hiw-terminal-greeting">Last login: today on ttys001</div>
            {entries.map((entry, index) => renderEntry(entry, index))}
            {typing && (
                <div className="hiw-terminal-command hiw-terminal-last">
                    <span className="hiw-terminal-prompt">cybermentis@mac</span>{" "}
                    <span className="hiw-terminal-path">~ %</span>{" "}
                    <span>{typing.text}</span><span className="hiw-terminal-cursor" aria-hidden="true" />
                </div>
            )}
            {finished && (
                <div className="hiw-terminal-command hiw-terminal-last">
                    <span className="hiw-terminal-prompt">cybermentis@mac</span>{" "}
                    <span className="hiw-terminal-path">~ %</span>{" "}
                    <span className="hiw-terminal-cursor" aria-hidden="true" />
                </div>
            )}
        </div>
    );
}

// ============================================================

// COMPONENT

// ============================================================

export default function HowItWorks () {

    const [activeTool, setActiveTool] = useState("message");

    const tool = TOOLS[activeTool];

    const ToolIcon = tool.Icon;

    return (

        <section

            id="how-it-works"

            className="how-it-works"

            aria-labelledby="how-it-works-title"

        >

            {/* BACKGROUND GLOW */}

            <div

                className="background-glow"

                aria-hidden="true"

            />

            <div className="how-it-works-container">

                {/* ============================================

                    SECTION HEADING

                ============================================ */}

                <div className="how-it-works-heading">

                    <span className="how-it-works-eyebrow">

                        <Sparkles size={14} />

                        HOW IT WORKS

                    </span>

                    <h2 id="how-it-works-title">

                        Stay one step ahead of{" "}

                        <span>digital threats.</span>

                    </h2>

                    <p>

                        Cybersecurity doesn't have to be

                        complicated. Explore our free security

                        tools, understand potential risks, and

                        make more informed decisions online.

                    </p>

                </div>

                {/* ============================================

                    TOOL SWITCHER

                ============================================ */}

                <div

                    className="how-it-works-tool-switcher"

                    role="group"

                    aria-label="Choose a cybersecurity tool"

                >

                    <button

                        type="button"

                        className={`how-it-works-tool-tab ${activeTool === "message"

                                ? "is-active"

                                : ""

                            }`}

                        onClick={() =>

                            setActiveTool("message")

                        }

                        aria-pressed={

                            activeTool === "message"

                        }

                    >

                        <MessageSquareWarning size={19} />

                        <span>

                            <strong>ScamShield</strong>

                            <small>

                                Message analysis

                            </small>

                        </span>

                    </button>

                    <button

                        type="button"

                        className={`how-it-works-tool-tab ${activeTool === "url"

                                ? "is-active"

                                : ""

                            }`}

                        onClick={() =>

                            setActiveTool("url")

                        }

                        aria-pressed={

                            activeTool === "url"

                        }

                    >

                        <Link2 size={19} />

                        <span>

                            <strong>

                                URL Safety Checker

                            </strong>

                            <small>

                                Link analysis

                            </small>

                        </span>

                    </button>

                </div>

                {/* ============================================

                    TOOL INTRODUCTION

                ============================================ */}

                <div className="how-it-works-tool-intro">

                    <div className="how-it-works-tool-intro-icon">

                        <ToolIcon size={23} />

                    </div>

                    <div>

                        <span className="how-it-works-tool-eyebrow">

                            {tool.eyebrow}

                        </span>

                        <h3>{tool.heading}</h3>

                        <p>{tool.description}</p>

                    </div>

                </div>

                {/* ============================================

                    WORKFLOW

                ============================================ */}

                <div className="how-it-works-workflow">

                    {/* STEPS */}

                    <div className="how-it-works-steps">

                        {tool.steps.map((step, index) => {

                            const StepIcon = step.Icon;

                            return (

                                <div

                                    key={`${activeTool}-${step.number}`}

                                    className="how-it-works-step"

                                >

                                    <div className="how-it-works-step-rail">

                                        <span className="how-it-works-step-number">

                                            {step.number}

                                        </span>

                                        {index !==

                                            tool.steps.length -

                                            1 && (

                                                <span

                                                    className="how-it-works-step-connector"

                                                    aria-hidden="true"

                                                />

                                            )}

                                    </div>

                                    <div className="how-it-works-step-content">

                                        <div className="how-it-works-step-icon">

                                            <StepIcon

                                                size={19}

                                            />

                                        </div>

                                        <h4>

                                            {step.title}

                                        </h4>

                                        <p>

                                            {

                                                step.description

                                            }

                                        </p>

                                    </div>

                                </div>

                            );

                        })}

                    </div>

                    {/* ========================================
                VISUAL ANALYSIS PREVIEW
                macOS Terminal-inspired illustration.
                Static commands and responses are fictional,
                and no scan or network request is executed.
            ======================================== */}
                    <div className="how-it-works-preview hiw-terminal" aria-label={`${tool.name} illustrative terminal session`}>
                        {/* macOS WINDOW CHROME */}
                        <div className="hiw-terminal-titlebar">
                            <div className="hiw-terminal-lights" aria-hidden="true">
                                <span className="hiw-terminal-close" />
                                <span className="hiw-terminal-minimize" />
                                <span className="hiw-terminal-maximize" />
                            </div>
                            <span className="hiw-terminal-title"> <span aria-hidden="true">⌘</span> cybermentis — zsh </span>
                            <span className="hiw-terminal-label">SIMULATED</span>
                        </div>

                        {/* TERMINAL CONTENT: animated fictional output, not live security results */}
                        <TerminalSession activeTool={activeTool} />
                        <div className="hiw-terminal-footer"><span><span className="hiw-terminal-footer-dot" /> Educational terminal illustration</span><span>No commands executed</span></div>
                    </div>
                </div>

                {/* ============================================

                    FEATURE STRIP

                ============================================ */}

                {/* <div className="how-it-works-feature-strip">

                    <div>

                        <CheckCircle2 size={17} />

                        <span>

                            Easy to understand

                        </span>

                    </div>

                    <div>

                        <SearchCheck size={17} />

                        <span>

                            Practical security insights

                        </span>

                    </div>

                    <div>

                        <MousePointerClick

                            size={17}

                        />

                        <span>

                            Simple interactive workflow

                        </span>

                    </div>

                </div> */}

                {/* ============================================

                    CYBERSECURITY QUIZ CTA

                ============================================ */}

                {/* <div className="how-it-works-quiz-banner">

                    <div className="how-it-works-quiz-banner-icon">

                        <GraduationCap

                            size={25}

                        />

                    </div>

                    <div className="how-it-works-quiz-banner-content">

                        <span>

                            READY FOR THE NEXT STEP?

                        </span>

                        <h3>

                            Turn awareness into confidence.

                        </h3>

                        <p>

                            Put your cybersecurity knowledge

                            to the test with our free

                            Foundations of Cybersecurity

                            Awareness assessment.

                        </p>

                    </div>

                    <Link

                        href="/quiz"

                        className="how-it-works-quiz-button"

                    >

                        Take the Quiz

                        <ArrowUpRight size={17} />

                    </Link>

                </div> */}

            </div>

        </section>

    );

}
