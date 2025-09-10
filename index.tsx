import React, { useState, useEffect, useRef, Fragment } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const workflowsData = {
    "DevSecOps": {
        nodes: ["Code & Commit", "SAST/SCA Scan", "DAST Scan", "Containerize & Scan", "IaC Security", "Secure K8s Deploy", "Cloud & Endpoint Monitoring"],
        details: {
            "Code & Commit": { description: "Securely versioning code and triggering automated CI/CD pipelines.", tools: ["Git", "GitHub Actions", "Jenkins"] },
            "SAST/SCA Scan": { description: "Analyzing static source code (SAST) and third-party dependencies (SCA).", tools: ["SonarQube", "Checkmarx", "Snyk"] },
            "DAST Scan": { description: "Running dynamic application security testing against a running application.", tools: ["OWASP ZAP"] },
            "Containerize & Scan": { description: "Packaging applications into hardened containers and scanning for vulnerabilities.", tools: ["Docker", "Aqua Security", "Falco"] },
            "IaC Security": { description: "Scanning Infrastructure as Code (IaC) for misconfigurations.", tools: ["Terraform", "Open Policy Agent"] },
            "Secure K8s Deploy": { description: "Automating secure deployment and configuration in Kubernetes.", tools: ["Kubernetes", "Helm"] },
            "Cloud & Endpoint Monitoring": { description: "Continuously monitoring cloud and endpoints for threats.", tools: ["Microsoft Sentinel", "AWS Security Hub", "CrowdStrike Falcon"] }
        }
    },
    "Incident Response": {
        nodes: ["Detection & Analysis", "Containment", "Eradication", "Recovery", "Post-Incident"],
        details: {
            "Detection & Analysis": { description: "Identifying and validating security incidents using SIEM and EDR alerts.", tools: ["Microsoft Sentinel", "CrowdStrike Falcon", "Wireshark"] },
            "Containment": { description: "Isolating affected systems to prevent further damage.", tools: ["Firewall Rules", "EDR Host Isolation"] },
            "Eradication": { description: "Removing the root cause of the incident and any malicious artifacts.", tools: ["Antivirus/Antimalware", "Patch Management"] },
            "Recovery": { description: "Restoring systems to normal operation and validating security.", tools: ["Backups", "Vulnerability Scanning"] },
            "Post-Incident": { description: "Conducting a root cause analysis and improving security controls.", tools: ["Runbooks", "Security Awareness Training"] }
        }
    },
    "Data Loss Prevention (DLP)": {
        nodes: ["Data Discovery", "Data Classification", "Policy Creation", "Policy Enforcement", "Monitoring & Reporting"],
        details: {
            "Data Discovery": { description: "Identifying and inventorying sensitive data across endpoints and cloud storage.", tools: ["Microsoft Purview Compliance"] },
            "Data Classification": { description: "Classifying data based on sensitivity (e.g., PHI) to apply appropriate controls.", tools: ["Data Labeling Policies"] },
            "Policy Creation": { description: "Defining rules to prevent unauthorized exfiltration or exposure of sensitive data.", tools: ["HIPAA Compliance Rules"] },
            "Policy Enforcement": { description: "Deploying agents and configuring cloud services to enforce DLP policies.", tools: ["Endpoint Agents", "Cloud DLP Services"] },
            "Monitoring & Reporting": { description: "Tracking DLP events, alerts, and generating compliance reports.", tools: ["SIEM Integration", "DLP Dashboards"] }
        }
    },
    "SIEM & Alerting": {
        nodes: ["Log Collection", "Log Correlation & Analysis", "Alert Generation", "Investigation & Triage", "Automation & SOAR"],
        details: {
            "Log Collection": { description: "Aggregating logs from diverse sources like firewalls, endpoints, and cloud services.", tools: ["AWS CloudWatch", "Azure Monitor"] },
            "Log Correlation & Analysis": { description: "Connecting events from different systems to identify potential threats.", tools: ["Microsoft Sentinel", "AWS Security Hub"] },
            "Alert Generation": { description: "Creating high-fidelity alerts based on correlation rules to flag suspicious activity.", tools: ["Custom SIEM Rules"] },
            "Investigation & Triage": { description: "Investigating alerts to determine their severity and impact.", tools: ["Threat Intelligence Feeds"] },
            "Automation & SOAR": { description: "Automating responses to common alerts to reduce manual effort.", tools: ["Remediation Workflows", "Playbooks"] }
        }
    }
};

const WorkflowVisualization = ({ workflow }) => {
    const [activeNode, setActiveNode] = useState(0);
    const [selectedNode, setSelectedNode] = useState(null);
    const [isUserInteracting, setIsUserInteracting] = useState(false);
    const [focusedNodeIndex, setFocusedNodeIndex] = useState(0);
    const nodeRefs = useRef([]);

    useEffect(() => {
        setSelectedNode(null);
        setActiveNode(0);
        setFocusedNodeIndex(0);
        setIsUserInteracting(false);
        nodeRefs.current = nodeRefs.current.slice(0, workflow.nodes.length);
    }, [workflow]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (document.hidden || isUserInteracting) return;
            
            setActiveNode(prevActiveNode => {
                const nextNode = (prevActiveNode + 1) % (workflow.nodes.length + 1);
                if (nextNode > 0 && nextNode <= workflow.nodes.length) {
                    setSelectedNode(workflow.nodes[nextNode - 1]);
                } else {
                    setSelectedNode(null);
                }
                return nextNode;
            });
        }, 2000);
        return () => clearInterval(interval);
    }, [workflow.nodes.length, isUserInteracting, workflow.nodes]);

    useEffect(() => {
        nodeRefs.current[focusedNodeIndex]?.focus();
    }, [focusedNodeIndex]);

    const handleNodeClick = (nodeName) => {
        setIsUserInteracting(true);
        // This ensures setting the node, not toggling it, so the panel stays open.
        if (selectedNode !== nodeName) {
            setSelectedNode(nodeName);
        }
        const nodeIndex = workflow.nodes.indexOf(nodeName);
        if (nodeIndex !== -1) {
             setActiveNode(nodeIndex + 1);
        }
    };

    const handleNodeKeyDown = (e, index) => {
        let nextIndex = index;
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextIndex = (index + 1) % workflow.nodes.length;
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            nextIndex = (index - 1 + workflow.nodes.length) % workflow.nodes.length;
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleNodeClick(workflow.nodes[index]);
            return;
        }
        if (nextIndex !== index) {
            setFocusedNodeIndex(nextIndex);
        }
    };

    return (
        <>
            <div className={`pipeline-container ${selectedNode ? 'selection-active' : ''}`}>
                {workflow.nodes.map((node, index) => (
                    <Fragment key={node}>
                        <div
                            ref={el => { nodeRefs.current[index] = el; }}
                            className={`pipeline-node ${index < activeNode ? 'active' : ''} ${selectedNode === node ? 'selected' : ''}`}
                            onClick={() => handleNodeClick(node)}
                            onKeyDown={(e) => handleNodeKeyDown(e, index)}
                            tabIndex={focusedNodeIndex === index ? 0 : -1}
                            role="button"
                            aria-pressed={selectedNode === node}
                        >
                            <span>{node}</span>
                        </div>
                         {index < workflow.nodes.length - 1 && (
                            <div className={`pipeline-arrow ${index + 1 < activeNode ? 'active' : ''}`} />
                        )}
                    </Fragment>
                ))}
            </div>
            <div className={`pipeline-info-panel ${selectedNode && workflow.details[selectedNode] ? 'visible' : ''}`}>
                {selectedNode && workflow.details[selectedNode] && (
                    <>
                        <h4>{selectedNode}</h4>
                        <p>{workflow.details[selectedNode].description}</p>
                        <h5>Key Tools / Concepts:</h5>
                        <ul>
                            {workflow.details[selectedNode].tools.map(tool => <li key={tool}>{tool}</li>)}
                        </ul>
                    </>
                )}
            </div>
        </>
    );
};

const SecureSdlcPipelines = () => {
    const [activeWorkflow, setActiveWorkflow] = useState('DevSecOps');
    const workflowNames = Object.keys(workflowsData);
    const tabRefs = useRef([]);

    useEffect(() => {
        tabRefs.current = tabRefs.current.slice(0, workflowNames.length);
    }, [workflowNames.length]);

    useEffect(() => {
        const activeIndex = workflowNames.indexOf(activeWorkflow);
        tabRefs.current[activeIndex]?.focus();
    }, [activeWorkflow]);

    const handleTabKeyDown = (e, index) => {
        let nextIndex = index;
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextIndex = (index + 1) % workflowNames.length;
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            nextIndex = (index - 1 + workflowNames.length) % workflowNames.length;
        } else {
            return;
        }
        setActiveWorkflow(workflowNames[nextIndex]);
    };

    return (
        <section id="sdlc-pipelines" className="card">
            <h3>Secure SDLC Pipelines</h3>
            <p className="subtitle">Interactive blueprints of security processes. Select a pipeline to begin.</p>
            <div className="workflow-tabs" role="tablist">
                {workflowNames.map((name, index) => (
                    <button
                        key={name}
                        ref={el => { tabRefs.current[index] = el; }}
                        className={`workflow-tab ${activeWorkflow === name ? 'active' : ''}`}
                        onClick={() => setActiveWorkflow(name)}
                        onKeyDown={e => handleTabKeyDown(e, index)}
                        role="tab"
                        aria-selected={activeWorkflow === name}
                        tabIndex={activeWorkflow === name ? 0 : -1}
                    >
                        {name}
                    </button>
                ))}
            </div>
            <div className="workflow-content">
                <WorkflowVisualization workflow={workflowsData[activeWorkflow]} />
            </div>
        </section>
    );
};

const ArchitectProfile = () => {
    const [activeTab, setActiveTab] = useState('Skills');
    const dossierTabRefs = useRef([]);
    
    const dossierData = {
         'Skills': (
            <>
                <h4>Technical Arsenal</h4>
                <div className="skills-grid">
                    <div className="skill-category">
                        <h5>Cloud Security & SIEM</h5>
                        <ul>
                            <li>Microsoft Sentinel</li>
                            <li>AWS Security Hub</li>
                            <li>SIEM Tuning & Automation</li>
                        </ul>
                    </div>
                    <div className="skill-category">
                        <h5>DevSecOps & IaC Security</h5>
                        <ul>
                            <li>Jenkins, GitHub Actions</li>
                            <li>Terraform, Kubernetes</li>
                            <li>Aqua Security, Falco</li>
                            <li>Container Hardening</li>
                        </ul>
                    </div>
                    <div className="skill-category">
                        <h5>Application Security</h5>
                        <ul>
                            <li>SAST (SonarQube, Checkmarx)</li>
                            <li>DAST (OWASP ZAP)</li>
                            <li>SCA (Snyk)</li>
                        </ul>
                    </div>
                    <div className="skill-category">
                        <h5>Endpoint Security</h5>
                        <ul>
                            <li>CrowdStrike Falcon</li>
                            <li>Microsoft Defender</li>
                            <li>EDR & DLP Policies</li>
                        </ul>
                    </div>
                    <div className="skill-category">
                        <h5>Network & Vulnerability</h5>
                        <ul>
                            <li>Wireshark</li>
                            <li>Nessus, Qualys</li>
                            <li>IDS/IPS</li>
                        </ul>
                    </div>
                    <div className="skill-category">
                        <h5>Scripting & Automation</h5>
                        <ul>
                            <li>Python</li>
                            <li>Bash</li>
                            <li>Remediation Workflows</li>
                        </ul>
                    </div>
                </div>
            </>
        ),
        'Experience': (
             <>
              <div className="job">
                <h4>Security Operations Specialist</h4>
                <p>Mankind America (Jan 2025 - Present)</p>
                <ul>
                  <li>Developed incident response and remediation workflows in CI/CD pipelines.</li>
                  <li>Engineered Jenkins and GitHub Actions integrations to automate IaC compliance checks.</li>
                </ul>
              </div>
              <div className="job">
                <h4>Security Engineer</h4>
                <p>Humana (Jan 2024 - Dec 2024)</p>
                <ul>
                  <li>Handled 100+ security alerts daily through AWS Security Hub and Microsoft Sentinel.</li>
                  <li>Rolled out advanced EDR and device-compliance policies across 10,000+ endpoints.</li>
                </ul>
              </div>
               <div className="job">
                <h4>Cybersecurity Engineer</h4>
                <p>Bytes Soft Solutions (Apr 2020 - July 2022)</p>
                <ul>
                    <li>Led a 3-member security team for Defender deployment and incident response across client environments.</li>
                    <li>Tuned SIEM configurations to boost detection accuracy by 25% and increase network visibility.</li>
                </ul>
              </div>
            </>
        ),
        'Projects': (
            <>
             <div className="project">
                <h4>IoT Smart City Security</h4>
                <p>Developed and implemented a decentralized, self-healing security framework for smart city IoT networks.</p>
              </div>
              <div className="project">
                <h4>Random Nexus: High-Entropy Key Generation</h4>
                <p>Multi-source randomness aggregation system to strengthen encryption key unpredictability.</p>
              </div>
            </>
        )
    };
    
    const dossierTabNames = Object.keys(dossierData);

    useEffect(() => {
        dossierTabRefs.current = dossierTabRefs.current.slice(0, dossierTabNames.length);
    }, [dossierTabNames.length]);

    useEffect(() => {
        const activeIndex = dossierTabNames.indexOf(activeTab);
        dossierTabRefs.current[activeIndex]?.focus();
    }, [activeTab]);

    const handleDossierTabKeyDown = (e, index) => {
        let nextIndex = index;
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextIndex = (index + 1) % dossierTabNames.length;
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            nextIndex = (index - 1 + dossierTabNames.length) % dossierTabNames.length;
        } else {
            return;
        }
        setActiveTab(dossierTabNames[nextIndex]);
    };

    return (
        <section id="architect-profile" className="card">
            <h3>Architect Profile</h3>
            <div className="profile-container">
                <div className="profile-about">
                    <h4>Ashish Reddy A</h4>
                    <p>I am a passionate DevSecOps and Endpoint Security Engineer with a proven track record of integrating security throughout the development lifecycle. I specialize in reducing production vulnerabilities, automating security processes, and hardening cloud infrastructure using tools for CI/CD, containerization, and Infrastructure as Code.</p>
                </div>
                <div className="profile-details">
                    <div className="dossier-tabs" role="tablist">
                        {dossierTabNames.map((tabName, index) => (
                            <button 
                                key={tabName}
                                ref={el => { dossierTabRefs.current[index] = el; }}
                                className={`dossier-tab ${activeTab === tabName ? 'active' : ''}`}
                                onClick={() => setActiveTab(tabName)}
                                onKeyDown={e => handleDossierTabKeyDown(e, index)}
                                role="tab"
                                aria-selected={activeTab === tabName}
                                tabIndex={activeTab === tabName ? 0 : -1}
                            >
                                {tabName}
                            </button>
                        ))}
                    </div>
                    <div className="dossier-content" key={activeTab}>
                        {dossierData[activeTab]}
                    </div>
                </div>
            </div>
        </section>
    );
};

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
);

const ThemeSwitcher = ({ theme, toggleTheme }) => (
    <button
        className="theme-switcher"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
);


const App = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="container">
      <div id="background-animation"></div>
      <header>
        <div className="header-content">
            <div className="logo">ARA</div>
            <div className="nav-wrapper">
                <nav>
                  <a href="#hero">Home</a>
                  <a href="#architect-profile">Profile</a>
                  <a href="#sdlc-pipelines">Pipelines</a>
                  <a href="#secure-channel">Contact</a>
                </nav>
                <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
            </div>
        </div>
      </header>

      <main>
        <section id="hero">
          <h1>Ashish Reddy A</h1>
          <h2>DevSecOps &amp; Endpoint Security Architect</h2>
          <p className="specializations">
            <span>Incident Response</span>
            <span>Endpoint Security</span>
            <span>CI/CD Automation</span>
            <span>Kubernetes Security</span>
            <span>IaC Security</span>
          </p>
        </section>

        <ArchitectProfile />
        
        <SecureSdlcPipelines />

        <section id="secure-channel" className="card">
          <h3>Establish Secure Channel</h3>
          <p>Email: ashishreddya01@gmail.com</p>
          <p>Phone: +1 248-710-5845</p>
          <p>
            LinkedIn:{' '}
            <a
              href="https://linkedin.com/in/ashish-Reddy"
              target="_blank"
              rel="noopener noreferrer"
            >
              linkedin.com/in/ashish-Reddy
            </a>
          </p>
        </section>
      </main>

      <footer>
        <p>&copy; 2024 Ashish Reddy A</p>
      </footer>
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
